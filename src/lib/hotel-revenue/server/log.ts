// Logs estructurados del Hotel Revenue Operator. Conjunto CERRADO de campos:
// no hay forma de colar un nombre, email, teléfono, hotel, IP o payload sin
// cambiar este tipo. `detail` admite solo un código corto (se filtra).

import { randomUUID } from "node:crypto";

export interface HotelRevenueLogFields {
  request_id?: string;
  lead_id?: string;
  action: "lead_submit" | "rate_limit" | "notification" | "config" | "method";
  status: "ok" | "duplicate" | "skipped" | "denied" | "invalid" | "error";
  error_code?: string;
  /** Código sin PII: nombres de campo, ámbito de rate limit, nombres de variables. */
  detail?: string;
}

const SAFE_DETAIL = /^[a-zA-Z0-9_.:,\- ]{0,200}$/;

export function formatLogLine(fields: HotelRevenueLogFields, now: Date = new Date()): string {
  const clean: HotelRevenueLogFields = { ...fields };
  if (clean.detail !== undefined) {
    const detail = clean.detail.slice(0, 200);
    clean.detail = SAFE_DETAIL.test(detail) ? detail : "redacted";
  }
  if (clean.error_code !== undefined) clean.error_code = clean.error_code.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 80);
  return JSON.stringify({ scope: "hotel-revenue", ts: now.toISOString(), ...clean });
}

export function hroLog(fields: HotelRevenueLogFields) {
  const line = formatLogLine(fields);
  if (fields.status === "error") console.error(line);
  else if (fields.status === "denied") console.warn(line);
  else console.log(line);
}

export function requestIdFrom(request: Request): string {
  const vercelId = request.headers.get("x-vercel-id");
  return (vercelId && /^[a-zA-Z0-9:_-]{1,120}$/.test(vercelId) && vercelId) || randomUUID();
}

/** Código de error estable a partir de cualquier excepción, sin su mensaje. */
export function errorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as { code?: unknown; name?: unknown };
    if (typeof e.code === "string" && e.code) return e.code.slice(0, 80);
    if (typeof e.name === "string" && e.name) return e.name.slice(0, 80);
  }
  return "unknown_error";
}
