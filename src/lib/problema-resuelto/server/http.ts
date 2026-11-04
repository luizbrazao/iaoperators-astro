// Piezas HTTP comunes a los dos endpoints de «Problema Resuelto»: cabeceras,
// lectura acotada del cuerpo JSON, IP del cliente y respuesta 405.

import { isAllowedOrigin } from "./env";
import { prLog, requestIdFrom } from "./log";

export const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
} as const;

export const FALLBACK_CONTACT = "info@iaoperators.com";

export function json(data: Record<string, unknown>, status: number, requestId: string, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify({ ...data, requestId }), { status, headers: { ...HEADERS, ...extra } });
}

export function clientIp(request: Request, clientAddress: () => string | undefined): string {
  try {
    const ip = clientAddress();
    if (ip) return ip;
  } catch {
    /* algunos adaptadores lanzan si no hay socket */
  }
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Origin, Content-Type, tamaño y JSON. Devuelve el cuerpo o la Response de
 * error ya construida.
 */
export async function readJsonBody(
  request: Request,
  url: URL,
  requestId: string,
  action: "chat_turn" | "submit",
  maxBytes: number,
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  if (!isAllowedOrigin(request, url)) {
    prLog({ request_id: requestId, action, status: "denied", error_code: "origin_not_allowed" });
    return { ok: false, response: json({ error: "Origen no permitido.", code: "origin_not_allowed" }, 403, requestId) };
  }
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return { ok: false, response: json({ error: "Formato no admitido.", code: "unsupported_media_type" }, 415, requestId) };
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, response: json({ error: "Solicitud demasiado grande.", code: "payload_too_large" }, 413, requestId) };
  }
  const text = await request.text().catch(() => "");
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { ok: false, response: json({ error: "Solicitud demasiado grande.", code: "payload_too_large" }, 413, requestId) };
  }
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: json({ error: "No hemos podido leer la solicitud.", code: "invalid_json" }, 400, requestId) };
  }
}

export function methodNotAllowed(request: Request): Response {
  prLog({ request_id: requestIdFrom(request), action: "method", status: "denied", detail: request.method.slice(0, 10) });
  return new Response(JSON.stringify({ error: "Método no permitido.", code: "method_not_allowed" }), {
    status: 405,
    headers: { ...HEADERS, allow: "POST" },
  });
}
