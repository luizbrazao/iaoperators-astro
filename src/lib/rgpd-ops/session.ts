// Cookie de sesión de RGPD Ops. HttpOnly, Secure (en HTTPS), SameSite=Lax,
// Path=/ y prefijo __Host- en HTTPS (el navegador exige Secure, Path=/ y sin
// Domain: no puede plantarse desde un subdominio). Espacio de nombres propio
// ("rgo.session"): una cookie del Kit no sirve aquí aunque se copiara.

import type { AstroCookies } from "astro";
import { signSessionWith, verifySessionWith, type SignedSessionPayload } from "../commerce/tokens";
import { getSessionSecret, getSessionTtlDays } from "./env";

export const SESSION_NS = "rgo.session";
const SECURE_NAME = "__Host-rgo_session";
const DEV_NAME = "rgo_session";

function isSecure(url: URL) {
  return url.protocol === "https:";
}

export function sessionCookieName(url: URL) {
  return isSecure(url) ? SECURE_NAME : DEV_NAME;
}

export function signOpsSession(payload: SignedSessionPayload, secret: string) {
  return signSessionWith(SESSION_NS, payload, secret);
}

export function verifyOpsSession(value: string | undefined | null, secret: string, now?: number) {
  return verifySessionWith(SESSION_NS, value, secret, now);
}

export function createSession(cookies: AstroCookies, url: URL, orderId: string, accessExpiresAt?: string | null) {
  const now = Math.floor(Date.now() / 1000);
  let exp = now + getSessionTtlDays() * 86_400;
  if (accessExpiresAt) exp = Math.min(exp, Math.floor(new Date(accessExpiresAt).getTime() / 1000));
  cookies.set(sessionCookieName(url), signOpsSession({ v: 1, oid: orderId, iat: now, exp }, getSessionSecret()), {
    httpOnly: true,
    secure: isSecure(url),
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, exp - now),
  });
}

export function readSession(cookies: AstroCookies, url: URL): SignedSessionPayload | null {
  const value = cookies.get(sessionCookieName(url))?.value;
  if (!value) return null;
  return verifyOpsSession(value, getSessionSecret());
}

export function clearSession(cookies: AstroCookies, url: URL) {
  cookies.delete(sessionCookieName(url), { path: "/", secure: isSecure(url), httpOnly: true, sameSite: "lax" });
}
