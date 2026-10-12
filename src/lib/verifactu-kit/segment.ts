// Qué oferta mostrar al terminar el test de Verifactu. Función pura: la usan la
// island del resultado, el email del informe y el test de regresión.
//
// Reglas (decididas, no reabrir sin motivo):
// - obligado "no" → ninguna venta. Solo orientación gratuita y confirmar con la asesoría.
// - "manual" y "estandar" → el Kit es el CTA principal: su problema es elegir,
//   preguntar al proveedor y ordenar documentación, no construir.
// - ERP propio, TPV, e-commerce y software vertical → auditoría técnica como CTA
//   principal; el Kit queda como opción secundaria.

import type { AssessmentResult } from "../assessment/types";

export type KitOfferMode = "none" | "kit-primary" | "audit-primary";

export const KIT_PRIMARY_SEGMENTS = ["manual", "estandar"] as const;
export const AUDIT_PRIMARY_SEGMENTS = ["erp-propio", "tpv", "ecommerce", "vertical"] as const;

export function kitOfferFor(result: Pick<AssessmentResult, "obligado" | "sector">): KitOfferMode {
  if (result.obligado === "no") return "none";
  if ((AUDIT_PRIMARY_SEGMENTS as readonly string[]).includes(result.sector)) return "audit-primary";
  return "kit-primary";
}
