// Cookie de sesión del Kit. HttpOnly, Secure (en HTTPS), SameSite=Lax, Path=/.
// En HTTPS usa el prefijo __Host-, que obliga al navegador a exigir Secure,
// Path=/ y ausencia de Domain: la cookie no puede plantarse desde un subdominio.

import type { AstroCookies } from "astro";
import { signSession, verifySession, type KitSessionPayload } from "./crypto";
import { getSessionSecret, getSessionTtlDays } from "./env";

const SECURE_NAME = "__Host-vfk_session";
const DEV_NAME = "vfk_session";

function isSecure(url: URL) {
  return url.protocol === "https:";
}

export function sessionCookieName(url: URL) {
  return isSecure(url) ? SECURE_NAME : DEV_NAME;
}

export function createSession(cookies: AstroCookies, url: URL, orderId: string, accessExpiresAt?: string | null) {
  const now = Math.floor(Date.now() / 1000);
  let exp = now + getSessionTtlDays() * 86_400;
  // La sesión nunca dura más que el acceso comprado.
  if (accessExpiresAt) exp = Math.min(exp, Math.floor(new Date(accessExpiresAt).getTime() / 1000));
  const payload: KitSessionPayload = { v: 1, oid: orderId, iat: now, exp };
  cookies.set(sessionCookieName(url), signSession(payload, getSessionSecret()), {
    httpOnly: true,
    secure: isSecure(url),
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, exp - now),
  });
}

export function readSession(cookies: AstroCookies, url: URL): KitSessionPayload | null {
  const value = cookies.get(sessionCookieName(url))?.value;
  if (!value) return null;
  return verifySession(value, getSessionSecret());
}

export function clearSession(cookies: AstroCookies, url: URL) {
  cookies.delete(sessionCookieName(url), { path: "/", secure: isSecure(url), httpOnly: true, sameSite: "lax" });
}
