#!/usr/bin/env node
/**
 * Regla anti-canibalización (docs/plan-arquitectura-2026-08.md, §7).
 *
 * Falla si:
 *   1. Dos rutas declaran la misma keyword primaria.
 *   2. Una keyword primaria aparece como secundaria de otra ruta.
 *   3. Existe en `src/pages` una ruta indexable sin declarar en el registro.
 *
 * Avisa (sin fallar) si:
 *   4. Una ruta declarada ya no existe en `src/pages`.
 *   5. Dos primarias son semánticamente muy próximas (p. ej. "agencia de ia" y
 *      "agencia de inteligencia artificial"). No falla: decidir si son la misma
 *      intención exige mirar la SERP y el Search Console, y eso no lo hace un
 *      script. El aviso solo marca el par para revisión humana.
 *
 * Uso: `npm run check:keywords`
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PAGES = join(ROOT, "src", "pages");
const REGISTRY = join(ROOT, "src", "data", "keywords-primarias.ts");

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

// --- 1. Leer el registro sin ejecutar TypeScript -------------------------
// El registro es un literal plano: se extraen los campos con expresiones
// regulares para que el script no necesite ni tsx ni un paso de build.
const source = readFileSync(REGISTRY, "utf8");

// El cuerpo entero de la entrada se captura en un solo grupo y los campos se
// extraen de él. Antes se capturaba solo lo que venía DESPUÉS de `primaria:`, y
// como `locales:` se declara antes, `e.locales` salía siempre vacío. No se notó
// mientras nada usaba ese campo; desde que las comprobaciones son por idioma
// (silo de integración traducido, ago/2026) habría metido a todas las rutas en
// los tres idiomas y dado falsos positivos de canibalización.
const entries = [];
const entryRe = /\{\s*(?:\/\/[^\n]*\n\s*)*path:\s*"([^"]+)"([\s\S]*?)\n  \}/g;
for (const m of source.matchAll(entryRe)) {
  const [, path, body] = m;
  const primaria = body.match(/primaria:\s*"([^"]+)"/)?.[1];
  if (!primaria) continue;
  const secBlock = body.match(/secundarias:\s*\[([\s\S]*?)\]/);
  const secundarias = secBlock
    ? [...secBlock[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])
    : [];
  const localesBlock = body.match(/locales:\s*\[([\s\S]*?)\]/);
  const locales = localesBlock
    ? [...localesBlock[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])
    : [];
  entries.push({ path, primaria, secundarias, locales });
}

const sinKeywordBlock = source.match(/RUTAS_SIN_KEYWORD[^=]*=\s*\[([\s\S]*?)\];/);
const rutasSinKeyword = sinKeywordBlock
  ? [...sinKeywordBlock[1].matchAll(/"([^"]*)"/g)].map((x) => x[1])
  : [];

if (entries.length === 0) {
  console.error(red("✖ No se pudo leer ninguna entrada de keywords-primarias.ts"));
  process.exit(1);
}

const errors = [];
const warnings = [];

// --- 2. Primarias duplicadas, DENTRO DE CADA IDIOMA ----------------------
//
// La comprobación era global y eso dejó de ser correcto cuando el silo de
// integración se tradujo (ago/2026): `/es/integracion/whatsapp-business-api/` y
// `/en/integration/whatsapp-business-api/` declaran la misma primaria —
// "whatsapp business api" es una marca, no se traduce— y no compiten entre sí:
// son la misma intención servida en dos idiomas, que es justo lo que resuelve
// el hreflang recíproco. Canibalización es dos URLs del MISMO idioma peleando
// por la misma query, así que el índice se construye por idioma.
//
// Una ruta declarada en varios idiomas entra en el índice de cada uno.
const LOCALES = ["es", "en", "pt"];

/** Map<locale, Map<keywordNormalizada, path[]>> */
const byPrimariaPorLocale = new Map(LOCALES.map((l) => [l, new Map()]));

for (const e of entries) {
  const key = normalize(e.primaria);
  const locales = e.locales.length ? e.locales : LOCALES;
  for (const loc of locales) {
    const index = byPrimariaPorLocale.get(loc);
    if (!index) continue;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(e.path);
  }
}

for (const [loc, index] of byPrimariaPorLocale) {
  for (const [kw, paths] of index) {
    if (paths.length > 1) {
      errors.push(
        `Keyword primaria duplicada en "${loc}": "${kw}"\n    → ${paths.join("\n    → ")}`,
      );
    }
  }
}

// --- 3. Primaria de una ruta usada como secundaria de otra ---------------
// También por idioma, y por la misma razón.
for (const e of entries) {
  const locales = e.locales.length ? e.locales : LOCALES;
  for (const sec of e.secundarias) {
    for (const loc of locales) {
      const owner = byPrimariaPorLocale.get(loc)?.get(normalize(sec));
      if (owner && !owner.includes(e.path)) {
        errors.push(
          `[${loc}] "${sec}" es primaria de ${owner[0]} y secundaria de ${e.path}.\n` +
            `    Quítala de las secundarias o cambia la primaria de una de las dos.`,
        );
      }
    }
  }
}

// --- 3-bis. Primarias semánticamente próximas (aviso) --------------------
// Regla: se avisa cuando dos primarias son casi el mismo concepto SIN que una
// contenga a la otra. La contención estricta ("ley de atención al cliente" vs
// "ley atención al cliente energía", o "agencia de ia" vs "agencia de ia madrid")
// es la relación normal pilar→hijo y no se avisa.
const STOPWORDS = new Set(["de", "del", "la", "el", "los", "las", "para", "con", "en", "y", "a", "al", "un", "una"]);
const SINONIMOS = [
  [/\bias?\b/g, "inteligencia artificial"],
  [/\bai\b/g, "inteligencia artificial"],
  [/\bpymes?\b/g, "pyme"],
  [/\bempresas\b/g, "empresa"],
  [/\bsistemas\b/g, "sistema"],
  [/\bagencias\b/g, "agencia"],
];

function tokens(kw) {
  let s = normalize(kw);
  for (const [re, to] of SINONIMOS) s = s.replace(re, to);
  return new Set(s.split(" ").filter((w) => w && !STOPWORDS.has(w)));
}

function jaccard(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

// 0.8 deja fuera a los hermanos que solo se diferencian por un calificador
// ("... energía" vs "... telecomunicaciones", "... madrid" vs "... barcelona":
// Jaccard 0,6) y conserva los pares que son el mismo concepto escrito de dos
// formas ("agencia de ia" vs "agencia de inteligencia artificial": 1,0).
//
// Igual que las dos comprobaciones anteriores, el aviso solo tiene sentido
// entre rutas que compiten en la misma SERP: dos idiomas distintos no compiten.
const SIMILARITY_THRESHOLD = 0.8;
const compartenIdioma = (a, b) => {
  const la = a.locales.length ? a.locales : LOCALES;
  const lb = b.locales.length ? b.locales : LOCALES;
  return la.some((l) => lb.includes(l));
};
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    if (!compartenIdioma(entries[i], entries[j])) continue;
    const a = tokens(entries[i].primaria);
    const b = tokens(entries[j].primaria);
    const subsetAB = [...a].every((x) => b.has(x)) && a.size < b.size;
    const subsetBA = [...b].every((x) => a.has(x)) && b.size < a.size;
    if (subsetAB || subsetBA) continue; // relación pilar→hijo, esperada
    if (jaccard(a, b) >= SIMILARITY_THRESHOLD) {
      warnings.push(
        `Primarias muy próximas — revisar si son la misma intención:\n` +
          `      "${entries[i].primaria}"  →  ${entries[i].path}\n` +
          `      "${entries[j].primaria}"  →  ${entries[j].path}\n` +
          `      Comprobar solapamiento de queries en Search Console y de SERP antes de consolidar.`,
      );
    }
  }
}

// --- 4. Rutas indexables sin declarar ------------------------------------
const declared = new Set([
  ...entries.map((e) => e.path),
  ...rutasSinKeyword,
]);

for (const route of discoverRoutes(PAGES)) {
  if (!declared.has(route)) {
    errors.push(
      `Ruta indexable sin keyword primaria declarada: "${route}"\n` +
        `    Añádela a KEYWORDS_PRIMARIAS o a RUTAS_SIN_KEYWORD en src/data/keywords-primarias.ts`,
    );
  }
}

// --- 5. Declaraciones huérfanas (aviso) ----------------------------------
const realRoutes = new Set(discoverRoutes(PAGES));
for (const e of entries) {
  if (!realRoutes.has(e.path)) {
    warnings.push(`Declarada pero no encontrada en src/pages: "${e.path}"`);
  }
}

// --- Salida --------------------------------------------------------------
console.log(dim(`Registro: ${entries.length} rutas con keyword primaria.`));

for (const w of warnings) console.warn(yellow(`⚠ ${w}`));

if (errors.length) {
  console.error("");
  for (const e of errors) console.error(red(`✖ ${e}`));
  console.error("");
  console.error(red(`${errors.length} problema(s) de canibalización.`));
  process.exit(1);
}

console.log(green("✔ Sin canibalización: cada keyword primaria tiene una sola URL."));

// -------------------------------------------------------------------------

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Devuelve las rutas indexables de `src/pages`, normalizadas a
 * "camino/sin/locale/" — el mismo formato que usa el registro.
 *
 * Se excluyen: endpoints, rutas dinámicas cuyo parámetro no se puede resolver
 * estáticamente aquí, parciales con guion bajo, y todo lo que el sitemap ya
 * filtra por `noindex`.
 */
function discoverRoutes(dir) {
  const noindex = readNoindexPaths();
  const out = new Set();

  for (const file of walk(dir)) {
    const rel = relative(dir, file).split("\\").join("/");
    if (!rel.endsWith(".astro")) continue;
    if (rel.split("/").some((seg) => seg.startsWith("_"))) continue;

    let route = rel.replace(/\/index\.astro$/, "/").replace(/\.astro$/, "/");
    route = route.replace(/^\[locale\]\//, "").replace(/^(es|en|pt)\//, "");
    if (route === "index/") route = "";

    // Rutas dinámicas: se expanden con los slugs de su archivo de datos, para
    // que la comprobación de cobertura sea real y no un agujero silencioso.
    if (route.includes("[")) {
      const expanded = expandDynamic(route);
      if (expanded === null) continue; // colecciones (blog, portfolio)
      for (const r of expanded) out.add(r);
      continue;
    }

    // Páginas sueltas de propuesta / admin: ya están en la lista noindex.
    if (noindex.some((p) => `/${route}`.includes(p) || `/es/${route}`.includes(p))) continue;

    out.add(route);
  }
  return [...out];
}

/**
 * Expande una ruta con parámetro dinámico usando los slugs declarados en
 * `src/data`. Devuelve `null` para las colecciones de contenido (blog,
 * portfolio), cuyos detalles no persiguen keyword propia en el registro.
 */
function expandDynamic(route) {
  // Se indexa por RUTA, no por nombre de parámetro: dos silos distintos usan
  // "[caso]" y con un mapa por parámetro el segundo heredaba los slugs del
  // primero, generando rutas inexistentes y falsos "sin declarar".
  // El silo de integración se sirve en tres idiomas con slugs distintos, así
  // que sus rutas dinámicas no se expanden desde una lista plana sino desde
  // `CASO_SLUG_BY_LOC` (src/data/integracion.ts), leyendo el bloque del idioma
  // que corresponde a cada ruta. Sin esto, `/en/integration/api-and-webhooks/`
  // se declararía como ruta inexistente y `api-y-webhooks` como huérfana.
  const CASO_HUB_POR_IDIOMA = [
    ["integracion/[caso]", "es"],
    ["integration/[caso]", "en"],
    ["integracao/[caso]", "pt"],
  ];
  const casoEntry = CASO_HUB_POR_IDIOMA.find(([match]) => route.includes(match));
  if (casoEntry) {
    const [match, loc] = casoEntry;
    try {
      const src = readFileSync(join(ROOT, "src", "data", "integracion.ts"), "utf8");
      const table = src.match(/CASO_SLUG_BY_LOC[^=]*=\s*\{([\s\S]*?)\n\};/);
      if (!table) return null;
      const block = table[1].match(new RegExp(`\\b${loc}:\\s*\\{([\\s\\S]*?)\\}`));
      if (!block) return null;
      const slugs = [...block[1].matchAll(/:\s*"([^"]+)"/g)].map((x) => x[1]);
      if (slugs.length === 0) return null;
      return slugs.map((slug) => route.replace(match.slice(match.indexOf("[")), slug));
    } catch {
      return null;
    }
  }

  const sources = [
    ["cumplimiento/ley-atencion-al-cliente/[sector]", "sectores-sac.ts", "SECTOR_SLUGS"],
    ["cumplimiento/verifactu/[caso]", "verifactu.ts", "CASO_SLUGS"],
    ["[ciudad]", "ciudades-ia.ts", "CIUDAD_SLUGS"],
  ];
  const entry = sources.find(([match]) => route.includes(match));
  if (!entry) return null;

  const [match, file, constName] = entry;
  const param = match.slice(match.indexOf("["));
  let slugs = [];
  try {
    const src = readFileSync(join(ROOT, "src", "data", file), "utf8");
    const block = src.match(new RegExp(`${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
    if (block) slugs = [...block[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  } catch {
    return null;
  }
  if (slugs.length === 0) return null;
  return slugs.map((slug) => route.replace(param, slug));
}

function readNoindexPaths() {
  try {
    const cfg = readFileSync(join(ROOT, "astro.config.mjs"), "utf8");
    const block = cfg.match(/const NOINDEX_PATHS = \[([\s\S]*?)\];/);
    if (!block) return [];
    return [...block[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  } catch {
    return [];
  }
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}
