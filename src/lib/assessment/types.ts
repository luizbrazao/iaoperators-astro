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

export type AssessmentKey = "sac-ley-10-2025";

export type QuestionType = "single" | "multi";

export interface AssessmentOption {
  value: string;
  label: string;
  hint?: string;
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

export interface AssessmentResult {
  obligado: ObligadoVerdict;
  /** Base legal del veredicto, citable por el usuario ante su asesoría. */
  motivo: string;
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
