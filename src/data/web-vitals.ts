// Capa tipada sobre `web-vitals.json`, que genera `scripts/measure-psi.mjs`.
//
// El JSON es dato medido; aquí vive solo la interpretación: en qué banda cae
// cada número. Los umbrales son los oficiales de Google, no criterio nuestro —
// por eso están en un único sitio y con la fuente anotada.

import raw from "./web-vitals.json";

export type Strategy = "mobile" | "desktop";
export type Band = "good" | "warning" | "critical";

export type WebVitalsRun = {
  scores: {
    performance: number;
    accessibility: number;
    "best-practices": number;
    seo: number;
  };
  lab: { lcpMs: number; fcpMs: number; tbtMs: number; cls: number; siMs: number };
  /** Datos de campo (CrUX). `null` cuando el sitio no tiene tráfico suficiente. */
  field: {
    overall: string;
    lcpMs: number | null;
    inpMs: number | null;
    cls: number | null;
  } | null;
  runs: number;
  finalUrl: string;
};

export type WebVitalsTarget = {
  url: string;
  measuredAt: string;
  mobile: WebVitalsRun;
  desktop: WebVitalsRun;
};

export type WebVitalsFile = {
  measuredAt: string;
  source: string;
  lighthouseVersion: string;
  methodology: { medianOf: Record<Strategy, number>; note: string };
  targets: Record<string, WebVitalsTarget>;
};

const data = raw as unknown as WebVitalsFile;

export const webVitalsMeta = {
  source: data.source,
  lighthouseVersion: data.lighthouseVersion,
  medianOf: data.methodology.medianOf,
};

export function getWebVitals(key: string): WebVitalsTarget | null {
  return data.targets[key] ?? null;
}

/**
 * Banda de una puntuación de categoría de Lighthouse.
 * Cortes oficiales: 0–49 deficiente · 50–89 mejorable · 90–100 bueno.
 * https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
 */
export function scoreBand(score: number): Band {
  if (score >= 90) return "good";
  if (score >= 50) return "warning";
  return "critical";
}

/**
 * Bandas de las métricas de Core Web Vitals y de las de laboratorio que las
 * acompañan. https://web.dev/articles/defining-core-web-vitals-thresholds
 */
const METRIC_THRESHOLDS = {
  lcpMs: [2500, 4000],
  fcpMs: [1800, 3000],
  tbtMs: [200, 600],
  inpMs: [200, 500],
  cls: [0.1, 0.25],
  siMs: [3400, 5800],
} as const;

export type MetricId = keyof typeof METRIC_THRESHOLDS;

export function metricBand(id: MetricId, value: number): Band {
  const [good, ni] = METRIC_THRESHOLDS[id];
  if (value <= good) return "good";
  if (value <= ni) return "warning";
  return "critical";
}

export function formatMetric(id: MetricId, value: number, locale: string): string {
  if (id === "cls") return value.toFixed(3).replace(".", locale === "en" ? "." : ",");
  const seconds = value / 1000;
  if (seconds < 1) return `${Math.round(value)} ms`;
  return `${seconds.toFixed(2).replace(".", locale === "en" ? "." : ",")} s`;
}
