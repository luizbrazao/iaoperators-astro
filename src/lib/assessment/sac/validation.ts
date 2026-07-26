// Validación de respuestas contra la definición del cuestionario.
// Allowlist estricta: solo ids de pregunta conocidos y solo valores declarados
// en las opciones. Cualquier otra cosa se descarta — el endpoint es público.

import type { AssessmentAnswers, AssessmentConsent } from "../types";
import { QUESTIONS } from "./questions";

const MAX_MULTI = 20;

export function sanitizeAnswers(raw: unknown): {
  answers: AssessmentAnswers;
  errors: string[];
} {
  const errors: string[] = [];
  const answers: AssessmentAnswers = {};
  const input = typeof raw === "object" && raw ? (raw as Record<string, unknown>) : {};

  for (const question of QUESTIONS) {
    const allowed = new Set(question.options.map((o) => o.value));
    const value = input[question.id];

    if (question.type === "multi") {
      const picked = Array.isArray(value) ? value : value === undefined ? [] : [value];
      const clean = [...new Set(picked.map((v) => String(v).trim()))]
        .filter((v) => allowed.has(v))
        .slice(0, MAX_MULTI);
      if (clean.length < (question.min ?? 1)) {
        errors.push(question.id);
        continue;
      }
      answers[question.id] = clean;
      continue;
    }

    const clean = String(value ?? "").trim();
    if (!allowed.has(clean)) {
      errors.push(question.id);
      continue;
    }
    answers[question.id] = clean;
  }

  return { answers, errors };
}

export function validateConsent(raw: unknown): {
  consent: AssessmentConsent;
  errors: string[];
} {
  const input = typeof raw === "object" && raw ? (raw as Record<string, unknown>) : {};
  const privacyAccepted = input.privacyAccepted === true;
  const contactAccepted = input.contactAccepted === true;
  const errors: string[] = [];
  // El consentimiento de privacidad es obligatorio para enviar el informe.
  // El de contacto comercial es opt-in separado y puede quedar en false.
  if (!privacyAccepted) errors.push("privacyAccepted");
  return { consent: { privacyAccepted, contactAccepted }, errors };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email) && email.length <= 254;
}
