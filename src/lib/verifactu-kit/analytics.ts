// Eventos del Kit para GTM (window.dataLayer). Cliente.
//
// Lista blanca de eventos y de parámetros: no hay forma de mandar un email, un
// NIF o un nombre al dataLayer desde aquí. Solo identificadores de producto,
// segmento del test, nivel de riesgo y página de origen.

import { KIT_PRODUCT } from "@/data/verifactu-kit";

export type KitEvent =
  | "view_item"
  | "begin_checkout"
  | "checkout_error"
  | "purchase_confirmed"
  | "kit_accessed"
  | "kit_module_completed"
  | "kit_template_copied"
  | "audit_cta_clicked";

export interface KitEventParams {
  assessment_segment?: string;
  risk_level?: string;
  source_page?: string;
  module_id?: string;
  template_id?: string;
  error_code?: string;
  transaction_id?: string;
  value?: number;
  currency?: string;
}

const ALLOWED = new Set<keyof KitEventParams>([
  "assessment_segment",
  "risk_level",
  "source_page",
  "module_id",
  "template_id",
  "error_code",
  "transaction_id",
  "value",
  "currency",
]);

const SAFE = /^[a-z0-9_.:\/-]{0,120}$/i;

export function pushKitEvent(event: KitEvent, params: KitEventParams = {}) {
  if (typeof window === "undefined") return;
  const clean: Record<string, unknown> = {
    event,
    product_id: KIT_PRODUCT.key,
    product_version: KIT_PRODUCT.version,
    source_page: window.location.pathname,
  };
  for (const [key, value] of Object.entries(params)) {
    if (!ALLOWED.has(key as keyof KitEventParams) || value === undefined || value === null) continue;
    if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "string" && SAFE.test(value)) clean[key] = value;
  }
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(clean);
}

/** Contexto del test guardado al pulsar la oferta (solo en esta pestaña). */
export interface KitAssessmentContext {
  rid?: string;
  seg?: string;
  risk?: string;
}

const CTX_KEY = "vfk_ctx";

export function saveAssessmentContext(ctx: KitAssessmentContext) {
  try {
    window.sessionStorage.setItem(CTX_KEY, JSON.stringify(ctx));
  } catch {
    /* almacenamiento no disponible: el checkout funciona sin contexto */
  }
}

export function readAssessmentContext(): KitAssessmentContext {
  try {
    const raw = window.sessionStorage.getItem(CTX_KEY);
    const parsed = raw ? (JSON.parse(raw) as KitAssessmentContext) : {};
    return {
      rid: typeof parsed.rid === "string" ? parsed.rid : undefined,
      seg: typeof parsed.seg === "string" ? parsed.seg : undefined,
      risk: typeof parsed.risk === "string" ? parsed.risk : undefined,
    };
  } catch {
    return {};
  }
}
