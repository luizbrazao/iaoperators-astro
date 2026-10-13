// Primitivas criptográficas del Kit: tokens de acceso, hash, sesiones firmadas
// y claves de rate limit.
//
// Desde oct/2026 la implementación vive en src/lib/commerce/tokens.ts
// (compartida con RGPD Ops). Este wrapper fija los espacios de nombres del Kit
// ("vfk.session" y "vfk.rl"), de modo que las cookies y claves ya emitidas
// siguen siendo válidas byte a byte.
//
// - Token de acceso: 32 bytes aleatorios en base64url. Solo se guarda su SHA-256.
// - Sesión: payload JSON en base64url + HMAC-SHA256, verificada con
//   timingSafeEqual. La cookie no contiene datos personales.

import {
  rateLimitKeyWith,
  signSessionWith,
  verifySessionWith,
  type SignedSessionPayload,
} from "../commerce/tokens";

export { TOKEN_RE, isUuid, generateAccessToken, hashAccessToken, safeEqual } from "../commerce/tokens";

export type KitSessionPayload = SignedSessionPayload;

const SESSION_NS = "vfk.session";
const RATE_LIMIT_NS = "vfk.rl";

export function signSession(payload: KitSessionPayload, secret: string): string {
  return signSessionWith(SESSION_NS, payload, secret);
}

export function verifySession(
  value: string | undefined | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): KitSessionPayload | null {
  return verifySessionWith(SESSION_NS, value, secret, nowSeconds);
}

/** Clave de rate limit: HMAC del ámbito y el identificador. No guarda IP ni email. */
export function rateLimitKey(secret: string, scope: string, identifier: string): string {
  return rateLimitKeyWith(RATE_LIMIT_NS, secret, scope, identifier);
}
