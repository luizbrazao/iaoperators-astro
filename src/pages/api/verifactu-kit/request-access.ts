// POST /api/verifactu-kit/request-access — pide un nuevo magic link.
//
// La respuesta es SIEMPRE la misma (salvo formato inválido o límite por IP):
// no revela si un email tiene una compra. El límite por email se aplica en
// silencio, devolviendo el mismo mensaje sin enviar nada.
import type { APIRoute } from "astro";
import { isValidEmail } from "@/lib/assessment/validation";
import { KitConfigError } from "@/lib/verifactu-kit/env";
import { issueAccessLink } from "@/lib/verifactu-kit/fulfillment";
import { errorCode, kitLog, requestIdFrom } from "@/lib/verifactu-kit/log";
import { isAllowedOrigin } from "@/lib/verifactu-kit/origin";
import { checkRateLimit } from "@/lib/verifactu-kit/rate-limit";
import { isAccessAllowed } from "@/lib/verifactu-kit/state";
import { findActiveOrdersByEmail } from "@/lib/verifactu-kit/storage";
import { jsonResponse, methodNotAllowed } from "./_http";

export const prerender = false;

const GENERIC =
  "Si ese email tiene una compra activa del Kit, en unos minutos recibirás un enlace de acceso. Revisa también la carpeta de spam.";

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  const requestId = requestIdFrom(request);

  if (!isAllowedOrigin(request, url)) {
    kitLog({ request_id: requestId, action: "request_access", status: "denied", error_code: "origin_not_allowed" });
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
      kitLog({ request_id: requestId, action: "request_access", status: "skipped", detail: "no_active_order" });
    }
  } catch (error) {
    kitLog({
      request_id: requestId,
      action: "request_access",
      status: "error",
      error_code: error instanceof KitConfigError ? "kit_config_missing" : errorCode(error),
    });
    // Mismo mensaje: un fallo interno no debe distinguirse de "no hay compra".
  }

  return jsonResponse({ ok: true, message: GENERIC });
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
