// Configuración server-side del Kit. Lee variables de entorno en tiempo de
// petición (nunca en el build) y falla de forma explícita si falta algo.
//
// Ninguna de estas variables lleva prefijo PUBLIC_: Vite no las incluye en el
// bundle del cliente. scripts/check-client-bundle.mjs lo comprueba tras el build.

export function readEnv(name: string): string | undefined {
  const importMetaEnv =
    typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;
  const value = importMetaEnv?.[name] ?? process.env[name];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export class KitConfigError extends Error {
  code = "kit_config_missing";
  /** Nombres de las variables que faltan. Nunca valores. */
  missing: string[];
  constructor(missing: string[], message?: string) {
    super(message ?? `Faltan variables de entorno del Kit: ${missing.join(", ")}`);
    this.name = "KitConfigError";
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

/**
 * Base de los enlaces que salen por email (magic links). Por defecto, el dominio
 * de producción. En local o en un preview se puede apuntar a otra URL con
 * VERIFACTU_KIT_BASE_URL (solo https o http://localhost).
 */
export function getEmailBaseUrl(): string {
  const raw = readEnv("VERIFACTU_KIT_BASE_URL")?.replace(/\/$/, "");
  if (raw && (/^https:\/\//.test(raw) || /^http:\/\/localhost(:\d+)?$/.test(raw))) return raw;
  return SITE_URL;
}

/** Secreto de firma de sesión y de claves de rate limit. Mínimo 32 caracteres. */
export function getSessionSecret(): string {
  const secret = readEnv("VERIFACTU_KIT_SESSION_SECRET");
  if (!secret) throw new KitConfigError(["VERIFACTU_KIT_SESSION_SECRET"]);
  if (secret.length < 32) {
    throw new KitConfigError(
      ["VERIFACTU_KIT_SESSION_SECRET"],
      "VERIFACTU_KIT_SESSION_SECRET debe tener al menos 32 caracteres.",
    );
  }
  return secret;
}

export function getMagicLinkTtlMinutes() {
  return intEnv("VERIFACTU_KIT_MAGIC_LINK_TTL_MINUTES", 60, 5, 1440);
}

export function getSessionTtlDays() {
  return intEnv("VERIFACTU_KIT_SESSION_TTL_DAYS", 30, 1, 90);
}

export interface StripeConfig {
  secretKey: string;
  priceId: string;
  /** Stripe Tax activado en la cuenta → automatic_tax. */
  automaticTax: boolean;
  /** Alternativa sin Stripe Tax: Tax Rate fijo (p. ej. IVA 21 %). */
  taxRateId?: string;
  /** Factura de Stripe tras el pago (recomendado para clientes empresa). */
  invoiceCreation: boolean;
}

export function getStripeConfig(): StripeConfig {
  const secretKey = readEnv("STRIPE_SECRET_KEY");
  const priceId = readEnv("VERIFACTU_KIT_STRIPE_PRICE_ID");
  const missing = [
    !secretKey && "STRIPE_SECRET_KEY",
    !priceId && "VERIFACTU_KIT_STRIPE_PRICE_ID",
  ].filter(Boolean) as string[];
  if (missing.length) throw new KitConfigError(missing);
  return {
    secretKey: secretKey!,
    priceId: priceId!,
    automaticTax: boolEnv("VERIFACTU_KIT_STRIPE_AUTOMATIC_TAX", false),
    taxRateId: readEnv("VERIFACTU_KIT_STRIPE_TAX_RATE_ID"),
    invoiceCreation: boolEnv("VERIFACTU_KIT_STRIPE_INVOICE_CREATION", true),
  };
}

export function getWebhookSecret(): string {
  const secret = readEnv("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new KitConfigError(["STRIPE_WEBHOOK_SECRET"]);
  return secret;
}

/** Orígenes aceptados además del propio (previews de Vercel, localhost). */
export function getExtraAllowedOrigins(): string[] {
  return (readEnv("VERIFACTU_KIT_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isSupabaseConfigured() {
  return Boolean(readEnv("SUPABASE_URL") && readEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
