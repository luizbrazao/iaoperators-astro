// Prueba la migración del Hotel Revenue Operator contra un Postgres real en
// memoria (PGlite): idempotencia, restricciones, unicidad por submission_id,
// trigger de updated_at, reclamación de la notificación sin duplicados, rate
// limit atómico con ventana, poda y permisos (RLS, anon/authenticated/PUBLIC).
// Uso: npm run hotel-revenue:test-sql   (no toca ninguna base de datos remota)
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";

const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`create role anon; create role authenticated; create role service_role;`);
const file = process.argv[2] ?? new URL("../supabase/migrations/20261014120000_create_hotel_revenue_leads.sql", import.meta.url);
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

const INPUTS = { rooms: 30, occupancyPct: 70, adr: 110, avgStayNights: 2.5, otaSharePct: 60, otaCommissionPct: 18, upsellAvg: 25 };
const scenario = { commissionSavingsMonthly: 1, upsellRevenueMonthly: 1, totalMonthly: 2, totalAnnual: 24 };
const RESULTS = { version: "1.0.0", base: {}, scenarios: { conservative: scenario, realistic: scenario, potential: scenario } };

let n = 0;
function row(over = {}) {
  n++;
  return {
    submission_id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    name: "Ana García",
    email: "ana@hotel.es",
    hotel_name: "Hotel Ejemplo",
    website: "https://hotel.es",
    phone: "+34 600 00 00 00",
    property_count: 1,
    room_count: 30,
    calculator_version: "1.0.0",
    calculator_inputs: INPUTS,
    calculator_results: RESULTS,
    landing_path: "/es/hoteles/reservas-directas-ia/",
    referrer_host: "www.google.com",
    cta_origin: "hero",
    consent_version: "hro-lead-2026-10-14",
    consent_at: new Date().toISOString(),
    ...over,
  };
}
async function insert(over = {}) {
  const r = row(over);
  const cols = Object.keys(r);
  const vals = cols.map((c) => (typeof r[c] === "object" && r[c] !== null ? JSON.stringify(r[c]) : r[c]));
  const res = await one(
    `insert into hotel_revenue_leads (${cols.join(",")}) values (${cols.map((_, i) => `$${i + 1}`).join(",")}) returning id, status, created_at, updated_at, notification_status`,
    vals,
  );
  return { ...res, submission_id: r.submission_id };
}

// ------------------------------------------------------------- inserción
const l1 = await insert();
ok("alta válida con valores por defecto (status new, notificación pending)", l1.status === "new" && l1.notification_status === "pending");
ok("submission_id único (idempotencia)", (await errCode(() => insert({ submission_id: l1.submission_id }))) === "23505");

const checks = [
  ["status fuera de lista", { status: "spam" }],
  ["email en mayúsculas", { email: "Ana@hotel.es" }],
  ["email sin dominio", { email: "ana@hotel" }],
  ["nombre de 1 carácter", { name: "A" }],
  ["hotel vacío", { hotel_name: "" }],
  ["web sin esquema", { website: "hotel.es" }],
  ["teléfono con letras", { phone: "600 abc" }],
  ["propiedades 0", { property_count: 0 }],
  ["habitaciones 0", { room_count: 0 }],
  ["habitaciones > 20000", { room_count: 20001 }],
  ["inputs sin una clave", { calculator_inputs: { rooms: 1 } }],
  ["inputs no objeto", { calculator_inputs: [1, 2] }],
  ["resultados sin escenario realista", { calculator_results: { scenarios: { conservative: {}, potential: {} } } }],
  ["landing fuera de /es/hoteles/", { landing_path: "/es/contact/" }],
  ["referrer con ruta", { referrer_host: "google.com/search" }],
  ["cta_origin con caracteres raros", { cta_origin: "hero<script>" }],
  ["utm vacía", { utm_source: "" }],
  ["utm > 100", { utm_campaign: "x".repeat(101) }],
];
for (const [name, over] of checks) {
  const code = await errCode(() => insert(over));
  ok(`CHECK: ${name}`, code === "23514", String(code));
}
ok("status permitido: pilot", (await errCode(() => insert({ status: "pilot" }))) === null);
ok("web y teléfono opcionales (null)", (await errCode(() => insert({ website: null, phone: null, referrer_host: null }))) === null);
ok("teléfono con paréntesis y prefijo", (await errCode(() => insert({ phone: "(+34) 952-123.456" }))) === null);

// ------------------------------------------------------------- updated_at
await q(`update hotel_revenue_leads set updated_at = now() - interval '1 hour' where id=$1`, [l1.id]);
// El propio UPDATE anterior pasa por el trigger y vuelve a now(); se fuerza la
// comparación desactivándolo un momento.
await q(`alter table hotel_revenue_leads disable trigger hotel_revenue_leads_touch`);
await q(`update hotel_revenue_leads set updated_at = now() - interval '1 hour' where id=$1`, [l1.id]);
await q(`alter table hotel_revenue_leads enable trigger hotel_revenue_leads_touch`);
await q(`update hotel_revenue_leads set status='contacted' where id=$1`, [l1.id]);
const touched = await one(`select updated_at > now() - interval '1 minute' as fresh from hotel_revenue_leads where id=$1`, [l1.id]);
ok("trigger: updated_at se renueva en cada UPDATE", touched.fresh === true);

// ------------------------------------------------------------- notificación
const claim = async (id) => (await one(`select public.hotel_revenue_claim_notification($1) as r`, [id])).r;
const l2 = await insert();
ok("claim: primera petición lo obtiene", (await claim(l2.id)) === true);
ok("claim: segunda petición concurrente no", (await claim(l2.id)) === false);
await q(`update hotel_revenue_leads set notification_status='failed', notification_error_code='resend_http_500' where id=$1`, [l2.id]);
ok("claim: tras 'failed' se puede reintentar", (await claim(l2.id)) === true);
await q(`update hotel_revenue_leads set notification_status='sent', notification_sent_at=now() where id=$1`, [l2.id]);
ok("claim: tras 'sent' nunca más (sin duplicados)", (await claim(l2.id)) === false);
const l3 = await insert();
const parallel = await Promise.all(Array.from({ length: 6 }, () => claim(l3.id)));
ok("claim: 6 llamadas simultáneas → una sola gana", parallel.filter(Boolean).length === 1);
await q(`update hotel_revenue_leads set notification_claimed_at = now() - interval '10 minutes' where id=$1`, [l3.id]);
ok("claim: 'sending' abandonado > 5 min se recupera", (await claim(l3.id)) === true);
const l4 = await insert();
for (let i = 0; i < 5; i++) {
  await claim(l4.id);
  await q(`update hotel_revenue_leads set notification_status='failed' where id=$1`, [l4.id]);
}
ok("claim: máximo 5 intentos", (await claim(l4.id)) === false && (await one(`select notification_attempts a from hotel_revenue_leads where id=$1`, [l4.id])).a === 5);
ok("claim: lead inexistente → false", (await claim("11111111-1111-4111-8111-111111111111")) === false);
ok("CHECK: notification_status fuera de lista", (await errCode(() => q(`update hotel_revenue_leads set notification_status='lost' where id=$1`, [l4.id]))) === "23514");

// ------------------------------------------------------------- rate limit
const KEY = "a".repeat(64);
const hit = async (key = KEY, limit = 3, win = 600) => (await one(`select public.hotel_revenue_rate_limit_hit($1,$2,$3) as r`, [key, limit, win])).r;
const seq = [await hit(), await hit(), await hit(), await hit()];
ok("rate limit: 3 dentro, la 4.ª fuera", seq.join(",") === "true,true,true,false", seq.join(","));
await q(`update hotel_revenue_rate_limits set window_started_at = now() - interval '11 minutes' where bucket_key=$1`, [KEY]);
ok("rate limit: ventana caducada → reinicia", (await hit()) === true && (await one(`select hits from hotel_revenue_rate_limits where bucket_key=$1`, [KEY])).hits === 1);
const K2 = "b".repeat(64);
const par = await Promise.all(Array.from({ length: 8 }, () => hit(K2, 5)));
ok("rate limit: 8 simultáneas con límite 5 → exactamente 5 pasan", par.filter(Boolean).length === 5);
ok("rate limit: la clave debe ser un HMAC hex de 64", (await errCode(() => hit("203.0.113.7"))) === "23514");
ok("rate limit: parámetros inválidos rechazados", (await errCode(() => hit("c".repeat(64), 0))) === "22023");
await q(`update hotel_revenue_rate_limits set window_started_at = now() - interval '2 days' where bucket_key=$1`, [K2]);
ok("poda: borra ventanas de más de un día", (await one(`select public.hotel_revenue_rate_limits_prune() as r`)).r === 1);

// ------------------------------------------------------------- índices
const idx = (await q(`select indexname from pg_indexes where tablename='hotel_revenue_leads'`)).rows.map((r) => r.indexname);
ok("índices: created_at, status, email, notificación", ["hotel_revenue_leads_created_at_idx", "hotel_revenue_leads_status_idx", "hotel_revenue_leads_email_idx", "hotel_revenue_leads_notification_idx"].every((i) => idx.includes(i)), idx.join(","));

// ------------------------------------------------------------- permisos
const rls = (await one(`select count(*)::int c from pg_class where relname in ('hotel_revenue_leads','hotel_revenue_rate_limits') and relkind='r' and relrowsecurity`)).c;
ok("RLS activado en las 2 tablas", rls === 2);
const policies = (await one(`select count(*)::int c from pg_policies where tablename like 'hotel_revenue_%'`)).c;
ok("sin políticas (nadie salvo service role)", policies === 0);
const grants = (await one(`select count(*)::int c from information_schema.role_table_grants where table_name like 'hotel_revenue_%' and grantee in ('anon','authenticated')`)).c;
ok("sin permisos de tabla para anon/authenticated", grants === 0);
await q(`grant usage on schema public to anon`);
await q(`set role anon`);
const anonRead = await errCode(() => q(`select * from hotel_revenue_leads`));
const anonWrite = await errCode(() => insert());
const anonRpc = await errCode(() => q(`select public.hotel_revenue_rate_limit_hit($1, 1, 1)`, ["d".repeat(64)]));
await q(`reset role`);
ok("anon: no puede leer", anonRead === "42501", String(anonRead));
ok("anon: no puede insertar", anonWrite === "42501", String(anonWrite));
ok("anon: no puede ejecutar funciones", anonRpc === "42501", String(anonRpc));

const fns = (await q(`select p.oid::regprocedure::text as sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'hotel_revenue_%'`)).rows;
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
const svc = await one(`select has_function_privilege('service_role', 'public.hotel_revenue_claim_notification(uuid)', 'execute') as a, has_table_privilege('service_role', 'public.hotel_revenue_leads', 'insert') as b`);
ok("service_role: puede insertar y ejecutar", svc.a === true && svc.b === true);

console.log(fails ? `\n${fails} fallo(s), ${passes} OK` : `SQL OK · ${passes} comprobaciones del Hotel Revenue Operator`);
process.exit(fails ? 1 : 0);
