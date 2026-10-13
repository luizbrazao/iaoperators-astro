// Pruebas de RGPD Ops Starter (sin red, sin Supabase, sin Stripe real).
// Uso: npm run rgpd-ops:test
//
// Cubre: tokens y sesiones (espacio de nombres propio), máquina de estados,
// webhook con firmas reales de Stripe, idempotencia y replay, creación
// idempotente del espacio, reembolso y revocación, autorización por sesión y
// pedido, GET del magic link sin consumo, validación de entidades, IDOR y
// concurrencia optimista en el servicio, CSV sin fórmulas, exportaciones,
// panel, analítica sin PII, comprobación del precio y logs sin PII.
// La base de datos se sustituye por dobles en memoria que reproducen las
// restricciones de la migración; la migración se prueba aparte con PGlite
// (npm run rgpd-ops:test-sql).

process.env.RGPD_OPS_SESSION_SECRET = "test-secret-rgpd-0123456789-abcdefghijklmnopqrstuvwxyz";
process.env.RGPD_OPS_MAGIC_LINK_TTL_MINUTES = "60";
process.env.RGPD_OPS_STRIPE_PRICE_ID = "price_test_rgpd";
process.env.VERIFACTU_KIT_SESSION_SECRET = process.env.RGPD_OPS_SESSION_SECRET;

import Stripe from "stripe";
import { generateAccessToken, hashAccessToken, TOKEN_RE } from "../src/lib/commerce/tokens";
import { accessExpiry, isAccessAllowed, nextAccessStatus, nextPaymentStatus, type PaymentStatus } from "../src/lib/commerce/payment-state";
import { csvCell, toCsv } from "../src/lib/commerce/csv";
import { signOpsSession, verifyOpsSession } from "../src/lib/rgpd-ops/session";
import { signSession as signKitSession } from "../src/lib/verifactu-kit/crypto";
import { processStripeWebhook, type WebhookDeps } from "../src/lib/rgpd-ops/webhook";
import type { FulfillmentDeps } from "../src/lib/rgpd-ops/fulfillment";
import type { EventClaim, OpsOrder, OrderFromSession } from "../src/lib/rgpd-ops/orders";
import { verifyWebhookEvent, opsMetadata, priceProblems, taxRateProblems } from "../src/lib/rgpd-ops/stripe";
import { getAuthorizedWorkspace, type AuthDeps } from "../src/lib/rgpd-ops/auth";
import { buildAccessEmail } from "../src/lib/rgpd-ops/email";
import { isAllowedOrigin } from "../src/lib/rgpd-ops/origin";
import { cleanRgpdOpsParams } from "../src/lib/rgpd-ops/analytics";
import { ENTITIES, ENTITY_SLUGS, validateCreate, validatePatch, validateProfile, containsContactData, type EntitySlug } from "../src/lib/rgpd-ops/schema";
import { addMonths } from "../src/lib/rgpd-ops/dates";
import {
  serviceCreate,
  serviceDelete,
  serviceUpdate,
  serviceUpdateProfile,
  toClientSnapshot,
  type RepoResult,
  type WorkspaceRepo,
} from "../src/lib/rgpd-ops/workspace";
import { buildBackup, buildCsv, CSV_TYPES } from "../src/lib/rgpd-ops/export";
import { buildDashboard } from "../src/lib/rgpd-ops/dashboard";
import type { WorkspaceSnapshot } from "../src/lib/rgpd-ops/types";
import { RGPD_OPS_PRODUCT, RGPD_OPS_PUBLIC_MODULES } from "../src/data/rgpd-ops";
import { MODULE_GUIDES, SEED_TASKS, RGPD_OPS_CONTENT_SENTINEL, REVIEW_CHECKLIST } from "../src/data/rgpd-ops-content";
import { REVIEW_KEYS } from "../src/lib/rgpd-ops/schema";
import { GET as consumeGET, POST as consumePOST } from "../src/pages/api/rgpd-ops/consume-access";

let fallos = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallos++;
  console.log(`${ok ? "PASS" : "FALLO"} · ${nombre}${!ok && detalle ? `\n       ${detalle}` : ""}`);
}

const logs: string[] = [];
const origLog = console.log;
const origErr = console.error;
const origWarn = console.warn;
function quiet<T>(fn: () => Promise<T>): Promise<T> {
  const capture = (...args: unknown[]) => logs.push(args.map(String).join(" "));
  console.error = capture;
  console.warn = capture;
  console.log = (...args: unknown[]) => {
    const s = args.map(String).join(" ");
    if (s.startsWith('{"scope":"rgpd-ops"')) logs.push(s);
    else origLog(...args);
  };
  return fn().finally(() => {
    console.log = origLog;
    console.error = origErr;
    console.warn = origWarn;
  });
}

const SECRET = process.env.RGPD_OPS_SESSION_SECRET!;
const OID = "6f1c1f3e-8a4b-4c2d-9e1f-0a1b2c3d4e5f";

// ------------------------------------------------------------------ tokens y sesión
{
  const tokens = new Set(Array.from({ length: 2000 }, () => generateAccessToken()));
  check("tokens: 2000 únicos de 256 bits", tokens.size === 2000 && [...tokens].every((t) => TOKEN_RE.test(t)));
  const now = 1_800_000_000;
  const value = signOpsSession({ v: 1, oid: OID, iat: now, exp: now + 3600 }, SECRET);
  check("sesión: firma válida", verifyOpsSession(value, SECRET, now + 10)?.oid === OID);
  check("sesión: caducada se rechaza", verifyOpsSession(value, SECRET, now + 3601) === null);
  check("sesión: otro secreto se rechaza", verifyOpsSession(value, "x".repeat(40), now + 10) === null);
  const kitCookie = signKitSession({ v: 1, oid: OID, iat: now, exp: now + 3600 }, SECRET);
  check("sesión: una cookie del Kit no abre RGPD Ops (mismo secreto)", verifyOpsSession(kitCookie, SECRET, now + 10) === null);
  const [, sig] = value.split(".");
  const forged = Buffer.from(JSON.stringify({ v: 1, oid: "00000000-0000-4000-8000-000000000000", iat: now, exp: now + 3600 })).toString("base64url");
  check("sesión: payload alterado se rechaza", verifyOpsSession(`${forged}.${sig}`, SECRET, now + 10) === null);
}

// ------------------------------------------------------------------ máquina de estados
{
  const casos: [PaymentStatus | null, PaymentStatus, PaymentStatus][] = [
    [null, "pending", "pending"],
    ["pending", "paid", "paid"],
    ["paid", "pending", "paid"],
    ["paid", "failed", "paid"],
    ["failed", "paid", "paid"],
    ["paid", "refunded", "refunded"],
    ["refunded", "paid", "refunded"],
    ["paid", "partially_refunded", "partially_refunded"],
    ["partially_refunded", "refunded", "refunded"],
  ];
  const malos = casos.filter(([a, b, e]) => nextPaymentStatus(a, b) !== e);
  check("estados: monotónicos ante eventos fuera de orden", malos.length === 0, JSON.stringify(malos));
  check("estados: reembolso total revoca, parcial conserva", nextAccessStatus("active", "refunded") === "revoked" && nextAccessStatus("active", "partially_refunded") === "active");
  const now = new Date("2026-10-13T10:00:00Z");
  check("acceso: 12 meses desde el pago", accessExpiry(now, RGPD_OPS_PRODUCT.accessMonths).toISOString().startsWith("2027-10-13"));
}

// ------------------------------------------------------------------ dobles en memoria
function createFakeOrders() {
  const orders = new Map<string, OpsOrder>();
  const events = new Map<string, { status: string; attempts: number }>();
  const tokens = new Map<string, { orderId: string; expires: number; consumed: boolean }>();
  const workspaces = new Map<string, string>();
  const sent = { access: 0, internal: 0, links: [] as string[], workspaceFlags: [] as boolean[] };
  let ensureCalls = 0;
  let failEnsure = false;
  let failUpsertOnce = false;
  let seq = 0;
  const bySession = (id: string) => [...orders.values()].find((o) => o.stripe_checkout_session_id === id) ?? null;
  const byPi = (id: string) => [...orders.values()].find((o) => o.stripe_payment_intent_id === id) ?? null;

  const fulfillment: FulfillmentDeps = {
    async upsertOrderFromSession(input: OrderFromSession) {
      if (failUpsertOnce) {
        failUpsertOnce = false;
        throw Object.assign(new Error("db down"), { code: "order_update_failed" });
      }
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      const now = new Date().toISOString();
      let o = bySession(input.checkoutSessionId);
      if (!o) {
        o = {
          id: `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`,
          email: input.email,
          customer_name: input.customerName,
          company_name: input.companyName,
          stripe_customer_id: input.stripeCustomerId,
          stripe_checkout_session_id: input.checkoutSessionId,
          stripe_payment_intent_id: input.paymentIntentId,
          stripe_price_id: input.priceId,
          product_key: RGPD_OPS_PRODUCT.key,
          product_version: input.productVersion,
          amount_total: input.amountTotal,
          currency: input.currency,
          payment_status: input.paymentStatus,
          access_status: nextAccessStatus(null, input.paymentStatus),
          assessment_response_id: input.assessmentResponseId,
          access_granted_at: null,
          access_expires_at: null,
          access_email_status: "pending",
          access_email_sent_at: null,
          last_access_at: null,
          created_at: now,
          updated_at: now,
          paid_at: input.paymentStatus === "paid" ? now : null,
          refunded_at: null,
        };
        orders.set(o.id, o);
        return { ...o };
      }
      const payment = nextPaymentStatus(o.payment_status, input.paymentStatus);
      o.payment_status = payment;
      o.access_status = nextAccessStatus(o.access_status, payment);
      if (payment === "paid" && !o.paid_at) o.paid_at = now;
      return { ...o };
    },
    async claimAccessGrant(orderId, expiresAt) {
      const o = orders.get(orderId);
      if (!o || o.payment_status !== "paid" || o.access_granted_at) return null;
      o.access_status = "active";
      o.access_granted_at = new Date().toISOString();
      o.access_expires_at = expiresAt.toISOString();
      return { ...o };
    },
    async createAccessToken(orderId, _purpose, ttl) {
      const token = generateAccessToken();
      const expiresAt = new Date(Date.now() + ttl * 60_000);
      tokens.set(hashAccessToken(token), { orderId, expires: expiresAt.getTime(), consumed: false });
      return { token, expiresAt };
    },
    async setAccessEmailStatus(orderId, status) {
      const o = orders.get(orderId);
      if (o) o.access_email_status = status;
    },
    async applyRefund(pi, fully) {
      const o = byPi(pi);
      if (!o) return null;
      const payment = nextPaymentStatus(o.payment_status, fully ? "refunded" : "partially_refunded");
      o.payment_status = payment;
      o.access_status = nextAccessStatus(o.access_status, payment);
      return { ...o };
    },
    async sendAccessEmail(input) {
      sent.access++;
      sent.links.push(input.magicLink);
      return { ok: true as const, code: "sent" };
    },
    async sendInternalSaleEmail(input) {
      sent.internal++;
      sent.workspaceFlags.push(input.workspaceOk);
      return { ok: true as const, code: "sent" };
    },
    async ensureWorkspace(orderId) {
      ensureCalls++;
      if (failEnsure) throw Object.assign(new Error("db"), { code: "workspace_ensure_failed" });
      // Reproduce UNIQUE(order_id) + insert on conflict do nothing.
      const existing = workspaces.get(orderId);
      if (existing) return { workspace_id: existing, created: false };
      const id = `11111111-0000-4000-8000-${String(workspaces.size + 1).padStart(12, "0")}`;
      workspaces.set(orderId, id);
      return { workspace_id: id, created: true };
    },
  };
  const webhook: Omit<WebhookDeps, "verify"> = {
    async claimWebhookEvent(id): Promise<EventClaim> {
      const e = events.get(id);
      if (!e) {
        events.set(id, { status: "processing", attempts: 1 });
        return "new";
      }
      if (e.status === "processed" || e.status === "ignored") return "duplicate";
      e.status = "processing";
      e.attempts++;
      return "retry";
    },
    async finishWebhookEvent(id, status) {
      const e = events.get(id);
      if (e) e.status = status;
    },
    fulfillment,
  };
  return {
    orders,
    events,
    tokens,
    workspaces,
    sent,
    get ensureCalls() {
      return ensureCalls;
    },
    setFailEnsure: (v: boolean) => (failEnsure = v),
    failNextUpsert: () => (failUpsertOnce = true),
    deps: { ...webhook, verify: verifyWebhookEvent } as WebhookDeps,
    consume(token: string) {
      const t = tokens.get(hashAccessToken(token));
      if (!t || t.consumed || t.expires <= Date.now()) return null;
      t.consumed = true;
      return t.orderId;
    },
  };
}

const WEBHOOK_SECRET = "whsec_test_secret_for_rgpd_ops";
let evSeq = 0;
function sessionObject(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "cs_test_rgpd_1",
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    amount_total: 18029,
    currency: "eur",
    customer: "cus_test_1",
    customer_email: null,
    customer_details: { email: "Comprador@Ejemplo.es", name: "Ana Pérez", business_name: "Agencia Pérez SL" },
    collected_information: null,
    payment_intent: "pi_rgpd_1",
    metadata: { product_key: RGPD_OPS_PRODUCT.key, product_version: RGPD_OPS_PRODUCT.version },
    ...over,
  };
}
function signed(type: string, object: unknown, opts: { id?: string; timestamp?: number } = {}) {
  const payload = JSON.stringify({ id: opts.id ?? `evt_rgpd_${++evSeq}`, object: "event", type, api_version: "2026-09-30", created: Math.floor(Date.now() / 1000), data: { object } });
  return { payload, header: Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET, timestamp: opts.timestamp }) };
}
const deliver = (db: ReturnType<typeof createFakeOrders>, ev: { payload: string; header: string }) =>
  processStripeWebhook({ rawBody: ev.payload, signature: ev.header, secret: WEBHOOK_SECRET, requestId: "test" }, db.deps);

await quiet(async () => {
  {
    const db = createFakeOrders();
    const ev = signed("checkout.session.completed", sessionObject(), { id: "evt_a" });
    const r1 = await deliver(db, ev);
    const order = [...db.orders.values()][0];
    check("webhook: pago → pedido, acceso, un espacio, un email", r1.status === 200 && db.orders.size === 1 && order.access_status === "active" && db.workspaces.size === 1 && db.sent.access === 1);
    check("webhook: email del pedido en minúsculas", order.email === "comprador@ejemplo.es");
    const r2 = await deliver(db, ev);
    check("webhook: replay del mismo evento no repite nada", r2.body.duplicate === true && db.sent.access === 1 && db.orders.size === 1 && db.workspaces.size === 1);
    await deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject()));
    check("webhook: otro evento de la sesión no crea segundo espacio ni email", db.sent.access === 1 && db.workspaces.size === 1);
    const token = new URL(db.sent.links[0]).searchParams.get("token")!;
    check("magic link: apunta a /api/rgpd-ops/consume-access", db.sent.links[0].includes("/api/rgpd-ops/consume-access?token="));
    check("magic link: solo se guarda el hash", !db.tokens.has(token) && db.tokens.has(hashAccessToken(token)));
    check("magic link: un solo uso", db.consume(token) === order.id && db.consume(token) === null);
    await deliver(db, signed("charge.refunded", { id: "ch", object: "charge", payment_intent: "pi_rgpd_1", amount: 18029, amount_refunded: 18029, refunded: true }));
    const after = [...db.orders.values()][0];
    check("reembolso total: acceso revocado", after.access_status === "revoked" && !isAccessAllowed(after));
    await deliver(db, signed("checkout.session.completed", sessionObject()));
    check("reembolso: un evento de pago atrasado no devuelve el acceso", !isAccessAllowed([...db.orders.values()][0]) && db.sent.access === 1);
  }
  {
    const db = createFakeOrders();
    await Promise.all([
      deliver(db, signed("checkout.session.completed", sessionObject())),
      deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject())),
      deliver(db, signed("checkout.session.completed", sessionObject())),
    ]);
    check("concurrencia: un pedido, un espacio, un email", db.orders.size === 1 && db.workspaces.size === 1 && db.sent.access === 1, `o=${db.orders.size} w=${db.workspaces.size} e=${db.sent.access}`);
  }
  {
    const db = createFakeOrders();
    db.setFailEnsure(true);
    const r = await deliver(db, signed("checkout.session.completed", sessionObject()));
    check("fallo al crear el espacio: el pago se procesa y el enlace sale igual", r.status === 200 && db.sent.access === 1 && db.sent.workspaceFlags[0] === false);
    db.setFailEnsure(false);
    await deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject()));
    check("fallo al crear el espacio: el siguiente evento lo crea (idempotente)", db.workspaces.size === 1 && db.sent.access === 1);
  }
  {
    const db = createFakeOrders();
    const ev = signed("checkout.session.completed", sessionObject());
    const bad = await processStripeWebhook({ rawBody: ev.payload, signature: ev.header, secret: "whsec_otro", requestId: "t" }, db.deps);
    check("firma inválida: 400 sin escrituras", bad.status === 400 && db.orders.size === 0 && db.events.size === 0);
    const tampered = await deliver(db, { payload: ev.payload.replace("18029", "1"), header: ev.header });
    check("cuerpo alterado: 400", tampered.status === 400 && db.orders.size === 0);
    const old = signed("checkout.session.completed", sessionObject(), { timestamp: Math.floor(Date.now() / 1000) - 3600 });
    check("firma antigua (replay): 400", (await deliver(db, old)).status === 400);
    const kitEvent = signed("checkout.session.completed", sessionObject({ metadata: { product_key: "verifactu-kit" } }));
    const k = await deliver(db, kitEvent);
    check("sesión del Kit: ignorada por el webhook de RGPD Ops", k.status === 200 && db.orders.size === 0);
  }
  {
    const db = createFakeOrders();
    await deliver(db, signed("checkout.session.completed", sessionObject({ id: "cs_async", payment_status: "unpaid", payment_intent: "pi_async" })));
    check("pago asíncrono pendiente: sin acceso ni espacio", db.sent.access === 0 && db.workspaces.size === 0);
    await deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject({ id: "cs_async", payment_status: "paid", payment_intent: "pi_async" })));
    check("pago asíncrono confirmado: acceso y espacio", db.sent.access === 1 && db.workspaces.size === 1);
  }
  {
    const db = createFakeOrders();
    await deliver(db, signed("checkout.session.completed", sessionObject()));
    await deliver(db, signed("charge.refunded", { id: "ch", object: "charge", payment_intent: "pi_rgpd_1", amount: 18029, amount_refunded: 1000, refunded: false }));
    check("reembolso parcial: conserva el acceso", isAccessAllowed([...db.orders.values()][0]));
  }
  {
    const db = createFakeOrders();
    db.failNextUpsert();
    const ev = signed("checkout.session.completed", sessionObject(), { id: "evt_k" });
    const r1 = await deliver(db, ev);
    const r2 = await deliver(db, ev);
    check("fallo de BD: 500 y el reintento procesa una vez", r1.status === 500 && r2.status === 200 && db.sent.access === 1 && db.events.get("evt_k")?.attempts === 2);
  }
});

// ------------------------------------------------------------------ autorización
{
  const now = Date.now();
  const active: Partial<OpsOrder> = { id: OID, payment_status: "paid", access_status: "active", access_expires_at: new Date(now + 86_400_000).toISOString() };
  let ensured = 0;
  const deps = (order: Partial<OpsOrder> | null, ws: string | null = "22222222-0000-4000-8000-000000000001"): AuthDeps => ({
    readSession: () => ({ v: 1, oid: OID, iat: 0, exp: 0 }),
    getOrderById: async () => order as OpsOrder | null,
    repo: {
      findWorkspaceId: async () => ws,
      ensureWorkspace: async () => {
        ensured++;
        return { workspace_id: "22222222-0000-4000-8000-000000000009", created: true };
      },
    },
  });
  const url = new URL("https://iaoperators.com/x");
  await quiet(async () => {
    const ok = await getAuthorizedWorkspace({} as never, url, "t", deps(active));
    check("auth: sesión + pedido activo → espacio del pedido", ok.status === "ok" && ok.workspaceId === "22222222-0000-4000-8000-000000000001");
    const ref = await getAuthorizedWorkspace({} as never, url, "t", deps({ ...active, payment_status: "refunded", access_status: "revoked" }));
    check("auth: pedido reembolsado → denegado aunque la cookie sea válida", ref.status === "denied");
    const exp = await getAuthorizedWorkspace({} as never, url, "t", deps({ ...active, access_expires_at: new Date(now - 1000).toISOString() }));
    check("auth: acceso caducado → denegado", exp.status === "denied");
    const none = await getAuthorizedWorkspace({} as never, url, "t", { ...deps(active), readSession: () => null });
    check("auth: sin sesión → anónimo", none.status === "anonymous");
    const missing = await getAuthorizedWorkspace({} as never, url, "t", deps(active, null));
    check("auth: espacio ausente → se crea (red de seguridad idempotente)", missing.status === "ok" && ensured === 1 && missing.workspaceId.endsWith("09"));
    const down = await getAuthorizedWorkspace({} as never, url, "t", { ...deps(active), getOrderById: async () => { throw new Error("x"); } });
    check("auth: BD caída → no disponible (nunca acceso)", down.status === "unavailable");
  });
}

// ------------------------------------------------------------------ magic link: GET no consume
{
  const token = generateAccessToken();
  const res = await consumeGET({ url: new URL(`https://iaoperators.com/api/rgpd-ops/consume-access?token=${token}`), redirect: (l: string, s: number) => new Response(null, { status: s, headers: { location: l } }) } as never);
  const html = await res.text();
  check(
    "magic link: GET muestra confirmación y no consume (sin acceso a BD)",
    res.status === 200 && html.includes('method="post"') && html.includes("/api/rgpd-ops/consume-access") && !html.includes("<script"),
  );
  check(
    "magic link: cabeceras de seguridad en la confirmación",
    (res.headers.get("content-security-policy") ?? "").includes("default-src 'none'") && res.headers.get("x-frame-options") === "DENY" && res.headers.get("referrer-policy") === "same-origin" && res.headers.get("cache-control") === "no-store",
  );
  const badGet = await consumeGET({ url: new URL("https://iaoperators.com/api/rgpd-ops/consume-access?token=corto"), redirect: (l: string, s: number) => new Response(null, { status: s, headers: { location: l } }) } as never);
  check("magic link: token mal formado → redirige sin tocar nada", badGet.status === 303 && (badGet.headers.get("location") ?? "").includes("enlace-invalido"));
  await quiet(async () => {
    const req = new Request("https://iaoperators.com/api/rgpd-ops/consume-access", { method: "POST", headers: { origin: "https://evil.example" }, body: new URLSearchParams({ token }) });
    const post = await consumePOST({ request: req, url: new URL(req.url), cookies: {} as never, clientAddress: "1.1.1.1", redirect: (l: string, s: number) => new Response(null, { status: s, headers: { location: l } }) } as never);
    check("magic link: POST desde otro origen rechazado antes de consumir", post.status === 303 && (post.headers.get("location") ?? "").includes("enlace-invalido"));
  });
}

// ------------------------------------------------------------------ Origin
{
  const url = new URL("https://iaoperators.com/api/rgpd-ops/workspace");
  const req = (h: Record<string, string>) => new Request(url, { method: "PATCH", headers: h });
  check("Origin: propio aceptado", isAllowedOrigin(req({ origin: "https://iaoperators.com" }), url));
  check("Origin: ajeno rechazado", !isAllowedOrigin(req({ origin: "https://evil.example" }), url));
  check("Origin: ausente rechazado", !isAllowedOrigin(req({}), url));
  check("Origin: null + same-origin aceptado", isAllowedOrigin(req({ origin: "null", "sec-fetch-site": "same-origin" }), url));
}

// ------------------------------------------------------------------ validación de entidades
{
  const now = new Date("2026-10-13T10:00:00Z");
  const minimos: Record<EntitySlug, Record<string, unknown>> = {
    tratamientos: { name: "Clientes" },
    proveedores: { name: "CRM" },
    captacion: { name: "Formulario" },
    solicitudes: { reference: "SOL-1", received_on: "2026-01-31" },
    incidentes: { reference: "INC-1", detected_at: "2026-10-12T08:00:00Z" },
    tareas: { title: "Hacer algo" },
    evidencias: { title: "Contrato CRM" },
    revisiones: { period: "2026-T4" },
  };
  const malas: string[] = [];
  for (const slug of ENTITY_SLUGS) {
    const ok = validateCreate(slug, minimos[slug], now);
    if (!ok.ok) malas.push(`${slug}: mínimo rechazado ${JSON.stringify(ok.issues)}`);
    for (const forbidden of ["id", "workspace_id", "version", "created_at", "seed_key", "order_id"]) {
      const r = validateCreate(slug, { ...minimos[slug], [forbidden]: "x" }, now);
      if (r.ok || !r.issues.some((i) => i.field === forbidden)) malas.push(`${slug}: acepta ${forbidden}`);
    }
    const empty = validateCreate(slug, {}, now);
    if (empty.ok) malas.push(`${slug}: acepta alta vacía`);
    for (const f of ENTITIES[slug].fields) {
      if (f.type === "text") {
        const r = validatePatch(slug, { [f.key]: "a".repeat(f.max + 1) }, now);
        if (r.ok) malas.push(`${slug}.${f.key}: acepta texto demasiado largo`);
      }
      if (f.type === "enum") {
        const r = validatePatch(slug, { [f.key]: "valor-inventado" }, now);
        if (r.ok) malas.push(`${slug}.${f.key}: acepta enum desconocido`);
      }
    }
  }
  check("validación: mínimos válidos, campos internos rechazados, límites y enums en las 8 entidades", malas.length === 0, malas.slice(0, 5).join("\n       "));
  const sol = validateCreate("solicitudes", { reference: "SOL-1", received_on: "2026-01-31" }, now);
  check("solicitudes: plazo de un mes calculado en el servidor (31/1 → 28/2)", sol.ok && sol.values.due_on === "2026-02-28" && sol.values.extended_due_on === null);
  const ext = validatePatch("solicitudes", { received_on: "2026-03-15", extended: true }, now);
  check("solicitudes: prórroga → +3 meses", ext.ok && ext.values.due_on === "2026-04-15" && ext.values.extended_due_on === "2026-06-15");
  const solo = validatePatch("solicitudes", { extended: true }, now);
  check("solicitudes: prórroga sin fecha de recepción rechazada (campos juntos)", !solo.ok);
  const cliente = validatePatch("solicitudes", { due_on: "2030-01-01" }, now);
  check("solicitudes: el cliente no puede fijar el plazo", !cliente.ok);
  const refEmail = validateCreate("solicitudes", { reference: "ana@empresa.com", received_on: "2026-10-01" }, now);
  check("solicitudes: referencia con email rechazada", !refEmail.ok);
  const notas = validatePatch("incidentes", { description: "Se envió un email a juan.perez@gmail.com por error" }, now);
  check("texto libre: emails rechazados", !notas.ok);
  check("texto libre: DNI, NIE y teléfonos detectados", containsContactData("DNI 12345678Z") && containsContactData("NIE X1234567L") && containsContactData("llamar al 612 345 678") && containsContactData("+34 612345678"));
  check("texto libre: textos normales permitidos", !containsContactData("Durante la relación y 6 años después") && !containsContactData("SOL-2026-001"));
  const rol = validatePatch("tareas", { owner_role: "ana@empresa.com" }, now);
  check("tareas: responsable como rol (sin emails ni números)", !rol.ok && validatePatch("tareas", { owner_role: "Marketing" }, now).ok);
  const hecha = validatePatch("tareas", { status: "hecha" }, now);
  check("tareas: completed_at derivado en el servidor", hecha.ok && typeof hecha.values.completed_at === "string");
  const futuro = validatePatch("incidentes", { detected_at: new Date(Date.now() + 5 * 86_400_000).toISOString() }, now);
  check("incidentes: fecha de constancia futura rechazada", !futuro.ok);
  const fecha = validatePatch("proveedores", { next_review_on: "2026-02-30" }, now);
  check("fechas: día inexistente rechazado", !fecha.ok);
  check("fechas: suma de meses prudente", addMonths("2026-01-31", 1) === "2026-02-28" && addMonths("2024-01-31", 1) === "2024-02-29" && addMonths("2026-12-15", 1) === "2027-01-15");
  const perfil = validateProfile({ rol: "responsable", senales: ["ninguna", "menores"] });
  check("perfil: «ninguna» no se combina", !perfil.ok);
  const perfilExtra = validateProfile({ rol: "responsable", is_admin: true });
  check("perfil: campos desconocidos rechazados", !perfilExtra.ok);
  check("revisión: checklist con claves fijas", !validatePatch("revisiones", { checklist: { hack: true } }, now).ok && validatePatch("revisiones", { checklist: { perfil: true } }, now).ok);
}

// ------------------------------------------------------------------ servicio: IDOR y concurrencia
function createFakeRepo() {
  type Row = Record<string, unknown> & { id: string; workspace_id: string; version: number };
  const rows = new Map<string, Row & { slug: EntitySlug }>();
  const ws = new Map<string, { version: number; profile: Record<string, unknown> }>();
  let seq = 0;
  const repo: WorkspaceRepo = {
    async findWorkspaceId() {
      return null;
    },
    async ensureWorkspace() {
      return { workspace_id: "x", created: false };
    },
    async snapshot() {
      return null;
    },
    async createEntity(workspaceId, slug, values) {
      const id = `33333333-0000-4000-8000-${String(++seq).padStart(12, "0")}`;
      const row = { ...values, id, workspace_id: workspaceId, version: 1, slug };
      rows.set(id, row);
      return { status: "ok", row };
    },
    async updateEntity(workspaceId, slug, id, version, patch): Promise<RepoResult> {
      const r = rows.get(id);
      if (!r || r.workspace_id !== workspaceId || r.slug !== slug) return { status: "not_found" };
      if (r.version !== version) return { status: "conflict", current: { ...r } };
      Object.assign(r, patch, { version: r.version + 1 });
      return { status: "ok", row: { ...r } };
    },
    async deleteEntity(workspaceId, slug, id, version): Promise<RepoResult> {
      const r = rows.get(id);
      if (!r || r.workspace_id !== workspaceId || r.slug !== slug) return { status: "not_found" };
      if (r.version !== version) return { status: "conflict", current: { ...r } };
      rows.delete(id);
      return { status: "ok", row: { id } };
    },
    async updateProfile(workspaceId, version, profile): Promise<RepoResult> {
      const w = ws.get(workspaceId) ?? { version: 1, profile: {} };
      ws.set(workspaceId, w);
      if (w.version !== version) return { status: "conflict", current: { id: workspaceId, order_id: "secreto", version: w.version, profile: w.profile } };
      w.version++;
      w.profile = profile;
      return { status: "ok", row: { id: workspaceId, order_id: "secreto", version: w.version, profile } };
    },
    async logEvent() {},
  };
  return { repo, rows };
}
{
  const { repo, rows } = createFakeRepo();
  const A = "44444444-0000-4000-8000-00000000000a";
  const B = "44444444-0000-4000-8000-00000000000b";
  const c = await serviceCreate(repo, A, "tareas", { values: { title: "Revisar CRM" } });
  const id = (c.body.row as { id: string }).id;
  check("servicio: alta 201", c.status === 201);
  const idor = await serviceUpdate(repo, B, "tareas", id, { version: 1, values: { title: "Hackeo" } });
  check("IDOR: un id de otro espacio da 404 y no cambia nada", idor.status === 404 && rows.get(id)!.title === "Revisar CRM");
  const idorDel = await serviceDelete(repo, B, "tareas", id, { version: 1 });
  check("IDOR: borrar un id de otro espacio da 404", idorDel.status === 404 && rows.has(id));
  const wrongEntity = await serviceUpdate(repo, A, "proveedores", id, { version: 1, values: { name: "x" } });
  check("IDOR: id válido con otro módulo da 404", wrongEntity.status === 404);
  const u1 = await serviceUpdate(repo, A, "tareas", id, { version: 1, values: { title: "Pestaña 1" } });
  const u2 = await serviceUpdate(repo, A, "tareas", id, { version: 1, values: { title: "Pestaña 2" } });
  check("concurrencia: la segunda pestaña recibe 409 con la versión actual", u1.status === 200 && u2.status === 409 && (u2.body.current as { title: string }).title === "Pestaña 1");
  const sinVersion = await serviceUpdate(repo, A, "tareas", id, { values: { title: "x" } });
  check("concurrencia: sin versión → 400", sinVersion.status === 400);
  const mass = await serviceUpdate(repo, A, "tareas", id, { version: 2, values: { workspace_id: B } });
  check("mass assignment: workspace_id rechazado antes de la BD", mass.status === 400 && rows.get(id)!.workspace_id === A);
  const unknown = await serviceCreate(repo, A, "rgpd_ops_orders", { values: { title: "x" } });
  check("módulo desconocido: 404", unknown.status === 404);
  const badId = await serviceUpdate(repo, A, "tareas", "1 or 1=1", { version: 1, values: { title: "x" } });
  check("id no UUID: 404", badId.status === 404);
  const del = await serviceDelete(repo, A, "tareas", id, { version: 1 });
  check("borrado con versión antigua: 409", del.status === 409 && rows.has(id));
  const p1 = await serviceUpdateProfile(repo, A, { version: 1, profile: { rol: "responsable" } });
  const p2 = await serviceUpdateProfile(repo, A, { version: 1, profile: { rol: "encargado" } });
  check("perfil: versión optimista y sin id de pedido en la respuesta", p1.status === 200 && p2.status === 409 && !JSON.stringify(p1.body).includes("secreto") && !JSON.stringify(p2.body).includes("secreto"));
}

// ------------------------------------------------------------------ exportaciones y panel
function sampleSnapshot(): WorkspaceSnapshot {
  const base = { workspace_id: "w", version: 1, notes: "", created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" };
  return {
    workspace: { id: "w", order_id: "o", product_version: "1.0.0", schema_version: 1, version: 3, profile: { empresa: "Agencia Demo", rol: "responsable", senales: ["menores"] }, created_at: base.created_at, updated_at: base.updated_at },
    tratamientos: [
      { ...base, id: "t1", name: "=HYPERLINK(\"http://evil\")", purpose: "+cmd|' /C calc'!A0", data_subjects: ["clientes"], data_categories: ["contacto"], recipients: "", transfers: "no", transfer_details: "", retention: "-2+3", security_measures: "@SUM(1)", legal_basis: "por_determinar", legal_basis_note: "", status: "borrador", last_reviewed_on: null },
    ],
    proveedores: [
      { ...base, id: "p1", name: "CRM", service_category: "crm", role_estimate: "encargado", location: "fuera_eee", transfer_mechanism: "por_determinar", dpa_status: "pendiente", dpa_reference: "", last_review_on: null, next_review_on: "2026-09-01" },
    ],
    captacion: [],
    solicitudes: [
      { ...base, id: "s1", reference: "SOL-1", request_type: "acceso", received_on: "2026-09-01", due_on: "2026-10-01", extended: false, extended_due_on: null, extension_notified_on: null, status: "en_curso", responded_on: null },
      { ...base, id: "s2", reference: "SOL-2", request_type: "supresion", received_on: "2026-09-15", due_on: "2026-10-15", extended: false, extended_due_on: null, extension_notified_on: null, status: "recibida", responded_on: null },
    ],
    incidentes: [
      { ...base, id: "i1", reference: "INC-1", detected_at: new Date(Date.now() - 10 * 3_600_000).toISOString(), data_categories: [], affected_scope: "pocos", description: "", internal_assessment: "alto_riesgo", escalation_decision: "pendiente", decision_reason: "", measures: "", aepd_notified_at: null, subjects_communicated_at: null, status: "abierto", closed_at: null },
    ],
    tareas: SEED_TASKS.map((t, i) => ({ ...base, id: `k${i}`, title: t.title, area: t.area, owner_role: t.owner_role, priority: t.priority, due_on: i === 0 ? "2026-10-01" : "2026-12-31", status: i === 1 ? "hecha" : "pendiente", completed_at: null, seed_key: t.seed_key })),
    evidencias: [],
    revisiones: [],
    auditoria: [{ id: "a1", occurred_at: base.created_at, actor: "sistema", action: "workspace_created", entity: null, entity_id: null, fields: [], detail: null }],
  };
}
{
  const snap = sampleSnapshot();
  const now = new Date("2026-10-13T10:00:00Z");
  const rat = buildCsv("rat", snap, now);
  check("CSV RAT: marca de BORRADOR, versión y fecha", rat.csv.includes("BORRADOR") && rat.csv.includes(`v${RGPD_OPS_PRODUCT.version}`) && rat.csv.includes("2026-10-13"));
  const lines = rat.csv.replace(/^﻿/, "").split("\r\n");
  const dataLine = lines.find((l) => l.includes("HYPERLINK"))!;
  const cells = dataLine.split(";").map((c) => c.replace(/^"|"$/g, ""));
  check(
    "CSV: ninguna celda empieza por = + - @",
    cells.every((c) => !/^[=+\-@]/.test(c)) && csvCell("＝1+1").startsWith("'") && csvCell("\t=1").startsWith("'"),
    dataLine,
  );
  const todos = CSV_TYPES.map((t) => buildCsv(t, snap, now));
  check("CSV: todos los tipos con BOM, separador ; y aviso legal", todos.every((x) => x.csv.startsWith("﻿") && x.csv.includes(";") && /no constituye asesoramiento jurídico/i.test(x.csv)));
  check("CSV: plantilla genérica sigue escapando", toCsv([{ key: "a", label: "A" }], [{ a: "=1" }]).includes("'=1"));
  const backup = buildBackup(snap, now);
  const json = JSON.stringify(backup);
  check("JSON: formato y versión declarados, aviso y borrador", backup.format === "rgpd-ops-backup" && backup.formatVersion === 1 && backup.product.version === RGPD_OPS_PRODUCT.version && json.includes("no certifica"));
  check("JSON: sin id de pedido ni workspace_id en las filas", !json.includes('"order_id"') && !json.includes('"workspace_id"'));
  const client = toClientSnapshot(snap);
  check("snapshot al navegador: sin id de pedido", !("order_id" in client.workspace));

  const d = buildDashboard(client, now);
  check("panel: solicitud fuera de plazo → alerta alta", d.alerts.some((a) => a.level === "alto" && a.text.includes("SOL-1")));
  check("panel: solicitud que vence pronto → alerta media", d.alerts.some((a) => a.level === "medio" && a.text.includes("SOL-2")));
  const d2 = buildDashboard(client, new Date());
  check("panel: incidente abierto sin decisión → reloj de 72 h", d2.alerts.some((a) => a.text.includes("INC-1") && a.text.includes("72 horas")));
  check("panel: alto riesgo valorado → aviso sin decidir por la empresa", d2.alerts.some((a) => a.text.includes("INC-1") && a.text.includes("revisadlo con un profesional")));
  check("panel: señales de riesgo → revisión profesional recomendada", d.professionalReview.recommended && d.alerts[0].level === "alto");
  check("panel: tareas vencidas y revisión pendiente", d.tasks.overdue.length === 1 && d.reviewOverdue);
  check("panel: progreso entre 0 y 100 y 7 módulos", d.progress >= 0 && d.progress <= 100 && d.modules.length === 7);
  check("panel: proveedor fuera del EEE sin garantía → alerta", d.alerts.some((a) => a.module === "proveedores" && a.text.includes("sin garantía")));
  const textoPanel = JSON.stringify(d);
  check("panel: nunca decide notificar ni certifica", !/debes notificar|cumples|garantiza|certifica/i.test(textoPanel));
}

// ------------------------------------------------------------------ analítica, precio y emails
{
  const clean = cleanRgpdOpsParams({ module_id: "tratamientos", segment: "agencia:ops", error_code: "ana@empresa.com", ...({ email: "a@b.es", empresa: "Demo" } as object) } as never);
  check("analítica: lista blanca, sin emails ni campos libres", JSON.stringify(clean) === JSON.stringify({ module_id: "tratamientos", segment: "agencia:ops" }));
  const okPrice = { active: true, type: "one_time", currency: "eur", unit_amount: 14900, tax_behavior: "exclusive" } as const;
  check("precio: Price correcto pasa", priceProblems(okPrice, true).length === 0 && priceProblems({ ...okPrice, tax_behavior: "unspecified" } as never, false).length === 0);
  check("precio: importe distinto bloquea la venta", priceProblems({ ...okPrice, unit_amount: 5900 }, true).includes("price_amount_mismatch"));
  check("precio: suscripción, moneda o inactivo bloquean", priceProblems({ ...okPrice, type: "recurring" } as never, true).includes("price_not_one_time") && priceProblems({ ...okPrice, currency: "usd" }, true).includes("price_currency_mismatch") && priceProblems({ ...okPrice, active: false }, true).includes("price_inactive"));
  check("precio: IVA incluido bloquea (se anuncia + IVA)", priceProblems({ ...okPrice, tax_behavior: "inclusive" }, true).length > 0 && priceProblems({ ...okPrice, tax_behavior: "inclusive" }, false).length > 0 && taxRateProblems({ active: true, inclusive: true }).length > 0);
  const md = opsMetadata("6f1c1f3e-8a4b-4c2d-9e1f-0a1b2c3d4e5f");
  check("checkout: metadatos solo producto, versión y responseId", Object.keys(md).sort().join(",") === "assessment_response_id,product_key,product_version");
  check("checkout: responseId no válido no viaja", !("assessment_response_id" in opsMetadata('{"x":1}')));
  const e = buildAccessEmail({ to: "a@b.es", magicLink: "https://iaoperators.com/api/rgpd-ops/consume-access?token=TOK", expiresAt: new Date(), ttlMinutes: 60, accessExpiresAt: "2027-10-13T00:00:00Z", requestAccessUrl: "https://iaoperators.com/es/cumplimiento/rgpd/ops/acceso/", purpose: "purchase", invoiceByStripe: true });
  check("email de acceso: enlace, caducidad, transaccional y aviso legal", e.html.includes("TOK") && e.html.includes("60 minutos") && e.html.includes("no te suscribe") && /no certifica el cumplimiento/.test(e.html) && !e.subject.includes("TOK"));
}

// ------------------------------------------------------------------ contenido
{
  const guiaIds = MODULE_GUIDES.map((g) => g.id);
  check("contenido: guía por módulo con fuentes oficiales", ["perfil", "tratamientos", "proveedores", "captacion", "solicitudes", "incidentes", "plan"].every((id) => guiaIds.includes(id)) && MODULE_GUIDES.filter((g) => g.id !== "exportaciones").every((g) => g.fuentes.length > 0));
  check("contenido: landing y producto con los mismos módulos", RGPD_OPS_PUBLIC_MODULES.length === 9);
  check("contenido: checklist de revisión alineada con el esquema", REVIEW_CHECKLIST.map((r) => r.key).join() === [...REVIEW_KEYS].join());
  check("contenido: tareas semilla con claves únicas y áreas válidas", new Set(SEED_TASKS.map((t) => t.seed_key)).size === SEED_TASKS.length && SEED_TASKS.every((t) => ENTITIES.tareas.fields.find((f) => f.key === "area")!.type === "enum"));
  const texto = JSON.stringify({ MODULE_GUIDES, SEED_TASKS, REVIEW_CHECKLIST });
  check("contenido: sin promesas de cumplimiento", !/garantiza(mos)? el cumplimiento|certificado rgpd|100\s?% conforme|cumples el rgpd/i.test(texto));
  check("contenido: centinela definido", RGPD_OPS_CONTENT_SENTINEL.includes("paid-only"));
}

// ------------------------------------------------------------------ logs
{
  const joined = logs.join("\n");
  check("logs: sin emails, nombres ni tokens", !/@ejemplo\.es|comprador@|Ana Pérez|token=/i.test(joined), joined.split("\n").find((l) => /@|token=|Ana/.test(l)) ?? "");
  const json = logs.filter((l) => l.startsWith("{"));
  check("logs: JSON con scope, action y status", json.length > 0 && json.every((l) => { try { const j = JSON.parse(l); return j.scope === "rgpd-ops" && j.action && j.status; } catch { return false; } }));
}

console.log(fallos ? `\n${fallos} fallo(s)` : "\nTodos los casos OK");
process.exit(fallos ? 1 : 0);
