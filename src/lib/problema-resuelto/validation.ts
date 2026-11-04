// Validación y normalización de lo que llega del navegador al programa
// «Problema Resuelto». Pura y compartida: la usan los endpoints y los tests.
// Lista blanca estricta: los campos que no están aquí se descartan sin mirarlos.

import {
  ACCEPTED_PROBLEMA_BASES_VERSIONS,
  ACCEPTED_PROBLEMA_CONSENT_VERSIONS,
  COMPANY_SIZES,
  FALLBACK_QUESTIONS,
  MANAGER_AWARE,
  PROBLEMA_LIMITS,
  PROBLEMA_PROGRAM,
  type CompanySize,
  type FallbackKey,
  type ManagerAware,
} from "@/data/problema-resuelto";
import { cleanMultiline, cleanText, isFreeEmailDomain, maskPii } from "./text";
import type {
  ChatMessage,
  ChatTurnInput,
  FallbackAnswers,
  FieldErrors,
  NormalizedSubmission,
  SubmitField,
  UtmParams,
  ValidationResult,
} from "./types";

export const SUBMIT_LIMITS = {
  name: { min: 2, max: 120 },
  company: { min: 2, max: 160 },
  jobTitle: { min: 2, max: 120 },
  email: { max: 254 },
  /** Mensajes en la transcripción: 6 de la persona + 6 del agente. */
  transcriptMax: PROBLEMA_LIMITS.userTurns * 2,
  /** Respuestas del agente: más largas que los mensajes de la persona. */
  assistantMax: 2000,
  answerMax: 1500,
  situacionMin: 20,
  landingPath: { max: 200 },
  utm: { max: 100 },
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STATE_RE = /^\d{10}\.[0-9a-f]{64}$/;

export function normalizeEmail(value: unknown): string | null {
  const email = cleanText(value, 300).toLowerCase();
  if (!email || email.length > SUBMIT_LIMITS.email.max || !EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Transcripción enviada por el navegador. Solo se comprueba la forma: que el
 * contenido es el que el servidor devolvió lo garantiza la firma del estado
 * (server/transcript.ts). Devuelve null si la forma no es válida.
 */
export function parseTranscript(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length > SUBMIT_LIMITS.transcriptMax) return null;
  const out: ChatMessage[] = [];
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as Record<string, unknown>;
    // Alterna estrictamente: persona, agente, persona, agente…
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (role !== expected || typeof content !== "string") return null;
    const max = expected === "user" ? PROBLEMA_LIMITS.messageMax : SUBMIT_LIMITS.assistantMax;
    if (content.length === 0 || content.length > max) return null;
    out.push({ role: expected, content });
  }
  return out;
}

export type ChatTurnField = "message" | "transcript" | "state";

export function validateChatTurn(raw: unknown): ValidationResult<ChatTurnInput, ChatTurnField> {
  const body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const errors: FieldErrors<ChatTurnField> = {};

  const message = cleanMultiline(body.message, PROBLEMA_LIMITS.messageMax + 500);
  if (message.length < PROBLEMA_LIMITS.messageMin) errors.message = "Cuéntalo con un poco más de detalle.";
  else if (message.length > PROBLEMA_LIMITS.messageMax) errors.message = `Como mucho ${PROBLEMA_LIMITS.messageMax} caracteres por mensaje.`;

  const transcript = parseTranscript(body.transcript ?? []);
  // Antes del nuevo mensaje la transcripción termina siempre en una respuesta del agente.
  if (!transcript || transcript.length % 2 !== 0) errors.transcript = "La conversación no es válida. Empieza de nuevo.";

  const state = body.state === null || body.state === undefined ? null : cleanText(body.state, 100);
  if (transcript && transcript.length > 0 && (!state || !STATE_RE.test(state))) {
    errors.state = "La conversación ha caducado. Empieza de nuevo.";
  }
  if (transcript && transcript.length === 0 && state) errors.state = "La conversación no es válida. Empieza de nuevo.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { message, transcript: transcript!, state } };
}

/** Solo la ruta, y solo dentro de la landing del programa. Lo demás → la landing. */
export function sanitizeLandingPath(value: unknown): string {
  const raw = cleanText(value, 400);
  let path = "";
  try {
    path = new URL(raw, "https://iaoperators.com").pathname;
  } catch {
    path = "";
  }
  if (!path.startsWith(PROBLEMA_PROGRAM.paths.landing) || path.length > SUBMIT_LIMITS.landingPath.max || !/^[a-z0-9/_-]+$/i.test(path)) {
    return PROBLEMA_PROGRAM.paths.landing;
  }
  return path.endsWith("/") ? path : `${path}/`;
}

/** Del referrer solo se conserva el host (sin ruta, query ni credenciales). */
export function sanitizeReferrerHost(value: unknown): string | null {
  const raw = cleanText(value, 2048);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    return host.length <= 253 && /^[a-z0-9.-]+$/.test(host) ? host : null;
  } catch {
    return null;
  }
}

// Valores UTM: cortos y sin "@", para que un email pegado en una URL no acabe en la BD.
const UTM_VALUE_RE = /^[\p{L}\p{N} _.+\-/:|]{1,100}$/u;
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function sanitizeUtm(value: unknown): UtmParams {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const out = {} as UtmParams;
  for (const key of UTM_KEYS) {
    const v = cleanText(input[key], 200);
    out[key] = v && v.length <= SUBMIT_LIMITS.utm.max && UTM_VALUE_RE.test(v) ? v : null;
  }
  return out;
}

/** true si el honeypot llega relleno. Se llama hp_confirm a propósito: `website` lo rellena el autocompletado. */
export function isHoneypotFilled(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return cleanText((raw as Record<string, unknown>).hp_confirm, 200) !== "";
}

const SIZE_VALUES = COMPANY_SIZES.map((s) => s.value) as readonly string[];
const AWARE_VALUES = MANAGER_AWARE.map((s) => s.value) as readonly string[];

export function validateSubmission(
  raw: unknown,
  accepted: { consent: readonly string[]; bases: readonly string[] } = {
    consent: ACCEPTED_PROBLEMA_CONSENT_VERSIONS,
    bases: ACCEPTED_PROBLEMA_BASES_VERSIONS,
  },
): ValidationResult<NormalizedSubmission, SubmitField> {
  const body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const errors: FieldErrors<SubmitField> = {};

  const submissionId = cleanText(body.submissionId, 64).toLowerCase();
  if (!UUID_RE.test(submissionId)) errors.submissionId = "Recarga la página e inténtalo de nuevo.";

  const mode = body.mode === "chat" || body.mode === "form" ? body.mode : null;
  if (!mode) errors.mode = "Recarga la página e inténtalo de nuevo.";

  let transcript: ChatMessage[] | null = null;
  let state: string | null = null;
  let answers: FallbackAnswers | null = null;
  let piiMasked = false;

  if (mode === "chat") {
    transcript = parseTranscript(body.transcript);
    state = cleanText(body.state, 100);
    if (!transcript || transcript.length < 2 || transcript.length % 2 !== 0 || !STATE_RE.test(state)) {
      errors.transcript = "La conversación no es válida o ha caducado. Empieza de nuevo.";
    }
    // El servidor ya enmascaró cada mensaje al recibirlo; se comprueba por si acaso.
    piiMasked = !!transcript?.some((m) => m.role === "user" && /\[(email|IBAN|NIE|DNI|número)\]/.test(m.content));
  } else if (mode === "form") {
    const input = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
    const out = {} as FallbackAnswers;
    for (const q of FALLBACK_QUESTIONS) {
      const cleaned = cleanMultiline(input[q.key], SUBMIT_LIMITS.answerMax + 500);
      if (cleaned.length > SUBMIT_LIMITS.answerMax) {
        errors[`answers.${q.key}` as SubmitField] = `Como mucho ${SUBMIT_LIMITS.answerMax} caracteres.`;
        continue;
      }
      if (q.required && cleaned.length < SUBMIT_LIMITS.situacionMin) {
        errors[`answers.${q.key}` as SubmitField] = "Cuéntalo con un poco más de detalle.";
        continue;
      }
      const masked = maskPii(cleaned);
      if (masked.kinds.length) piiMasked = true;
      out[q.key as FallbackKey] = masked.text;
    }
    answers = out;
  }

  const name = cleanText(body.name, 300);
  if (name.length < SUBMIT_LIMITS.name.min || name.length > SUBMIT_LIMITS.name.max) errors.name = "Escribe tu nombre.";

  const email = normalizeEmail(body.email);
  if (!email) errors.email = "Escribe un email válido.";
  else if (isFreeEmailDomain(email)) errors.email = "Usa el correo de tu empresa. Así sabemos para quién es la solución.";

  const company = cleanText(body.company, 300);
  if (company.length < SUBMIT_LIMITS.company.min || company.length > SUBMIT_LIMITS.company.max) errors.company = "Escribe el nombre de la empresa.";

  const jobTitle = cleanText(body.jobTitle, 300);
  if (jobTitle.length < SUBMIT_LIMITS.jobTitle.min || jobTitle.length > SUBMIT_LIMITS.jobTitle.max) errors.jobTitle = "Escribe tu cargo o área.";

  const companySize = SIZE_VALUES.includes(body.companySize as string) ? (body.companySize as CompanySize) : null;
  if (!companySize) errors.companySize = "Elige el tamaño de la empresa.";

  const managerAware = AWARE_VALUES.includes(body.managerAware as string) ? (body.managerAware as ManagerAware) : null;
  if (!managerAware) errors.managerAware = "Elige una opción.";

  if (body.privacyAccepted !== true) errors.privacyAccepted = "Necesitamos tu aceptación para poder evaluar el caso.";
  if (body.basesAccepted !== true) errors.basesAccepted = "Para participar hay que aceptar las bases.";

  const consentVersion = cleanText(body.consentVersion, 60);
  if (!accepted.consent.includes(consentVersion)) errors.consentVersion = "Recarga la página e inténtalo de nuevo.";
  const basesVersion = cleanText(body.basesVersion, 60);
  if (!accepted.bases.includes(basesVersion)) errors.basesVersion = "Recarga la página e inténtalo de nuevo.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const context = body.context && typeof body.context === "object" ? (body.context as Record<string, unknown>) : {};

  return {
    ok: true,
    value: {
      submissionId,
      mode: mode!,
      transcript,
      state: mode === "chat" ? state : null,
      answers,
      piiMasked,
      name,
      email: email!,
      company,
      jobTitle,
      companySize: companySize!,
      managerAware: managerAware!,
      consentVersion,
      basesVersion,
      landingPath: sanitizeLandingPath(context.landingPath),
      referrerHost: sanitizeReferrerHost(context.referrer),
      utm: sanitizeUtm(context.utm),
    },
  };
}

/** Texto principal del caso para leerlo de un vistazo (columna problem_text). */
export function problemTextOf(sub: Pick<NormalizedSubmission, "mode" | "transcript" | "answers">): string {
  if (sub.mode === "chat") return (sub.transcript?.[0]?.content ?? "").slice(0, 4000);
  return (sub.answers?.situacion ?? "").slice(0, 4000);
}
