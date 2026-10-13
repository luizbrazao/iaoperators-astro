// Prueba la migración de RGPD Ops contra un Postgres real en memoria (PGlite):
// idempotencia de la migración, restricciones, creación idempotente del
// espacio, listas blancas (IDOR y mass assignment), concurrencia optimista,
// auditoría append-only, cascadas, rate limit atómico, purga y permisos.
// Uso: npm run rgpd-ops:test-sql   (no toca ninguna base de datos remota)
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";

const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`create role anon; create role authenticated; create role service_role;`);
const file = process.argv[2] ?? new URL("../supabase/migrations/20261013120000_create_rgpd_ops.sql", import.meta.url);
const sql = fs.readFileSync(file, "utf8");
await db.exec(sql);
await db.exec(sql); // idempotente

let fails = 0;
const ok = (n, c, d = "") => {
  console.log((c ? "PASS" : "FALLO") + " · " + n + (!c && d ? `\n       ${d}` : ""));
  if (!c) fails++;
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
const rpc = async (fn, args) => {
  const ph = args.map((_, i) => `$${i + 1}`).join(", ");
  return (await one(`select public.${fn}(${ph}) as r`, args)).r;
};

const SEEDS = JSON.stringify([
  { seed_key: "seed:perfil", title: "Completa el perfil", area: "perfil", priority: "alta", due_in_days: 7 },
  { seed_key: "seed:mapa", title: "Primer tratamiento", area: "tratamientos", priority: "alta", due_in_days: 14 },
]);

async function order(sid, { active = true } = {}) {
  const r = await one(
    `insert into rgpd_ops_orders (email, stripe_checkout_session_id, payment_status, access_status, access_expires_at)
     values ('a@b.es', $1, $2, $3, now() + interval '1 year') returning id`,
    [sid, active ? "paid" : "pending", active ? "active" : "pending"],
  );
  return r.id;
}

// ------------------------------------------------------------- pedidos
const o1 = await order("cs_1");
ok("pedido: session id único", (await errCode(() => order("cs_1"))) === "23505");
ok("pedido: email en minúsculas", (await errCode(() => q(`insert into rgpd_ops_orders (email, stripe_checkout_session_id) values ('A@B.es','cs_x')`))) === "23514");

// ------------------------------------------------------------- espacio de trabajo
const pending = await order("cs_pending", { active: false });
ok("ensure: pedido sin acceso activo se rechaza", (await errCode(() => rpc("rgpd_ops_ensure_workspace", [pending, "1.0.0", SEEDS]))) === "P0001");
const e1 = await rpc("rgpd_ops_ensure_workspace", [o1, "1.0.0", SEEDS]);
ok("ensure: crea el espacio y siembra tareas", e1.created === true && (await one(`select count(*)::int c from rgpd_ops_tasks where workspace_id=$1`, [e1.workspace_id])).c === 2);
const e2 = await rpc("rgpd_ops_ensure_workspace", [o1, "1.0.0", SEEDS]);
ok("ensure: idempotente (mismo id, sin resembrar)", e2.created === false && e2.workspace_id === e1.workspace_id && (await one(`select count(*)::int c from rgpd_ops_tasks where workspace_id=$1`, [e1.workspace_id])).c === 2);
const o2 = await order("cs_2");
const many = await Promise.all(Array.from({ length: 6 }, () => rpc("rgpd_ops_ensure_workspace", [o2, "1.0.0", SEEDS])));
ok(
  "ensure: llamadas concurrentes → un solo espacio y una sola siembra",
  new Set(many.map((m) => m.workspace_id)).size === 1 && many.filter((m) => m.created).length === 1 &&
    (await one(`select count(*)::int c from rgpd_ops_workspaces where order_id=$1`, [o2])).c === 1,
);
ok("espacio: único por pedido", (await errCode(() => q(`insert into rgpd_ops_workspaces (order_id) values ($1)`, [o1]))) === "23505");
{ const c = await errCode(() => q(`delete from rgpd_ops_orders where id=$1`, [o1])); ok("pedido con espacio no se borra (RESTRICT)", c === "23503" || c === "23001", String(c)); }
const W1 = e1.workspace_id;
const W2 = many[0].workspace_id;

// ------------------------------------------------------------- alta
ok("alta: entidad desconocida rechazada", (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "rgpd_ops_orders", JSON.stringify({ name: "x" }), 500]))) === "22023");
for (const field of ["workspace_id", "id", "version", "seed_key", "created_at"]) {
  ok(`alta: campo no permitido «${field}»`, (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "tareas", JSON.stringify({ title: "x", [field]: W2 }), 500]))) === "22023");
}
const c1 = await rpc("rgpd_ops_entity_create", [
  W1,
  "tratamientos",
  JSON.stringify({ name: "Gestión de clientes", purpose: "Prestar el servicio", data_subjects: ["clientes"], data_categories: ["identificativos", "contacto"] }),
  500,
]);
ok("alta: ok con arrays y versión 1", c1.status === "ok" && c1.row.version === 1 && c1.row.data_subjects.length === 1 && c1.row.workspace_id === W1);
ok("alta: enum inválido → CHECK", (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "tratamientos", JSON.stringify({ name: "x", legal_basis: "porque si" }), 500]))) === "23514");
ok("alta: categoría fuera de lista → CHECK", (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "tratamientos", JSON.stringify({ name: "x", data_categories: ["dni"] }), 500]))) === "23514");
ok(
  "alta: referencia con email rechazada",
  (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "solicitudes", JSON.stringify({ reference: "ana@empresa.com", received_on: "2026-10-01", due_on: "2026-11-01" }), 500]))) === "23514",
);
ok(
  "alta: referencia con espacios rechazada",
  (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "solicitudes", JSON.stringify({ reference: "Ana Pérez", received_on: "2026-10-01", due_on: "2026-11-01" }), 500]))) === "23514",
);
const sol = await rpc("rgpd_ops_entity_create", [W1, "solicitudes", JSON.stringify({ reference: "SOL-2026-001", received_on: "2026-10-01", due_on: "2026-11-01" }), 500]);
ok("alta: solicitud con referencia interna", sol.status === "ok");
ok(
  "alta: referencia duplicada en el mismo espacio",
  (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "solicitudes", JSON.stringify({ reference: "SOL-2026-001", received_on: "2026-10-01", due_on: "2026-11-01" }), 500]))) === "23505",
);
const solOtro = await rpc("rgpd_ops_entity_create", [W2, "solicitudes", JSON.stringify({ reference: "SOL-2026-001", received_on: "2026-10-01", due_on: "2026-11-01" }), 500]);
ok("alta: la misma referencia en otro espacio es independiente", solOtro.status === "ok");
ok(
  "alta: prórroga sin fecha → CHECK",
  (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "solicitudes", JSON.stringify({ reference: "SOL-2", received_on: "2026-10-01", due_on: "2026-11-01", extended: true }), 500]))) === "23514",
);
const inc = await rpc("rgpd_ops_entity_create", [W1, "incidentes", JSON.stringify({ reference: "INC-1", detected_at: "2026-10-12T08:00:00Z", data_categories: ["contacto"] }), 500]);
ok("alta: incidente con fecha y categorías", inc.status === "ok" && inc.row.escalation_decision === "pendiente");
const lim1 = await rpc("rgpd_ops_entity_create", [W2, "evidencias", JSON.stringify({ title: "a" }), 2]);
const lim2 = await rpc("rgpd_ops_entity_create", [W2, "evidencias", JSON.stringify({ title: "b" }), 2]);
const lim3 = await rpc("rgpd_ops_entity_create", [W2, "evidencias", JSON.stringify({ title: "c" }), 2]);
ok("alta: límite de filas por espacio", lim1.status === "ok" && lim2.status === "ok" && lim3.status === "limit");
const ghost = await rpc("rgpd_ops_entity_create", ["00000000-0000-4000-8000-000000000000", "tareas", JSON.stringify({ title: "x" }), 500]);
ok("alta: espacio inexistente → not_found", ghost.status === "not_found");

// ------------------------------------------------------------- modificación
const id = c1.row.id;
const u1 = await rpc("rgpd_ops_entity_update", [W1, "tratamientos", id, 1, JSON.stringify({ purpose: "Facturar" })]);
ok("modificación: versión correcta → ok y versión 2", u1.status === "ok" && u1.row.version === 2 && u1.row.purpose === "Facturar" && u1.row.name === "Gestión de clientes");
const u2 = await rpc("rgpd_ops_entity_update", [W1, "tratamientos", id, 1, JSON.stringify({ purpose: "Otra pestaña" })]);
ok("modificación: versión antigua → conflict con la fila actual", u2.status === "conflict" && u2.current.version === 2 && u2.current.purpose === "Facturar");
const u3 = await rpc("rgpd_ops_entity_update", [W2, "tratamientos", id, 2, JSON.stringify({ purpose: "IDOR" })]);
ok("IDOR: id de otro espacio → not_found y sin cambios", u3.status === "not_found" && (await one(`select purpose from rgpd_ops_processing_activities where id=$1`, [id])).purpose === "Facturar");
ok(
  "mass assignment: workspace_id en el parche rechazado",
  (await errCode(() => rpc("rgpd_ops_entity_update", [W1, "tratamientos", id, 2, JSON.stringify({ workspace_id: W2 })]))) === "22023",
);
ok("modificación: parche vacío rechazado", (await errCode(() => rpc("rgpd_ops_entity_update", [W1, "tratamientos", id, 2, JSON.stringify({})]))) === "22023");
const arr = await rpc("rgpd_ops_entity_update", [W1, "tratamientos", id, 2, JSON.stringify({ data_subjects: ["clientes", "empleados"] })]);
ok("modificación: arrays", arr.status === "ok" && arr.row.data_subjects.length === 2);

// Trigger de versión: ni el UPDATE directo puede fijar la versión ni mover la fila.
await q(`update rgpd_ops_processing_activities set version = 999, workspace_id = $2 where id = $1`, [id, W2]);
const after = await one(`select version, workspace_id from rgpd_ops_processing_activities where id=$1`, [id]);
ok("trigger: la versión la pone la BD y la fila no cambia de espacio", after.version === 4 && after.workspace_id === W1, JSON.stringify(after));

// ------------------------------------------------------------- borrado
const d1 = await rpc("rgpd_ops_entity_delete", [W1, "tratamientos", id, 1]);
ok("borrado: versión antigua → conflict", d1.status === "conflict");
const d2 = await rpc("rgpd_ops_entity_delete", [W2, "tratamientos", id, 4]);
ok("borrado: otro espacio → not_found", d2.status === "not_found");
const d3 = await rpc("rgpd_ops_entity_delete", [W1, "tratamientos", id, 4]);
ok("borrado: ok", d3.status === "ok" && (await one(`select count(*)::int c from rgpd_ops_processing_activities where id=$1`, [id])).c === 0);

// ------------------------------------------------------------- revisiones
const rv = await rpc("rgpd_ops_entity_create", [W1, "revisiones", JSON.stringify({ period: "2026-T4" }), 500]);
ok("revisión: periodo válido", rv.status === "ok");
ok("revisión: periodo inválido → CHECK", (await errCode(() => rpc("rgpd_ops_entity_create", [W1, "revisiones", JSON.stringify({ period: "Q4" }), 500]))) === "23514");
ok(
  "revisión: completada sin fecha → CHECK",
  (await errCode(() => rpc("rgpd_ops_entity_update", [W1, "revisiones", rv.row.id, 1, JSON.stringify({ status: "completada" })]))) === "23514",
);
const rvc = await rpc("rgpd_ops_entity_update", [W1, "revisiones", rv.row.id, 1, JSON.stringify({ status: "completada", completed_at: new Date().toISOString(), checklist: { mapa: true } })]);
ok("revisión: completada y auditada como review_completed", rvc.status === "ok" && (await one(`select count(*)::int c from rgpd_ops_audit_events where workspace_id=$1 and action='review_completed'`, [W1])).c === 1);

// ------------------------------------------------------------- perfil
const ws = await one(`select version from rgpd_ops_workspaces where id=$1`, [W1]);
const p1 = await rpc("rgpd_ops_update_profile", [W1, ws.version, JSON.stringify({ rol: "responsable", sector: "agencia" })]);
const p2 = await rpc("rgpd_ops_update_profile", [W1, ws.version, JSON.stringify({ rol: "encargado" })]);
ok("perfil: versión optimista", p1.status === "ok" && p2.status === "conflict" && p2.current.profile.rol === "responsable");
const pa = await one(`select fields from rgpd_ops_audit_events where workspace_id=$1 and action='profile_updated' order by occurred_at desc limit 1`, [W1]);
ok("perfil: auditoría con nombres de campos, sin valores", JSON.stringify(pa.fields) === JSON.stringify(["rol", "sector"]));

// ------------------------------------------------------------- auditoría
const audits = await one(`select count(*)::int c from rgpd_ops_audit_events where workspace_id=$1`, [W1]);
ok("auditoría: altas, cambios y borrados registrados", audits.c >= 8, String(audits.c));
const valores = await one(`select count(*)::int c from rgpd_ops_audit_events where fields::text like '%Facturar%' or fields::text like '%SOL-2026%'`);
ok("auditoría: nunca guarda valores", valores.c === 0);
ok("auditoría: UPDATE prohibido", (await errCode(() => q(`update rgpd_ops_audit_events set actor='soporte' where workspace_id=$1`, [W1]))) === "42501");
ok("auditoría: DELETE directo prohibido", (await errCode(() => q(`delete from rgpd_ops_audit_events where workspace_id=$1`, [W1]))) === "42501");
await rpc("rgpd_ops_log_event", [W1, "export", "json"]);
ok("auditoría: evento de exportación", (await one(`select count(*)::int c from rgpd_ops_audit_events where workspace_id=$1 and action='export' and detail='json'`, [W1])).c === 1);
ok("auditoría: acción no permitida", (await errCode(() => rpc("rgpd_ops_log_event", [W1, "entity_deleted", null]))) === "22023");

// ------------------------------------------------------------- snapshot
const snap = await rpc("rgpd_ops_workspace_snapshot", [W1, 500]);
ok(
  "snapshot: todas las secciones",
  ["workspace", "tratamientos", "proveedores", "captacion", "solicitudes", "incidentes", "tareas", "evidencias", "revisiones", "auditoria"].every((k) => k in snap) &&
    snap.tareas.length === 2 && snap.solicitudes.length === 1,
);
ok("snapshot: solo datos del propio espacio", snap.solicitudes.every((s) => s.workspace_id === W1) && snap.evidencias.length === 0);
ok("snapshot: espacio inexistente → null", (await rpc("rgpd_ops_workspace_snapshot", ["00000000-0000-4000-8000-000000000000", 500])) === null);

// ------------------------------------------------------------- rate limit concurrente
const hits = await Promise.all(Array.from({ length: 12 }, () => rpc("rgpd_ops_rate_limit_hit", ["k", 5, 60])));
ok("rate limit concurrente: exactamente 5 dentro", hits.filter(Boolean).length === 5, JSON.stringify(hits));
await q(`update rgpd_ops_rate_limits set window_started_at = now() - interval '2 minutes' where bucket_key='k'`);
ok("rate limit: ventana nueva reinicia", (await rpc("rgpd_ops_rate_limit_hit", ["k", 5, 60])) === true);

// ------------------------------------------------------------- purga y cascada
await q(`update rgpd_ops_orders set access_expires_at = now() - interval '100 days' where id = $1`, [o2]);
const purged = await rpc("rgpd_ops_purge_expired_workspaces", [90]);
ok("purga: borra solo espacios vencidos hace más de 90 días", purged === 1 && (await one(`select count(*)::int c from rgpd_ops_workspaces where id=$1`, [W1])).c === 1);
ok(
  "purga: cascada de entidades y auditoría",
  (await one(`select count(*)::int c from rgpd_ops_evidence_items where workspace_id=$1`, [W2])).c === 0 &&
    (await one(`select count(*)::int c from rgpd_ops_audit_events where workspace_id=$1`, [W2])).c === 0,
);
ok("purga: el pedido se conserva", (await one(`select count(*)::int c from rgpd_ops_orders where id=$1`, [o2])).c === 1);

// ------------------------------------------------------------- permisos
const tablas = (await one(`select count(*)::int c from pg_class where relname like 'rgpd_ops_%' and relkind='r' and relrowsecurity`)).c;
ok("RLS activado en las 14 tablas", tablas === 14, String(tablas));
const grants = (await one(`select count(*)::int c from information_schema.role_table_grants where table_name like 'rgpd_ops_%' and grantee in ('anon','authenticated')`)).c;
ok("sin permisos de tabla para anon/authenticated", grants === 0);
const fns = (await q(`select p.oid::regprocedure::text as sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'rgpd_ops_%'`)).rows;
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
ok(`funciones: ninguna ejecutable por anon/authenticated/PUBLIC (${fns.length} revisadas)`, exec.length === 0, exec.join(", "));

console.log(fails ? `${fails} fallo(s)` : "SQL OK");
process.exit(fails ? 1 : 0);
