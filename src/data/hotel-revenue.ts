// Hotel Revenue Operator — configuración PÚBLICA del producto (Fase 1).
//
// Fuente única de nombre, rutas, versión del consentimiento y textos legales
// cortos. Se puede importar desde páginas estáticas e islands: no contiene
// secretos. Fórmulas, límites y escenarios de la calculadora viven en
// src/lib/hotel-revenue/calculator.ts.
//
// Fase 1 = validar adquisición y disposición a pagar. No hay checkout ni
// producto operativo: la página ofrece un programa piloto.

export const HOTEL_REVENUE_PRODUCT = {
  /** Identificador estable (analítica, emails, BD). */
  key: "hotel-revenue-operator",
  name: "Hotel Revenue Operator",
  endorsement: "by IA Operators",
  promise: "Convierte conversaciones en reservas directas e ingresos adicionales para tu hotel.",
  paths: {
    vertical: "/es/hoteles/",
    landing: "/es/hoteles/reservas-directas-ia/",
    calculator: "/es/hoteles/calculadora-ingresos/",
    gracias: "/es/hoteles/reservas-directas-ia/gracias/",
    caseMenorca: "/es/portfolio/radiografia-cadena-hotelera-menorca/",
    contact: "/es/contact/",
    privacy: "/es/politica-de-privacidad/",
    api: "/api/hotel-revenue/lead",
    ogImage: "/og/es/hotel-revenue-operator.png",
  },
  /** Valor de `lead_source` en el evento generate_lead de GTM. */
  leadSource: "Hotel_Revenue_Operator",
} as const;

/**
 * Versión del texto de consentimiento del formulario. Si cambia el texto de la
 * casilla o la finalidad declarada, se crea una versión nueva y se añade a
 * ACCEPTED_CONSENT_VERSIONS (las anteriores siguen aceptándose mientras haya
 * páginas en caché que las muestren).
 */
export const HOTEL_REVENUE_CONSENT = {
  version: "hro-lead-2026-10-14",
  text: "He leído la política de privacidad y acepto que IA Operators use estos datos para analizar mi caso y contactarme sobre el programa piloto.",
} as const;

export const ACCEPTED_CONSENT_VERSIONS: readonly string[] = [HOTEL_REVENUE_CONSENT.version];

export const HOTEL_REVENUE_DISCLAIMER =
  "Estimación orientativa basada en los datos introducidos. No constituye una previsión ni una garantía de resultados.";

export const HOTEL_REVENUE_INTEGRATION_NOTE =
  "La disponibilidad de cada integración depende de la API y del sistema utilizado por el hotel.";

/**
 * Hipótesis comercial del piloto. NO se publica en ninguna página mientras
 * `display` sea false: la Fase 1 funciona en modo «solicitar piloto». Los
 * importes quedan en null a propósito: los decide Luiz tras las primeras
 * conversaciones (ver docs/hotel-revenue-operator.md, «Hipótesis»).
 */
export const PILOT_COMMERCIAL_HYPOTHESIS = {
  display: false,
  currency: "EUR",
  setupFee: null as number | null,
  monthlyFee: null as number | null,
  /** Duración del piloto que se propondrá en el diagnóstico, en semanas. */
  pilotLengthWeeks: null as number | null,
  /** Plazas de piloto que se abren a la vez (capacidad real de implantación). */
  concurrentPilots: null as number | null,
  notes: "Validar disposición a pagar en las llamadas de diagnóstico antes de fijar precio.",
} as const;
