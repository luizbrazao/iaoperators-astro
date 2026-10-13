// Tipos genéricos de "assessment" (test de cualificación con resultado calculado).
//
// Por qué NO reutilizamos src/lib/survey/*: la encuesta Segunda Factura IA es un
// estudio exploratorio anónimo, con consentimiento de confidencialidad, pipeline de
// quality flags y revisión. Un test de cumplimiento es captación cualificada: guarda
// email comercial, calcula un resultado y no tiene revisión editorial. Mezclar ambos
// en la misma tabla ensucia el dataset del estudio y la base de consentimiento.
// Lo que sí se comparte es la capa genérica: src/lib/survey/utils.ts (hashes, UTMs,
// device) y el helper json() de src/lib/survey/admin.ts.
//
// Este módulo nace parametrizado por `assessmentKey` para que el test de Verifactu
// (Frente B) no requiera duplicar nada de la capa de persistencia.

export type AssessmentKey = "sac-ley-10-2025" | "verifactu-rrsif" | "rgpd-ops";

export type QuestionType = "single" | "multi";

export interface AssessmentOption {
  value: string;
  label: string;
  hint?: string;
  /**
   * Solo en preguntas "multi": opción que no se puede combinar con ninguna otra
   * (p. ej. "Nada de lo anterior"). La island limpia el resto al marcarla y el
   * servidor rechaza combinaciones contradictorias.
   */
  exclusive?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  options: AssessmentOption[];
  /** Para type "multi": mínimo de opciones para poder avanzar. */
  min?: number;
}

export type AnswerValue = string | string[];
export type AssessmentAnswers = Record<string, AnswerValue>;

/** Resultado de la evaluación de una obligación concreta. */
export type GapState = "ok" | "parcial" | "gap" | "desconocido";

export interface GapEvaluation {
  id: string;
  /** Obligación en lenguaje de la norma. */
  obligacion: string;
  estado: GapState;
  /** Qué implica el estado detectado, en términos de sistema. */
  detalle: string;
  /** De qué respuesta sale este veredicto — hace el resultado auditable. */
  derivadoDe: string[];
}

export type ObligadoVerdict = "si" | "probable" | "no";
export type RiskLevel = "critico" | "alto" | "medio" | "bajo";

/**
 * Nivel de madurez (test RGPD, oct/2026). Los tests de la Ley 10/2025 y de
 * Verifactu no lo usan: su resultado es un veredicto de obligación.
 */
export type MaturityLevel = "inicial" | "en_proceso" | "operativo";

export interface MaturityResult {
  level: MaturityLevel;
  label: string;
  /** Puntos obtenidos sobre el máximo (misma escala determinista que los gaps). */
  score: number;
  scoreMax: number;
}

export interface ProfessionalReview {
  /** true si las respuestas aconsejan revisión profesional antes de seguir solo. */
  recommended: boolean;
  /** Motivos legibles, cada uno ligado a una respuesta. */
  motivos: string[];
  /** Preguntas de las que salen los motivos (resultado auditable). */
  derivadoDe: string[];
}

export interface AssessmentResult {
  obligado: ObligadoVerdict;
  /** Base legal del veredicto, citable por el usuario ante su asesoría. */
  motivo: string;
  /**
   * Perfil detectado que se muestra como chip en el informe. En el test de la
   * Ley 10/2025 es el sector de actividad; en el de Verifactu, el tipo de
   * sistema de facturación (ERP a medida, TPV multi-tienda, e-commerce…).
   * El nombre del campo se mantiene para no romper las filas ya guardadas.
   */
  sector: string;
  sectorLabel: string;
  gaps: GapEvaluation[];
  riskScore: number;
  riskScoreMax: number;
  riskLevel: RiskLevel;
  diasRestantes: number;
  /** Titular del informe, ya redactado según veredicto y riesgo. */
  titular: string;
  /** Siguientes pasos priorizados. */
  prioridades: string[];
  /** Versión del motor: si cambian las reglas, los resultados viejos siguen explicables. */
  engineVersion: string;
  /**
   * Extensión opcional y retrocompatible (test RGPD). Si existe, la island
   * muestra la vista de madurez en lugar de la de obligación. Los tests de la
   * Ley 10/2025 y de Verifactu nunca la rellenan.
   */
  maturity?: MaturityResult;
  /** Recomendación de revisión profesional (test RGPD). */
  review?: ProfessionalReview;
}

export interface AssessmentConsent {
  /** Acepta la política de privacidad para el envío del informe. */
  privacyAccepted: boolean;
  /** Opt-in separado para comunicaciones comerciales. */
  contactAccepted: boolean;
}

export interface AssessmentSourceContext {
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  userAgentHash: string;
  deviceCategory: "mobile" | "tablet" | "desktop" | "unknown";
  fingerprintHash: string;
}

export interface AssessmentRecord {
  responseId: string;
  assessmentKey: AssessmentKey;
  version: string;
  locale: string;
  answers: AssessmentAnswers;
  result: AssessmentResult;
  email?: string;
  consent?: AssessmentConsent;
  durationMs: number;
  source: AssessmentSourceContext;
}
