// Validación de Origin para los endpoints que cambian estado (CSRF). Los
// navegadores envían Origin en todo POST de fetch y de formulario. Sin Origin,
// o con uno que no es el propio ni uno permitido, se rechaza.

import { getExtraAllowedOrigins, SITE_URL } from "./env";

export function isAllowedOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get("origin");
  // Con Referrer-Policy: no-referrer (o en algunos navegadores con privacidad
  // reforzada) el POST llega con "Origin: null" aunque sea de la propia web.
  // En ese caso decide Sec-Fetch-Site, que lo fija el navegador y una página
  // de otro sitio no puede falsificar.
  if (!origin || origin === "null") {
    return request.headers.get("sec-fetch-site") === "same-origin";
  }
  const normalized = origin.replace(/\/$/, "");
  if (normalized === url.origin) return true;
  if (normalized === SITE_URL || normalized === SITE_URL.replace("https://", "https://www.")) return true;
  return getExtraAllowedOrigins().includes(normalized);
}

/**
 * Base para success_url, cancel_url y enlaces de acceso. Solo el origen de la
 * petición si ya pasó isAllowedOrigin; en cualquier otro caso, el dominio propio.
 */
export function trustedBaseUrl(request: Request, url: URL): string {
  if (isAllowedOrigin(request, url)) return (request.headers.get("origin") ?? url.origin).replace(/\/$/, "");
  return SITE_URL;
}
