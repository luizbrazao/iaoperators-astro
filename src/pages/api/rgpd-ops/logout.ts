// POST /api/rgpd-ops/logout — borra la cookie de sesión.
import type { APIRoute } from "astro";
import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { isAllowedOrigin } from "@/lib/rgpd-ops/origin";
import { clearSession } from "@/lib/rgpd-ops/session";
import { methodNotAllowed } from "@/lib/rgpd-ops/http";

export const prerender = false;

export const POST: APIRoute = ({ request, url, cookies, redirect }) => {
  const requestId = requestIdFrom(request);
  if (!isAllowedOrigin(request, url)) {
    opsLog({ request_id: requestId, action: "logout", status: "denied", error_code: "origin_not_allowed" });
    return redirect(RGPD_OPS_PRODUCT.paths.acceso, 303);
  }
  clearSession(cookies, url);
  opsLog({ request_id: requestId, action: "logout", status: "ok" });
  return redirect(`${RGPD_OPS_PRODUCT.paths.acceso}?estado=sesion-cerrada`, 303);
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
