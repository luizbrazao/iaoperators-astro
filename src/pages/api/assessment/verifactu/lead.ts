import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { json } from "@/lib/survey/admin";
import { buildSourceContext } from "@/lib/assessment/request";
import {
  attachAssessmentLead,
  isAssessmentStorageError,
  isStorageConfigured,
} from "@/lib/assessment/storage";
import { sendAssessmentEmails, type AssessmentBrand } from "@/lib/assessment/email";
import type { AssessmentRecord } from "@/lib/assessment/types";
import { ASSESSMENT_KEY, ASSESSMENT_VERSION } from "@/lib/assessment/verifactu/questions";
import { isValidEmail, sanitizeAnswers, validateConsent } from "@/lib/assessment/verifactu/validation";
import { scoreAssessment } from "@/lib/assessment/verifactu/scoring";

export const prerender = false;

// Marca del informe: sin esto los correos saldrían con las cabeceras y el
// asunto del test de la Ley 10/2025, que es el que fija los valores por defecto.
const BRAND: AssessmentBrand = {
  norma: "Verifactu",
  cabecera: "Verifactu · Informe de cumplimiento",
  origen:
    "Resultado generado por reglas deterministas sobre el Real Decreto 1007/2023 y su calendario vigente",
};

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
      console.error("[assessment/verifactu/lead] storage not configured — lead perdido", { email });
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
    });

    let fallbackRecord: AssessmentRecord | undefined;
    if (errors.length === 0) {
      fallbackRecord = {
        responseId: String(body?.responseId ?? "") || randomUUID(),
        assessmentKey: ASSESSMENT_KEY,
        version: ASSESSMENT_VERSION,
        locale: "es",
        answers,
        result: scoreAssessment(answers),
        durationMs: Number(body?.durationMs ?? 0),
        source,
      };
    }

    const responseId = String(body?.responseId ?? "").trim() || fallbackRecord?.responseId;
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
        brand: BRAND,
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
      console.warn("[assessment/verifactu/lead] lead sin answers válidas — informe no enviado", {
        responseId,
        email,
      });
    }

    return json({ ok: true, responseId });
  } catch (error) {
    if (isAssessmentStorageError(error)) {
      console.error("[assessment/verifactu/lead] storage failed", error);
      return json(
        {
          error:
            "No pudimos guardar tu solicitud. Escríbenos a info@iaoperators.com y te enviamos el informe.",
          code: error.code,
        },
        503,
      );
    }
    console.error("[assessment/verifactu/lead] request failed", error);
    return json({ error: "No se pudo registrar la solicitud." }, 500);
  }
};
