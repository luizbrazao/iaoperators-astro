// POST /api/hotel-revenue/lead — lead del Hotel Revenue Operator (Fase 1).
//
// Capa HTTP fina: método, Origin, Content-Type y tamaño. El flujo (honeypot,
// validación, rate limit persistente, recálculo, inserción idempotente y
// notificación interna) vive en src/lib/hotel-revenue/server/service.ts.
//
// Si la base de datos no está configurada responde 503 con un mensaje útil:
// nunca devuelve éxito sin haber guardado el lead.

import type { APIRoute } from "astro";
import {
  getLeadStorageConfig,
  getNotificationConfig,
  isAllowedOrigin,
  supabaseTableEditorUrl,
} from "@/lib/hotel-revenue/server/env";
import { buildInternalLeadEmail, sendInternalLeadEmail } from "@/lib/hotel-revenue/server/email";
import { hroLog, requestIdFrom } from "@/lib/hotel-revenue/server/log";
import { submitLead, type LeadServiceDeps } from "@/lib/hotel-revenue/server/service";
import { createSupabaseLeadStore } from "@/lib/hotel-revenue/server/store";

export const prerender = false;

const MAX_BODY_BYTES = 16 * 1024;
const FALLBACK_CONTACT = "info@iaoperators.com";

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
} as const;

function json(data: Record<string, unknown>, status: number, requestId: string, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify({ ...data, requestId }), { status, headers: { ...HEADERS, ...extra } });
}

function clientIp(request: Request, clientAddress: () => string | undefined): string {
  try {
    const ip = clientAddress();
    if (ip) return ip;
  } catch {
    /* algunos adaptadores lanzan si no hay socket */
  }
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function buildDeps(): LeadServiceDeps {
  const storage = getLeadStorageConfig(); // lanza HotelRevenueConfigError si falta algo
  const notification = getNotificationConfig();
  const tableEditorUrl = supabaseTableEditorUrl(storage.supabaseUrl);
  return {
    store: createSupabaseLeadStore(storage),
    hmacSecret: storage.hmacSecret,
    buildEmail: (input) => buildInternalLeadEmail({ ...input, config: notification, tableEditorUrl }),
    sendEmail: (email) => sendInternalLeadEmail(email, notification.resendApiKey),
    now: () => new Date(),
    log: hroLog,
  };
}

export const POST: APIRoute = async (ctx) => {
  const { request, url } = ctx;
  const requestId = requestIdFrom(request);

  if (!isAllowedOrigin(request, url)) {
    hroLog({ request_id: requestId, action: "lead_submit", status: "denied", error_code: "origin_not_allowed" });
    return json({ error: "Origen no permitido.", code: "origin_not_allowed" }, 403, requestId);
  }

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return json({ error: "Formato no admitido.", code: "unsupported_media_type" }, 415, requestId);
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json({ error: "Solicitud demasiado grande.", code: "payload_too_large" }, 413, requestId);
  }
  const text = await request.text().catch(() => "");
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return json({ error: "Solicitud demasiado grande.", code: "payload_too_large" }, 413, requestId);
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "No hemos podido leer la solicitud.", code: "invalid_json" }, 400, requestId);
  }

  const outcome = await submitLead(body, { ip: clientIp(request, () => ctx.clientAddress), requestId }, buildDeps, hroLog);

  switch (outcome.kind) {
    case "created":
      return json({ ok: true }, 201, requestId);
    case "duplicate":
    case "honeypot":
      // Misma respuesta que un alta: no revela si ese envío o ese email ya existían.
      return json({ ok: true }, 200, requestId);
    case "invalid":
      return json({ error: "Revisa los campos marcados.", code: "invalid_payload", fields: outcome.errors }, 400, requestId);
    case "rate_limited":
      return json(
        {
          error: `Has enviado varias solicitudes seguidas. Espera unos minutos o escríbenos a ${FALLBACK_CONTACT}.`,
          code: "rate_limited",
        },
        429,
        requestId,
        { "retry-after": "600" },
      );
    case "not_configured":
    case "unavailable":
      return json(
        {
          error: `No hemos podido registrar tu solicitud y no se ha guardado nada. Inténtalo más tarde o escríbenos a ${FALLBACK_CONTACT}.`,
          code: outcome.kind === "not_configured" ? "lead_storage_not_configured" : outcome.code,
        },
        503,
        requestId,
      );
  }
};

export const ALL: APIRoute = ({ request }) => {
  hroLog({ request_id: requestIdFrom(request), action: "method", status: "denied", detail: request.method.slice(0, 10) });
  return new Response(JSON.stringify({ error: "Método no permitido.", code: "method_not_allowed" }), {
    status: 405,
    headers: { ...HEADERS, allow: "POST" },
  });
};
