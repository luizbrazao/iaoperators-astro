import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { json } from "@/lib/survey/admin";
import { buildSourceContext } from "@/lib/assessment/request";
import {
  attachAssessmentLead,
  isAssessmentStorageError,
  isStorageConfigured,
} from "@/lib/assessment/storage";
import { sendAssessmentEmails } from "@/lib/assessment/email";
import { RGPD_BRAND } from "@/lib/assessment/rgpd/brand";
import type { AssessmentRecord } from "@/lib/assessment/types";
import { ASSESSMENT_KEY, ASSESSMENT_VERSION } from "@/lib/assessment/rgpd/questions";
import { isValidEmail, sanitizeAnswers, validateConsent } from "@/lib/assessment/rgpd/validation";
import { scoreAssessment } from "@/lib/assessment/rgpd/scoring";
import { isUuid } from "@/lib/commerce/tokens";

export const prerender = false;

// Rate limit best-effort en memoria, mismo patrón que /api/contact.ts. Este
// endpoint dispara correos a una dirección que llega del cliente: sin límite,
// sirve de amplificador de spam con nuestro dominio como remitente.
const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, limit = 5, windowMs = 3_600_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  try {
    const body = await request.json().catch(() => null);

    if (String(body?.hp_confirm ?? "").trim()) {
      return json({ ok: true }, 200);
    }

    const ip = clientAddress || "unknown";
    if (!rateLimit(ip)) {
      return json({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, 429);
    }

    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return json({ error: "El email no tiene un formato válido.", details: ["email"] }, 400);
    }

    const { consent, errors: consentErrors } = validateConsent(body?.consent);
    if (consentErrors.length > 0) {
      return json(
        { error: "Falta aceptar la política de privacidad.", details: consentErrors },
        400,
      );
    }

    if (!isStorageConfigured()) {
      console.error("[assessment/rgpd/lead] storage not configured — lead perdido");
      return json(
        {
          error:
            "No podemos registrar tu solicitud ahora mismo. Escríbenos a info@iaoperators.com y te enviamos el informe.",
          code: "assessment_storage_unconfigured",
        },
        503,
      );
    }

    // Registro de respaldo por si el guardado inicial del test falló: así el lead
    // no se pierde por un fallo transitorio en la primera llamada.
    const { answers, errors } = sanitizeAnswers(body?.answers);
    const source = buildSourceContext({
      request,
      clientAddress,
      url,
      landingPath: body?.landingPath,
      referrer: body?.referrer,
      utm: body?.utm,
    });

    // Solo se acepta un UUID: response_id es la clave de la fila y nada más
    // que llegue del navegador debe acabar en ella.
    const rawResponseId = String(body?.responseId ?? "").trim();
    const clientResponseId = isUuid(rawResponseId) ? rawResponseId : "";

    let fallbackRecord: AssessmentRecord | undefined;
    if (errors.length === 0) {
      fallbackRecord = {
        responseId: clientResponseId || randomUUID(),
        assessmentKey: ASSESSMENT_KEY,
        version: ASSESSMENT_VERSION,
        locale: "es",
        answers,
        result: scoreAssessment(answers),
        durationMs: Number(body?.durationMs ?? 0),
        source,
      };
    }

    const responseId = clientResponseId || fallbackRecord?.responseId;
    if (!responseId) {
      return json({ error: "No se encontró la sesión del test." }, 400);
    }

    const { alreadyHadEmail } = await attachAssessmentLead({
      responseId,
      email,
      consent,
      fallbackRecord,
    });

    // El envío no bloquea la captación: el lead ya está en base de datos.
    // Solo se envía la primera vez, para que reenviar el formulario no genere
    // correos repetidos ni sirva de vector de abuso.
    if (!alreadyHadEmail && fallbackRecord) {
      await sendAssessmentEmails({
        brand: RGPD_BRAND,
        email,
        result: fallbackRecord.result,
        answers: fallbackRecord.answers,
        responseId,
        utmSource: source.utmSource,
        utmCampaign: source.utmCampaign,
      });
    } else if (!fallbackRecord) {
      // Sin respuestas válidas no podemos componer el informe; avisamos igual
      // para no perder el lead de vista.
      console.warn("[assessment/rgpd/lead] lead sin answers válidas — informe no enviado", {
        responseId,
      });
    }

    return json({ ok: true, responseId });
  } catch (error) {
    if (isAssessmentStorageError(error)) {
      console.error("[assessment/rgpd/lead] storage failed", error);
      return json(
        {
          error:
            "No pudimos guardar tu solicitud. Escríbenos a info@iaoperators.com y te enviamos el informe.",
          code: error.code,
        },
        503,
      );
    }
    console.error("[assessment/rgpd/lead] request failed", error);
    return json({ error: "No se pudo registrar la solicitud." }, 500);
  }
};
