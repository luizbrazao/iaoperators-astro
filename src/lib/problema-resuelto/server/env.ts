// Configuración server-side del programa «Problema Resuelto». Lee variables en
// tiempo de petición (nunca en el build) y falla de forma explícita si falta
// algo imprescindible.
//
// Ninguna variable lleva prefijo PUBLIC_: Vite no las incluye en el bundle del
// cliente. scripts/check-problema-resuelto-bundle.mjs lo comprueba tras el build.

import { isAllowedOrigin as isAllowedOriginWith, readEnv } from "@/lib/hotel-revenue/server/env";

export { readEnv };

export class ProblemaConfigError extends Error {
  code = "problema_not_configured";
  /** Nombres de las variables que faltan o no son válidas. Nunca valores. */
  missing: string[];
  constructor(missing: string[]) {
    super(`Faltan variables de entorno de Problema Resuelto: ${missing.join(", ")}`);
    this.name = "ProblemaConfigError";
    this.missing = missing;
  }
}

/** Firma de la conversación. Sin esto no funciona ni el chat ni el envío. */
export function getHmacSecret(): string {
  const secret = readEnv("PROBLEMA_HMAC_SECRET");
  if (!secret || secret.length < 32) throw new ProblemaConfigError(["PROBLEMA_HMAC_SECRET"]);
  return secret;
}

export interface StorageConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  hmacSecret: string;
}

/** Lo imprescindible para guardar un caso. Sin esto el envío responde 503. */
export function getStorageConfig(): StorageConfig {
  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const hmacSecret = readEnv("PROBLEMA_HMAC_SECRET");
  const missing = [
    !supabaseUrl && "SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    (!hmacSecret || hmacSecret.length < 32) && "PROBLEMA_HMAC_SECRET",
  ].filter(Boolean) as string[];
  if (missing.length) throw new ProblemaConfigError(missing);
  return { supabaseUrl: supabaseUrl!, serviceRoleKey: serviceRoleKey!, hmacSecret: hmacSecret! };
}

/** Modelo por defecto del agente: rápido y barato, suficiente para triar. */
export const DEFAULT_LLM_MODEL = "claude-haiku-5-5";

export interface LlmConfig {
  apiKey: string;
  model: string;
}

/** null = agente desactivado: la página cae al formulario de respaldo. */
export function getLlmConfig(): LlmConfig | null {
  const apiKey = readEnv("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  const model = readEnv("PROBLEMA_LLM_MODEL") ?? DEFAULT_LLM_MODEL;
  return /^[a-z0-9.\-_]{3,80}$/i.test(model) ? { apiKey, model } : null;
}

/** Turnos del agente al día, en total. Protege el coste del modelo. */
export function getDailyTurnLimit(): number {
  const raw = Number(readEnv("PROBLEMA_DAILY_TURN_LIMIT") ?? "400");
  return Number.isInteger(raw) && raw >= 1 && raw <= 100000 ? raw : 400;
}

export interface NotificationConfig {
  resendApiKey?: string;
  from: string;
  to: string;
}

/** La notificación es opcional: sin RESEND_API_KEY el caso se guarda igual. */
export function getNotificationConfig(): NotificationConfig {
  return {
    resendApiKey: readEnv("RESEND_API_KEY"),
    from: readEnv("CONTACT_FROM_EMAIL") || "IA Operators <onboarding@resend.dev>",
    to: readEnv("CONTACT_TO_EMAIL") || "info@iaoperators.com",
  };
}

export function getExtraAllowedOrigins(): string[] {
  return (readEnv("PROBLEMA_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/** Validación de Origin (CSRF), la misma regla que el resto de formularios. */
export function isAllowedOrigin(request: Request, url: URL): boolean {
  return isAllowedOriginWith(request, url, getExtraAllowedOrigins());
}

export { supabaseTableEditorUrl } from "@/lib/hotel-revenue/server/env";
