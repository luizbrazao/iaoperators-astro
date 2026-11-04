// Prueba la migración de «Problema Resuelto» contra un Postgres real en
// memoria (PGlite): idempotencia, restricciones (incluida la coherencia entre
// modo y contenido), unicidad por submission_id, trigger de updated_at,
// reclamación de la notificación sin duplicados, rate limit atómico con
// ventana, poda y permisos (RLS, anon/authenticated/PUBLIC).
// Uso: npm run problema-resuelto:test-sql   (no toca ninguna base de datos remota)
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";

const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`create role anon; create role authenticated; create role service_role;`);
const file = process.argv[2] ?? new URL("../supabase/migrations/20261104120000_create_problema_resuelto.sql", import.meta.url);
const sql = fs.readFileSync(file, "utf8");
await db.exec(sql);
await db.exec(sql); // idempotente

let fails = 0;
let passes = 0;
const ok = (n, c, d = "") => {
  if (c) passes++;
  else {
    fails++;
    console.log("FALLO · " + n + (d ? `\n       ${d}` : ""));
  }
};
const errCode = async (fn) => {
  try {
    await fn();
    return null;
  } catch (x) {
    return x.code ?? String(x.message);
  }
};
const q = (text, params) => db.query(text, params);
const one = async (text, params) => (await q(text, params)).rows[0];

const TRANSCRIPT = [
  { role: "user", content: "Copiamos pedidos del correo al ERP a mano" },
  { role: "assistant", content: "¿Cada cuánto ocurre?" },
];

let n = 0;
function row(over = {}) {
  n++;
  return {
    submission_id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    mode: "chat",
    name: "Ana García",
    email: "ana@empresa.es",
    company: "Distribuciones Ejemplo SL",
    job_title: "Administración",
    company_size: "10-49",
    manager_aware: "si",
    problem_text: "Copiamos pedidos del correo al ERP a mano",
    transcript: TRANSCRIPT,
    answers: null,
    prompt_version: "pr-2026-11-04.1",
    llm_model: "claude-haiku-5-5",
    landing_path: "/es/problema-resuelto/",
    referrer_host: "www.linkedin.com",
    consent_version: "pr-consent-2026-11-04",
    bases_version: "pr-bases-2026-11-04",
    consent_at: new Date().toISOString(),
    ...over,
  };
}
async function insert(over = {}) {
  const r = row(over);
  const cols = Object.keys(r);
  const vals = cols.map((c) => (typeof r[c] === "object" && r[c] !== null ? JSON.stringify(r[c]) : r[c]));
  const res = await one(
    `insert into problema_resuelto_casos (${cols.join(",")}) values (${cols.map((_, i) => `$${i + 1}`).join(",")}) returning id, status, ficha_status, notification_status, pii_masked`,
    vals,
  );
  return { ...res, submission_id: r.submission_id };
}

// ------------------------------------------------------------- inserción
const c1 = await insert();
ok("alta válida con valores por defecto (nuevo, ficha pending, notificación pending)", c1.status === "nuevo" && c1.ficha_status === "pending" && c1.notification_status === "pending" && c1.pii_masked === false);
ok("submission_id único (idempotencia)", (await errCode(() => insert({ submission_id: c1.submission_id }))) === "23505");
ok("modo form con respuestas", (await errCode(() => insert({ mode: "form", transcript: null, answers: { situacion: "Copiamos pedidos a mano cada lunes" } }))) === null);

const checks = [
  ["status fuera de lista", { status: "ganado" }],
  ["modo fuera de lista", { mode: "voz" }],
  ["chat sin transcripción", { transcript: null }],
  ["chat con respuestas además", { answers: { situacion: "x" } }],
  ["form sin respuestas", { mode: "form", transcript: null, answers: null }],
  ["form con transcripción", { mode: "form", answers: { situacion: "x" } }],
  ["transcripción no array", { transcript: { a: 1 } }],
  ["transcripción vacía", { transcript: [] }],
  ["transcripción de 13 mensajes", { transcript: Array.from({ length: 13 }, () => ({ role: "user", content: "x" })) }],
  ["email en mayúsculas", { email: "Ana@empresa.es" }],
  ["email sin dominio", { email: "ana@empresa" }],
  ["nombre de 1 carácter", { name: "A" }],
  ["empresa vacía", { company: "" }],
  ["cargo vacío", { job_title: "" }],
  ["tamaño fuera de lista", { company_size: "1000+" }],
  ["responsable fuera de lista", { manager_aware: "quizá" }],
  ["problema demasiado corto", { problem_text: "corto" }],
  ["ficha no objeto", { ficha: [1] }],
  ["ficha_status fuera de lista", { ficha_status: "done" }],
  ["landing fuera del programa", { landing_path: "/es/contact/" }],
  ["referrer con ruta", { referrer_host: "google.com/search" }],
  ["utm vacía", { utm_source: "" }],
  ["prompt_version vacía", { prompt_version: "" }],
  ["bases_version vacía", { bases_version: "" }],
];
for (const [name, over] of checks) {
  const code = await errCode(() => insert(over));
  ok(`CHECK: ${name}`, code === "23514", String(code));
}
ok("status permitido: convertido", (await errCode(() => insert({ status: "convertido" }))) === null);
ok("ficha objeto aceptada", (await errCode(() => insert({ ficha: { resumen: "x" }, ficha_status: "ok" }))) === null);

// ------------------------------------------------------------- updated_at
await q(`alter table problema_resuelto_casos disable trigger problema_resuelto_casos_touch`);
await q(`update problema_resuelto_casos set updated_at = now() - interval '1 hour' where id=$1`, [c1.id]);
await q(`alter table problema_resuelto_casos enable trigger problema_resuelto_casos_touch`);
await q(`update problema_resuelto_casos set status='en_revision' where id=$1`, [c1.id]);
const touched = await one(`select updated_at > now() - interval '1 minute' as fresh from problema_resuelto_casos where id=$1`, [c1.id]);
ok("trigger: updated_at se renueva en cada UPDATE", touched.fresh === true);

// ------------------------------------------------------------- notificación
const claim = async (id) => (await one(`select public.problema_resuelto_claim_notification($1) as r`, [id])).r;
const c2 = await insert();
ok("claim: primera petición lo obtiene", (await claim(c2.id)) === true);
ok("claim: segunda petición no", (await claim(c2.id)) === false);
await q(`update problema_resuelto_casos set notification_status='failed' where id=$1`, [c2.id]);
ok("claim: tras 'failed' se puede reintentar", (await claim(c2.id)) === true);
await q(`update problema_resuelto_casos set notification_status='sent', notification_sent_at=now() where id=$1`, [c2.id]);
ok("claim: tras 'sent' nunca más", (await claim(c2.id)) === false);
const c3 = await insert();
const parallel = await Promise.all(Array.from({ length: 6 }, () => claim(c3.id)));
ok("claim: 6 llamadas simultáneas → una sola gana", parallel.filter(Boolean).length === 1);
await q(`update problema_resuelto_casos set notification_claimed_at = now() - interval '10 minutes' where id=$1`, [c3.id]);
ok("claim: 'sending' abandonado > 5 min se recupera", (await claim(c3.id)) === true);
const c4 = await insert();
for (let i = 0; i < 5; i++) {
  await claim(c4.id);
  await q(`update problema_resuelto_casos set notification_status='failed' where id=$1`, [c4.id]);
}
ok("claim: máximo 5 intentos", (await claim(c4.id)) === false);
ok("claim: caso inexistente → false", (await claim("11111111-1111-4111-8111-111111111111")) === false);

// ------------------------------------------------------------- rate limit
const KEY = "a".repeat(64);
const hit = async (key = KEY, limit = 3, win = 600) => (await one(`select public.problema_resuelto_rate_limit_hit($1,$2,$3) as r`, [key, limit, win])).r;
const seq = [await hit(), await hit(), await hit(), await hit()];
ok("rate limit: 3 dentro, la 4.ª fuera", seq.join(",") === "true,true,true,false", seq.join(","));
await q(`update problema_resuelto_rate_limits set window_started_at = now() - interval '11 minutes' where bucket_key=$1`, [KEY]);
ok("rate limit: ventana caducada → reinicia", (await hit()) === true);
const K2 = "b".repeat(64);
const par = await Promise.all(Array.from({ length: 8 }, () => hit(K2, 5)));
ok("rate limit: 8 simultáneas con límite 5 → exactamente 5 pasan", par.filter(Boolean).length === 5);
ok("rate limit: la clave debe ser un HMAC hex de 64", (await errCode(() => hit("203.0.113.7"))) === "23514");
ok("rate limit: parámetros inválidos rechazados", (await errCode(() => hit("c".repeat(64), 0))) === "22023");
await q(`update problema_resuelto_rate_limits set window_started_at = now() - interval '3 days' where bucket_key=$1`, [K2]);
ok("poda: borra ventanas de más de dos días", (await one(`select public.problema_resuelto_rate_limits_prune() as r`)).r === 1);

// ------------------------------------------------------------- índices
const idx = (await q(`select indexname from pg_indexes where tablename='problema_resuelto_casos'`)).rows.map((r) => r.indexname);
ok(
  "índices: created_at, status, email, notificación",
  ["problema_resuelto_casos_created_at_idx", "problema_resuelto_casos_status_idx", "problema_resuelto_casos_email_idx", "problema_resuelto_casos_notification_idx"].every((i) => idx.includes(i)),
  idx.join(","),
);

// ------------------------------------------------------------- permisos
const rls = (await one(`select count(*)::int c from pg_class where relname in ('problema_resuelto_casos','problema_resuelto_rate_limits') and relkind='r' and relrowsecurity`)).c;
ok("RLS activado en las 2 tablas", rls === 2);
const policies = (await one(`select count(*)::int c from pg_policies where tablename like 'problema_resuelto_%'`)).c;
ok("sin políticas (nadie salvo service role)", policies === 0);
const grants = (await one(`select count(*)::int c from information_schema.role_table_grants where table_name like 'problema_resuelto_%' and grantee in ('anon','authenticated')`)).c;
ok("sin permisos de tabla para anon/authenticated", grants === 0);
await q(`grant usage on schema public to anon`);
await q(`set role anon`);
const anonRead = await errCode(() => q(`select * from problema_resuelto_casos`));
const anonWrite = await errCode(() => insert());
const anonRpc = await errCode(() => q(`select public.problema_resuelto_rate_limit_hit($1, 1, 1)`, ["d".repeat(64)]));
await q(`reset role`);
ok("anon: no puede leer", anonRead === "42501", String(anonRead));
ok("anon: no puede insertar", anonWrite === "42501", String(anonWrite));
ok("anon: no puede ejecutar funciones", anonRpc === "42501", String(anonRpc));

const fns = (await q(`select p.oid::regprocedure::text as sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'problema_resuelto_%'`)).rows;
const exec = [];
for (const f of fns) {
  for (const role of ["anon", "authenticated", "public"]) {
    const r = await one(
      role === "public"
        ? `select bool_or(acl.privilege_type = 'EXECUTE' and acl.grantee = 0) as x from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl where p.oid = $1::regprocedure`
        : `select has_function_privilege('${role}', $1::regprocedure, 'execute') as x`,
      [f.sig],
    );
    if (r.x) exec.push(`${role}:${f.sig}`);
  }
}
ok(`funciones: ninguna ejecutable por anon/authenticated/PUBLIC (${fns.length} revisadas)`, fns.length === 4 && exec.length === 0, exec.join(", "));
const svc = await one(`select has_function_privilege('service_role', 'public.problema_resuelto_claim_notification(uuid)', 'execute') as a, has_table_privilege('service_role', 'public.problema_resuelto_casos', 'insert') as b`);
ok("service_role: puede insertar y ejecutar", svc.a === true && svc.b === true);

console.log(fails ? `\n${fails} fallo(s), ${passes} OK` : `SQL OK · ${passes} comprobaciones de Problema Resuelto`);
process.exit(fails ? 1 : 0);
