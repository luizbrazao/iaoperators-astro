// Validación de Origin para los endpoints que cambian estado (CSRF). Sin
// Origin, o con uno que no es el propio ni uno permitido, se rechaza. Con
// "Origin: null" decide Sec-Fetch-Site, que el navegador fija y una página de
// otro sitio no puede falsificar.

import { getExtraAllowedOrigins, SITE_URL } from "./env";

export function isAllowedOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") {
    return request.headers.get("sec-fetch-site") === "same-origin";
  }
  const normalized = origin.replace(/\/$/, "");
  if (normalized === url.origin) return true;
  if (normalized === SITE_URL || normalized === SITE_URL.replace("https://", "https://www.")) return true;
  return getExtraAllowedOrigins().includes(normalized);
}

/** Base para success_url y cancel_url: el origen solo si ya está permitido. */
export function trustedBaseUrl(request: Request, url: URL): string {
  if (isAllowedOrigin(request, url)) return (request.headers.get("origin") ?? url.origin).replace(/\/$/, "");
  return SITE_URL;
}
