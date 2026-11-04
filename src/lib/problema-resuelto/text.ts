// Limpieza de texto y ocultación de datos personales. Pura: la usan los
// endpoints y los tests (y se puede importar desde el navegador, aunque la
// ocultación que cuenta es la del servidor).

// Caracteres de control y de formato invisibles (incluye RTL override y ZWSP),
// salvo el salto de línea, que se trata aparte.
const CONTROL_RE = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g;

/** Texto de una línea: NFC, sin controles, espacios colapsados, recortado. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .normalize("NFC")
    .replace(CONTROL_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Texto libre de varias líneas: NFC, sin controles, \r\n → \n, espacios
 * colapsados dentro de cada línea, como mucho una línea en blanco seguida,
 * recortado. `max` se aplica DESPUÉS de limpiar.
 */
export function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_RE, " ")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export type PiiKind = "email" | "iban" | "dni" | "nie" | "numero";

const PII_RULES: { kind: PiiKind; re: RegExp; label: string }[] = [
  { kind: "email", re: /[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}/gi, label: "[email]" },
  // IBAN: dos letras, dos dígitos y de 11 a 30 caracteres más (con o sin espacios).
  { kind: "iban", re: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,4})?\b/gi, label: "[IBAN]" },
  { kind: "nie", re: /\b[XYZ][-\s]?\d{7}[-\s]?[A-HJ-NP-TV-Z]\b/gi, label: "[NIE]" },
  { kind: "dni", re: /\b\d{8}[-\s]?[A-HJ-NP-TV-Z]\b/gi, label: "[DNI]" },
];

// Teléfonos, tarjetas y otros números largos: secuencias con al menos 9
// dígitos. "200 currículums", "2026" o "15 días" no llegan al umbral.
const LONG_NUMBER_RE = /\+?\d[\d ().-]{7,}\d/g;
const LONG_NUMBER_MIN_DIGITS = 9;

/**
 * Oculta emails, IBAN, DNI/NIE y números largos (teléfonos, tarjetas). No
 * intenta detectar nombres de personas: eso lo pide el agente en la
 * conversación y lo recuerdan la página y las bases.
 */
export function maskPii(text: string): { text: string; kinds: PiiKind[] } {
  const kinds = new Set<PiiKind>();
  let out = text;
  for (const rule of PII_RULES) {
    out = out.replace(rule.re, () => {
      kinds.add(rule.kind);
      return rule.label;
    });
  }
  out = out.replace(LONG_NUMBER_RE, (match) => {
    if (match.replace(/\D/g, "").length < LONG_NUMBER_MIN_DIGITS) return match;
    kinds.add("numero");
    return "[número]";
  });
  return { text: out, kinds: [...kinds] };
}

// Correo de empresa: se rechazan los proveedores gratuitos más comunes en
// España. No es una verificación de identidad, solo un filtro de intención.
export const FREE_EMAIL_DOMAINS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "live.com",
  "live.es",
  "msn.com",
  "yahoo.com",
  "yahoo.es",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "gmx.com",
  "gmx.es",
  "gmx.net",
  "proton.me",
  "protonmail.com",
  "tutanota.com",
  "yandex.com",
  "mail.com",
  "zoho.com",
  "terra.es",
  "telefonica.net",
  "movistar.es",
];

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return FREE_EMAIL_DOMAINS.includes(domain);
}
