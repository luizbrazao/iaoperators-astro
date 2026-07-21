import { createHash, timingSafeEqual } from "node:crypto";
import type { SurveyAnswerValue, SurveyAnswers, SurveyQuestionId, SurveyUtms } from "./types";

export function normalizeUtms(url: URL): SurveyUtms {
  return {
    source: url.searchParams.get("utm_source")?.trim() ?? "",
    medium: url.searchParams.get("utm_medium")?.trim() ?? "",
    campaign: url.searchParams.get("utm_campaign")?.trim() ?? "",
    term: url.searchParams.get("utm_term")?.trim() ?? "",
    content: url.searchParams.get("utm_content")?.trim() ?? "",
  };
}

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function createFingerprintHash(input: {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
}) {
  const salt = import.meta.env.SURVEY_FINGERPRINT_SALT || "iaoperators-survey-salt";
  return sha256([salt, input.ip || "unknown", input.userAgent || "unknown", input.acceptLanguage || "unknown"].join("|"));
}

export function hashUserAgent(userAgent: string) {
  return sha256(userAgent || "unknown");
}

export function detectDeviceCategory(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (!ua) return "unknown" as const;
  if (/ipad|tablet/.test(ua)) return "tablet" as const;
  if (/mobi|iphone|android/.test(ua)) return "mobile" as const;
  return "desktop" as const;
}

export function answerSignature(answers: SurveyAnswers) {
  const ordered = Object.keys(answers)
    .sort()
    .map((key) => {
      const value = answers[key as SurveyQuestionId];
      return Array.isArray(value)
        ? `${key}:${[...value].sort().join(",")}`
        : `${key}:${String(value ?? "")}`;
    })
    .join("|");
  return sha256(ordered);
}

export function normalizeAnswerValue(value: unknown): SurveyAnswerValue {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
  }
  return String(value ?? "").trim();
}

export function escapeCsvCell(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return `"${text.replaceAll(`"`, `""`)}"`;
}

export function ensureArray(value: SurveyAnswerValue | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function isTruthy(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1;
}

export function basicAuthMatches(header: string | null, username: string, password: string) {
  if (!header?.startsWith("Basic ")) return false;
  const provided = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const expected = `${username}:${password}`;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(providedBytes, expectedBytes);
}
