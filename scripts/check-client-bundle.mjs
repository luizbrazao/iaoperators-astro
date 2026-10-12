// Comprobación posterior al build: nada secreto ni de pago en lo que se sirve
// al navegador.
// Uso: npm run build && npm run verifactu-kit:check-bundle
//
// Revisa los archivos estáticos (JS, CSS, HTML prerenderizado) en
// .vercel/output/static y dist/ (excepto dist/server) y falla si encuentra:
// - valores con forma de secreto (claves de Stripe, de Resend, JWT de service role);
// - nombres de variables server-side (señal de que un módulo de servidor se
//   coló en el bundle del cliente);
// - marcadores del contenido de pago del Kit.

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
  "VERIFACTU_KIT_SESSION_SECRET",
  "RESEND_API_KEY",
];

// Marcadores del contenido de pago (src/data/verifactu-kit-content.ts).
const PAID_MARKERS = [
  "vfk-content-7c1e9a0b-paid-only",
  "Nos ayudaría tener la respuesta antes del",
  "Os escribí el [fecha]",
  "Señales de que necesitas una auditoría técnica",
  "Crea la carpeta del dossier y guarda lo que ya tienes",
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
    for (const marker of PAID_MARKERS) if (text.includes(marker)) problems.push(`${file}: contenido de pago («${marker}»)`);
  }
}

// La zona del comprador nunca debe existir como HTML estático.
for (const root of ROOTS) {
  const leaked = path.join(root, "es/cumplimiento/verifactu/kit/acceso/index.html");
  if (fs.existsSync(leaked)) problems.push(`${leaked}: la zona privada se ha prerenderizado`);
}

if (problems.length) {
  console.error(`FALLO · ${problems.length} problema(s) en ${files} archivos:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`OK · ${files} archivos estáticos revisados en ${ROOTS.join(", ")}: sin secretos, sin variables de servidor, sin contenido de pago.`);
