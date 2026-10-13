// Logs estructurados de RGPD Ops. Conjunto CERRADO de campos: no hay forma de
// colar un email, un token, una IP, un payload de Stripe ni contenido del
// espacio de trabajo sin cambiar este tipo.

import { randomUUID } from "node:crypto";

export interface RgpdOpsLogFields {
  request_id?: string;
  stripe_event_id?: string;
  checkout_session_id?: string;
  order_id?: string;
  workspace_id?: string;
  action: string;
  status: "ok" | "skipped" | "error" | "denied" | "duplicate" | "started" | "conflict";
  error_code?: string;
  /** Detalle técnico sin PII (tipo de evento, entidad, motivo). */
  detail?: string;
}

export function opsLog(fields: RgpdOpsLogFields) {
  const line = JSON.stringify({ scope: "rgpd-ops", ts: new Date().toISOString(), ...fields });
  if (fields.status === "error") console.error(line);
  else if (fields.status === "denied") console.warn(line);
  else console.log(line);
}

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
