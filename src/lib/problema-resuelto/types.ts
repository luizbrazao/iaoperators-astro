// Tipos compartidos del programa «Problema Resuelto». Sin dependencias de
// servidor: los importan la island, los endpoints y los tests.

import type { CompanySize, FallbackKey, ManagerAware } from "@/data/problema-resuelto";

export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export type ValidationResult<T, K extends string = string> = { ok: true; value: T } | { ok: false; errors: FieldErrors<K> };

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

/** Turno de chat ya validado. `message` todavía sin enmascarar. */
export interface ChatTurnInput {
  message: string;
  transcript: ChatMessage[];
  state: string | null;
}

/** Respuesta del endpoint de chat. */
export type ChatTurnResponse =
  | {
      mode: "chat";
      reply: string;
      ready: boolean;
      offTopic: boolean;
      transcript: ChatMessage[];
      state: string;
      turnsLeft: number;
      piiMasked: boolean;
    }
  | { mode: "form"; reason: "agent_unavailable" | "daily_limit"; message: string };

export type SubmitField =
  | "submissionId"
  | "mode"
  | "transcript"
  | "answers"
  | `answers.${FallbackKey}`
  | "name"
  | "email"
  | "company"
  | "jobTitle"
  | "companySize"
  | "managerAware"
  | "privacyAccepted"
  | "basesAccepted"
  | "consentVersion"
  | "basesVersion";

export type FallbackAnswers = Record<FallbackKey, string>;

export interface NormalizedSubmission {
  submissionId: string;
  mode: "chat" | "form";
  /** Solo en modo chat: transcripción canónica (ya enmascarada por el servidor en cada turno). */
  transcript: ChatMessage[] | null;
  /** Solo en modo chat: token de estado que firma la transcripción. */
  state: string | null;
  /** Solo en modo form. Enmascaradas al validar. */
  answers: FallbackAnswers | null;
  piiMasked: boolean;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  companySize: CompanySize;
  managerAware: ManagerAware;
  consentVersion: string;
  basesVersion: string;
  landingPath: string;
  referrerHost: string | null;
  utm: UtmParams;
}

export type EncajeSugerido = "encaja" | "reducido" | "no_encaja" | "dudoso";
export type Entregable = "flujo" | "asistente" | "script" | "hoja_calculo" | "prototipo" | "otro";
export type Riesgo = "datos_personales" | "acceso_sistemas" | "sin_permiso" | "alcance_grande" | "otro";

/** Ficha del caso que genera el modelo. Sugerencia interna, nunca una decisión. */
export interface Ficha {
  resumen: string;
  situacion_actual: string;
  frecuencia: string;
  tiempo_estimado: string;
  herramientas: string[];
  resultado_deseado: string;
  encaje_sugerido: EncajeSugerido;
  motivo_encaje: string;
  complejidad: 1 | 2 | 3 | 4 | 5;
  entregable_sugerido: Entregable;
  riesgos: Riesgo[];
  senales_comerciales: string;
}
