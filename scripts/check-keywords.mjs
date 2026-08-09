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

const entries = [];
const entryRe = /\{\s*(?:\/\/[^\n]*\n\s*)*path:\s*"([^"]+)"[\s\S]*?primaria:\s*"([^"]+)"([\s\S]*?)\n  \}/g;
for (const m of source.matchAll(entryRe)) {
  const [, path, primaria, rest] = m;
  const secBlock = rest.match(/secundarias:\s*\[([\s\S]*?)\]/);
  const secundarias = secBlock
    ? [...secBlock[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])
    : [];
  const localesBlock = rest.match(/locales:\s*\[([\s\S]*?)\]/);
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

// --- 2. Primarias duplicadas --------------------------------------------
const byPrimaria = new Map();
for (const e of entries) {
  const key = normalize(e.primaria);
  if (!byPrimaria.has(key)) byPrimaria.set(key, []);
  byPrimaria.get(key).push(e.path);
}
for (const [kw, paths] of byPrimaria) {
  if (paths.length > 1) {
    errors.push(
      `Keyword primaria duplicada: "${kw}"\n    → ${paths.join("\n    → ")}`,
    );
  }
}

// --- 3. Primaria de una ruta usada como secundaria de otra ---------------
for (const e of entries) {
  for (const sec of e.secundarias) {
    const owner = byPrimaria.get(normalize(sec));
    if (owner && !owner.includes(e.path)) {
      errors.push(
        `"${sec}" es primaria de ${owner[0]} y secundaria de ${e.path}.\n` +
          `    Quítala de las secundarias o cambia la primaria de una de las dos.`,
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
  const sources = {
    "[sector]": ["sectores-sac.ts", "SECTOR_SLUGS"],
    "[caso]": ["verifactu.ts", "CASO_SLUGS"],
    "[ciudad]": ["ciudades-ia.ts", "CIUDAD_SLUGS"],
  };
  const param = Object.keys(sources).find((p) => route.includes(p));
  if (!param) return null;

  const [file, constName] = sources[param];
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
