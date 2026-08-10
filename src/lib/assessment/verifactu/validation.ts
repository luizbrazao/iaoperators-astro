// Validación del test de Verifactu: ata la capa genérica a este cuestionario.

import { sanitizeAnswersWith } from "../validation";
import { QUESTIONS } from "./questions";

export { validateConsent, isValidEmail } from "../validation";

export function sanitizeAnswers(raw: unknown) {
  return sanitizeAnswersWith(QUESTIONS, raw);
}
