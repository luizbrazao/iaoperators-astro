// Autorización de la zona del comprador de RGPD Ops. En CADA petición:
// 1. La cookie de sesión tiene una firma HMAC válida y no ha caducado.
// 2. El pedido sigue pagado, con acceso activo y dentro de plazo EN LA BASE DE
//    DATOS. Un reembolso revoca el acceso aunque la cookie siga siendo válida.
// 3. El espacio de trabajo es el de ESE pedido (UNIQUE(order_id)). Si no
//    existe todavía (fallo puntual al crearlo en el webhook), se crea aquí de
//    forma idempotente.

import type { AstroCookies } from "astro";
import { isAccessAllowed } from "../commerce/payment-state";
import { RgpdOpsConfigError } from "./env";
import { errorCode, opsLog } from "./log";
import { getOrderById, type OpsOrder } from "./orders";
import { readSession } from "./session";
import { supabaseRepo, type WorkspaceRepo } from "./workspace";

export type OpsAuth =
  | { status: "ok"; order: OpsOrder; workspaceId: string }
  | { status: "anonymous" }
  | { status: "denied" }
  | { status: "unavailable" };

export interface AuthDeps {
  readSession: typeof readSession;
  getOrderById: typeof getOrderById;
  repo: Pick<WorkspaceRepo, "findWorkspaceId" | "ensureWorkspace">;
}

const defaultAuthDeps: AuthDeps = { readSession, getOrderById, repo: supabaseRepo };

export async function getAuthorizedWorkspace(
  cookies: AstroCookies,
  url: URL,
  requestId: string,
  deps: AuthDeps = defaultAuthDeps,
): Promise<OpsAuth> {
  try {
    const session = deps.readSession(cookies, url);
    if (!session) return { status: "anonymous" };
    const order = await deps.getOrderById(session.oid);
    if (!isAccessAllowed(order)) {
      opsLog({ request_id: requestId, order_id: session.oid, action: "auth", status: "denied" });
      return { status: "denied" };
    }
    const workspaceId = (await deps.repo.findWorkspaceId(order!.id)) ?? (await deps.repo.ensureWorkspace(order!.id)).workspace_id;
    return { status: "ok", order: order!, workspaceId };
  } catch (error) {
    opsLog({
      request_id: requestId,
      action: "auth",
      status: "error",
      error_code: error instanceof RgpdOpsConfigError ? "rgpd_ops_config_missing" : errorCode(error),
    });
    return { status: "unavailable" };
  }
}
