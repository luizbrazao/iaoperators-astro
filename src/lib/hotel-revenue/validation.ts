// Validación y normalización del payload del formulario de leads.
//
// Pura y compartida: la usa el endpoint y los tests. Todo lo que llega del
// navegador se trata como no fiable. Lista blanca estricta: los campos que no
// están aquí (incluidos los «resultados» que pudiera mandar el cliente) se
// descartan sin mirarlos.

import { ACCEPTED_CONSENT_VERSIONS, HOTEL_REVENUE_PRODUCT } from "@/data/hotel-revenue";
import { validateCalculatorInputs } from "./calculator";
import type { CtaOrigin, FieldErrors, LeadField, NormalizedLead, UtmParams, ValidationResult } from "./types";

export const LEAD_LIMITS = {
  name: { min: 2, max: 120 },
  hotelName: { min: 2, max: 160 },
  email: { max: 254 },
  website: { max: 200 },
  phone: { max: 32, minDigits: 6, maxDigits: 18 },
  propertyCount: { min: 1, max: 200 },
  roomCount: { min: 1, max: 20000 },
  landingPath: { max: 200 },
  utm: { max: 100 },
} as const;

export const CTA_ORIGINS: readonly CtaOrigin[] = [
  "hero",
  "calculator_embedded",
  "calculator_page",
  "pilot",
  "closing",
  "hoteles_vertical",
  "unknown",
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Caracteres de control y de formato invisibles (incluye RTL override y ZWSP).
const CONTROL_RE = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g;

/** Texto libre de una línea: NFC, sin controles, espacios colapsados, recortado. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .normalize("NFC")
    .replace(CONTROL_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function normalizeEmail(value: unknown): string | null {
  const email = cleanText(value, 300).toLowerCase();
  if (!email || email.length > LEAD_LIMITS.email.max || !EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Web opcional. Acepta "hotel.com", "www.hotel.com" o una URL http(s).
 * Devuelve la URL normalizada (origen + ruta, sin query ni fragmento) o null.
 * `undefined` = campo vacío (válido); `null` = presente pero inválido.
 */
export function normalizeWebsite(value: unknown): string | undefined | null {
  const raw = cleanText(value, 300);
  if (!raw) return undefined;
  if (raw.length > LEAD_LIMITS.website.max) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (!/^[a-z0-9.-]+$/.test(host) || !host.includes(".") || host.startsWith(".") || host.endsWith(".")) return null;
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
    const out = `${url.protocol}//${host}${url.port ? `:${url.port}` : ""}${path}`;
    return out.length <= LEAD_LIMITS.website.max ? out : null;
  } catch {
    return null;
  }
}

/**
 * Teléfono opcional. Sin intentar validar el plan de numeración de cada país:
 * solo dígitos, espacios, un "+", "(", ")", "-", "." y entre 6 y 18 dígitos.
 */
export function normalizePhone(value: unknown): string | undefined | null {
  const raw = cleanText(value, 64);
  if (!raw) return undefined;
  if (raw.length > LEAD_LIMITS.phone.max || !/^[0-9 ()+.-]+$/.test(raw) || (raw.match(/\+/g) ?? []).length > 1) return null;
  const digits = raw.replace(/\D/g, "").length;
  if (digits < LEAD_LIMITS.phone.minDigits || digits > LEAD_LIMITS.phone.maxDigits) return null;
  return raw;
}

function intInRange(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && /^\s*\d+\s*$/.test(value) ? Number(value) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/** Solo la ruta, y solo dentro de la vertical hotelera. Lo demás → la landing. */
export function sanitizeLandingPath(value: unknown): string {
  const raw = cleanText(value, 400);
  let path = raw;
  try {
    path = new URL(raw, "https://iaoperators.com").pathname;
  } catch {
    path = "";
  }
  if (!path.startsWith("/es/hoteles/") || path.length > LEAD_LIMITS.landingPath.max || !/^[a-z0-9/_-]+$/i.test(path)) {
    return HOTEL_REVENUE_PRODUCT.paths.landing;
  }
  return path.endsWith("/") ? path : `${path}/`;
}

/** Del referrer solo se conserva el host (sin ruta, query ni credenciales). */
export function sanitizeReferrerHost(value: unknown): string | null {
  const raw = cleanText(value, 2048);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    return host.length <= 253 && /^[a-z0-9.-]+$/.test(host) ? host : null;
  } catch {
    return null;
  }
}

// Valores UTM: cortos y sin "@", para que un email pegado en una URL no acabe
// en la base de datos.
const UTM_VALUE_RE = /^[\p{L}\p{N} _.+\-/:|]{1,100}$/u;
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function sanitizeUtm(value: unknown): UtmParams {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const out = {} as UtmParams;
  for (const key of UTM_KEYS) {
    const v = cleanText(input[key], 200);
    out[key] = v && v.length <= LEAD_LIMITS.utm.max && UTM_VALUE_RE.test(v) ? v : null;
  }
  return out;
}

export function sanitizeCtaOrigin(value: unknown): CtaOrigin {
  return CTA_ORIGINS.includes(value as CtaOrigin) ? (value as CtaOrigin) : "unknown";
}

/** true si el honeypot llega relleno. El campo se llama hp_confirm a propósito (ver docs). */
export function isHoneypotFilled(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return cleanText((raw as Record<string, unknown>).hp_confirm, 200) !== "";
}

export function validateLeadPayload(
  raw: unknown,
  acceptedConsentVersions: readonly string[] = ACCEPTED_CONSENT_VERSIONS,
): ValidationResult<NormalizedLead, LeadField> {
  const body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const errors: FieldErrors<LeadField> = {};

  const submissionId = cleanText(body.submissionId, 64).toLowerCase();
  if (!UUID_RE.test(submissionId)) errors.submissionId = "Recarga la página e inténtalo de nuevo.";

  const name = cleanText(body.name, 300);
  if (name.length < LEAD_LIMITS.name.min || name.length > LEAD_LIMITS.name.max) errors.name = "Escribe tu nombre.";

  const email = normalizeEmail(body.email);
  if (!email) errors.email = "Escribe un email válido.";

  const hotelName = cleanText(body.hotelName, 300);
  if (hotelName.length < LEAD_LIMITS.hotelName.min || hotelName.length > LEAD_LIMITS.hotelName.max) {
    errors.hotelName = "Escribe el nombre del hotel o del grupo.";
  }

  const website = normalizeWebsite(body.website);
  if (website === null) errors.website = "Revisa la dirección web (por ejemplo, hotelejemplo.com).";

  const phone = normalizePhone(body.phone);
  if (phone === null) errors.phone = "Revisa el teléfono: solo números, espacios y el prefijo +.";

  const propertyCount = intInRange(body.propertyCount, LEAD_LIMITS.propertyCount.min, LEAD_LIMITS.propertyCount.max);
  if (propertyCount === null) errors.propertyCount = `Entre ${LEAD_LIMITS.propertyCount.min} y ${LEAD_LIMITS.propertyCount.max}.`;

  const roomCount = intInRange(body.roomCount, LEAD_LIMITS.roomCount.min, LEAD_LIMITS.roomCount.max);
  if (roomCount === null) errors.roomCount = "Indica el número total de habitaciones.";

  if (body.privacyAccepted !== true) errors.privacyAccepted = "Necesitamos tu aceptación para poder responderte.";

  const consentVersion = cleanText(body.consentVersion, 60);
  if (!acceptedConsentVersions.includes(consentVersion)) errors.consentVersion = "Recarga la página e inténtalo de nuevo.";

  const calc = validateCalculatorInputs(body.inputs);
  if (!calc.ok) {
    for (const [field, message] of Object.entries(calc.errors)) {
      errors[`inputs.${field}` as LeadField] = message;
    }
  }

  if (Object.keys(errors).length || !calc.ok) return { ok: false, errors };

  const context = body.context && typeof body.context === "object" ? (body.context as Record<string, unknown>) : {};

  return {
    ok: true,
    value: {
      submissionId,
      name,
      email: email!,
      hotelName,
      website: website ?? null,
      phone: phone ?? null,
      propertyCount: propertyCount!,
      roomCount: roomCount!,
      inputs: calc.value,
      consentVersion,
      landingPath: sanitizeLandingPath(context.landingPath),
      referrerHost: sanitizeReferrerHost(context.referrer),
      utm: sanitizeUtm(context.utm),
      ctaOrigin: sanitizeCtaOrigin(context.ctaOrigin),
    },
  };
}
