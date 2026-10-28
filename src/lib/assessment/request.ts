// Contexto de origen de la petición, compartido por los endpoints de assessment.
// Reutiliza los helpers genéricos de src/lib/survey/utils.ts (hashes, UTMs,
// categoría de dispositivo): esa parte sí es común a cualquier instrumento.

import {
  createFingerprintHash,
  detectDeviceCategory,
  hashUserAgent,
  normalizeUtms,
} from "@/lib/survey/utils";
import type { AssessmentSourceContext } from "./types";

export function buildSourceContext(input: {
  request: Request;
  clientAddress?: string;
  url: URL;
  landingPath?: unknown;
  referrer?: unknown;
  /** UTMs leídas por el cliente en la página del test (`utm_source`, …). */
  utm?: unknown;
}): AssessmentSourceContext {
  const { request, clientAddress, url } = input;
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  // La URL de la petición es la del endpoint (/api/...), que nunca lleva query
  // string: las UTMs reales vienen del cliente. La URL queda como respaldo.
  const utms = pickUtms(input.utm, normalizeUtms(url));

  return {
    landingPath: String(input.landingPath ?? url.pathname).slice(0, 512),
    referrer: String(input.referrer ?? request.headers.get("referer") ?? "").slice(0, 512),
    utmSource: utms.source,
    utmMedium: utms.medium,
    utmCampaign: utms.campaign,
    utmTerm: utms.term,
    utmContent: utms.content,
    userAgentHash: hashUserAgent(userAgent),
    deviceCategory: detectDeviceCategory(userAgent),
    fingerprintHash: createFingerprintHash({
      ip: clientAddress || "unknown",
      userAgent,
      acceptLanguage,
    }),
  };
}

const UTM_MAX = 150;

function cleanUtm(value: unknown): string {
  if (typeof value !== "string") return "";
  // Fuera caracteres de control; el resto se guarda tal cual, recortado.
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, UTM_MAX);
}

function pickUtms(
  raw: unknown,
  fallback: ReturnType<typeof normalizeUtms>,
): ReturnType<typeof normalizeUtms> {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const from = (key: string, fb: string) => cleanUtm(obj[key]) || fb;
  return {
    source: from("utm_source", fallback.source),
    medium: from("utm_medium", fallback.medium),
    campaign: from("utm_campaign", fallback.campaign),
    term: from("utm_term", fallback.term),
    content: from("utm_content", fallback.content),
  };
}
