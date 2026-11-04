// POST /api/problema-resuelto/chat — un turno del agente de triaje.
//
// Capa HTTP fina. El flujo (firma de la conversación, rate limit, ocultación
// de datos personales, llamada al modelo y respaldo al formulario) vive en
// src/lib/problema-resuelto/server/service.ts. No guarda nada del texto: solo
// el contador del rate limit.

import type { APIRoute } from "astro";
import { getDailyTurnLimit, getHmacSecret, getLlmConfig, getStorageConfig } from "@/lib/problema-resuelto/server/env";
import { clientIp, FALLBACK_CONTACT, json, methodNotAllowed, readJsonBody } from "@/lib/problema-resuelto/server/http";
import { createAnthropicClient } from "@/lib/problema-resuelto/server/llm";
import { prLog, requestIdFrom } from "@/lib/problema-resuelto/server/log";
import { chatTurn, type ChatDeps } from "@/lib/problema-resuelto/server/service";
import { createSupabaseCasoStore } from "@/lib/problema-resuelto/server/store";

export const prerender = false;

// Transcripción completa (6 + 6 mensajes) + mensaje nuevo, con holgura.
const MAX_BODY_BYTES = 64 * 1024;

function buildDeps(): ChatDeps {
  const hmacSecret = getHmacSecret();
  const storage = getStorageConfig(); // lanza ProblemaConfigError si falta algo
  const llm = getLlmConfig();
  return {
    hmacSecret,
    store: createSupabaseCasoStore(storage),
    llm: llm ? createAnthropicClient(llm) : null,
    dailyTurnLimit: getDailyTurnLimit(),
    now: () => new Date(),
    log: prLog,
  };
}

export const POST: APIRoute = async (ctx) => {
  const { request, url } = ctx;
  const requestId = requestIdFrom(request);
  const read = await readJsonBody(request, url, requestId, "chat_turn", MAX_BODY_BYTES);
  if (!read.ok) return read.response;

  const outcome = await chatTurn(read.body, { ip: clientIp(request, () => ctx.clientAddress), requestId }, buildDeps, prLog);

  switch (outcome.kind) {
    case "ok":
    case "fallback":
      return json(outcome.response, 200, requestId);
    case "invalid":
      return json({ error: "Revisa el mensaje.", code: "invalid_payload", fields: outcome.errors }, 400, requestId);
    case "conversation_invalid":
      return json(
        { error: "La conversación ha caducado o no es válida. Empieza de nuevo, no se ha guardado nada.", code: outcome.code },
        409,
        requestId,
      );
    case "rate_limited":
      return json(
        { error: `Has enviado muchos mensajes seguidos. Espera unos minutos o escríbenos a ${FALLBACK_CONTACT}.`, code: "rate_limited" },
        429,
        requestId,
        { "retry-after": "600" },
      );
  }
};

export const ALL: APIRoute = ({ request }) => methodNotAllowed(request);
