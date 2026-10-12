// Autorización de la zona del comprador. Dos comprobaciones, siempre las dos:
// 1. La cookie de sesión tiene una firma HMAC válida y no ha caducado.
// 2. El pedido sigue pagado y con acceso activo EN LA BASE DE DATOS. Un
//    reembolso revoca el acceso aunque la cookie siga siendo válida.

import type { AstroCookies } from "astro";
import { KitConfigError } from "./env";
import { errorCode, kitLog } from "./log";
import { readSession } from "./session";
import { isAccessAllowed } from "./state";
import { getOrderById, type KitOrder } from "./storage";

export type KitAuth =
  | { status: "ok"; order: KitOrder }
  | { status: "anonymous" }
  | { status: "denied" }
  | { status: "unavailable" };

export async function getAuthorizedOrder(cookies: AstroCookies, url: URL, requestId: string): Promise<KitAuth> {
  try {
    const session = readSession(cookies, url);
    if (!session) return { status: "anonymous" };
    const order = await getOrderById(session.oid);
    if (!isAccessAllowed(order)) {
      kitLog({ request_id: requestId, order_id: session.oid, action: "auth", status: "denied" });
      return { status: "denied" };
    }
    return { status: "ok", order: order! };
  } catch (error) {
    kitLog({
      request_id: requestId,
      action: "auth",
      status: "error",
      error_code: error instanceof KitConfigError ? "kit_config_missing" : errorCode(error),
    });
    return { status: "unavailable" };
  }
}
