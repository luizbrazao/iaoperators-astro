import type { APIRoute } from "astro";
import { finalizeSurveySubmission } from "@/lib/survey/storage";
import { json } from "@/lib/survey/admin";
import { sanitizeAnswers, validateConsent } from "@/lib/survey/validation";
import { createFingerprintHash } from "@/lib/survey/utils";

export const prerender = false;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json().catch(() => null);
    const honeypot = String(body?.website ?? "").trim();
    if (honeypot) {
      return json({ ok: true }, 200);
    }

    const responseId = String(body?.responseId ?? "").trim();
    if (!responseId) {
      return json({ error: "No se encontró la sesión de encuesta." }, 400);
    }

    const { answers, errors: answerErrors } = sanitizeAnswers(
      typeof body?.answers === "object" && body?.answers ? body.answers : {},
    );
    const { consent, errors: consentErrors } = validateConsent(
      typeof body?.consent === "object" && body?.consent ? body.consent : {},
    );

    const errors = [...answerErrors, ...consentErrors];
    if (errors.length > 0) {
      return json({ error: "Hay respuestas pendientes o no válidas.", details: errors }, 400);
    }

    const email = String(body?.email ?? "").trim();
    if (email && !isValidEmail(email)) {
      return json({ error: "El email opcional no tiene un formato válido." }, 400);
    }

    const durationMs = Number(body?.durationMs ?? 0);
    const completionStep = Number(body?.completionStep ?? 0);
    const userAgent = request.headers.get("user-agent") || "";
    const acceptLanguage = request.headers.get("accept-language") || "";
    const fingerprintHash = createFingerprintHash({
      ip: clientAddress || "unknown",
      userAgent,
      acceptLanguage,
    });

    const record = await finalizeSurveySubmission({
      responseId,
      answers,
      email: email || undefined,
      consent,
      durationMs,
      completionStep,
      fingerprintHash,
    });

    return json({ ok: true, responseId: record.responseId, reviewStatus: record.reviewStatus });
  } catch (error) {
    console.error("[survey/submit] failed", error);
    return json({ error: "No se pudo enviar la encuesta." }, 500);
  }
};
