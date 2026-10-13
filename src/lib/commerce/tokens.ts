// Primitivas criptográficas compartidas por los productos de pago (Kit
// VERI*FACTU y RGPD Ops). Funciones puras sobre node:crypto, sin estado ni
// variables de entorno: cada producto decide su espacio de nombres, su secreto
// y su cookie.
//
// - Token de acceso: 32 bytes aleatorios (256 bits) en base64url. En la base de
//   datos solo se guarda su SHA-256: un token robado de la tabla no sirve.
// - Sesión: payload JSON en base64url + HMAC-SHA256 sobre
//   "<namespace>.<body>". El namespace impide que una cookie firmada para un
//   producto sea válida en otro aunque compartieran secreto.
// - Claves de rate limit: HMAC del ámbito y del identificador (no se guarda la
//   IP ni el email).

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;
/** base64url de 32 bytes = 43 caracteres. */
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function generateAccessToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function hmac(secret: string, data: string): Buffer {
  return createHmac("sha256", secret).update(data, "utf8").digest();
}

export function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export interface SignedSessionPayload {
  /** Versión del formato de sesión. */
  v: 1;
  /** Id del pedido (uuid). */
  oid: string;
  /** Emitida (segundos epoch). */
  iat: number;
  /** Caduca (segundos epoch). */
  exp: number;
}

export function signSessionWith(namespace: string, payload: SignedSessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = hmac(secret, `${namespace}.${body}`).toString("base64url");
  return `${body}.${sig}`;
}

export function verifySessionWith(
  namespace: string,
  value: string | undefined | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): SignedSessionPayload | null {
  if (!value || value.length > 1024) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  const expected = hmac(secret, `${namespace}.${body}`);
  if (!safeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedSessionPayload;
    if (payload.v !== 1 || !isUuid(payload.oid)) return null;
    if (typeof payload.exp !== "number" || payload.exp <= nowSeconds) return null;
    if (typeof payload.iat !== "number" || payload.iat > nowSeconds + 60) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Clave de rate limit: HMAC del ámbito y el identificador. No guarda IP ni email. */
export function rateLimitKeyWith(namespace: string, secret: string, scope: string, identifier: string): string {
  return createHmac("sha256", secret).update(`${namespace}.${scope}.${identifier}`, "utf8").digest("hex");
}
