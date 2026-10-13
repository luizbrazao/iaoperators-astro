// Rate limit persistente en Supabase (función rgpd_ops_rate_limit_hit). Un Map
// en memoria no sirve en Vercel: cada invocación puede caer en otra instancia.
//
// Política ante fallo de la base de datos:
// - "open": se deja pasar y se registra (checkout, lecturas y mutaciones de un
//   comprador ya autenticado: no bloquear el trabajo por un contador).
// - "closed": se bloquea (endpoints que envían emails o consumen tokens).

import { rateLimitKeyWith } from "../commerce/tokens";
import { getSessionSecret } from "./env";
import { errorCode, opsLog } from "./log";
import { rateLimitHit } from "./orders";

export const LIMITS = {
  checkoutIp: { limit: 10, windowSeconds: 600 },
  requestAccessIp: { limit: 5, windowSeconds: 900 },
  requestAccessEmail: { limit: 3, windowSeconds: 3600 },
  consumeIp: { limit: 20, windowSeconds: 3600 },
  workspaceRead: { limit: 300, windowSeconds: 600 },
  workspaceWrite: { limit: 600, windowSeconds: 600 },
  exportSession: { limit: 60, windowSeconds: 600 },
} as const;

export async function checkRateLimit(
  scope: keyof typeof LIMITS,
  identifier: string,
  onFailure: "open" | "closed",
  requestId: string,
): Promise<boolean> {
  const { limit, windowSeconds } = LIMITS[scope];
  try {
    const key = rateLimitKeyWith("rgo.rl", getSessionSecret(), scope, identifier || "unknown");
    const ok = await rateLimitHit(key, limit, windowSeconds);
    if (!ok) opsLog({ request_id: requestId, action: "rate_limit", status: "denied", detail: scope });
    return ok;
  } catch (error) {
    opsLog({ request_id: requestId, action: "rate_limit", status: "error", error_code: errorCode(error), detail: `${scope}:fail_${onFailure}` });
    return onFailure === "open";
  }
}
