// POST /api/rgpd-ops/entities/:entity  { values } → alta de un registro.
// :entity es un slug de una lista cerrada (src/lib/rgpd-ops/schema.ts y la
// función SQL rgpd_ops_entity_table): el cliente no elige tabla ni columnas.
import type { APIRoute } from "astro";
import { errorCode, opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { guardPrivate, jsonResponse, methodNotAllowed, readJson } from "@/lib/rgpd-ops/http";
import { isEntitySlug } from "@/lib/rgpd-ops/schema";
import { mapStorageError, serviceCreate, supabaseRepo } from "@/lib/rgpd-ops/workspace";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const requestId = requestIdFrom(ctx.request);
  const entity = ctx.params.entity;
  if (!isEntitySlug(entity)) return jsonResponse({ error: "Módulo desconocido.", code: "unknown_entity" }, 404, requestId);
  const g = await guardPrivate(ctx, requestId, { mutation: true });
  if (!g.ok) return g.response;
  const parsed = await readJson(ctx.request);
  if (!parsed.ok) return jsonResponse({ error: "Petición no válida.", code: parsed.code }, parsed.status, requestId);
  try {
    const result = await serviceCreate(supabaseRepo, g.workspaceId, entity, parsed.body);
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: "entity_create", status: result.status < 400 ? "ok" : "denied", detail: `${entity}:${result.status}` });
    return jsonResponse(result.body, result.status);
  } catch (error) {
    const mapped = mapStorageError(error);
    if (mapped) return jsonResponse(mapped.body, mapped.status, requestId);
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: "entity_create", status: "error", error_code: errorCode(error), detail: entity });
    return jsonResponse({ error: "No se pudo guardar.", code: "unavailable" }, 503, requestId);
  }
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
