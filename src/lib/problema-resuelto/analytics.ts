// Eventos de «Problema Resuelto» para GTM (window.dataLayer). Cliente.
//
// Lista blanca de eventos y de parámetros con valores de listas cerradas: no
// hay forma de mandar desde aquí el texto del problema, el nombre, el email ni
// la empresa. Igual que el resto del sitio, el evento se encola siempre y GTM
// solo lo procesa si la persona acepta las cookies (CookieBanner).

import { COMPANY_SIZES, PROBLEMA_PROGRAM } from "@/data/problema-resuelto";

export type ProblemaEvent = "problem_start" | "triage_complete" | "problem_fallback" | "problem_submit" | "generate_lead";

export const PROBLEMA_EVENTS: readonly ProblemaEvent[] = ["problem_start", "triage_complete", "problem_fallback", "problem_submit", "generate_lead"];

export interface ProblemaEventParams {
  mode?: "chat" | "form";
  company_size?: (typeof COMPANY_SIZES)[number]["value"];
  /** Turnos que hizo falta para llegar al resumen. */
  turns?: "1" | "2" | "3" | "4" | "5" | "6";
  fallback_reason?: "agent_unavailable" | "daily_limit" | "error";
}

const ALLOWED: { [K in keyof ProblemaEventParams]-?: readonly string[] } = {
  mode: ["chat", "form"],
  company_size: COMPANY_SIZES.map((s) => s.value),
  turns: ["1", "2", "3", "4", "5", "6"],
  fallback_reason: ["agent_unavailable", "daily_limit", "error"],
};

export function buildProblemaPayload(event: ProblemaEvent, params: ProblemaEventParams = {}): Record<string, string> | null {
  if (!PROBLEMA_EVENTS.includes(event)) return null;
  const payload: Record<string, string> = { event, program_id: PROBLEMA_PROGRAM.key };
  for (const [key, value] of Object.entries(params)) {
    const allowed = ALLOWED[key as keyof ProblemaEventParams];
    if (allowed && typeof value === "string" && allowed.includes(value)) payload[key] = value;
  }
  if (event === "generate_lead") payload.lead_source = PROBLEMA_PROGRAM.leadSource;
  return payload;
}

export function pushProblemaEvent(event: ProblemaEvent, params: ProblemaEventParams = {}): void {
  if (typeof window === "undefined") return;
  const payload = buildProblemaPayload(event, params);
  if (!payload) return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(payload);
}
