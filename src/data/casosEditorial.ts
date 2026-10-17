// src/data/casosEditorial.ts
//
// Capa de presentación editorial de los casos en ES. No duplica contenido: el
// texto de cada caso sigue viviendo en projects.ts + projects.json. Aquí solo
// se decide cómo se presenta cada caso en el portfolio editorial:
//
// - qué ilustración lo acompaña (todas declaradas como ilustración, salvo la
//   de rendimiento, que pinta datos medidos de web-vitals.json);
// - qué métricas se destacan en el índice;
// - si su ficha ya usa la plantilla editorial (despliegue incremental: una
//   ficha se activa cuando se ha revisado visualmente).
//
// Oct/2026: la misma capa sirve a ES, EN y PT. Los textos de las sustituciones
// viven en portfolioEditorial.json (metricOverrides) de cada idioma.

import type { Project, ProjectMetric } from "./projects";
import { getPortfolioEditorial, type PortfolioEditorialCopy } from "@/i18n/editorialCopy";

export type CaseVisualKind = "system-map" | "chat" | "booking-rules" | "web-vitals" | "spec-sheet";
export type CaseTone = "graphite" | "sage" | "slate" | "sand";

type MetricOverride = keyof PortfolioEditorialCopy["metricOverrides"];

export interface CaseEditorialEntry {
  visual: CaseVisualKind;
  tone: CaseTone;
  /** Índices de `project.metrics` que se muestran en la tarjeta del índice. */
  featuredMetrics: number[];
  /**
   * Sustituciones para métricas que no son una medición. Mismo criterio que
   * HOME_METRIC_OVERRIDE_ES en HomeCases.astro: el "100%" de reservas
   * turísticas describe reglas determinísticas, no un porcentaje medido.
   */
  metricOverrides?: Record<number, MetricOverride>;
  /** La ficha /es/portfolio/<slug>/ usa la plantilla editorial. */
  editorialDetail: boolean;
  /**
   * "measured": resultados observados en un proyecto (auditoría, web medida).
   * "product": producto propio; el impacto describe lo que resuelve, no una
   * medición en un cliente, y la ficha lo titula así.
   */
  results: "measured" | "product";
  /** Índices de `project.metrics` en la banda de cifras de la ficha. Por defecto, todas. */
  detailMetrics?: number[];
  /**
   * Diagrama de arquitectura, solo si está documentado en el propio caso.
   * Claves i18n completas: `flow` es la cadena principal, `outputs` lo que el
   * sistema dispara además y `core` el índice del nodo que se resalta.
   */
  architecture?: { flow: string[]; outputs: string[]; core: number };
  /**
   * Cómo se titulan los pasos de `howItWorks` cuando no son fases:
   * "steps" (un flujo en orden) o "decisions" (decisiones técnicas sin orden).
   */
  stepsKind?: "steps" | "decisions";
  /**
   * Título de la sección de contexto. El de portfolio.json ("El coste real de
   * la desintegración") solo describe el caso hotelero; la plantilla antigua
   * lo repetía también en Propiziare.
   */
  contextTitleKey?: string;
  /**
   * Solo para `visual: "spec-sheet"`: ficha técnica del proyecto (no es una
   * captura). `caseKey` es el prefijo en projects.json; los valores se leen de
   * `projects:<caseKey>.sheet.{type,stack,channel,status}` y las etiquetas de
   * `portfolioEditorial.visual.sheet.rows`.
   */
  sheet?: { host: string; caseKey: string };
}

const CASE_EDITORIAL_ES: Record<string, CaseEditorialEntry> = {
  "radiografia-cadena-hotelera-menorca": {
    visual: "system-map",
    tone: "graphite",
    featuredMetrics: [0, 2, 3],
    editorialDetail: true,
    results: "measured",
    contextTitleKey: "portfolio:project.sections.context.title",
  },
  "chatplug-whatsapp-altegio": {
    visual: "chat",
    tone: "sage",
    featuredMetrics: [0, 1],
    editorialDetail: true,
    results: "product",
    architecture: {
      flow: ["whatsapp", "chatplug", "orchestration", "altegio"].map((key) => `portfolio:project.arch.${key}`),
      outputs: ["notifications", "analytics", "handoff"].map((key) => `portfolio:project.arch.${key}`),
      core: 1,
    },
  },
  "chatbot-reservas-turisticas-whatsapp": {
    visual: "booking-rules",
    tone: "slate",
    featuredMetrics: [0, 2],
    metricOverrides: { 0: "tourPrice" },
    editorialDetail: true,
    results: "product",
    // Etiquetas en portfolioEditorial.json (arch.tourBooking), resumidas de
    // howItWorks + pilares del caso. Se resalta el cálculo: "la IA conversa;
    // el código calcula" es la tesis documentada del proyecto.
    architecture: {
      flow: ["input", "aggregation", "agent", "tools", "reply"].map((key) => `portfolioEditorial:arch.tourBooking.${key}`),
      outputs: ["leads", "logs"].map((key) => `portfolioEditorial:arch.tourBooking.${key}`),
      core: 3,
    },
  },
  "propiziare-immigra-web-seo": {
    visual: "web-vitals",
    tone: "sand",
    featuredMetrics: [0, 1, 2],
    editorialDetail: true,
    results: "measured",
    // howItWorks describe decisiones de construcción, no pasos de un flujo.
    stepsKind: "decisions",
    contextTitleKey: "portfolioEditorial:contextTitles.propiziare",
  },
  // Oct/2026: productos propios y webs sin captura publicable. La ficha
  // técnica dice qué es, con qué está hecho y en qué estado está; no inventa
  // una interfaz que el visitante no puede comprobar.
  "hotel-revenue-operator-reservas-directas": {
    visual: "spec-sheet",
    tone: "graphite",
    featuredMetrics: [0, 2],
    editorialDetail: true,
    results: "product",
    sheet: { host: "iaoperators.com/es/hoteles", caseKey: "hotelRevenue" },
  },
  "rgpd-ops-starter": {
    visual: "spec-sheet",
    tone: "slate",
    featuredMetrics: [0, 1],
    editorialDetail: true,
    results: "product",
    sheet: { host: "iaoperators.com/es/cumplimiento", caseKey: "rgpdOps" },
  },
  "ruta-nacionalidad": {
    visual: "spec-sheet",
    tone: "sand",
    featuredMetrics: [1, 2],
    editorialDetail: true,
    results: "product",
    sheet: { host: "app.propiziareimmigra.com", caseKey: "rutaNacionalidad" },
  },
  "un-rato-fontaneria-whatsapp-malaga": {
    visual: "spec-sheet",
    tone: "sage",
    featuredMetrics: [0, 1],
    editorialDetail: true,
    results: "product",
    sheet: { host: "unrato.es", caseKey: "unRato" },
  },
  "psicosprint-test-psicotecnicos-oposiciones": {
    visual: "spec-sheet",
    tone: "slate",
    featuredMetrics: [0, 1, 2],
    editorialDetail: true,
    results: "product",
    sheet: { host: "psicosprint.iaoperators.com", caseKey: "psicoSprint" },
  },
  "sunday-campers-web-alquiler-campers": {
    visual: "spec-sheet",
    tone: "sand",
    featuredMetrics: [0, 1],
    editorialDetail: true,
    results: "measured",
    sheet: { host: "sundaycampers.es", caseKey: "sundayCampers" },
  },
  "renuva-renovaciones-regularizacion-extraordinaria": {
    visual: "spec-sheet",
    tone: "graphite",
    featuredMetrics: [0, 2],
    editorialDetail: true,
    results: "product",
    sheet: { host: "renuva.iaoperators.com", caseKey: "renuva" },
  },
};

export const getCaseEditorial = (project: Project): CaseEditorialEntry | undefined =>
  CASE_EDITORIAL_ES[project.slugs.es];

export const hasEditorialDetail = (project: Project): boolean =>
  getCaseEditorial(project)?.editorialDetail === true;

/**
 * `label` y `noteKey` son claves i18n salvo cuando `labelIsKey` es false
 * (sustitución escrita aquí). `isText`: el valor es una frase, no una cifra;
 * se compone más pequeño.
 */
export type CaseFigure = { value: string; label: string; labelIsKey: boolean; noteKey?: string; isText: boolean };

/** Cifras de un caso para el índice o para la ficha, con las sustituciones aplicadas. */
export function caseFigures(project: Project, where: "index" | "detail", locale = "es"): CaseFigure[] {
  const overrides = getPortfolioEditorial(locale).metricOverrides;
  const entry = getCaseEditorial(project);
  const metrics: ProjectMetric[] = project.metrics ?? [];
  const all = metrics.map((_, index) => index);
  const indexes = where === "index"
    ? entry?.featuredMetrics ?? all.slice(0, 3)
    : entry?.detailMetrics ?? all;
  return indexes.flatMap((index) => {
    const metric = metrics[index];
    if (!metric) return [];
    const overrideKey = entry?.metricOverrides?.[index];
    const override = overrideKey ? overrides[overrideKey] : undefined;
    return override
      ? [{ value: override.value, label: override.label, labelIsKey: false, noteKey: metric.noteKey, isText: true }]
      : [{ value: metric.value, label: metric.labelKey, labelIsKey: true, noteKey: metric.noteKey, isText: false }];
  });
}
