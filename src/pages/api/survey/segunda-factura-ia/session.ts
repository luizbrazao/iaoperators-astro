import type { APIRoute } from "astro";
import { createSurveySession, updateSurveySession } from "@/lib/survey/storage";
import { hashUserAgent, createFingerprintHash, detectDeviceCategory, normalizeUtms } from "@/lib/survey/utils";
import { deriveQualityFlags, sanitizeAnswers } from "@/lib/survey/validation";
import { json } from "@/lib/survey/admin";

export const prerender = false;

function getRequestContext(request: Request, clientAddress: string | undefined, url: URL) {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  return {
    userAgent,
    acceptLanguage,
    userAgentHash: hashUserAgent(userAgent),
    deviceCategory: detectDeviceCategory(userAgent),
    fingerprintHash: createFingerprintHash({
      ip: clientAddress || "unknown",
      userAgent,
      acceptLanguage,
    }),
    utms: normalizeUtms(url),
  };
}

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  try {
    const context = getRequestContext(request, clientAddress, url);
    const body = await request.json().catch(() => ({}));
    const locale = String(body?.locale ?? "es");
    const landingPath = String(body?.landingPath ?? url.pathname);
    const referrer = String(body?.referrer ?? request.headers.get("referer") ?? "");

    const session = await createSurveySession({
      locale,
      landingPath,
      referrer,
      utms: context.utms,
      userAgentHash: context.userAgentHash,
      deviceCategory: context.deviceCategory,
      fingerprintHash: context.fingerprintHash,
      questionnaireLanguage: locale === "es" ? "es-ES" : locale,
    });

    return json({
      ok: true,
      responseId: session.responseId,
      completionStep: session.completionStep,
      storageDriver: "ready",
    });
  } catch (error) {
    console.error("[survey/session] create failed", error);
    return json({ error: "No se pudo iniciar la encuesta." }, 500);
  }
};

export const PATCH: APIRoute = async ({ request, clientAddress, url }) => {
  try {
    const body = await request.json().catch(() => null);
    const responseId = String(body?.responseId ?? "").trim();
    if (!responseId) {
      return json({ error: "Falta responseId." }, 400);
    }

    const status = body?.status ? String(body.status) : undefined;
    const completionStep = Number(body?.completionStep ?? 0);
    const durationMs = Number(body?.durationMs ?? 0);
    const partialRaw = typeof body?.answers === "object" && body?.answers ? body.answers : {};
    const { answers } = sanitizeAnswers(partialRaw);

    const context = getRequestContext(request, clientAddress, url);
    const qualityFlags =
      status === "abandoned"
        ? deriveQualityFlags({
            answers,
            durationMs,
            fingerprintIsDuplicate: false,
            status: "abandoned",
            userAgentMissing: !context.userAgentHash,
          })
        : undefined;

    const updated = await updateSurveySession({
      responseId,
      status: status as "abandoned" | "started" | undefined,
      completionStep,
      durationMs,
      answers,
      qualityFlags,
    });

    return json({ ok: true, status: updated.status });
  } catch (error) {
    console.error("[survey/session] update failed", error);
    return json({ error: "No se pudo actualizar la sesión." }, 500);
  }
};
