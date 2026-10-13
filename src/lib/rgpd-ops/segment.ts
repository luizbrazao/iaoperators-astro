// Qué oferta mostrar al terminar el diagnóstico RGPD. Función pura: la usan la
// island del resultado, el email del informe y el test de regresión.
//
// Reglas (decididas):
// - Sin señales de mayor riesgo y menos de 250 personas → RGPD Ops Starter es
//   el CTA principal: el problema es organizar y mantener la operación.
// - Con señales de mayor riesgo (categorías especiales, menores, ubicación,
//   perfiles, decisiones automatizadas, gran escala, publicidad con perfiles)
//   o 250+ personas → la revisión profesional es el CTA principal. RGPD Ops
//   queda como herramienta de apoyo, nunca como sustituto de esa revisión.

import type { AssessmentResult } from "../assessment/types";

export type RgpdOfferMode = "ops-primary" | "review-primary";

export function rgpdOfferFor(result: Pick<AssessmentResult, "review">): RgpdOfferMode {
  return result.review?.recommended ? "review-primary" : "ops-primary";
}

/** Segmento analítico (sin datos personales): actividad + modo de oferta. */
export function rgpdSegment(result: Pick<AssessmentResult, "review" | "sector">): string {
  return `${result.sector}:${rgpdOfferFor(result) === "review-primary" ? "revision" : "ops"}`;
}
