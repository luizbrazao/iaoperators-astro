import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { json } from "@/lib/survey/admin";
import { buildSourceContext } from "@/lib/assessment/request";
import { persistAssessment } from "@/lib/assessment/storage";
import type { AssessmentRecord } from "@/lib/assessment/types";
import { ASSESSMENT_KEY, ASSESSMENT_VERSION } from "@/lib/assessment/sac/questions";
import { sanitizeAnswers } from "@/lib/assessment/sac/validation";
import { scoreAssessment } from "@/lib/assessment/sac/scoring";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  try {
    const body = await request.json().catch(() => null);

    // Honeypot: respondemos 200 para no dar señal al bot, pero no persistimos.
    if (String(body?.website ?? "").trim()) {
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
      }),
    };

    // Best-effort: el resultado se devuelve aunque falle la persistencia.
    const persisted = await persistAssessment(record);

    return json({ ok: true, responseId, result, persisted });
  } catch (error) {
    console.error("[assessment/sac/submit] request failed", error);
    return json({ error: "No se pudo calcular el resultado." }, 500);
  }
};
