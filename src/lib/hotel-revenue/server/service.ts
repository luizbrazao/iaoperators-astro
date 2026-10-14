// Caso de uso «registrar un lead». Sin dependencias de Astro ni de red: todo
// lo externo (BD, email, reloj, logs) llega inyectado, de modo que los tests
// prueban el flujo completo con dobles en memoria.
//
// Orden:
//   1. honeypot          → éxito aparente, no se guarda nada
//   2. validación        → 400 con los campos a revisar
//   3. configuración     → 503 explícito si falta (nunca un éxito falso)
//   4. rate limit (BD)   → 429; si la BD falla, 503 (sin BD no hay lead)
//   5. recálculo         → las cifras SIEMPRE salen de calculator.ts
//   6. inserción idempotente por submission_id
//   7. notificación interna reclamada en la BD (sin duplicados); si falla,
//      el lead queda guardado con el código de error.

import { rateLimitKeyWith } from "@/lib/commerce/tokens";
import { calculate, CALCULATOR_VERSION } from "../calculator";
import type { CalculatorResult, FieldErrors, LeadField, NormalizedLead } from "../types";
import { isHoneypotFilled, validateLeadPayload } from "../validation";
import type { InternalLeadEmail } from "./email";
import { errorCode, type HotelRevenueLogFields } from "./log";

export const RATE_LIMITS = {
  ip: { limit: 6, windowSeconds: 600 },
  email: { limit: 5, windowSeconds: 86400 },
} as const;

/** Fila tal y como se inserta en public.hotel_revenue_leads. */
export interface LeadRow {
  submission_id: string;
  status: "new";
  name: string;
  email: string;
  hotel_name: string;
  website: string | null;
  phone: string | null;
  property_count: number;
  room_count: number;
  calculator_version: string;
  calculator_inputs: CalculatorResult["inputs"];
  calculator_results: { version: string; base: CalculatorResult["base"]; scenarios: CalculatorResult["scenarios"] };
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_path: string;
  referrer_host: string | null;
  cta_origin: string;
  consent_version: string;
  consent_at: string;
}

export interface LeadStore {
  rateLimitHit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  insertLead(row: LeadRow): Promise<{ id: string; created: boolean }>;
  claimNotification(leadId: string): Promise<boolean>;
  markNotification(leadId: string, status: "sent" | "failed" | "skipped", errorCode: string | null, at: Date): Promise<void>;
}

export interface LeadServiceDeps {
  store: LeadStore;
  hmacSecret: string;
  buildEmail(input: { lead: NormalizedLead; result: CalculatorResult; leadId: string }): InternalLeadEmail;
  sendEmail(email: InternalLeadEmail): Promise<{ ok: boolean; code: string }>;
  now(): Date;
  log(fields: HotelRevenueLogFields): void;
}

export type LeadOutcome =
  | { kind: "created" | "duplicate"; leadId: string; notification: "sent" | "failed" | "skipped" | "not_claimed" | "error" }
  | { kind: "honeypot" }
  | { kind: "invalid"; errors: FieldErrors<LeadField> }
  | { kind: "rate_limited" }
  | { kind: "not_configured"; missing: string[] }
  | { kind: "unavailable"; code: string };

export function buildLeadRow(lead: NormalizedLead, result: CalculatorResult, now: Date): LeadRow {
  return {
    submission_id: lead.submissionId,
    status: "new",
    name: lead.name,
    email: lead.email,
    hotel_name: lead.hotelName,
    website: lead.website,
    phone: lead.phone,
    property_count: lead.propertyCount,
    room_count: lead.roomCount,
    calculator_version: CALCULATOR_VERSION,
    calculator_inputs: result.inputs,
    calculator_results: { version: result.version, base: result.base, scenarios: result.scenarios },
    utm_source: lead.utm.utm_source,
    utm_medium: lead.utm.utm_medium,
    utm_campaign: lead.utm.utm_campaign,
    utm_content: lead.utm.utm_content,
    utm_term: lead.utm.utm_term,
    landing_path: lead.landingPath,
    referrer_host: lead.referrerHost,
    cta_origin: lead.ctaOrigin,
    consent_version: lead.consentVersion,
    consent_at: now.toISOString(),
  };
}

export async function submitLead(
  raw: unknown,
  ctx: { ip: string; requestId: string },
  getDeps: () => LeadServiceDeps,
  log: (fields: HotelRevenueLogFields) => void,
): Promise<LeadOutcome> {
  const { requestId } = ctx;

  if (isHoneypotFilled(raw)) {
    log({ request_id: requestId, action: "lead_submit", status: "skipped", detail: "honeypot" });
    return { kind: "honeypot" };
  }

  const validation = validateLeadPayload(raw);
  if (!validation.ok) {
    log({ request_id: requestId, action: "lead_submit", status: "invalid", detail: Object.keys(validation.errors).join(",") });
    return { kind: "invalid", errors: validation.errors };
  }
  const lead = validation.value;

  let deps: LeadServiceDeps;
  try {
    deps = getDeps();
  } catch (error) {
    const missing = error && typeof error === "object" && Array.isArray((error as { missing?: unknown }).missing)
      ? ((error as { missing: string[] }).missing)
      : [];
    log({ request_id: requestId, action: "config", status: "error", error_code: "lead_storage_not_configured", detail: missing.join(",") });
    return { kind: "not_configured", missing };
  }

  try {
    const ipKey = rateLimitKeyWith("hro.rl", deps.hmacSecret, "lead_ip", ctx.ip || "unknown");
    const emailKey = rateLimitKeyWith("hro.rl", deps.hmacSecret, "lead_email", lead.email);
    const ipOk = await deps.store.rateLimitHit(ipKey, RATE_LIMITS.ip.limit, RATE_LIMITS.ip.windowSeconds);
    const emailOk = ipOk && (await deps.store.rateLimitHit(emailKey, RATE_LIMITS.email.limit, RATE_LIMITS.email.windowSeconds));
    if (!ipOk || !emailOk) {
      deps.log({ request_id: requestId, action: "rate_limit", status: "denied", detail: ipOk ? "lead_email" : "lead_ip" });
      return { kind: "rate_limited" };
    }
  } catch (error) {
    deps.log({ request_id: requestId, action: "rate_limit", status: "error", error_code: errorCode(error) });
    return { kind: "unavailable", code: "lead_storage_unavailable" };
  }

  // Recálculo: los resultados que mande el navegador ni se leen.
  const result = calculate(lead.inputs);
  const now = deps.now();

  let leadId: string;
  let created: boolean;
  try {
    ({ id: leadId, created } = await deps.store.insertLead(buildLeadRow(lead, result, now)));
  } catch (error) {
    deps.log({ request_id: requestId, action: "lead_submit", status: "error", error_code: errorCode(error) });
    return { kind: "unavailable", code: "lead_storage_unavailable" };
  }
  deps.log({ request_id: requestId, lead_id: leadId, action: "lead_submit", status: created ? "ok" : "duplicate" });

  const notification = await notify(deps, { lead, result, leadId, requestId });
  return { kind: created ? "created" : "duplicate", leadId, notification };
}

async function notify(
  deps: LeadServiceDeps,
  input: { lead: NormalizedLead; result: CalculatorResult; leadId: string; requestId: string },
): Promise<"sent" | "failed" | "skipped" | "not_claimed" | "error"> {
  const { leadId, requestId } = input;
  try {
    if (!(await deps.store.claimNotification(leadId))) {
      deps.log({ request_id: requestId, lead_id: leadId, action: "notification", status: "skipped", detail: "already_claimed" });
      return "not_claimed";
    }
    const sent = await deps.sendEmail(deps.buildEmail(input));
    const status = sent.ok ? "sent" : sent.code === "resend_not_configured" ? "skipped" : "failed";
    await deps.store.markNotification(leadId, status, sent.ok ? null : sent.code, deps.now());
    deps.log({
      request_id: requestId,
      lead_id: leadId,
      action: "notification",
      status: status === "sent" ? "ok" : status === "skipped" ? "skipped" : "error",
      error_code: sent.ok ? undefined : sent.code,
    });
    return status;
  } catch (error) {
    // El lead ya está guardado: un fallo aquí nunca lo invalida.
    deps.log({ request_id: requestId, lead_id: leadId, action: "notification", status: "error", error_code: errorCode(error) });
    return "error";
  }
}
