// Prueba la migración del Kit contra un Postgres real en memoria (PGlite):
// restricciones UNIQUE, CHECK, UPDATE condicionales (claim de acceso, token de
// un solo uso), rate limit atómico, trigger, RLS y permisos.
// Uso: npm run verifactu-kit:test-sql   (no toca ninguna base de datos remota)
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";
const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`create role anon; create role authenticated; create role service_role;`);
const file = process.argv[2] ?? new URL("../supabase/migrations/20261012120000_create_verifactu_kit.sql", import.meta.url);
const sql = fs.readFileSync(file, "utf8");
await db.exec(sql);
await db.exec(sql); // idempotente
let fails = 0; const ok = (n, c) => { console.log((c ? "PASS" : "FALLO") + " · " + n); if (!c) fails++; };
const ins = (sid, pi) => db.query(`insert into verifactu_kit_orders (email, stripe_checkout_session_id, stripe_payment_intent_id, product_version) values ('a@b.es', $1, $2, '1.0.0') returning id`, [sid, pi]);
const o = (await ins("cs_1", "pi_1")).rows[0].id;
let e = null; try { await ins("cs_1", "pi_2"); } catch (x) { e = x.code; } ok("session id único (23505)", e === "23505");
e = null; try { await ins("cs_2", "pi_1"); } catch (x) { e = x.code; } ok("payment intent único", e === "23505");
await ins("cs_3", null); await ins("cs_4", null); ok("varios payment_intent NULL permitidos", true);
e = null; try { await db.query(`insert into verifactu_kit_orders (email, stripe_checkout_session_id) values ('A@B.es','cs_5')`); } catch (x) { e = x.code; } ok("email debe ir en minúsculas", e === "23514");
e = null; try { await db.query(`update verifactu_kit_orders set payment_status='weird' where id=$1`, [o]); } catch (x) { e = x.code; } ok("check de payment_status", e === "23514");
await db.query(`update verifactu_kit_orders set payment_status='paid' where id=$1`, [o]);
const c1 = await db.query(`update verifactu_kit_orders set access_status='active', access_granted_at=now() where id=$1 and payment_status='paid' and access_granted_at is null returning id`, [o]);
const c2 = await db.query(`update verifactu_kit_orders set access_status='active', access_granted_at=now() where id=$1 and payment_status='paid' and access_granted_at is null returning id`, [o]);
ok("claim de acceso solo una vez", c1.rows.length === 1 && c2.rows.length === 0);
const h = "a".repeat(64);
await db.query(`insert into verifactu_kit_access_tokens (order_id, token_hash, purpose, expires_at) values ($1,$2,'purchase', now() + interval '1 hour')`, [o, h]);
const k1 = await db.query(`update verifactu_kit_access_tokens set consumed_at=now() where token_hash=$1 and consumed_at is null and expires_at > now() returning order_id`, [h]);
const k2 = await db.query(`update verifactu_kit_access_tokens set consumed_at=now() where token_hash=$1 and consumed_at is null and expires_at > now() returning order_id`, [h]);
ok("token de un solo uso", k1.rows.length === 1 && k2.rows.length === 0);
await db.query(`insert into verifactu_kit_access_tokens (order_id, token_hash, purpose, expires_at) values ($1,$2,'resend', now() - interval '1 minute')`, [o, "b".repeat(64)]);
const k3 = await db.query(`update verifactu_kit_access_tokens set consumed_at=now() where token_hash=$1 and consumed_at is null and expires_at > now() returning order_id`, ["b".repeat(64)]);
ok("token caducado no se consume", k3.rows.length === 0);
e = null; try { await db.query(`insert into verifactu_kit_access_tokens (order_id, token_hash, purpose, expires_at) values ($1,'corto','purchase', now())`, [o]); } catch (x) { e = x.code; } ok("hash con longitud 64", e === "23514");
await db.query(`insert into verifactu_kit_webhook_events (stripe_event_id, event_type) values ('evt_1','checkout.session.completed')`);
e = null; try { await db.query(`insert into verifactu_kit_webhook_events (stripe_event_id, event_type) values ('evt_1','x')`); } catch (x) { e = x.code; } ok("evento único (replay)", e === "23505");
const rl = []; for (let i = 0; i < 4; i++) rl.push((await db.query(`select verifactu_kit_rate_limit_hit('k', 3, 60) as ok`)).rows[0].ok);
ok("rate limit: 3 dentro, el 4º fuera", JSON.stringify(rl) === "[true,true,true,false]");
await db.query(`update verifactu_kit_rate_limits set window_started_at = now() - interval '2 minutes' where bucket_key='k'`);
ok("rate limit: ventana nueva reinicia", (await db.query(`select verifactu_kit_rate_limit_hit('k', 3, 60) as ok`)).rows[0].ok === true);
const before = (await db.query(`select updated_at from verifactu_kit_orders where id=$1`, [o])).rows[0].updated_at;
await new Promise(r => setTimeout(r, 20));
await db.query(`update verifactu_kit_orders set customer_name='x' where id=$1`, [o]);
const after = (await db.query(`select updated_at from verifactu_kit_orders where id=$1`, [o])).rows[0].updated_at;
ok("trigger updated_at", after > before);
const rls = (await db.query(`select count(*)::int c from pg_class where relname like 'verifactu_kit_%' and relkind='r' and relrowsecurity`)).rows[0].c;
ok("RLS activado en las 4 tablas", rls === 4);
const g = (await db.query(`select count(*)::int c from information_schema.role_table_grants where table_name like 'verifactu_kit_%' and grantee in ('anon','authenticated')`)).rows[0].c;
ok("sin permisos para anon/authenticated", g === 0);
await db.query(`delete from verifactu_kit_orders where id=$1`, [o]);
ok("borrado en cascada de tokens", (await db.query(`select count(*)::int c from verifactu_kit_access_tokens`)).rows[0].c === 0);
console.log(fails ? fails + " fallo(s)" : "SQL OK"); process.exit(fails ? 1 : 0);
