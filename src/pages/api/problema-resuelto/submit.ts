// POST /api/problema-resuelto/submit — envío del caso al programa.
//
// Capa HTTP fina. El flujo (honeypot, validación, firma de la conversación,
// rate limit, inserción idempotente, ficha y notificación interna) vive en
// src/lib/problema-resuelto/server/service.ts.
//
// Si la base de datos no está configurada responde 503 con un mensaje útil:
// nunca devuelve éxito sin haber guardado el caso.

import type { APIRoute } from "astro";
import { getLlmConfig, getNotificationConfig, getStorageConfig, supabaseTableEditorUrl } from "@/lib/problema-resuelto/server/env";
import { buildInternalCasoEmail, sendInternalCasoEmail } from "@/lib/problema-resuelto/server/email";
import { clientIp, FALLBACK_CONTACT, json, methodNotAllowed, readJsonBody } from "@/lib/problema-resuelto/server/http";
import { createAnthropicClient } from "@/lib/problema-resuelto/server/llm";
import { prLog, requestIdFrom } from "@/lib/problema-resuelto/server/log";
import { submitCaso, type SubmitDeps } from "@/lib/problema-resuelto/server/service";
import { createSupabaseCasoStore } from "@/lib/problema-resuelto/server/store";

export const prerender = false;

const MAX_BODY_BYTES = 64 * 1024;

function buildDeps(): SubmitDeps {
  const storage = getStorageConfig(); // lanza ProblemaConfigError si falta algo
  const notification = getNotificationConfig();
  const tableEditorUrl = supabaseTableEditorUrl(storage.supabaseUrl);
  const llm = getLlmConfig();
  return {
    store: createSupabaseCasoStore(storage),
    hmacSecret: storage.hmacSecret,
    llm: llm ? createAnthropicClient(llm) : null,
    buildEmail: (input) => buildInternalCasoEmail({ ...input, config: notification, tableEditorUrl }),
    sendEmail: (email) => sendInternalCasoEmail(email, notification.resendApiKey),
    now: () => new Date(),
    log: prLog,
  };
}

export const POST: APIRoute = async (ctx) => {
  const { request, url } = ctx;
  const requestId = requestIdFrom(request);
  const read = await readJsonBody(request, url, requestId, "submit", MAX_BODY_BYTES);
  if (!read.ok) return read.response;

  const outcome = await submitCaso(read.body, { ip: clientIp(request, () => ctx.clientAddress), requestId }, buildDeps, prLog);

  switch (outcome.kind) {
    case "created":
      return json({ ok: true }, 201, requestId);
    case "duplicate":
    case "honeypot":
      // Misma respuesta que un alta: no revela si ese envío ya existía.
      return json({ ok: true }, 200, requestId);
    case "invalid":
      return json({ error: "Revisa los campos marcados.", code: "invalid_payload", fields: outcome.errors }, 400, requestId);
    case "rate_limited":
      return json(
        { error: `Has enviado varios casos seguidos. Espera un poco o escríbenos a ${FALLBACK_CONTACT}.`, code: "rate_limited" },
        429,
        requestId,
        { "retry-after": "600" },
      );
    case "not_configured":
    case "unavailable":
      return json(
        {
          error: `No hemos podido registrar tu caso y no se ha guardado nada. Inténtalo más tarde o escríbenos a ${FALLBACK_CONTACT}.`,
          code: outcome.kind === "not_configured" ? "caso_storage_not_configured" : outcome.code,
        },
        503,
        requestId,
      );
  }
};

export const ALL: APIRoute = ({ request }) => methodNotAllowed(request);
