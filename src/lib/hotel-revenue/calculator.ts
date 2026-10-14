// Motor de la calculadora de oportunidad del Hotel Revenue Operator.
//
// Funciones PURAS: sin DOM, sin red, sin fecha, sin aleatoriedad. Las usan la
// island (para mostrar), el endpoint (para recalcular: nunca se guarda lo que
// calcula el navegador) y los tests. Mismos datos → mismo resultado, siempre.
//
// Modelo (versión CALCULATOR_VERSION), en base mensual de 30 días:
//   occupiedRoomNights     = rooms × 30 × ocupación
//   estimatedBookings      = occupiedRoomNights ÷ estancia media
//   estimatedOtaRevenue    = occupiedRoomNights × ADR × cuota OTA
//   estimatedOtaCommission = estimatedOtaRevenue × comisión OTA
// Por escenario:
//   ahorro de comisión     = estimatedOtaCommission × % de reservas OTA recuperadas como directas
//   ingresos por extras    = estimatedBookings × % de adopción × ticket medio del extra
//   oportunidad mensual    = ahorro + extras
//   oportunidad anual      = mensual × 12
//
// Limitaciones declaradas (también en la página): el ahorro es BRUTO (no resta
// el coste del canal directo: motor, pasarela, campañas), no hay
// estacionalidad, el extra se cuenta por reserva y no por huésped, y la cuota
// OTA se aplica a noches, no a reservas. Es una estimación orientativa.
//
// Si cambia cualquier fórmula, límite o escenario: subir CALCULATOR_VERSION.
// La versión se guarda con cada lead para poder reinterpretar datos antiguos.

import type {
  CalculatorBase,
  CalculatorField,
  CalculatorInputs,
  CalculatorResult,
  FieldErrors,
  FieldLimit,
  ScenarioDefinition,
  ScenarioId,
  ScenarioResult,
  ValidationResult,
} from "./types";

export const CALCULATOR_VERSION = "1.0.0";

export const DAYS_PER_MONTH = 30;

export const CALCULATOR_FIELDS: readonly CalculatorField[] = [
  "rooms",
  "occupancyPct",
  "adr",
  "avgStayNights",
  "otaSharePct",
  "otaCommissionPct",
  "upsellAvg",
] as const;

export const INPUT_LIMITS: Readonly<Record<CalculatorField, FieldLimit>> = {
  rooms: { min: 1, max: 1000, decimals: 0 },
  occupancyPct: { min: 1, max: 100, decimals: 1 },
  adr: { min: 10, max: 5000, decimals: 2 },
  avgStayNights: { min: 1, max: 30, decimals: 1 },
  otaSharePct: { min: 0, max: 100, decimals: 1 },
  otaCommissionPct: { min: 0, max: 40, decimals: 1 },
  upsellAvg: { min: 0, max: 1000, decimals: 2 },
};

/** Valores de ejemplo con los que arranca la calculadora (no son medias del sector). */
export const DEFAULT_INPUTS: Readonly<CalculatorInputs> = {
  rooms: 30,
  occupancyPct: 70,
  adr: 110,
  avgStayNights: 2.5,
  otaSharePct: 60,
  otaCommissionPct: 18,
  upsellAvg: 25,
};

/**
 * Escenarios. Hipótesis de trabajo para conversar con el hotel, no datos
 * medidos: se revisarán con los resultados reales de los pilotos.
 * Orden: de menor a mayor (los tests comprueban que el resultado crece).
 */
export const SCENARIOS: readonly ScenarioDefinition[] = [
  { id: "conservative", label: "Conservador", otaRecoveryRate: 0.03, upsellAdoptionRate: 0.03 },
  { id: "realistic", label: "Realista", otaRecoveryRate: 0.07, upsellAdoptionRate: 0.07 },
  { id: "potential", label: "Potencial", otaRecoveryRate: 0.12, upsellAdoptionRate: 0.12 },
] as const;

export const SCENARIO_IDS: readonly ScenarioId[] = SCENARIOS.map((s) => s.id);

// ---------------------------------------------------------------- números

function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON * Math.sign(value)) * f) / f;
}

/** Euros → céntimos enteros. Toda la aritmética de dinero de salida va en céntimos. */
function toCents(euros: number): number {
  return Math.round((euros + Number.EPSILON * Math.sign(euros)) * 100);
}

const fromCents = (cents: number) => cents / 100;

/**
 * Lee un número escrito como lo escribe una persona en España: "2,5", "1.200",
 * "110 €", "18%". Devuelve null si no es un número. Reglas:
 * - coma = decimal; si hay punto y coma, el último de los dos es el decimal;
 * - un punto seguido de grupos de 3 dígitos ("1.200", "12.500") = miles.
 */
export function parseLocaleNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  let s = raw.trim().replace(/[\s €%]/g, "");
  if (s === "" || s.length > 24) return null;
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (hasComma) {
    if ((s.match(/,/g) ?? []).length > 1) return null;
    s = s.replace(",", ".");
  } else if (hasDot && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(n);
}

/**
 * Valida y normaliza los datos de la calculadora. Rechaza (no recorta) los
 * valores fuera de rango: un dato imposible es un error de quien lo escribe y
 * se le debe decir. Ignora cualquier campo que no esté en CALCULATOR_FIELDS.
 */
export function validateCalculatorInputs(raw: unknown): ValidationResult<CalculatorInputs, CalculatorField> {
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const errors: FieldErrors<CalculatorField> = {};
  const out = {} as CalculatorInputs;

  for (const field of CALCULATOR_FIELDS) {
    const { min, max, decimals } = INPUT_LIMITS[field];
    const n = parseLocaleNumber(input[field]);
    if (n === null) {
      errors[field] = "Introduce un número.";
      continue;
    }
    if (decimals === 0 && !Number.isInteger(n)) {
      errors[field] = "Introduce un número entero.";
      continue;
    }
    if (n < min || n > max) {
      errors[field] = `Debe estar entre ${fmt(min)} y ${fmt(max)}.`;
      continue;
    }
    out[field] = roundTo(n, decimals);
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: out };
}

/**
 * Lleva cualquier entrada al dominio válido. Solo es una red de seguridad para
 * que calculate() nunca devuelva NaN, Infinity o negativos: el flujo normal
 * valida antes con validateCalculatorInputs().
 */
export function clampInputs(inputs: Partial<Record<CalculatorField, unknown>>): CalculatorInputs {
  const out = {} as CalculatorInputs;
  for (const field of CALCULATOR_FIELDS) {
    const { min, max, decimals } = INPUT_LIMITS[field];
    const n = parseLocaleNumber(inputs[field]);
    const safe = n === null ? min : Math.min(max, Math.max(min, n));
    out[field] = roundTo(decimals === 0 ? Math.round(safe) : safe, decimals);
  }
  return out;
}

export function calculateBase(inputs: CalculatorInputs): CalculatorBase {
  const occupiedRoomNights = inputs.rooms * DAYS_PER_MONTH * (inputs.occupancyPct / 100);
  const estimatedBookings = occupiedRoomNights / inputs.avgStayNights;
  const estimatedOtaRevenue = occupiedRoomNights * inputs.adr * (inputs.otaSharePct / 100);
  const estimatedOtaCommission = estimatedOtaRevenue * (inputs.otaCommissionPct / 100);
  return { occupiedRoomNights, estimatedBookings, estimatedOtaRevenue, estimatedOtaCommission };
}

export function calculateScenario(base: CalculatorBase, inputs: CalculatorInputs, scenario: ScenarioDefinition): ScenarioResult {
  const savingsCents = toCents(base.estimatedOtaCommission * scenario.otaRecoveryRate);
  const upsellCents = toCents(base.estimatedBookings * scenario.upsellAdoptionRate * inputs.upsellAvg);
  const totalCents = savingsCents + upsellCents;
  return {
    id: scenario.id,
    otaRecoveryRate: scenario.otaRecoveryRate,
    upsellAdoptionRate: scenario.upsellAdoptionRate,
    commissionSavingsMonthly: fromCents(savingsCents),
    upsellRevenueMonthly: fromCents(upsellCents),
    totalMonthly: fromCents(totalCents),
    totalAnnual: fromCents(totalCents * 12),
  };
}

/**
 * Calcula los tres escenarios. Acepta cualquier entrada (la normaliza con
 * clampInputs) y garantiza resultados finitos y no negativos.
 */
export function calculate(rawInputs: Partial<Record<CalculatorField, unknown>>, scenarios: readonly ScenarioDefinition[] = SCENARIOS): CalculatorResult {
  const inputs = clampInputs(rawInputs);
  const exact = calculateBase(inputs);
  const results = {} as Record<ScenarioId, ScenarioResult>;
  for (const s of scenarios) results[s.id] = calculateScenario(exact, inputs, s);
  return {
    version: CALCULATOR_VERSION,
    inputs,
    base: {
      occupiedRoomNights: roundTo(exact.occupiedRoomNights, 1),
      estimatedBookings: roundTo(exact.estimatedBookings, 1),
      estimatedOtaRevenue: fromCents(toCents(exact.estimatedOtaRevenue)),
      estimatedOtaCommission: fromCents(toCents(exact.estimatedOtaCommission)),
    },
    scenarios: results,
  };
}

// ---------------------------------------------------------------- formato

// useGrouping "always": por defecto es-ES no agrupa los números de 4 cifras
// ("4962 €" junto a "11.579 €" en la misma tabla). Donde el navegador no
// conoce "always" se comporta como true (agrupación por defecto).
const GROUPING = "always" as unknown as boolean;
const eurFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: GROUPING });
const numFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: GROUPING });

/** "1.250 €" (es-ES, EUR, sin decimales). Nunca devuelve "NaN €". */
export function formatEuros(value: number): string {
  return eurFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return numFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatPct(rate: number): string {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(rate * 100)} %`;
}
