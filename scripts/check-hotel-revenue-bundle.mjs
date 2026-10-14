// Comprobación posterior al build del Hotel Revenue Operator.
// Uso: npm run build && npm run hotel-revenue:check-bundle
//
// 1. Nada secreto en lo que se sirve al navegador (JS, CSS, HTML, JSON):
//    valores con forma de secreto, nombres de variables server-side y piezas
//    de servidor (tablas, funciones SQL) del producto.
// 2. SEO de las páginas públicas generadas:
//    - landing: indexable, canonical absoluto, hreflang es + x-default, un solo
//      H1, JSON-LD válido con Service, BreadcrumbList y FAQPage, sin
//      Product/Offer, og:image propia;
//    - calculadora: noindex, follow; gracias: noindex;
//    - ni la calculadora ni gracias en el sitemap; la landing sí.
// 3. El endpoint no se prerenderiza.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOTS = [".vercel/output/static", "dist"].filter((d) => fs.existsSync(d));
const SKIP_DIRS = new Set(["server", "functions", "_functions"]);
const EXT = new Set([".js", ".mjs", ".css", ".html", ".json", ".txt", ".xml", ".map"]);

const SECRET_PATTERNS = [
  { name: "Stripe secret key", re: /\b[sr]k_(live|test)_[A-Za-z0-9]{10,}/ },
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/ },
  { name: "JWT (service role)", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];
const SERVER_ENV_NAMES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
  "HOTEL_REVENUE_HMAC_SECRET",
  "HOTEL_REVENUE_ALLOWED_ORIGINS",
];
const SERVER_MARKERS = [
  "hotel_revenue_leads",
  "hotel_revenue_rate_limit_hit",
  "hotel_revenue_claim_notification",
  "hotel_revenue_rate_limits",
  "Localizar el registro",
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

const landing = read("es/hoteles/reservas-directas-ia/index.html");
if (landing) {
  const url = `${SITE}/es/hoteles/reservas-directas-ia/`;
  const robots = meta(landing, "robots") ?? "";
  if (robots.includes("noindex")) problems.push("landing: no debe ser noindex");
  if (canonical(landing) !== url) problems.push(`landing: canonical ${canonical(landing)} ≠ ${url}`);
  if (!landing.includes(`hreflang="es" href="${url}"`)) problems.push("landing: falta hreflang es");
  if (!landing.includes(`hreflang="x-default" href="${url}"`)) problems.push("landing: falta hreflang x-default");
  if (/hreflang="(en|pt)"/.test(landing)) problems.push("landing: no debe declarar en/pt (solo ES en la Fase 1)");
  const h1 = (landing.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) problems.push(`landing: ${h1} H1 (debe ser 1)`);
  const title = landing.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const desc = meta(landing, "description") ?? "";
  if (title.length < 45 || title.length > 62) problems.push(`landing: title de ${title.length} caracteres («${title}»)`);
  if (desc.length < 130 || desc.length > 165) problems.push(`landing: description de ${desc.length} caracteres`);
  if (!landing.includes(`property="og:image" content="${SITE}/og/es/hotel-revenue-operator.png"`)) problems.push("landing: og:image propia ausente");
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
  for (const link of ["/es/hoteles/", "/es/portfolio/radiografia-cadena-hotelera-menorca/", "/es/contact/", "/es/politica-de-privacidad/"]) {
    if (!landing.includes(`href="${link}"`)) problems.push(`landing: falta enlace interno a ${link}`);
  }
  for (const required of [
    "Estimación orientativa basada en los datos introducidos. No constituye una previsión ni una garantía de resultados.",
    "La disponibilidad de cada integración depende de la API y del sistema utilizado por el hotel.",
    "Programa piloto para hoteles independientes y pequeños grupos en España.",
    "Demostración",
  ]) {
    if (!landing.includes(required)) problems.push(`landing: falta el texto obligatorio «${required.slice(0, 50)}…»`);
  }
}

const calc = read("es/hoteles/calculadora-ingresos/index.html");
if (calc) {
  const robots = meta(calc, "robots") ?? "";
  if (!/noindex,\s*follow/.test(robots)) problems.push(`calculadora: robots «${robots}» (debe ser noindex, follow)`);
  if ((calc.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push("calculadora: debe tener un H1");
}
const thanks = read("es/hoteles/reservas-directas-ia/gracias/index.html");
if (thanks && !(meta(thanks, "robots") ?? "").includes("noindex")) problems.push("gracias: debe ser noindex");

const vertical = read("es/hoteles/index.html");
if (vertical && !vertical.includes('href="/es/hoteles/reservas-directas-ia/"')) problems.push("/es/hoteles/: falta el enlace a la landing del producto");

if (!fs.existsSync(path.join(staticRoot, "og/es/hotel-revenue-operator.png"))) problems.push("falta og/es/hotel-revenue-operator.png");
if (fs.existsSync(path.join(staticRoot, "api/hotel-revenue/lead"))) problems.push("el endpoint se ha prerenderizado");

// Sitemap (texto o gzip).
const sitemapFile = ["sitemap-0.xml", "sitemap-0.xml.gz"].map((f) => path.join(staticRoot, f)).find((f) => fs.existsSync(f));
if (sitemapFile) {
  const raw = fs.readFileSync(sitemapFile);
  const xml = sitemapFile.endsWith(".gz") ? zlib.gunzipSync(raw).toString("utf8") : raw.toString("utf8");
  if (!xml.includes(`${SITE}/es/hoteles/reservas-directas-ia/</loc>`)) problems.push("sitemap: falta la landing");
  if (xml.includes("/es/hoteles/calculadora-ingresos/")) problems.push("sitemap: la calculadora (noindex) no debe estar");
  if (xml.includes("/es/hoteles/reservas-directas-ia/gracias/")) problems.push("sitemap: gracias (noindex) no debe estar");
} else {
  problems.push("no se encuentra sitemap-0.xml");
}

if (problems.length) {
  console.error(`FALLO · ${problems.length} problema(s) en ${files} archivos:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `OK · ${files} archivos estáticos revisados en ${ROOTS.join(", ")}: sin secretos ni piezas de servidor del Hotel Revenue Operator; SEO de landing, calculadora y gracias correcto.`,
);
