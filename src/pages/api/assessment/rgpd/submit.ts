// Endpoint del diagnóstico RGPD. Comparte toda la capa genérica con los tests
// de la Ley 10/2025 y de Verifactu (storage, request, validación) y solo cambia
// el cuestionario y el motor (madurez, no obligación).
import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { json } from "@/lib/survey/admin";
import { buildSourceContext } from "@/lib/assessment/request";
import { persistAssessment } from "@/lib/assessment/storage";
import type { AssessmentRecord } from "@/lib/assessment/types";
import { ASSESSMENT_KEY, ASSESSMENT_VERSION } from "@/lib/assessment/rgpd/questions";
import { sanitizeAnswers } from "@/lib/assessment/rgpd/validation";
import { scoreAssessment } from "@/lib/assessment/rgpd/scoring";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  try {
    const body = await request.json().catch(() => null);

    // Honeypot: respondemos 200 para no dar señal al bot, pero no persistimos.
    if (String(body?.hp_confirm ?? "").trim()) {
      return json({ ok: true, responseId: randomUUID(), result: null, persisted: false }, 200);
    }

    const { answers, errors } = sanitizeAnswers(body?.answers);
    if (errors.length > 0) {
      return json({ error: "Faltan respuestas o no son válidas.", details: errors }, 400);
    }

    const result = scoreAssessment(answers);
    const responseId = randomUUID();

    const record: AssessmentRecord = {
      responseId,
      assessmentKey: ASSESSMENT_KEY,
      version: ASSESSMENT_VERSION,
      locale: "es",
      answers,
      result,
      durationMs: Number(body?.durationMs ?? 0),
      source: buildSourceContext({
        request,
        clientAddress,
        url,
        landingPath: body?.landingPath,
        referrer: body?.referrer,
        utm: body?.utm,
      }),
    };

    // Best-effort: el resultado se devuelve aunque falle la persistencia.
    const persisted = await persistAssessment(record);

    return json({ ok: true, responseId, result, persisted });
  } catch (error) {
    console.error("[assessment/rgpd/submit] request failed", error);
    return json({ error: "No se pudo calcular el resultado." }, 500);
  }
};
