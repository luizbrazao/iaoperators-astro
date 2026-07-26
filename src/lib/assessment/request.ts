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
}): AssessmentSourceContext {
  const { request, clientAddress, url } = input;
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const utms = normalizeUtms(url);

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
