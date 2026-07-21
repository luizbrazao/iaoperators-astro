import { surveyQuestionMap, surveyQuestions } from "./questions";
import type {
  SurveyAnswerValue,
  SurveyAnswers,
  SurveyConsentPayload,
  SurveyQualityFlag,
  SurveyQuestionId,
} from "./types";
import { ensureArray, normalizeAnswerValue } from "./utils";

function addFlag(
  flags: SurveyQualityFlag[],
  code: SurveyQualityFlag["code"],
  severity: SurveyQualityFlag["severity"],
  message: string,
) {
  flags.push({ code, severity, message });
}

function enforceExclusive(
  questionId: SurveyQuestionId,
  value: SurveyAnswerValue,
  errors: string[],
) {
  const question = surveyQuestionMap[questionId];
  if (!question || question.type !== "multi" || !Array.isArray(value)) return;

  const selected = new Set(value);
  const exclusive = question.options.filter((option) => option.exclusive).map((option) => option.value);
  const pickedExclusive = exclusive.filter((option) => selected.has(option));
  if (pickedExclusive.length > 1 || (pickedExclusive.length === 1 && value.length > 1)) {
    errors.push(`La pregunta "${question.title}" contiene opciones incompatibles.`);
  }
}

export function sanitizeAnswers(raw: Record<string, unknown>) {
  const answers: SurveyAnswers = {};
  const errors: string[] = [];

  for (const question of surveyQuestions) {
    const rawValue = raw[question.id];
    const normalized = normalizeAnswerValue(rawValue);
    const isEmpty =
      (Array.isArray(normalized) && normalized.length === 0) ||
      (!Array.isArray(normalized) && normalized.length === 0);

    if (question.required && isEmpty) {
      errors.push(`Falta responder: ${question.title}`);
      continue;
    }

    if (isEmpty) continue;

    if (question.type === "multi") {
      const values = ensureArray(normalized);
      const validOptions = new Set(question.options.map((option) => option.value));
      const invalid = values.filter((value) => !validOptions.has(value));
      if (invalid.length > 0) {
        errors.push(`La pregunta "${question.title}" contiene opciones no válidas.`);
        continue;
      }
      answers[question.id] = values;
      enforceExclusive(question.id, values, errors);
      continue;
    }

    if (Array.isArray(normalized)) {
      errors.push(`La pregunta "${question.title}" requiere una sola respuesta.`);
      continue;
    }

    const validOptions = new Set(question.options.map((option) => option.value));
    if (!validOptions.has(normalized)) {
      errors.push(`La pregunta "${question.title}" contiene una respuesta no válida.`);
      continue;
    }

    answers[question.id] = normalized;
  }

  return { answers, errors };
}

export function validateConsent(raw: Record<string, unknown>) {
  const consent: SurveyConsentPayload = {
    accepted: raw.accepted === true,
    confidentialityNoticeAccepted: raw.confidentialityNoticeAccepted === true,
    aggregateUseAccepted: raw.aggregateUseAccepted === true,
    deletionRightsRead: raw.deletionRightsRead === true,
    emailMarketingAccepted: raw.emailMarketingAccepted === true,
  };

  const errors: string[] = [];

  if (!consent.accepted) {
    errors.push("Debes aceptar el envío de la encuesta para continuar.");
  }
  if (!consent.confidentialityNoticeAccepted) {
    errors.push("Debes confirmar que no vas a introducir datos confidenciales.");
  }
  if (!consent.aggregateUseAccepted) {
    errors.push("Debes aceptar el tratamiento agregado de resultados.");
  }
  if (!consent.deletionRightsRead) {
    errors.push("Debes confirmar que has leído cómo solicitar la eliminación de datos.");
  }

  return { consent, errors };
}

export function deriveQualityFlags(input: {
  answers: SurveyAnswers;
  durationMs: number;
  fingerprintIsDuplicate: boolean;
  status: "completed" | "abandoned";
  honeypotTriggered?: boolean;
  userAgentMissing?: boolean;
}) {
  const flags: SurveyQualityFlag[] = [];
  const usage = input.answers.ai_usage_frequency;
  const shared = ensureArray(input.answers.shared_information_types);
  const account = input.answers.work_account_usage;
  const dependency = input.answers.supplier_dependency_resilience;

  if (input.durationMs > 0 && input.durationMs < 20_000) {
    addFlag(flags, "too_fast", "medium", "Tiempo de respuesta inferior a 20 segundos.");
  }

  if (input.fingerprintIsDuplicate) {
    addFlag(flags, "possible_duplicate", "medium", "La huella técnica coincide con otra respuesta reciente.");
  }

  if (input.status !== "completed") {
    addFlag(flags, "incomplete", "low", "La sesión no llegó a completarse.");
  }

  if (usage === "never" && account && account !== "no_use" && account !== "unknown") {
    addFlag(flags, "logic_inconsistency", "medium", "Declara no usar IA en el trabajo, pero informa de un tipo de cuenta de uso.");
  }

  if (usage === "never" && shared.length > 0 && !shared.includes("none") && !shared.includes("unknown") && !shared.includes("prefer_not")) {
    addFlag(flags, "logic_inconsistency", "medium", "Declara no usar IA en el trabajo, pero reporta información compartida.");
  }

  if (dependency === "not_applicable" && usage && usage !== "never" && usage !== "unknown") {
    addFlag(flags, "logic_inconsistency", "low", "Indica dependencia no aplicable pese a declarar uso de IA.");
  }

  if (input.userAgentMissing) {
    addFlag(flags, "bot_like", "medium", "La solicitud no incluyó un user-agent útil.");
  }

  if (input.honeypotTriggered) {
    addFlag(flags, "honeypot_triggered", "high", "El campo honeypot fue rellenado.");
  }

  return flags;
}
