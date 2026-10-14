// Tipos del Hotel Revenue Operator (Fase 1: adquisición y validación).
//
// Compartidos por el motor de la calculadora (función pura), la island, el
// endpoint de leads y los tests. No contienen lógica ni valores de negocio:
// límites y escenarios viven en calculator.ts; textos y rutas, en
// src/data/hotel-revenue.ts.

/** Datos que introduce el hotel. Todos mensuales salvo que se diga otra cosa. */
export interface CalculatorInputs {
  /** Habitaciones de la propiedad (entero). */
  rooms: number;
  /** Ocupación media, en porcentaje (1–100). */
  occupancyPct: number;
  /** ADR: tarifa media por habitación ocupada y noche, en euros. */
  adr: number;
  /** Estancia media, en noches. */
  avgStayNights: number;
  /** Porcentaje de reservas que llegan por OTAs (0–100). */
  otaSharePct: number;
  /** Comisión media de las OTAs, en porcentaje (0–40). */
  otaCommissionPct: number;
  /** Ticket medio de un servicio adicional (parking, desayuno, late checkout…), en euros. */
  upsellAvg: number;
}

export type CalculatorField = keyof CalculatorInputs;

export interface FieldLimit {
  min: number;
  max: number;
  /** Decimales que se conservan al normalizar. */
  decimals: number;
}

export type ScenarioId = "conservative" | "realistic" | "potential";

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  /** Fracción de las reservas OTA que pasa a directa (0–1). */
  otaRecoveryRate: number;
  /** Fracción de reservas que compra un servicio adicional (0–1). */
  upsellAdoptionRate: number;
}

/** Magnitudes base del mes, comunes a los tres escenarios. */
export interface CalculatorBase {
  occupiedRoomNights: number;
  estimatedBookings: number;
  estimatedOtaRevenue: number;
  estimatedOtaCommission: number;
}

export interface ScenarioResult {
  id: ScenarioId;
  otaRecoveryRate: number;
  upsellAdoptionRate: number;
  /** Ahorro bruto de comisión al mes, en euros (2 decimales). */
  commissionSavingsMonthly: number;
  /** Ingresos por servicios adicionales al mes, en euros (2 decimales). */
  upsellRevenueMonthly: number;
  /** Suma de los dos anteriores. */
  totalMonthly: number;
  /** totalMonthly × 12, sin estacionalidad. */
  totalAnnual: number;
}

export interface CalculatorResult {
  version: string;
  inputs: CalculatorInputs;
  base: CalculatorBase;
  scenarios: Record<ScenarioId, ScenarioResult>;
}

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export type ValidationResult<T, K extends string = string> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldErrors<K> };

/** Origen del CTA que llevó al formulario. Lista cerrada (analítica y BD). */
export type CtaOrigin =
  | "hero"
  | "calculator_embedded"
  | "calculator_page"
  | "pilot"
  | "closing"
  | "hoteles_vertical"
  | "unknown";

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

/** Lead ya validado y normalizado en el servidor. */
export interface NormalizedLead {
  submissionId: string;
  name: string;
  email: string;
  hotelName: string;
  website: string | null;
  phone: string | null;
  propertyCount: number;
  roomCount: number;
  inputs: CalculatorInputs;
  consentVersion: string;
  landingPath: string;
  referrerHost: string | null;
  utm: UtmParams;
  ctaOrigin: CtaOrigin;
}

export type LeadField =
  | "submissionId"
  | "name"
  | "email"
  | "hotelName"
  | "website"
  | "phone"
  | "propertyCount"
  | "roomCount"
  | "privacyAccepted"
  | "consentVersion"
  | `inputs.${CalculatorField}`;
