// Utilidades HTTP de los endpoints de RGPD Ops.

import type { APIContext } from "astro";
import { getAuthorizedWorkspace } from "./auth";
import { opsLog } from "./log";
import { isAllowedOrigin } from "./origin";
import { checkRateLimit } from "./rate-limit";
import type { OpsOrder } from "./orders";

export const NO_STORE_HEADERS = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
} as const;

export function jsonResponse(data: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(requestId ? { ...(data as object), requestId } : data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...NO_STORE_HEADERS },
  });
}

export function methodNotAllowed(allow: string): Response {
  return new Response("Method Not Allowed", { status: 405, headers: { allow, "content-type": "text/plain; charset=utf-8", ...NO_STORE_HEADERS } });
}

export function redirect303(location: string): Response {
  return new Response(null, { status: 303, headers: { location, ...NO_STORE_HEADERS } });
}

export const MAX_BODY_BYTES = 64 * 1024;

/** Lee un cuerpo JSON con tipo y tamaño acotados. null si no es válido. */
export async function readJson(request: Request, maxBytes = MAX_BODY_BYTES): Promise<{ ok: true; body: unknown } | { ok: false; status: number; code: string }> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) return { ok: false, status: 415, code: "unsupported_media_type" };
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return { ok: false, status: 413, code: "payload_too_large" };
  const text = await request.text().catch(() => "");
  if (text.length > maxBytes) return { ok: false, status: 413, code: "payload_too_large" };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, code: "invalid_json" };
  }
}

export type GuardResult = { ok: true; order: OpsOrder; workspaceId: string } | { ok: false; response: Response };

/**
 * Puerta de toda petición privada: Origin (en mutaciones), sesión firmada,
 * pedido activo en la BD, espacio del pedido y rate limit por pedido.
 */
export async function guardPrivate(
  ctx: Pick<APIContext, "request" | "url" | "cookies">,
  requestId: string,
  opts: { mutation: boolean; scope?: "workspaceRead" | "workspaceWrite" | "exportSession" },
): Promise<GuardResult> {
  if (opts.mutation && !isAllowedOrigin(ctx.request, ctx.url)) {
    opsLog({ request_id: requestId, action: "guard", status: "denied", error_code: "origin_not_allowed" });
    return { ok: false, response: jsonResponse({ error: "Origen no permitido.", code: "origin_not_allowed" }, 403, requestId) };
  }
  const auth = await getAuthorizedWorkspace(ctx.cookies, ctx.url, requestId);
  if (auth.status === "unavailable") return { ok: false, response: jsonResponse({ error: "Servicio no disponible. Inténtalo en unos minutos.", code: "unavailable" }, 503, requestId) };
  if (auth.status !== "ok") return { ok: false, response: jsonResponse({ error: "Tu sesión ha caducado. Pide un enlace nuevo.", code: "unauthorized" }, 401, requestId) };
  const scope = opts.scope ?? (opts.mutation ? "workspaceWrite" : "workspaceRead");
  if (!(await checkRateLimit(scope, auth.order.id, "open", requestId))) {
    return { ok: false, response: jsonResponse({ error: "Demasiadas peticiones seguidas. Espera un momento.", code: "rate_limited" }, 429, requestId) };
  }
  return { ok: true, order: auth.order, workspaceId: auth.workspaceId };
}
