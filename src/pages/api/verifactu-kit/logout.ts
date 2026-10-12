// POST /api/verifactu-kit/logout — borra la cookie de sesión.
import type { APIRoute } from "astro";
import { KIT_PRODUCT } from "@/data/verifactu-kit";
import { kitLog, requestIdFrom } from "@/lib/verifactu-kit/log";
import { isAllowedOrigin } from "@/lib/verifactu-kit/origin";
import { clearSession } from "@/lib/verifactu-kit/session";
import { methodNotAllowed } from "./_http";

export const prerender = false;

export const POST: APIRoute = ({ request, url, cookies, redirect }) => {
  const requestId = requestIdFrom(request);
  if (!isAllowedOrigin(request, url)) {
    kitLog({ request_id: requestId, action: "logout", status: "denied", error_code: "origin_not_allowed" });
    return redirect(KIT_PRODUCT.paths.acceso, 303);
  }
  clearSession(cookies, url);
  kitLog({ request_id: requestId, action: "logout", status: "ok" });
  return redirect(`${KIT_PRODUCT.paths.acceso}?estado=sesion-cerrada`, 303);
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
