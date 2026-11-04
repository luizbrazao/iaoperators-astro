// Casos de uso de «Problema Resuelto»: un turno del agente de triaje y el envío
// final del caso. Sin dependencias de Astro ni de red: BD, modelo, email,
// reloj y logs llegan inyectados, de modo que los tests prueban el flujo
// completo con dobles en memoria.
//
// Turno de chat (nada se guarda en la BD salvo el contador del rate limit):
//   1. validación             → 400
//   2. configuración / modelo → si falta, el navegador pasa al formulario
//   3. firma de la conversación (server/transcript.ts) → 409 si no cuadra
//   4. tope de turnos
//   5. rate limit por IP (429) y tope diario global de turnos (→ formulario)
//   6. ocultación de datos personales del mensaje
//   7. llamada al modelo; si falla o no responde con sentido → formulario
//   8. respuesta + transcripción canónica firmada
//
// Envío del caso:
//   1. honeypot → éxito aparente, no se guarda nada
//   2. validación → 400
//   3. configuración → 503 explícito (nunca un éxito falso)
//   4. firma de la conversación (modo chat)
//   5. rate limit por IP y por email
//   6. inserción idempotente por submission_id
//   7. ficha generada por el modelo (si falla, el caso queda guardado igual)
//   8. notificación interna reclamada en la BD (sin duplicados)

import { rateLimitKeyWith } from "@/lib/commerce/tokens";
import { PROBLEMA_LIMITS } from "@/data/problema-resuelto";
import { parseFicha, parseTriageOutput } from "../parse";
import { maskPii } from "../text";
import type { ChatMessage, ChatTurnResponse, FieldErrors, Ficha, NormalizedSubmission, SubmitField } from "../types";
import { isHoneypotFilled, problemTextOf, validateChatTurn, validateSubmission, type ChatTurnField } from "../validation";
import type { InternalCasoEmail } from "./email";
import type { LlmClient } from "./llm";
import { errorCode, type ProblemaLogFields } from "./log";
import { FICHA_SYSTEM_PROMPT, fichaUserMessage, PROMPT_VERSION, triageSystemPrompt } from "./prompts";
import { signTranscript, verifyTranscript } from "./transcript";

export const RATE_LIMITS = {
  chatIp: { limit: 30, windowSeconds: 600 },
  submitIp: { limit: 5, windowSeconds: 600 },
  submitEmail: { limit: 3, windowSeconds: 86400 },
} as const;

export const LLM_LIMITS = {
  triage: { maxTokens: 600, timeoutMs: 20000 },
  ficha: { maxTokens: 1200, timeoutMs: 25000 },
} as const;

const FALLBACK_MESSAGE = "El asistente no está disponible ahora mismo. Puedes contarnos el problema en este formulario y lo revisamos igual.";
const DAILY_LIMIT_MESSAGE = "Hoy hemos recibido muchas consultas y el asistente está en pausa. Cuéntanos el problema en este formulario y lo revisamos igual.";

/** Fila tal y como se inserta en public.problema_resuelto_casos. */
export interface CasoRow {
  submission_id: string;
  status: "nuevo";
  mode: "chat" | "form";
  name: string;
  email: string;
  company: string;
  job_title: string;
  company_size: string;
  manager_aware: string;
  problem_text: string;
  transcript: ChatMessage[] | null;
  answers: Record<string, string> | null;
  pii_masked: boolean;
  prompt_version: string;
  llm_model: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_path: string;
  referrer_host: string | null;
  consent_version: string;
  bases_version: string;
  consent_at: string;
}

export interface CasoStore {
  rateLimitHit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  insertCaso(row: CasoRow): Promise<{ id: string; created: boolean }>;
  saveFicha(casoId: string, ficha: Ficha | null, status: "ok" | "failed" | "skipped", errorCode: string | null, model: string | null): Promise<void>;
  claimNotification(casoId: string): Promise<boolean>;
  markNotification(casoId: string, status: "sent" | "failed" | "skipped", errorCode: string | null, at: Date): Promise<void>;
}

type Log = (fields: ProblemaLogFields) => void;

// ---------------------------------------------------------------- chat

export interface ChatDeps {
  hmacSecret: string;
  store: CasoStore;
  /** null = agente desactivado (sin ANTHROPIC_API_KEY). */
  llm: LlmClient | null;
  dailyTurnLimit: number;
  now(): Date;
  log: Log;
}

export type ChatOutcome =
  | { kind: "ok"; response: Extract<ChatTurnResponse, { mode: "chat" }> }
  | { kind: "fallback"; response: Extract<ChatTurnResponse, { mode: "form" }> }
  | { kind: "invalid"; errors: FieldErrors<ChatTurnField> }
  | { kind: "conversation_invalid"; code: string }
  | { kind: "rate_limited" };

function fallback(reason: "agent_unavailable" | "daily_limit"): ChatOutcome {
  return { kind: "fallback", response: { mode: "form", reason, message: reason === "daily_limit" ? DAILY_LIMIT_MESSAGE : FALLBACK_MESSAGE } };
}

function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export async function chatTurn(
  raw: unknown,
  ctx: { ip: string; requestId: string },
  getDeps: () => ChatDeps,
  log: Log,
): Promise<ChatOutcome> {
  const { requestId } = ctx;
  const validation = validateChatTurn(raw);
  if (!validation.ok) {
    log({ request_id: requestId, action: "chat_turn", status: "invalid", detail: Object.keys(validation.errors).join(",") });
    return { kind: "invalid", errors: validation.errors };
  }
  const { message, transcript, state } = validation.value;

  let deps: ChatDeps;
  try {
    deps = getDeps();
  } catch (error) {
    const missing = (error as { missing?: unknown })?.missing;
    log({ request_id: requestId, action: "config", status: "error", error_code: "problema_not_configured", detail: Array.isArray(missing) ? missing.join(",") : undefined });
    return fallback("agent_unavailable");
  }
  if (!deps.llm) {
    deps.log({ request_id: requestId, action: "chat_turn", status: "fallback", detail: "llm_not_configured" });
    return fallback("agent_unavailable");
  }

  if (transcript.length > 0) {
    const verified = verifyTranscript(deps.hmacSecret, transcript, state ?? "", deps.now());
    if (!verified.ok) {
      deps.log({ request_id: requestId, action: "chat_turn", status: "denied", error_code: verified.code });
      return { kind: "conversation_invalid", code: verified.code };
    }
  }

  const turn = transcript.length / 2 + 1;
  if (turn > PROBLEMA_LIMITS.userTurns) {
    deps.log({ request_id: requestId, action: "chat_turn", status: "denied", error_code: "turn_limit" });
    return { kind: "conversation_invalid", code: "turn_limit" };
  }

  try {
    const ipKey = rateLimitKeyWith("pr.rl", deps.hmacSecret, "chat_ip", ctx.ip || "unknown");
    if (!(await deps.store.rateLimitHit(ipKey, RATE_LIMITS.chatIp.limit, RATE_LIMITS.chatIp.windowSeconds))) {
      deps.log({ request_id: requestId, action: "rate_limit", status: "denied", detail: "chat_ip" });
      return { kind: "rate_limited" };
    }
    const dayKey = rateLimitKeyWith("pr.rl", deps.hmacSecret, "chat_day", utcDay(deps.now()));
    if (!(await deps.store.rateLimitHit(dayKey, deps.dailyTurnLimit, 86400))) {
      deps.log({ request_id: requestId, action: "rate_limit", status: "fallback", detail: "chat_day" });
      return fallback("daily_limit");
    }
  } catch (error) {
    // Sin BD no hay forma de limitar el coste del modelo: mejor el formulario.
    deps.log({ request_id: requestId, action: "rate_limit", status: "error", error_code: errorCode(error) });
    return fallback("agent_unavailable");
  }

  const masked = maskPii(message);
  const messages: ChatMessage[] = [...transcript, { role: "user", content: masked.text }];

  const result = await deps.llm.complete({
    system: triageSystemPrompt(turn),
    messages,
    maxTokens: LLM_LIMITS.triage.maxTokens,
    timeoutMs: LLM_LIMITS.triage.timeoutMs,
  });
  if (!result.ok) {
    deps.log({ request_id: requestId, action: "llm", status: "error", error_code: result.code, detail: `turn_${turn}` });
    return fallback("agent_unavailable");
  }
  const parsed = parseTriageOutput(result.text);
  if (!parsed) {
    deps.log({ request_id: requestId, action: "llm", status: "error", error_code: "llm_unparseable", detail: `turn_${turn}` });
    return fallback("agent_unavailable");
  }

  const lastTurn = turn >= PROBLEMA_LIMITS.userTurns;
  const ready = !parsed.offTopic && (parsed.ready || lastTurn);
  const nextTranscript: ChatMessage[] = [...messages, { role: "assistant", content: parsed.reply }];
  deps.log({
    request_id: requestId,
    action: "chat_turn",
    status: "ok",
    detail: `turn_${turn}${ready ? ",ready" : ""}${parsed.offTopic ? ",off_topic" : ""}${parsed.structured ? "" : ",unstructured"}${masked.kinds.length ? ",pii_masked" : ""}`,
  });

  return {
    kind: "ok",
    response: {
      mode: "chat",
      reply: parsed.reply,
      ready,
      offTopic: parsed.offTopic,
      transcript: nextTranscript,
      state: signTranscript(deps.hmacSecret, nextTranscript, deps.now()),
      turnsLeft: parsed.offTopic || ready ? 0 : PROBLEMA_LIMITS.userTurns - turn,
      piiMasked: masked.kinds.length > 0,
    },
  };
}

// ---------------------------------------------------------------- envío

export interface SubmitDeps {
  store: CasoStore;
  hmacSecret: string;
  llm: LlmClient | null;
  buildEmail(input: { sub: NormalizedSubmission; ficha: Ficha | null; casoId: string }): InternalCasoEmail;
  sendEmail(email: InternalCasoEmail): Promise<{ ok: boolean; code: string }>;
  now(): Date;
  log: Log;
}

export type SubmitOutcome =
  | {
      kind: "created" | "duplicate";
      casoId: string;
      ficha: "ok" | "failed" | "skipped" | "not_generated";
      notification: "sent" | "failed" | "skipped" | "not_claimed" | "error";
    }
  | { kind: "honeypot" }
  | { kind: "invalid"; errors: FieldErrors<SubmitField> }
  | { kind: "rate_limited" }
  | { kind: "not_configured"; missing: string[] }
  | { kind: "unavailable"; code: string };

export function buildCasoRow(sub: NormalizedSubmission, now: Date, llmModel: string | null): CasoRow {
  return {
    submission_id: sub.submissionId,
    status: "nuevo",
    mode: sub.mode,
    name: sub.name,
    email: sub.email,
    company: sub.company,
    job_title: sub.jobTitle,
    company_size: sub.companySize,
    manager_aware: sub.managerAware,
    problem_text: problemTextOf(sub),
    transcript: sub.mode === "chat" ? sub.transcript : null,
    answers: sub.mode === "form" ? sub.answers : null,
    pii_masked: sub.piiMasked,
    prompt_version: PROMPT_VERSION,
    llm_model: llmModel,
    utm_source: sub.utm.utm_source,
    utm_medium: sub.utm.utm_medium,
    utm_campaign: sub.utm.utm_campaign,
    utm_content: sub.utm.utm_content,
    utm_term: sub.utm.utm_term,
    landing_path: sub.landingPath,
    referrer_host: sub.referrerHost,
    consent_version: sub.consentVersion,
    bases_version: sub.basesVersion,
    consent_at: now.toISOString(),
  };
}

export async function submitCaso(
  raw: unknown,
  ctx: { ip: string; requestId: string },
  getDeps: () => SubmitDeps,
  log: Log,
): Promise<SubmitOutcome> {
  const { requestId } = ctx;

  if (isHoneypotFilled(raw)) {
    log({ request_id: requestId, action: "submit", status: "skipped", detail: "honeypot" });
    return { kind: "honeypot" };
  }

  const validation = validateSubmission(raw);
  if (!validation.ok) {
    log({ request_id: requestId, action: "submit", status: "invalid", detail: Object.keys(validation.errors).join(",") });
    return { kind: "invalid", errors: validation.errors };
  }
  const sub = validation.value;

  let deps: SubmitDeps;
  try {
    deps = getDeps();
  } catch (error) {
    const missing = (error as { missing?: unknown })?.missing;
    const list = Array.isArray(missing) ? (missing as string[]) : [];
    log({ request_id: requestId, action: "config", status: "error", error_code: "problema_not_configured", detail: list.join(",") });
    return { kind: "not_configured", missing: list };
  }

  if (sub.mode === "chat") {
    const verified = verifyTranscript(deps.hmacSecret, sub.transcript ?? [], sub.state ?? "", deps.now());
    if (!verified.ok) {
      deps.log({ request_id: requestId, action: "submit", status: "denied", error_code: verified.code });
      return { kind: "invalid", errors: { transcript: "La conversación ha caducado o no es válida. Vuelve a empezar, son cinco minutos." } };
    }
  }

  try {
    const ipKey = rateLimitKeyWith("pr.rl", deps.hmacSecret, "submit_ip", ctx.ip || "unknown");
    const emailKey = rateLimitKeyWith("pr.rl", deps.hmacSecret, "submit_email", sub.email);
    const ipOk = await deps.store.rateLimitHit(ipKey, RATE_LIMITS.submitIp.limit, RATE_LIMITS.submitIp.windowSeconds);
    const emailOk = ipOk && (await deps.store.rateLimitHit(emailKey, RATE_LIMITS.submitEmail.limit, RATE_LIMITS.submitEmail.windowSeconds));
    if (!ipOk || !emailOk) {
      deps.log({ request_id: requestId, action: "rate_limit", status: "denied", detail: ipOk ? "submit_email" : "submit_ip" });
      return { kind: "rate_limited" };
    }
  } catch (error) {
    deps.log({ request_id: requestId, action: "rate_limit", status: "error", error_code: errorCode(error) });
    return { kind: "unavailable", code: "caso_storage_unavailable" };
  }

  const now = deps.now();
  let casoId: string;
  let created: boolean;
  try {
    ({ id: casoId, created } = await deps.store.insertCaso(buildCasoRow(sub, now, deps.llm?.model ?? null)));
  } catch (error) {
    deps.log({ request_id: requestId, action: "submit", status: "error", error_code: errorCode(error) });
    return { kind: "unavailable", code: "caso_storage_unavailable" };
  }
  deps.log({ request_id: requestId, caso_id: casoId, action: "submit", status: created ? "ok" : "duplicate", detail: sub.mode });

  // Un reintento del mismo envío no vuelve a gastar modelo ni a mandar email.
  if (!created) return { kind: "duplicate", casoId, ficha: "not_generated", notification: "not_claimed" };

  const { ficha, status: fichaStatus } = await generateFicha(deps, sub, casoId, requestId);
  const notification = await notify(deps, { sub, ficha, casoId, requestId });
  return { kind: "created", casoId, ficha: fichaStatus, notification };
}

async function generateFicha(
  deps: SubmitDeps,
  sub: NormalizedSubmission,
  casoId: string,
  requestId: string,
): Promise<{ ficha: Ficha | null; status: "ok" | "failed" | "skipped" }> {
  let ficha: Ficha | null = null;
  let status: "ok" | "failed" | "skipped" = "skipped";
  let code: string | null = "llm_not_configured";
  if (deps.llm) {
    const result = await deps.llm.complete({
      system: FICHA_SYSTEM_PROMPT,
      messages: [{ role: "user", content: fichaUserMessage(sub) }],
      maxTokens: LLM_LIMITS.ficha.maxTokens,
      timeoutMs: LLM_LIMITS.ficha.timeoutMs,
    });
    if (result.ok) {
      ficha = parseFicha(result.text);
      status = ficha ? "ok" : "failed";
      code = ficha ? null : "ficha_unparseable";
    } else {
      status = "failed";
      code = result.code;
    }
  }
  try {
    await deps.store.saveFicha(casoId, ficha, status, code, deps.llm?.model ?? null);
  } catch (error) {
    deps.log({ request_id: requestId, caso_id: casoId, action: "ficha", status: "error", error_code: errorCode(error) });
  }
  deps.log({ request_id: requestId, caso_id: casoId, action: "ficha", status: status === "ok" ? "ok" : status === "skipped" ? "skipped" : "error", error_code: code ?? undefined });
  return { ficha, status };
}

async function notify(
  deps: SubmitDeps,
  input: { sub: NormalizedSubmission; ficha: Ficha | null; casoId: string; requestId: string },
): Promise<"sent" | "failed" | "skipped" | "not_claimed" | "error"> {
  const { casoId, requestId } = input;
  try {
    if (!(await deps.store.claimNotification(casoId))) {
      deps.log({ request_id: requestId, caso_id: casoId, action: "notification", status: "skipped", detail: "already_claimed" });
      return "not_claimed";
    }
    const sent = await deps.sendEmail(deps.buildEmail(input));
    const status = sent.ok ? "sent" : sent.code === "resend_not_configured" ? "skipped" : "failed";
    await deps.store.markNotification(casoId, status, sent.ok ? null : sent.code, deps.now());
    deps.log({
      request_id: requestId,
      caso_id: casoId,
      action: "notification",
      status: status === "sent" ? "ok" : status === "skipped" ? "skipped" : "error",
      error_code: sent.ok ? undefined : sent.code,
    });
    return status;
  } catch (error) {
    // El caso ya está guardado: un fallo aquí nunca lo invalida.
    deps.log({ request_id: requestId, caso_id: casoId, action: "notification", status: "error", error_code: errorCode(error) });
    return "error";
  }
}
