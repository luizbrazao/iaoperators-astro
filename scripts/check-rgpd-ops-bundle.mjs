// Comprobación posterior al build de RGPD Ops: nada secreto ni privado en lo
// que se sirve al navegador.
// Uso: npm run build && npm run rgpd-ops:check-bundle
//
// Revisa los archivos estáticos (JS, CSS, HTML prerenderizado, JSON) en
// .vercel/output/static y dist/ (excepto el código de servidor) y falla si
// encuentra:
// - valores con forma de secreto (Stripe, Resend, JWT de service role);
// - nombres de variables server-side de RGPD Ops o globales;
// - el centinela o textos del contenido guiado (src/data/rgpd-ops-content.ts),
//   que solo se entrega en la respuesta SSR autenticada;
// - módulos de servidor de RGPD Ops (tablas, funciones SQL) en el cliente;
// - las zonas privadas prerenderizadas como HTML estático.

import fs from "node:fs";
import path from "node:path";

const ROOTS = [".vercel/output/static", "dist"].filter((d) => fs.existsSync(d));
const SKIP_DIRS = new Set(["server", "functions", "_functions"]);
const EXT = new Set([".js", ".mjs", ".css", ".html", ".json", ".txt", ".xml", ".map"]);

const SECRET_PATTERNS = [
  { name: "Stripe secret key", re: /\b[sr]k_(live|test)_[A-Za-z0-9]{10,}/ },
  { name: "Stripe webhook secret", re: /\bwhsec_[A-Za-z0-9]{10,}/ },
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/ },
  { name: "JWT", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];

const SERVER_ENV_NAMES = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "RGPD_OPS_SESSION_SECRET",
  "RGPD_OPS_STRIPE_PRICE_ID",
  "RGPD_OPS_STRIPE_WEBHOOK_SECRET",
  "RGPD_OPS_STRIPE_TAX_RATE_ID",
];

// Contenido guiado (solo SSR autenticado) y piezas de servidor.
const PRIVATE_MARKERS = [
  "rgo-content-4f2a91d3-paid-only",
  "Registra el momento en que la empresa tuvo constancia: es el inicio del reloj orientativo.",
  "Indica si decidís para qué y cómo se tratan los datos (responsable)",
  "Escribir el protocolo de incidentes: quién decide, qué se documenta",
  "Las evidencias siguen donde dice el catálogo y las vencidas se han revisado.",
  "rgpd_ops_entity_update",
  "rgpd_ops_workspace_snapshot",
  "rgpd_ops_orders",
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
    for (const env of SERVER_ENV_NAMES) if (text.includes(env)) problems.push(`${file}: referencia a ${env}`);
    for (const marker of PRIVATE_MARKERS) if (text.includes(marker)) problems.push(`${file}: contenido privado («${marker.slice(0, 60)}»)`);
  }
}

for (const root of ROOTS) {
  for (const rel of ["es/cumplimiento/rgpd/ops/acceso/index.html", "es/cumplimiento/rgpd/ops/gracias/index.html"]) {
    const leaked = path.join(root, rel);
    if (fs.existsSync(leaked)) problems.push(`${leaked}: la zona privada se ha prerenderizado`);
  }
}

// Las páginas públicas sí deben existir como HTML estático (si faltan, el build no es el esperado).
const expected = ["es/cumplimiento/rgpd/index.html", "es/cumplimiento/rgpd/test/index.html", "es/cumplimiento/rgpd/ops/index.html", "es/cumplimiento/rgpd/ops/condiciones/index.html"];
const staticRoot = ROOTS[0];
for (const rel of expected) {
  if (!fs.existsSync(path.join(staticRoot, rel))) problems.push(`${path.join(staticRoot, rel)}: falta la página pública`);
}

if (problems.length) {
  console.error(`FALLO · ${problems.length} problema(s) en ${files} archivos:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`OK · ${files} archivos estáticos revisados en ${ROOTS.join(", ")}: sin secretos, sin variables de servidor, sin contenido privado de RGPD Ops.`);
