// Logs estructurados de «Problema Resuelto». Conjunto CERRADO de campos: no
// hay forma de colar un nombre, email, empresa, IP o el texto del problema sin
// cambiar este tipo. `detail` admite solo un código corto (se filtra).

export { errorCode, requestIdFrom } from "@/lib/hotel-revenue/server/log";

export interface ProblemaLogFields {
  request_id?: string;
  caso_id?: string;
  action: "chat_turn" | "submit" | "ficha" | "rate_limit" | "notification" | "config" | "llm" | "method";
  status: "ok" | "duplicate" | "skipped" | "denied" | "invalid" | "error" | "fallback";
  error_code?: string;
  /** Código sin PII: nombres de campo, ámbito de rate limit, nombres de variables, número de turno. */
  detail?: string;
}

const SAFE_DETAIL = /^[a-zA-Z0-9_.:,\- ]{0,200}$/;

export function formatLogLine(fields: ProblemaLogFields, now: Date = new Date()): string {
  const clean: ProblemaLogFields = { ...fields };
  if (clean.detail !== undefined) {
    const detail = clean.detail.slice(0, 200);
    clean.detail = SAFE_DETAIL.test(detail) ? detail : "redacted";
  }
  if (clean.error_code !== undefined) clean.error_code = clean.error_code.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 80);
  return JSON.stringify({ scope: "problema-resuelto", ts: now.toISOString(), ...clean });
}

export function prLog(fields: ProblemaLogFields) {
  const line = formatLogLine(fields);
  if (fields.status === "error") console.error(line);
  else if (fields.status === "denied") console.warn(line);
  else console.log(line);
}
