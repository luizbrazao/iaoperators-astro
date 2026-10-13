// /api/rgpd-ops/workspace
//
// GET   → snapshot completo del espacio del comprador (sin el id del pedido).
// PATCH → { version, profile } reemplaza el perfil y alcance con versión
//         optimista (409 con la versión actual si otra pestaña guardó antes).
import type { APIRoute } from "astro";
import { errorCode, opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { guardPrivate, jsonResponse, methodNotAllowed, readJson } from "@/lib/rgpd-ops/http";
import { mapStorageError, serviceUpdateProfile, supabaseRepo, toClientSnapshot } from "@/lib/rgpd-ops/workspace";

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const requestId = requestIdFrom(ctx.request);
  const g = await guardPrivate(ctx, requestId, { mutation: false });
  if (!g.ok) return g.response;
  try {
    const snap = await supabaseRepo.snapshot(g.workspaceId);
    if (!snap) return jsonResponse({ error: "Espacio no disponible.", code: "not_found" }, 404, requestId);
    return jsonResponse({ ok: true, snapshot: toClientSnapshot(snap), serverTime: new Date().toISOString() });
  } catch (error) {
    opsLog({ request_id: requestId, order_id: g.order.id, action: "workspace_read", status: "error", error_code: errorCode(error) });
    return jsonResponse({ error: "No se pudo cargar tu espacio.", code: "unavailable" }, 503, requestId);
  }
};

export const PATCH: APIRoute = async (ctx) => {
  const requestId = requestIdFrom(ctx.request);
  const g = await guardPrivate(ctx, requestId, { mutation: true });
  if (!g.ok) return g.response;
  const parsed = await readJson(ctx.request);
  if (!parsed.ok) return jsonResponse({ error: "Petición no válida.", code: parsed.code }, parsed.status, requestId);
  try {
    const result = await serviceUpdateProfile(supabaseRepo, g.workspaceId, parsed.body);
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: "profile_update", status: result.status === 409 ? "conflict" : result.status < 400 ? "ok" : "denied", detail: String(result.status) });
    return jsonResponse(result.body, result.status);
  } catch (error) {
    const mapped = mapStorageError(error);
    if (mapped) return jsonResponse(mapped.body, mapped.status, requestId);
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: "profile_update", status: "error", error_code: errorCode(error) });
    return jsonResponse({ error: "No se pudo guardar.", code: "unavailable" }, 503, requestId);
  }
};

export const ALL: APIRoute = () => methodNotAllowed("GET, PATCH");
