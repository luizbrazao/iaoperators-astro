// Firma de la conversación con el agente.
//
// Durante el triaje no se guarda nada en la BD: la transcripción vive en el
// navegador y viaja en cada turno. Para que nadie pueda inventarse respuestas
// del agente (o inyectar instrucciones haciéndolas pasar por suyas), el
// servidor devuelve con cada turno un estado `<emitido>.<hmac>` que firma la
// transcripción exacta. El turno siguiente y el envío final solo se aceptan si
// la firma coincide y no ha caducado.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { ChatMessage } from "../types";

/** Una conversación abandonada caduca a las 6 horas del último turno. */
export const STATE_TTL_SECONDS = 6 * 60 * 60;

function mac(secret: string, issuedAt: number, transcript: readonly ChatMessage[]): string {
  return createHmac("sha256", secret)
    .update(`pr.transcript.v1|${issuedAt}|${JSON.stringify(transcript.map((m) => [m.role, m.content]))}`, "utf8")
    .digest("hex");
}

export function signTranscript(secret: string, transcript: readonly ChatMessage[], now: Date = new Date()): string {
  const issuedAt = Math.floor(now.getTime() / 1000);
  return `${issuedAt}.${mac(secret, issuedAt, transcript)}`;
}

export type VerifyResult = { ok: true } | { ok: false; code: "state_malformed" | "state_expired" | "state_mismatch" };

export function verifyTranscript(
  secret: string,
  transcript: readonly ChatMessage[],
  state: string,
  now: Date = new Date(),
): VerifyResult {
  const m = /^(\d{10})\.([0-9a-f]{64})$/.exec(state);
  if (!m) return { ok: false, code: "state_malformed" };
  const issuedAt = Number(m[1]);
  const age = Math.floor(now.getTime() / 1000) - issuedAt;
  // Un poco de margen hacia el futuro por relojes de instancias distintas.
  if (age > STATE_TTL_SECONDS || age < -300) return { ok: false, code: "state_expired" };
  const expected = Buffer.from(mac(secret, issuedAt, transcript), "hex");
  const given = Buffer.from(m[2], "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, code: "state_mismatch" };
  return { ok: true };
}
