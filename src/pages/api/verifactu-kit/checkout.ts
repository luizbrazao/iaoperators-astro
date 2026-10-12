// POST /api/verifactu-kit/checkout — crea una Stripe Checkout Session.
// El navegador solo puede aportar el responseId del test (opcional). Precio,
// moneda, producto, impuestos y URLs se deciden aquí.
import type { APIRoute } from "astro";
import { isUuid } from "@/lib/verifactu-kit/crypto";
import { KitConfigError } from "@/lib/verifactu-kit/env";
import { errorCode, kitLog, requestIdFrom } from "@/lib/verifactu-kit/log";
import { isAllowedOrigin, trustedBaseUrl } from "@/lib/verifactu-kit/origin";
import { checkRateLimit } from "@/lib/verifactu-kit/rate-limit";
import { createKitCheckoutSession, KitCheckoutError } from "@/lib/verifactu-kit/stripe";
import { jsonResponse, methodNotAllowed } from "./_http";

export const prerender = false;

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  const requestId = requestIdFrom(request);

  if (!isAllowedOrigin(request, url)) {
    kitLog({ request_id: requestId, action: "checkout_create", status: "denied", error_code: "origin_not_allowed" });
    return jsonResponse({ error: "Origen no permitido.", code: "origin_not_allowed" }, 403, requestId);
  }
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return jsonResponse({ error: "Formato no admitido.", code: "unsupported_media_type" }, 415, requestId);
  }

  const body = (await request.json().catch(() => null)) as { responseId?: unknown } | null;
  const responseId = isUuid(body?.responseId) ? (body!.responseId as string) : null;

  if (!(await checkRateLimit("checkoutIp", clientAddress ?? "unknown", "open", requestId))) {
    return jsonResponse(
      { error: "Demasiados intentos. Espera unos minutos y vuelve a probar.", code: "rate_limited" },
      429,
      requestId,
    );
  }

  try {
    const session = await createKitCheckoutSession({
      baseUrl: trustedBaseUrl(request, url),
      assessmentResponseId: responseId,
    });
    if (!session.url) throw new KitCheckoutError("checkout_url_missing", "Stripe no devolvió URL de pago.");
    kitLog({
      request_id: requestId,
      checkout_session_id: session.id,
      action: "checkout_create",
      status: "ok",
      detail: responseId ? "with_assessment" : "direct",
    });
    return jsonResponse({ url: session.url }, 200, requestId);
  } catch (error) {
    const code =
      error instanceof KitConfigError
        ? "kit_config_missing"
        : error instanceof KitCheckoutError
          ? error.code
          : errorCode(error);
    kitLog({ request_id: requestId, action: "checkout_create", status: "error", error_code: code });
    const unavailable = error instanceof KitConfigError || error instanceof KitCheckoutError;
    return jsonResponse(
      {
        error: unavailable
          ? "El pago no está disponible ahora mismo. Escríbenos a info@iaoperators.com y te ayudamos."
          : "No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos.",
        code: unavailable ? "checkout_unavailable" : "checkout_failed",
      },
      unavailable ? 503 : 502,
      requestId,
    );
  }
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
