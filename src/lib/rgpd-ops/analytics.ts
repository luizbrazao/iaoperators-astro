// Eventos de RGPD Ops para GTM (window.dataLayer). Cliente.
//
// Lista blanca de eventos y de parámetros. No hay forma de mandar desde aquí
// respuestas del test, nombres de proveedores, datos de la empresa, emails,
// identificadores internos ni contenido del espacio de trabajo: solo
// identificadores de producto, nivel, segmento, módulo y formato.

import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";

export type RgpdOpsEvent =
  | "view_item"
  | "begin_checkout"
  | "checkout_error"
  | "rgpd_ops_accessed"
  | "rgpd_ops_module_completed"
  | "rgpd_ops_exported"
  | "rgpd_ops_review_completed"
  | "review_cta_clicked";

export interface RgpdOpsEventParams {
  maturity_level?: string;
  risk_level?: string;
  segment?: string;
  module_id?: string;
  export_format?: string;
  export_type?: string;
  error_code?: string;
  value?: number;
  currency?: string;
}

const ALLOWED = new Set<keyof RgpdOpsEventParams>([
  "maturity_level",
  "risk_level",
  "segment",
  "module_id",
  "export_format",
  "export_type",
  "error_code",
  "value",
  "currency",
]);

// Valores cortos, sin espacios ni "@": un email o un texto libre no pasa.
const SAFE = /^[a-z0-9_.:\/-]{0,80}$/i;

export function cleanRgpdOpsParams(params: RgpdOpsEventParams): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!ALLOWED.has(key as keyof RgpdOpsEventParams) || value === undefined || value === null) continue;
    if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "string" && SAFE.test(value)) clean[key] = value;
  }
  return clean;
}

export function pushRgpdOpsEvent(event: RgpdOpsEvent, params: RgpdOpsEventParams = {}) {
  if (typeof window === "undefined") return;
  const payload: Record<string, unknown> = {
    event,
    product_id: RGPD_OPS_PRODUCT.key,
    product_version: RGPD_OPS_PRODUCT.version,
    source_page: window.location.pathname,
    ...cleanRgpdOpsParams(params),
  };
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(payload);
}

/** Contexto del test guardado al pulsar la oferta (solo en esta pestaña). */
export interface RgpdAssessmentContext {
  rid?: string;
  seg?: string;
  lvl?: string;
  risk?: string;
}

const CTX_KEY = "rgo_ctx";

export function saveRgpdAssessmentContext(ctx: RgpdAssessmentContext) {
  try {
    window.sessionStorage.setItem(CTX_KEY, JSON.stringify(ctx));
  } catch {
    /* almacenamiento no disponible: el checkout funciona sin contexto */
  }
}

export function readRgpdAssessmentContext(): RgpdAssessmentContext {
  try {
    const raw = window.sessionStorage.getItem(CTX_KEY);
    const parsed = raw ? (JSON.parse(raw) as RgpdAssessmentContext) : {};
    const str = (v: unknown) => (typeof v === "string" && v.length <= 80 ? v : undefined);
    return { rid: str(parsed.rid), seg: str(parsed.seg), lvl: str(parsed.lvl), risk: str(parsed.risk) };
  } catch {
    return {};
  }
}
