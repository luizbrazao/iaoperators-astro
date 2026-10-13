// /api/rgpd-ops/entities/:entity/:id
//
// PATCH  { version, values } → cambio parcial con versión optimista.
// DELETE { version }         → borrado con versión optimista.
//
// El id solo se usa junto al espacio de la sesión: un id de otro espacio
// responde 404 (no se distingue de uno inexistente).
import type { APIRoute } from "astro";
import { errorCode, opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { guardPrivate, jsonResponse, methodNotAllowed, readJson } from "@/lib/rgpd-ops/http";
import { isEntitySlug } from "@/lib/rgpd-ops/schema";
import { mapStorageError, serviceDelete, serviceUpdate, supabaseRepo } from "@/lib/rgpd-ops/workspace";

export const prerender = false;

async function handle(ctx: Parameters<APIRoute>[0], op: "update" | "delete") {
  const requestId = requestIdFrom(ctx.request);
  const { entity, id } = ctx.params;
  if (!isEntitySlug(entity)) return jsonResponse({ error: "Módulo desconocido.", code: "unknown_entity" }, 404, requestId);
  const g = await guardPrivate(ctx, requestId, { mutation: true });
  if (!g.ok) return g.response;
  const parsed = await readJson(ctx.request);
  if (!parsed.ok) return jsonResponse({ error: "Petición no válida.", code: parsed.code }, parsed.status, requestId);
  try {
    const result =
      op === "update"
        ? await serviceUpdate(supabaseRepo, g.workspaceId, entity, id, parsed.body)
        : await serviceDelete(supabaseRepo, g.workspaceId, entity, id, parsed.body);
    opsLog({
      request_id: requestId,
      workspace_id: g.workspaceId,
      action: `entity_${op}`,
      status: result.status === 409 ? "conflict" : result.status < 400 ? "ok" : "denied",
      detail: `${entity}:${result.status}`,
    });
    return jsonResponse(result.body, result.status);
  } catch (error) {
    const mapped = mapStorageError(error);
    if (mapped) return jsonResponse(mapped.body, mapped.status, requestId);
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: `entity_${op}`, status: "error", error_code: errorCode(error), detail: entity });
    return jsonResponse({ error: "No se pudo guardar.", code: "unavailable" }, 503, requestId);
  }
}

export const PATCH: APIRoute = (ctx) => handle(ctx, "update");
export const DELETE: APIRoute = (ctx) => handle(ctx, "delete");
export const ALL: APIRoute = () => methodNotAllowed("PATCH, DELETE");
