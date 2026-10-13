// /api/rgpd-ops/consume-access
//
// GET ?token=…  → página mínima con un botón "Entrar a mi espacio" (NO consume el token).
// POST token    → consume el token (uso único, atómico), crea la sesión firmada
//                 y redirige con 303 a la zona de RGPD Ops, ya sin token en la URL.
//
// Por qué no se consume en el GET: los escáneres de enlaces del correo
// (Microsoft Defender Safe Links, Gmail, antivirus) abren las URLs de los
// emails con GET antes que la persona. Si el GET consumiera el token, el enlace
// llegaría usado. Un escáner no envía formularios POST.
//
// La página intermedia no carga analítica ni recursos externos y lleva
// Referrer-Policy: same-origin, para que el token no salga del dominio.
import type { APIRoute } from "astro";
import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { escapeHtml } from "@/lib/assessment/email";
import { TOKEN_RE } from "@/lib/commerce/tokens";
import { errorCode, opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { isAllowedOrigin } from "@/lib/rgpd-ops/origin";
import { checkRateLimit } from "@/lib/rgpd-ops/rate-limit";
import { createSession } from "@/lib/rgpd-ops/session";
import { isAccessAllowed } from "@/lib/commerce/payment-state";
import { consumeAccessToken, getOrderById, touchLastAccess } from "@/lib/rgpd-ops/orders";
import { methodNotAllowed, NO_STORE_HEADERS } from "@/lib/rgpd-ops/http";

export const prerender = false;

const ACCESO = RGPD_OPS_PRODUCT.paths.acceso;

function confirmPage(token: string): Response {
  const html = `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<meta name="referrer" content="same-origin" />
<title>Entrar a RGPD Ops · IA Operators</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f2ec; color: #1d1f1a;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; padding: 16px; }
  main { max-width: 440px; width: 100%; background: #fff; padding: 32px; box-sizing: border-box; }
  p.eyebrow { font: 600 11px/1.4 ui-monospace, Menlo, monospace; letter-spacing: .08em; text-transform: uppercase; color: #ae3810; margin: 0 0 12px; }
  h1 { font-size: 24px; line-height: 1.25; letter-spacing: -.02em; font-weight: 600; margin: 0 0 12px; }
  p { font-size: 15px; line-height: 1.6; color: #4b4f45; margin: 0 0 20px; }
  button { width: 100%; min-height: 48px; border: 0; background: #1d1f1a; color: #fff; font: 600 16px/1 inherit; cursor: pointer; }
  button:focus-visible { outline: 3px solid #ae3810; outline-offset: 2px; }
  small { display: block; margin-top: 16px; font-size: 12px; color: #6b6f63; line-height: 1.5; }
</style>
</head><body><main>
  <p class="eyebrow">${escapeHtml(RGPD_OPS_PRODUCT.shortName)}</p>
  <h1>Entrar a tu espacio</h1>
  <p>Pulsa el botón para abrir tu acceso en este navegador. El enlace es de un solo uso.</p>
  <form method="post" action="/api/rgpd-ops/consume-access">
    <input type="hidden" name="token" value="${escapeHtml(token)}" />
    <button type="submit">Entrar a mi espacio</button>
  </form>
  <small>¿El enlace no funciona? Pide uno nuevo en <a href="${ACCESO}">${ACCESO}</a>.</small>
</main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...NO_STORE_HEADERS,
      // same-origin y no no-referrer: con no-referrer el navegador envía
      // "Origin: null" en el POST del botón. La página no carga nada externo,
      // así que el token no sale del propio dominio.
      "referrer-policy": "same-origin",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "x-frame-options": "DENY",
    },
  });
}

export const GET: APIRoute = ({ url, redirect }) => {
  const token = url.searchParams.get("token") ?? "";
  if (!TOKEN_RE.test(token)) return redirect(`${ACCESO}?estado=enlace-invalido`, 303);
  return confirmPage(token);
};

export const POST: APIRoute = async ({ request, url, cookies, clientAddress, redirect }) => {
  const requestId = requestIdFrom(request);

  if (!isAllowedOrigin(request, url)) {
    opsLog({ request_id: requestId, action: "consume_access", status: "denied", error_code: "origin_not_allowed" });
    return redirect(`${ACCESO}?estado=enlace-invalido`, 303);
  }

  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  if (!TOKEN_RE.test(token)) return redirect(`${ACCESO}?estado=enlace-invalido`, 303);

  if (!(await checkRateLimit("consumeIp", clientAddress ?? "unknown", "closed", requestId))) {
    return redirect(`${ACCESO}?estado=demasiados-intentos`, 303);
  }

  try {
    const orderId = await consumeAccessToken(token);
    if (!orderId) {
      opsLog({ request_id: requestId, action: "consume_access", status: "denied", error_code: "token_invalid_or_used" });
      return redirect(`${ACCESO}?estado=enlace-caducado`, 303);
    }
    const order = await getOrderById(orderId);
    if (!isAccessAllowed(order)) {
      opsLog({ request_id: requestId, order_id: orderId, action: "consume_access", status: "denied", error_code: "access_not_active" });
      return redirect(`${ACCESO}?estado=acceso-no-disponible`, 303);
    }
    createSession(cookies, url, order!.id, order!.access_expires_at);
    await touchLastAccess(order!.id).catch(() => undefined);
    opsLog({ request_id: requestId, order_id: order!.id, action: "consume_access", status: "ok" });
    return redirect(ACCESO, 303);
  } catch (error) {
    opsLog({ request_id: requestId, action: "consume_access", status: "error", error_code: errorCode(error) });
    return redirect(`${ACCESO}?estado=no-disponible`, 303);
  }
};

export const ALL: APIRoute = () => methodNotAllowed("GET, POST");
