// Comprobación posterior al build de «Problema Resuelto».
// Uso: npm run build && npm run problema-resuelto:check-bundle
//
// 1. Nada secreto en lo que se sirve al navegador (JS, CSS, HTML, JSON):
//    valores con forma de secreto, nombres de variables server-side y piezas
//    de servidor (tablas, funciones SQL, prompts) del programa.
// 2. SEO de la landing: indexable, canonical absoluto, hreflang es +
//    x-default, un solo H1, JSON-LD Service + BreadcrumbList + FAQPage sin
//    Offer ni reseñas, og:image propia, en el sitemap, bases y política enlazadas.
// 3. Los endpoints no se prerenderizan.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOTS = [".vercel/output/static", "dist"].filter((d) => fs.existsSync(d));
const SKIP_DIRS = new Set(["server", "functions", "_functions"]);
const EXT = new Set([".js", ".mjs", ".css", ".html", ".json", ".txt", ".xml", ".map"]);

const SECRET_PATTERNS = [
  { name: "Anthropic API key", re: /\bsk-ant-[A-Za-z0-9_-]{10,}/ },
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/ },
  { name: "JWT (service role)", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];
const SERVER_ENV_NAMES = [
  "ANTHROPIC_API_KEY",
  "PROBLEMA_HMAC_SECRET",
  "PROBLEMA_LLM_MODEL",
  "PROBLEMA_DAILY_TURN_LIMIT",
  "PROBLEMA_ALLOWED_ORIGINS",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
];
const SERVER_MARKERS = [
  "problema_resuelto_casos",
  "problema_resuelto_rate_limit_hit",
  "problema_resuelto_claim_notification",
  "problema_resuelto_rate_limits",
  "pr.transcript.v1",
  "Eres el asistente de triaje",
  "Preparas la ficha interna",
  "api.anthropic.com",
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (EXT.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

if (ROOTS.length === 0) {
  console.error("No hay build que revisar. Ejecuta antes `npm run build`.");
  process.exit(2);
}

const problems = [];
let files = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    files++;
    const text = fs.readFileSync(file, "utf8");
    for (const { name, re } of SECRET_PATTERNS) if (re.test(text)) problems.push(`${file}: posible ${name}`);
    for (const env of SERVER_ENV_NAMES) if (new RegExp(`\\b${env}\\b`).test(text)) problems.push(`${file}: referencia a ${env}`);
    for (const marker of SERVER_MARKERS) if (text.includes(marker)) problems.push(`${file}: pieza de servidor («${marker}»)`);
  }
}

// ------------------------------------------------------------------ SEO
const staticRoot = ROOTS[0];
const SITE = "https://iaoperators.com";
const URL_PATH = "/es/problema-resuelto/";
const read = (rel) => {
  const f = path.join(staticRoot, rel);
  if (!fs.existsSync(f)) {
    problems.push(`${f}: falta la página`);
    return null;
  }
  return fs.readFileSync(f, "utf8");
};
const meta = (html, name) => html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`))?.[1] ?? null;
const canonical = (html) => html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ?? null;

const landing = read("es/problema-resuelto/index.html");
if (landing) {
  const url = `${SITE}${URL_PATH}`;
  if ((meta(landing, "robots") ?? "").includes("noindex")) problems.push("landing: no debe ser noindex");
  if (canonical(landing) !== url) problems.push(`landing: canonical ${canonical(landing)} ≠ ${url}`);
  if (!landing.includes(`hreflang="es" href="${url}"`)) problems.push("landing: falta hreflang es");
  if (!landing.includes(`hreflang="x-default" href="${url}"`)) problems.push("landing: falta hreflang x-default");
  if (/hreflang="(en|pt)"/.test(landing)) problems.push("landing: no debe declarar en/pt (solo ES)");
  const h1 = (landing.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) problems.push(`landing: ${h1} H1 (debe ser 1)`);
  const title = landing.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const desc = meta(landing, "description") ?? "";
  if (title.length < 40 || title.length > 62) problems.push(`landing: title de ${title.length} caracteres («${title}»)`);
  if (desc.length < 120 || desc.length > 165) problems.push(`landing: description de ${desc.length} caracteres`);
  if (!landing.includes(`property="og:image" content="${SITE}/og/es/problema-resuelto.png"`)) problems.push("landing: og:image propia ausente");
  const types = [];
  for (const m of landing.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      types.push(...[data["@type"]].flat());
    } catch {
      problems.push("landing: JSON-LD no parsea");
    }
  }
  for (const t of ["Service", "BreadcrumbList", "FAQPage"]) if (!types.includes(t)) problems.push(`landing: falta JSON-LD ${t}`);
  for (const t of ["Product", "Offer", "AggregateRating", "Review"]) if (types.includes(t) || landing.includes(`"@type":"${t}"`)) problems.push(`landing: JSON-LD ${t} no permitido`);
  for (const link of ["/es/politica-de-privacidad/", "#bases", "#contar"]) {
    if (!landing.includes(`href="${link}"`)) problems.push(`landing: falta enlace a ${link}`);
  }
  if (!landing.includes('id="bases"')) problems.push("landing: faltan las bases (id=bases)");
  if (!landing.includes("astro-island")) problems.push("landing: falta la island del cuadro de entrada");
}

if (!fs.existsSync(path.join(staticRoot, "og/es/problema-resuelto.png"))) problems.push("falta og/es/problema-resuelto.png");
for (const api of ["api/problema-resuelto/chat", "api/problema-resuelto/submit"]) {
  if (fs.existsSync(path.join(staticRoot, api))) problems.push(`el endpoint ${api} se ha prerenderizado`);
}

const sitemapFile = ["sitemap-0.xml", "sitemap-0.xml.gz"].map((f) => path.join(staticRoot, f)).find((f) => fs.existsSync(f));
if (sitemapFile) {
  const raw = fs.readFileSync(sitemapFile);
  const xml = sitemapFile.endsWith(".gz") ? zlib.gunzipSync(raw).toString("utf8") : raw.toString("utf8");
  if (!xml.includes(`${SITE}${URL_PATH}</loc>`)) problems.push("sitemap: falta la landing");
} else {
  problems.push("no se encuentra sitemap-0.xml");
}

if (problems.length) {
  console.error(`FALLO · ${problems.length} problema(s) en ${files} archivos:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`OK · ${files} archivos estáticos revisados en ${ROOTS.join(", ")}: sin secretos ni piezas de servidor de Problema Resuelto; SEO de la landing correcto.`);
