// POST /api/rgpd-ops/request-access — pide un nuevo magic link.
//
// La respuesta es SIEMPRE la misma (salvo formato inválido o límite por IP):
// no revela si un email tiene una compra. El límite por email se aplica en
// silencio, devolviendo el mismo mensaje sin enviar nada.
import type { APIRoute } from "astro";
import { isValidEmail } from "@/lib/assessment/validation";
import { RgpdOpsConfigError } from "@/lib/rgpd-ops/env";
import { issueAccessLink } from "@/lib/rgpd-ops/fulfillment";
import { errorCode, opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { isAllowedOrigin } from "@/lib/rgpd-ops/origin";
import { checkRateLimit } from "@/lib/rgpd-ops/rate-limit";
import { isAccessAllowed } from "@/lib/commerce/payment-state";
import { findActiveOrdersByEmail } from "@/lib/rgpd-ops/orders";
import { jsonResponse, methodNotAllowed } from "@/lib/rgpd-ops/http";

export const prerender = false;

const GENERIC =
  "Si ese email tiene una compra activa de RGPD Ops, en unos minutos recibirás un enlace de acceso. Revisa también la carpeta de spam.";

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  const requestId = requestIdFrom(request);

  if (!isAllowedOrigin(request, url)) {
    opsLog({ request_id: requestId, action: "request_access", status: "denied", error_code: "origin_not_allowed" });
    return jsonResponse({ error: "Origen no permitido.", code: "origin_not_allowed" }, 403, requestId);
  }

  const body = (await request.json().catch(() => null)) as { email?: unknown; hp_confirm?: unknown } | null;
  if (String(body?.hp_confirm ?? "").trim()) return jsonResponse({ ok: true, message: GENERIC });

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return jsonResponse({ error: "Escribe un email válido.", code: "invalid_email" }, 400, requestId);
  }

  if (!(await checkRateLimit("requestAccessIp", clientAddress ?? "unknown", "closed", requestId))) {
    return jsonResponse(
      { error: "Demasiadas solicitudes. Espera unos minutos y vuelve a probar.", code: "rate_limited" },
      429,
      requestId,
    );
  }

  if (!(await checkRateLimit("requestAccessEmail", email, "closed", requestId))) {
    return jsonResponse({ ok: true, message: GENERIC });
  }

  try {
    const order = (await findActiveOrdersByEmail(email)).find((o) => isAccessAllowed(o));
    if (order) {
      await issueAccessLink(order, "resend", requestId);
    } else {
      opsLog({ request_id: requestId, action: "request_access", status: "skipped", detail: "no_active_order" });
    }
  } catch (error) {
    opsLog({
      request_id: requestId,
      action: "request_access",
      status: "error",
      error_code: error instanceof RgpdOpsConfigError ? "rgpd_ops_config_missing" : errorCode(error),
    });
    // Mismo mensaje: un fallo interno no debe distinguirse de "no hay compra".
  }

  return jsonResponse({ ok: true, message: GENERIC });
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
