#!/usr/bin/env node
/**
 * Mide los sitios del portfolio con la PageSpeed Insights API y escribe
 * `src/data/web-vitals.json`.
 *
 * Por qué un script y no una captura de pantalla: una imagen del informe de PSI
 * envejece en silencio — nadie sabe de qué día es ni con qué versión de
 * Lighthouse se sacó, y no se puede volver a generar. Aquí el dato queda
 * versionado con su fecha y su método, y se refresca con un comando.
 *
 * Por qué la mediana y no una sola ejecución: Lighthouse tiene varianza real
 * entre pasadas. En sundaycampers.es medimos [81, 81, 81, 72, 81] en cinco
 * ejecuciones móviles del mismo día. Publicar n=1 es publicar ruido.
 *
 * Uso:
 *   PAGESPEED_API_KEY=xxx node scripts/measure-psi.mjs
 *   PAGESPEED_API_KEY=xxx node scripts/measure-psi.mjs --only propiziaReimmigra
 *
 * La clave NUNCA se versiona. Se crea gratis en Google Cloud Console
 * (PageSpeed Insights API) y puede revocarse en cuanto termina la medición:
 * lo que queda en el repo es el resultado, no la credencial.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/data/web-vitals.json");

const KEY = process.env.PAGESPEED_API_KEY;
if (!KEY) {
  console.error("Falta PAGESPEED_API_KEY. Créala en Google Cloud Console → PageSpeed Insights API.");
  process.exit(1);
}

/** Objetivos medidos. La clave se referencia desde `webVitalsKey` en projects.ts. */
const TARGETS = {
  propiziaReimmigra: "https://propiziareimmigra.com/",
  sundayCampers: "https://sundaycampers.es/",
};

/** Ejecuciones por estrategia. Móvil varía más, así que lleva más pasadas. */
const RUNS = { mobile: 5, desktop: 3 };
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > -1 ? process.argv[onlyArg + 1] : null;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

async function runOnce(url, strategy) {
  const qs = new URLSearchParams({ url, strategy, key: KEY });
  for (const c of CATEGORIES) qs.append("category", c);
  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs}`);
  const json = await res.json();
  if (json.error) throw new Error(`${strategy} ${url}: ${json.error.message}`);
  return json;
}

async function measure(url, strategy) {
  const samples = [];
  for (let i = 0; i < RUNS[strategy]; i++) samples.push(await runOnce(url, strategy));

  const pick = (fn) => median(samples.map(fn));
  const audit = (s, id) => s.lighthouseResult.audits[id]?.numericValue ?? 0;
  const last = samples[samples.length - 1];
  const lr = last.lighthouseResult;

  // Las categorías no cronometradas (a11y, best-practices, seo) son
  // deterministas: se toman de la última pasada. Solo performance se mediana.
  const scores = Object.fromEntries(
    CATEGORIES.map((c) => [
      c,
      c === "performance"
        ? Math.round(pick((s) => (s.lighthouseResult.categories[c]?.score ?? 0) * 100))
        : Math.round((lr.categories[c]?.score ?? 0) * 100),
    ]),
  );

  const field = last.loadingExperience?.metrics;
  const hasField = field && Object.keys(field).length > 0;

  return {
    scores,
    lab: {
      lcpMs: Math.round(pick((s) => audit(s, "largest-contentful-paint"))),
      fcpMs: Math.round(pick((s) => audit(s, "first-contentful-paint"))),
      tbtMs: Math.round(pick((s) => audit(s, "total-blocking-time"))),
      cls: Number(pick((s) => audit(s, "cumulative-layout-shift")).toFixed(3)),
      siMs: Math.round(pick((s) => audit(s, "speed-index"))),
    },
    // Datos de campo (CrUX, usuarios reales). Solo existen si el sitio tiene
    // tráfico suficiente en el dataset de Chrome; si es null, lo decimos en la
    // página en vez de disimularlo.
    field: hasField
      ? {
          overall: last.loadingExperience.overall_category,
          lcpMs: field.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
          inpMs: field.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
          cls:
            field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null
              ? field.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
              : null,
        }
      : null,
    runs: RUNS[strategy],
    finalUrl: lr.finalDisplayedUrl,
  };
}

const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { targets: {} };

const out = {
  $comment: "Generado por scripts/measure-psi.mjs. No editar a mano.",
  measuredAt: new Date().toISOString().slice(0, 10),
  source: "PageSpeed Insights API v5",
  lighthouseVersion: null,
  methodology: {
    medianOf: RUNS,
    note: "Datos de laboratorio. Performance es la mediana de N ejecuciones; el resto de categorías son deterministas.",
  },
  targets: { ...previous.targets },
};

for (const [key, url] of Object.entries(TARGETS)) {
  if (only && key !== only) continue;
  process.stderr.write(`midiendo ${key} … `);
  const mobile = await measure(url, "mobile");
  const desktop = await measure(url, "desktop");
  out.targets[key] = { url, measuredAt: out.measuredAt, mobile, desktop };
  process.stderr.write(`ok (mobile ${mobile.scores.performance} · desktop ${desktop.scores.performance})\n`);
}

const probe = await runOnce(Object.values(TARGETS)[0], "desktop");
out.lighthouseVersion = probe.lighthouseResult.lighthouseVersion;

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.error(`\nEscrito ${path.relative(ROOT, OUT)}`);
