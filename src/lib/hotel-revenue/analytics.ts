// Eventos del Hotel Revenue Operator para GTM (window.dataLayer). Cliente.
//
// Lista blanca de eventos y de parámetros, y valores de listas cerradas. No hay
// forma de mandar desde aquí nombre, email, teléfono, hotel, web ni cifras
// exactas de la calculadora: solo tramos (buckets), escenario y origen del CTA.
//
// Consentimiento: igual que el resto del sitio, el evento se encola en
// window.dataLayer siempre; GTM solo se carga (y solo procesa la cola) si la
// persona acepta las cookies (src/islands/CookieBanner.jsx). Quien rechaza no
// envía nada a ninguna plataforma.

import { HOTEL_REVENUE_PRODUCT } from "@/data/hotel-revenue";
import { CALCULATOR_VERSION } from "./calculator";
import type { CalculatorResult, CtaOrigin, ScenarioId } from "./types";

export type HotelRevenueEvent =
  | "hotel_revenue_cta_clicked"
  | "hotel_revenue_calculator_started"
  | "hotel_revenue_calculator_completed"
  | "hotel_revenue_lead_started"
  | "generate_lead";

export const HOTEL_REVENUE_EVENTS: readonly HotelRevenueEvent[] = [
  "hotel_revenue_cta_clicked",
  "hotel_revenue_calculator_started",
  "hotel_revenue_calculator_completed",
  "hotel_revenue_lead_started",
  "generate_lead",
];

export const ROOMS_BUCKETS = ["1-9", "10-29", "30-59", "60-100", "101-250", "251+"] as const;
export const OTA_SHARE_BUCKETS = ["0-24", "25-49", "50-74", "75-100"] as const;
export const OPPORTUNITY_BUCKETS = ["0-499", "500-1999", "2000-4999", "5000-9999", "10000+"] as const;

export type RoomsBucket = (typeof ROOMS_BUCKETS)[number];
export type OtaShareBucket = (typeof OTA_SHARE_BUCKETS)[number];
export type OpportunityBucket = (typeof OPPORTUNITY_BUCKETS)[number];

export interface HotelRevenueEventParams {
  rooms_bucket?: RoomsBucket;
  ota_share_bucket?: OtaShareBucket;
  /** Tramo de la oportunidad MENSUAL del escenario indicado en `scenario`. */
  opportunity_bucket?: OpportunityBucket;
  scenario?: ScenarioId;
  cta_origin?: CtaOrigin;
}

export function roomsBucket(rooms: number): RoomsBucket {
  if (rooms < 10) return "1-9";
  if (rooms < 30) return "10-29";
  if (rooms < 60) return "30-59";
  if (rooms <= 100) return "60-100";
  if (rooms <= 250) return "101-250";
  return "251+";
}

export function otaShareBucket(pct: number): OtaShareBucket {
  if (pct < 25) return "0-24";
  if (pct < 50) return "25-49";
  if (pct < 75) return "50-74";
  return "75-100";
}

export function opportunityBucket(monthlyEuros: number): OpportunityBucket {
  if (monthlyEuros < 500) return "0-499";
  if (monthlyEuros < 2000) return "500-1999";
  if (monthlyEuros < 5000) return "2000-4999";
  if (monthlyEuros < 10000) return "5000-9999";
  return "10000+";
}

/** Dimensiones de un resultado, siempre referidas al escenario realista. */
export function resultDimensions(result: CalculatorResult): HotelRevenueEventParams {
  return {
    rooms_bucket: roomsBucket(result.inputs.rooms),
    ota_share_bucket: otaShareBucket(result.inputs.otaSharePct),
    opportunity_bucket: opportunityBucket(result.scenarios.realistic.totalMonthly),
    scenario: "realistic",
  };
}

const ALLOWED_VALUES: { [K in keyof HotelRevenueEventParams]-?: readonly string[] } = {
  rooms_bucket: ROOMS_BUCKETS,
  ota_share_bucket: OTA_SHARE_BUCKETS,
  opportunity_bucket: OPPORTUNITY_BUCKETS,
  scenario: ["conservative", "realistic", "potential"],
  cta_origin: ["hero", "calculator_embedded", "calculator_page", "pilot", "closing", "hoteles_vertical", "unknown"],
};

/** Descarta cualquier clave o valor fuera de las listas cerradas. */
export function cleanHotelRevenueParams(params: Record<string, unknown>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const allowed = ALLOWED_VALUES[key as keyof HotelRevenueEventParams];
    if (allowed && typeof value === "string" && allowed.includes(value)) clean[key] = value;
  }
  return clean;
}

/** Objeto exacto que se encola. Exportado para poder probarlo sin navegador. */
export function buildHotelRevenuePayload(event: HotelRevenueEvent, params: HotelRevenueEventParams = {}): Record<string, string> | null {
  if (!HOTEL_REVENUE_EVENTS.includes(event)) return null;
  const payload: Record<string, string> = {
    event,
    product_id: HOTEL_REVENUE_PRODUCT.key,
    calculator_version: CALCULATOR_VERSION,
    ...cleanHotelRevenueParams(params as Record<string, unknown>),
  };
  if (event === "generate_lead") payload.lead_source = HOTEL_REVENUE_PRODUCT.leadSource;
  return payload;
}

export function pushHotelRevenueEvent(
  event: HotelRevenueEvent,
  params: HotelRevenueEventParams = {},
  options: { onDone?: () => void; timeoutMs?: number } = {},
): void {
  if (typeof window === "undefined") return;
  const payload = buildHotelRevenuePayload(event, params);
  if (!payload) return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  if (!options.onDone) {
    w.dataLayer.push(payload);
    return;
  }
  // eventCallback solo se ejecuta si GTM está cargado; si no hay
  // consentimiento no se cargó, así que el temporizador garantiza la salida.
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    options.onDone?.();
  };
  w.dataLayer.push({ ...payload, eventCallback: finish, eventTimeout: options.timeoutMs ?? 1500 });
  window.setTimeout(finish, (options.timeoutMs ?? 1500) + 100);
}
