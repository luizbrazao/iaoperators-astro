// Configuración server-side de RGPD Ops. Lee variables de entorno en tiempo de
// petición (nunca en el build) y falla de forma explícita si falta algo.
//
// Ninguna variable lleva prefijo PUBLIC_: Vite no las incluye en el bundle del
// cliente. scripts/check-rgpd-ops-bundle.mjs lo comprueba tras el build.

export function readEnv(name: string): string | undefined {
  const importMetaEnv =
    typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;
  const value = importMetaEnv?.[name] ?? process.env[name];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export class RgpdOpsConfigError extends Error {
  code = "rgpd_ops_config_missing";
  /** Nombres de las variables que faltan. Nunca valores. */
  missing: string[];
  constructor(missing: string[], message?: string) {
    super(message ?? `Faltan variables de entorno de RGPD Ops: ${missing.join(", ")}`);
    this.name = "RgpdOpsConfigError";
    this.missing = missing;
  }
}

function intEnv(name: string, fallback: number, min: number, max: number) {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function boolEnv(name: string, fallback: boolean) {
  const raw = readEnv(name)?.toLowerCase();
  if (raw === undefined) return fallback;
  return raw === "1" || raw === "true" || raw === "yes";
}

export const SITE_URL = "https://iaoperators.com";

/** Base de los magic links. Por defecto, producción. Solo https o http://localhost. */
export function getEmailBaseUrl(): string {
  const raw = readEnv("RGPD_OPS_BASE_URL")?.replace(/\/$/, "");
  if (raw && (/^https:\/\//.test(raw) || /^http:\/\/localhost(:\d+)?$/.test(raw))) return raw;
  return SITE_URL;
}

/** Secreto de firma de sesión y de claves de rate limit. Mínimo 32 caracteres. */
export function getSessionSecret(): string {
  const secret = readEnv("RGPD_OPS_SESSION_SECRET");
  if (!secret) throw new RgpdOpsConfigError(["RGPD_OPS_SESSION_SECRET"]);
  if (secret.length < 32) {
    throw new RgpdOpsConfigError(["RGPD_OPS_SESSION_SECRET"], "RGPD_OPS_SESSION_SECRET debe tener al menos 32 caracteres.");
  }
  return secret;
}

export function getMagicLinkTtlMinutes() {
  return intEnv("RGPD_OPS_MAGIC_LINK_TTL_MINUTES", 60, 5, 1440);
}

export function getSessionTtlDays() {
  return intEnv("RGPD_OPS_SESSION_TTL_DAYS", 30, 1, 90);
}

export interface StripeConfig {
  secretKey: string;
  priceId: string;
  automaticTax: boolean;
  taxRateId?: string;
  invoiceCreation: boolean;
}

export function getStripeConfig(): StripeConfig {
  const secretKey = readEnv("STRIPE_SECRET_KEY");
  const priceId = readEnv("RGPD_OPS_STRIPE_PRICE_ID");
  const missing = [!secretKey && "STRIPE_SECRET_KEY", !priceId && "RGPD_OPS_STRIPE_PRICE_ID"].filter(Boolean) as string[];
  if (missing.length) throw new RgpdOpsConfigError(missing);
  return {
    secretKey: secretKey!,
    priceId: priceId!,
    automaticTax: boolEnv("RGPD_OPS_STRIPE_AUTOMATIC_TAX", false),
    taxRateId: readEnv("RGPD_OPS_STRIPE_TAX_RATE_ID"),
    invoiceCreation: boolEnv("RGPD_OPS_STRIPE_INVOICE_CREATION", true),
  };
}

/**
 * Secreto del endpoint de webhook de RGPD Ops. Stripe firma cada endpoint con
 * su propio secreto: el del Kit (STRIPE_WEBHOOK_SECRET) no sirve aquí.
 */
export function getWebhookSecret(): string {
  const secret = readEnv("RGPD_OPS_STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new RgpdOpsConfigError(["RGPD_OPS_STRIPE_WEBHOOK_SECRET"]);
  return secret;
}

export function getExtraAllowedOrigins(): string[] {
  return (readEnv("RGPD_OPS_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}
