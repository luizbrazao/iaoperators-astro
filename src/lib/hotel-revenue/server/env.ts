// Configuración server-side del Hotel Revenue Operator. Lee variables en
// tiempo de petición (nunca en el build) y falla de forma explícita si falta
// algo imprescindible para no perder un lead.
//
// Ninguna variable lleva prefijo PUBLIC_: Vite no las incluye en el bundle del
// cliente. scripts/check-hotel-revenue-bundle.mjs lo comprueba tras el build.

export const SITE_URL = "https://iaoperators.com";

export function readEnv(name: string): string | undefined {
  const importMetaEnv =
    typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;
  const value = importMetaEnv?.[name] ?? process.env[name];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export class HotelRevenueConfigError extends Error {
  code = "lead_storage_not_configured";
  /** Nombres de las variables que faltan o no son válidas. Nunca valores. */
  missing: string[];
  constructor(missing: string[], message?: string) {
    super(message ?? `Faltan variables de entorno del Hotel Revenue Operator: ${missing.join(", ")}`);
    this.name = "HotelRevenueConfigError";
    this.missing = missing;
  }
}

export interface LeadStorageConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  hmacSecret: string;
}

/** Lo imprescindible para guardar un lead. Sin esto el endpoint responde 503. */
export function getLeadStorageConfig(): LeadStorageConfig {
  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const hmacSecret = readEnv("HOTEL_REVENUE_HMAC_SECRET");
  const missing = [
    !supabaseUrl && "SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    (!hmacSecret || hmacSecret.length < 32) && "HOTEL_REVENUE_HMAC_SECRET",
  ].filter(Boolean) as string[];
  if (missing.length) throw new HotelRevenueConfigError(missing);
  return { supabaseUrl: supabaseUrl!, serviceRoleKey: serviceRoleKey!, hmacSecret: hmacSecret! };
}

export interface NotificationConfig {
  resendApiKey?: string;
  from: string;
  to: string;
}

/** La notificación es opcional: sin RESEND_API_KEY el lead se guarda igual. */
export function getNotificationConfig(): NotificationConfig {
  return {
    resendApiKey: readEnv("RESEND_API_KEY"),
    from: readEnv("CONTACT_FROM_EMAIL") || "IA Operators <onboarding@resend.dev>",
    to: readEnv("CONTACT_TO_EMAIL") || "info@iaoperators.com",
  };
}

export function getExtraAllowedOrigins(): string[] {
  return (readEnv("HOTEL_REVENUE_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/**
 * Validación de Origin (CSRF). Sin Origin, o con "null", decide
 * Sec-Fetch-Site, que el navegador fija y otra web no puede falsificar.
 */
export function isAllowedOrigin(request: Request, url: URL, extra: readonly string[] = getExtraAllowedOrigins()): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return request.headers.get("sec-fetch-site") === "same-origin";
  const normalized = origin.replace(/\/$/, "");
  if (normalized === url.origin) return true;
  if (normalized === SITE_URL || normalized === SITE_URL.replace("https://", "https://www.")) return true;
  return extra.includes(normalized);
}

/** Enlace al editor de tablas de Supabase a partir de SUPABASE_URL (si es *.supabase.co). */
export function supabaseTableEditorUrl(supabaseUrl: string | undefined): string | null {
  const m = supabaseUrl?.match(/^https:\/\/([a-z0-9]{10,40})\.supabase\.co\/?$/);
  return m ? `https://supabase.com/dashboard/project/${m[1]}/editor` : null;
}
