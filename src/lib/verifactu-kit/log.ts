// Logs estructurados del Kit. Una línea JSON por evento, con un conjunto
// CERRADO de campos: no hay forma de colar un email, un token o un payload de
// Stripe sin cambiar este tipo. Los identificadores de Stripe y de pedido no
// son datos personales por sí mismos y permiten cruzar con el Dashboard.

import { randomUUID } from "node:crypto";

export interface KitLogFields {
  request_id?: string;
  stripe_event_id?: string;
  checkout_session_id?: string;
  order_id?: string;
  action: string;
  status: "ok" | "skipped" | "error" | "denied" | "duplicate" | "started";
  error_code?: string;
  /** Detalle técnico sin PII (tipo de evento, modo, motivo). */
  detail?: string;
}

export function kitLog(fields: KitLogFields) {
  const line = JSON.stringify({ scope: "verifactu-kit", ts: new Date().toISOString(), ...fields });
  if (fields.status === "error") console.error(line);
  else if (fields.status === "denied") console.warn(line);
  else console.log(line);
}

/** Usa el id de petición de Vercel si existe; si no, uno propio. */
export function requestIdFrom(request: Request): string {
  const vercelId = request.headers.get("x-vercel-id");
  return (vercelId && vercelId.slice(0, 120)) || randomUUID();
}

/** Código de error estable a partir de cualquier excepción, sin su mensaje. */
export function errorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as { code?: unknown; type?: unknown; name?: unknown };
    if (typeof e.code === "string" && e.code) return e.code.slice(0, 80);
    if (typeof e.type === "string" && e.type) return e.type.slice(0, 80);
    if (typeof e.name === "string" && e.name) return e.name.slice(0, 80);
  }
  return "unknown_error";
}
