// Rate limit persistente en Supabase (ver la función SQL
// verifactu_kit_rate_limit_hit). Un Map en memoria no sirve en Vercel: cada
// invocación puede caer en una instancia distinta.
//
// Política ante fallo de la base de datos:
// - "open": se deja pasar y se registra (checkout: no perder ventas por un
//   contador).
// - "closed": se bloquea (endpoints que envían emails a direcciones que llegan
//   del cliente).

import { rateLimitKey } from "./crypto";
import { getSessionSecret } from "./env";
import { errorCode, kitLog } from "./log";
import { rateLimitHit } from "./storage";

export const LIMITS = {
  checkoutIp: { limit: 10, windowSeconds: 600 },
  requestAccessIp: { limit: 5, windowSeconds: 900 },
  requestAccessEmail: { limit: 3, windowSeconds: 3600 },
  consumeIp: { limit: 20, windowSeconds: 3600 },
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
    const key = rateLimitKey(getSessionSecret(), scope, identifier || "unknown");
    const ok = await rateLimitHit(key, limit, windowSeconds);
    if (!ok) kitLog({ request_id: requestId, action: "rate_limit", status: "denied", detail: scope });
    return ok;
  } catch (error) {
    kitLog({
      request_id: requestId,
      action: "rate_limit",
      status: "error",
      error_code: errorCode(error),
      detail: `${scope}:fail_${onFailure}`,
    });
    return onFailure === "open";
  }
}
