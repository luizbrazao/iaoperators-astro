// Pruebas del Kit de Preparación VERI*FACTU (sin red, sin Supabase, sin Stripe real).
// Uso: npm run verifactu-kit:test
//
// Cubre: tokens y sesiones firmadas, máquina de estados del pedido, webhook con
// firmas reales de Stripe (generadas con el SDK), idempotencia y replay,
// reembolso, fallo de email, metadatos del checkout, CSV, Origin y contenido.
// La base de datos se sustituye por un doble en memoria que reproduce las
// restricciones de la migración (UNIQUE y UPDATE condicionales).

process.env.VERIFACTU_KIT_SESSION_SECRET = "test-secret-0123456789-abcdefghijklmnopqrstuvwxyz";
process.env.VERIFACTU_KIT_MAGIC_LINK_TTL_MINUTES = "60";
process.env.VERIFACTU_KIT_STRIPE_PRICE_ID = "price_test_kit";

import Stripe from "stripe";
import {
  generateAccessToken,
  hashAccessToken,
  signSession,
  verifySession,
  TOKEN_RE,
  isUuid,
} from "../src/lib/verifactu-kit/crypto";
import { nextPaymentStatus, isAccessAllowed, accessExpiry, paymentStatusFromSession } from "../src/lib/verifactu-kit/state";
import type { PaymentStatus } from "../src/lib/verifactu-kit/state";
import type { FulfillmentDeps } from "../src/lib/verifactu-kit/fulfillment";
import { processStripeWebhook, type WebhookDeps } from "../src/lib/verifactu-kit/webhook";
import { verifyWebhookEvent, kitMetadata } from "../src/lib/verifactu-kit/stripe";
import type { KitOrder, OrderFromSession, EventClaim } from "../src/lib/verifactu-kit/storage";
import { csvCell, toCsv } from "../src/lib/verifactu-kit/csv";
import { isAllowedOrigin } from "../src/lib/verifactu-kit/origin";
import { buildAccessEmail } from "../src/lib/verifactu-kit/email";
import { KIT_MODULES, KIT_DISCLAIMER, KIT_EXPORTS } from "../src/data/verifactu-kit-content";
import { KIT_PRODUCT, KIT_PUBLIC_MODULES } from "../src/data/verifactu-kit";
import { nextAccessStatus } from "../src/lib/verifactu-kit/state";

let fallos = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallos++;
  console.log(`${ok ? "PASS" : "FALLO"} · ${nombre}${!ok && detalle ? `\n       ${detalle}` : ""}`);
}

// Silencia los logs estructurados durante las pruebas (se comprueban aparte).
const logs: string[] = [];
const origLog = console.log;
const capture = (...args: unknown[]) => logs.push(args.map(String).join(" "));
function quiet<T>(fn: () => Promise<T>): Promise<T> {
  console.error = capture as typeof console.error;
  console.warn = capture as typeof console.warn;
  const prev = console.log;
  console.log = (...args: unknown[]) => {
    const s = args.map(String).join(" ");
    if (s.startsWith('{"scope":"verifactu-kit"')) logs.push(s);
    else prev(...args);
  };
  return fn().finally(() => {
    console.log = origLog;
  });
}

// ------------------------------------------------------------------ crypto
{
  const tokens = new Set(Array.from({ length: 2000 }, () => generateAccessToken()));
  check("tokens: 2000 únicos", tokens.size === 2000);
  const t = [...tokens][0];
  check("token: 32 bytes en base64url (43 caracteres)", TOKEN_RE.test(t), t);
  check("hash del token: SHA-256 hex", /^[0-9a-f]{64}$/.test(hashAccessToken(t)) && hashAccessToken(t) !== t);

  const secret = "s".repeat(40);
  const now = 1_800_000_000;
  const oid = "6f1c1f3e-8a4b-4c2d-9e1f-0a1b2c3d4e5f";
  const value = signSession({ v: 1, oid, iat: now, exp: now + 3600 }, secret);
  check("sesión: firma válida", verifySession(value, secret, now + 10)?.oid === oid);
  check("sesión: caducada se rechaza", verifySession(value, secret, now + 3601) === null);
  check("sesión: otro secreto se rechaza", verifySession(value, "x".repeat(40), now + 10) === null);
  const [body, sig] = value.split(".");
  const forged = Buffer.from(JSON.stringify({ v: 1, oid: "00000000-0000-4000-8000-000000000000", iat: now, exp: now + 3600 })).toString("base64url");
  check("sesión: payload alterado se rechaza", verifySession(`${forged}.${sig}`, secret, now + 10) === null);
  check("sesión: firma truncada se rechaza", verifySession(`${body}.${sig.slice(0, 10)}`, secret, now + 10) === null);
  check("sesión: basura se rechaza", verifySession("abc", secret, now) === null && verifySession("", secret, now) === null);
  const future = signSession({ v: 1, oid, iat: now + 7200, exp: now + 9000 }, secret);
  check("sesión: emitida en el futuro se rechaza", verifySession(future, secret, now) === null);
  check("isUuid", isUuid(oid) && !isUuid("1; drop table") && !isUuid(undefined));
}

// ------------------------------------------------------------------ estados
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
    ["partially_refunded", "paid", "partially_refunded"],
    ["partially_refunded", "refunded", "refunded"],
  ];
  const malos = casos.filter(([a, b, esperado]) => nextPaymentStatus(a, b) !== esperado);
  check("máquina de estados de pago (eventos fuera de orden)", malos.length === 0, JSON.stringify(malos));
  check("reembolso total revoca el acceso", nextAccessStatus("active", "refunded") === "revoked");
  check("reembolso parcial conserva el acceso", nextAccessStatus("active", "partially_refunded") === "active");
  check("cupón 100 % (no_payment_required) cuenta como pagado", paymentStatusFromSession("no_payment_required") === "paid");
  check("sesión 'unpaid' no concede nada", paymentStatusFromSession("unpaid") === "pending");

  const now = new Date("2026-10-12T10:00:00Z");
  const exp = accessExpiry(now, 12);
  check("acceso y actualizaciones: 12 meses", exp.toISOString().startsWith("2027-10-12"));
  check("acceso permitido: pagado y activo", isAccessAllowed({ payment_status: "paid", access_status: "active", access_expires_at: exp.toISOString() }, now));
  check("acceso denegado: caducado", !isAccessAllowed({ payment_status: "paid", access_status: "active", access_expires_at: "2026-10-01T00:00:00Z" }, now));
  check("acceso denegado: revocado", !isAccessAllowed({ payment_status: "refunded", access_status: "revoked", access_expires_at: null }, now));
  check("acceso denegado: pendiente de pago", !isAccessAllowed({ payment_status: "pending", access_status: "pending", access_expires_at: null }, now));
}

// ------------------------------------------------------------------ doble de la BD
function createFakeDb() {
  const orders = new Map<string, KitOrder>();
  const events = new Map<string, { status: string; attempts: number }>();
  const tokens = new Map<string, { orderId: string; expires: number; consumed: boolean }>();
  const sent = { access: 0, internal: 0, accessTo: [] as string[] };
  let failEmail = false;
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
      // Cede el turno como haría una llamada de red: expone carreras.
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      const now = new Date().toISOString();
      let o = bySession(input.checkoutSessionId);
      if (!o) {
        if (input.paymentIntentId && byPi(input.paymentIntentId)) throw Object.assign(new Error("dup pi"), { code: "23505" });
        o = {
          id: `00000000-0000-4000-8000-${String(++seq).padStart(12, "0")}`,
          email: input.email,
          customer_name: input.customerName,
          company_name: input.companyName,
          stripe_customer_id: input.stripeCustomerId,
          stripe_checkout_session_id: input.checkoutSessionId,
          stripe_payment_intent_id: input.paymentIntentId,
          stripe_price_id: input.priceId,
          product_key: KIT_PRODUCT.key,
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
      if (!o.stripe_payment_intent_id && input.paymentIntentId) o.stripe_payment_intent_id = input.paymentIntentId;
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
      if (payment === "refunded") o.refunded_at = new Date().toISOString();
      return { ...o };
    },
    async sendAccessEmail(input) {
      if (failEmail) return { ok: false as const, code: "resend_http_500" };
      sent.access++;
      sent.accessTo.push(input.magicLink);
      return { ok: true as const, code: "sent" };
    },
    async sendInternalSaleEmail() {
      sent.internal++;
      return { ok: true as const, code: "sent" };
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
    sent,
    deps: { ...webhook, verify: verifyWebhookEvent } as WebhookDeps,
    setFailEmail: (v: boolean) => (failEmail = v),
    failNextUpsert: () => (failUpsertOnce = true),
    consume(token: string) {
      const t = tokens.get(hashAccessToken(token));
      if (!t || t.consumed || t.expires <= Date.now()) return null;
      t.consumed = true;
      return t.orderId;
    },
  };
}

const WEBHOOK_SECRET = "whsec_test_secret_for_kit";
let evSeq = 0;

function sessionObject(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "cs_test_kit_1",
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    amount_total: 7139,
    currency: "eur",
    customer: "cus_test_1",
    customer_email: null,
    customer_details: { email: "Comprador@Ejemplo.es", name: "Ana Pérez", business_name: "Taller Pérez SL" },
    collected_information: null,
    payment_intent: "pi_test_1",
    metadata: { product_key: KIT_PRODUCT.key, product_version: KIT_PRODUCT.version, assessment_response_id: "6f1c1f3e-8a4b-4c2d-9e1f-0a1b2c3d4e5f" },
    ...over,
  };
}

function signed(type: string, object: unknown, opts: { id?: string; timestamp?: number } = {}) {
  const payload = JSON.stringify({
    id: opts.id ?? `evt_test_${++evSeq}`,
    object: "event",
    type,
    api_version: "2026-09-30",
    created: Math.floor(Date.now() / 1000),
    data: { object },
  });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET, timestamp: opts.timestamp });
  return { payload, header };
}

async function deliver(db: ReturnType<typeof createFakeDb>, ev: { payload: string; header: string }) {
  return processStripeWebhook({ rawBody: ev.payload, signature: ev.header, secret: WEBHOOK_SECRET, requestId: "test" }, db.deps);
}

await quiet(async () => {
  // a. Pago completado → un pedido, un acceso, un email.
  {
    const db = createFakeDb();
    const ev = signed("checkout.session.completed", sessionObject(), { id: "evt_a" });
    const r1 = await deliver(db, ev);
    const order = [...db.orders.values()][0];
    check("webhook: pago confirmado crea pedido y concede acceso", r1.status === 200 && db.orders.size === 1 && order.access_status === "active");
    check("webhook: email normalizado en minúsculas", order.email === "comprador@ejemplo.es");
    check("webhook: un email de acceso y un aviso interno", db.sent.access === 1 && db.sent.internal === 1);
    check("webhook: solo el id del test en el pedido", order.assessment_response_id === "6f1c1f3e-8a4b-4c2d-9e1f-0a1b2c3d4e5f");

    // b. Replay exacto del mismo evento.
    const r2 = await deliver(db, ev);
    check("webhook: replay del mismo evento no repite nada", r2.status === 200 && r2.body.duplicate === true && db.sent.access === 1 && db.orders.size === 1);

    // c. Otro evento de la misma sesión (p. ej. async_payment_succeeded).
    await deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject()));
    check("webhook: segundo evento de la misma sesión no reenvía acceso", db.sent.access === 1 && db.orders.size === 1);

    // Magic link de uso único.
    const link = db.sent.accessTo[0];
    const token = new URL(link).searchParams.get("token")!;
    check("magic link: apunta al endpoint de consumo", link.includes("/api/verifactu-kit/consume-access?token="));
    check("magic link: el token no se guarda en claro", !db.tokens.has(token) && db.tokens.has(hashAccessToken(token)));
    check("magic link: primer uso válido", db.consume(token) === order.id);
    check("magic link: segundo uso rechazado", db.consume(token) === null);

    // h. Reembolso total.
    const charge = { id: "ch_1", object: "charge", payment_intent: "pi_test_1", amount: 7139, amount_refunded: 7139, refunded: true };
    await deliver(db, signed("charge.refunded", charge));
    const after = [...db.orders.values()][0];
    check("reembolso total: refunded + acceso revocado", after.payment_status === "refunded" && after.access_status === "revoked" && !isAccessAllowed(after));
    // Un evento atrasado de pago no resucita el acceso.
    await deliver(db, signed("checkout.session.completed", sessionObject()));
    const later = [...db.orders.values()][0];
    check("reembolso: evento de pago atrasado no devuelve el acceso", later.payment_status === "refunded" && !isAccessAllowed(later) && db.sent.access === 1);
  }

  // d. Entregas concurrentes de eventos distintos de la misma sesión.
  {
    const db = createFakeDb();
    await Promise.all([
      deliver(db, signed("checkout.session.completed", sessionObject())),
      deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject())),
      deliver(db, signed("checkout.session.completed", sessionObject())),
    ]);
    check("concurrencia: un solo pedido y un solo email", db.orders.size === 1 && db.sent.access === 1, `orders=${db.orders.size} emails=${db.sent.access}`);
  }

  // e. Firma inválida y l. firma antigua (replay fuera de tolerancia).
  {
    const db = createFakeDb();
    const ev = signed("checkout.session.completed", sessionObject());
    const bad = await processStripeWebhook({ rawBody: ev.payload, signature: ev.header, secret: "whsec_otro", requestId: "t" }, db.deps);
    check("firma inválida: 400 y sin escrituras", bad.status === 400 && db.orders.size === 0 && db.events.size === 0);
    const tampered = await deliver(db, { payload: ev.payload.replace("7139", "1"), header: ev.header });
    check("cuerpo alterado: 400", tampered.status === 400 && db.orders.size === 0);
    const old = signed("checkout.session.completed", sessionObject(), { timestamp: Math.floor(Date.now() / 1000) - 3600 });
    const r = await deliver(db, old);
    check("firma con más de 5 minutos: 400 (replay)", r.status === 400 && db.orders.size === 0);
    const none = await processStripeWebhook({ rawBody: ev.payload, signature: null, secret: WEBHOOK_SECRET, requestId: "t" }, db.deps);
    check("sin cabecera de firma: 400", none.status === 400);
  }

  // f/g. Pago asíncrono.
  {
    const db = createFakeDb();
    await deliver(db, signed("checkout.session.completed", sessionObject({ id: "cs_async", payment_status: "unpaid", payment_intent: "pi_async" })));
    const pending = [...db.orders.values()][0];
    check("pago asíncrono: pedido pendiente sin acceso ni email", pending.payment_status === "pending" && pending.access_status === "pending" && db.sent.access === 0);
    await deliver(db, signed("checkout.session.async_payment_succeeded", sessionObject({ id: "cs_async", payment_status: "paid", payment_intent: "pi_async" })));
    check("pago asíncrono confirmado: acceso y un email", [...db.orders.values()][0].access_status === "active" && db.sent.access === 1);

    const db2 = createFakeDb();
    await deliver(db2, signed("checkout.session.completed", sessionObject({ id: "cs_f", payment_status: "unpaid", payment_intent: "pi_f" })));
    await deliver(db2, signed("checkout.session.async_payment_failed", sessionObject({ id: "cs_f", payment_status: "unpaid", payment_intent: "pi_f" })));
    const failed = [...db2.orders.values()][0];
    check("pago asíncrono fallido: failed, sin acceso", failed.payment_status === "failed" && failed.access_status === "pending" && db2.sent.access === 0);
  }

  // Reembolso parcial.
  {
    const db = createFakeDb();
    await deliver(db, signed("checkout.session.completed", sessionObject()));
    await deliver(db, signed("charge.refunded", { id: "ch", object: "charge", payment_intent: "pi_test_1", amount: 7139, amount_refunded: 1000, refunded: false }));
    const o = [...db.orders.values()][0];
    check("reembolso parcial: conserva el acceso", o.payment_status === "partially_refunded" && isAccessAllowed(o));
  }

  // i. Sesión de otro producto.
  {
    const db = createFakeDb();
    const r = await deliver(db, signed("checkout.session.completed", sessionObject({ metadata: { product_key: "otro" } })));
    check("otro producto: ignorado sin pedido", r.status === 200 && db.orders.size === 0 && db.events.get([...db.events.keys()][0])?.status === "ignored");
    const r2 = await deliver(db, signed("customer.created", { id: "cus" }));
    check("tipo de evento no gestionado: 200 ignorado", r2.status === 200 && r2.body.ignored === true);
  }

  // j. Fallo de email: el pedido pagado sigue válido.
  {
    const db = createFakeDb();
    db.setFailEmail(true);
    const r = await deliver(db, signed("checkout.session.completed", sessionObject()));
    const o = [...db.orders.values()][0];
    check(
      "fallo de email: 200, pedido pagado y activo, email marcado como fallido",
      r.status === 200 && o.payment_status === "paid" && o.access_status === "active" && o.access_email_status === "failed",
    );
  }

  // k. Fallo de base de datos → 500 → reintento de Stripe procesa una vez.
  {
    const db = createFakeDb();
    db.failNextUpsert();
    const ev = signed("checkout.session.completed", sessionObject(), { id: "evt_k" });
    const r1 = await deliver(db, ev);
    check("fallo de BD: 500 para que Stripe reintente", r1.status === 500 && db.events.get("evt_k")?.status === "failed");
    const r2 = await deliver(db, ev);
    check("reintento tras fallo: procesa y concede una vez", r2.status === 200 && db.sent.access === 1 && db.events.get("evt_k")?.attempts === 2);
  }
});

// Logs sin PII.
{
  const joined = logs.join("\n");
  check("logs: sin emails ni tokens", !/@ejemplo\.es|comprador/i.test(joined) && !/token=/.test(joined), joined.split("\n").find((l) => /@|token=/.test(l)) ?? "");
  check("logs: JSON estructurado con request_id y action", logs.length > 0 && logs.every((l) => { try { const j = JSON.parse(l); return j.action && j.request_id && j.status; } catch { return false; } }));
}

// ------------------------------------------------------------------ checkout
{
  const md = kitMetadata("6f1c1f3e-8a4b-4c2d-9e1f-0a1b2c3d4e5f");
  check(
    "checkout: metadatos solo con producto, versión y responseId",
    Object.keys(md).sort().join(",") === "assessment_response_id,product_key,product_version" && md.product_version === KIT_PRODUCT.version,
  );
  const md2 = kitMetadata('{"answers":{"sistema":"erp"}}');
  check("checkout: responseId inválido no viaja a Stripe", !("assessment_response_id" in md2));
}

// ------------------------------------------------------------------ CSV
{
  check("CSV: neutraliza fórmulas", csvCell("=HYPERLINK(\"x\")").startsWith("\"'=") && csvCell("+1") === "'+1" && csvCell("@SUM") === "'@SUM");
  check("CSV: escapa separador y comillas", csvCell('a;b"c') === '"a;b""c"');
  const csv = toCsv([{ key: "a", label: "Á" }], [{ a: "x" }]);
  check("CSV: BOM UTF-8 y CRLF", csv.startsWith("﻿") && csv.includes("\r\n"));
}

// ------------------------------------------------------------------ Origin
{
  const url = new URL("https://iaoperators.com/api/verifactu-kit/checkout");
  const req = (origin?: string) => new Request(url, { method: "POST", headers: origin ? { origin } : {} });
  check("Origin: propio aceptado", isAllowedOrigin(req("https://iaoperators.com"), url));
  check("Origin: ajeno rechazado", !isAllowedOrigin(req("https://evil.example"), url));
  check("Origin: ausente rechazado", !isAllowedOrigin(req(), url));
  const reqH = (h: Record<string, string>) => new Request(url, { method: "POST", headers: h });
  check("Origin null + Sec-Fetch-Site same-origin aceptado (formulario con no-referrer)", isAllowedOrigin(reqH({ origin: "null", "sec-fetch-site": "same-origin" }), url));
  check("Origin null + Sec-Fetch-Site cross-site rechazado", !isAllowedOrigin(reqH({ origin: "null", "sec-fetch-site": "cross-site" }), url));
  check("Sin Origin ni Sec-Fetch-Site rechazado", !isAllowedOrigin(reqH({}), url));
}

// ------------------------------------------------------------------ email de acceso
{
  const e = buildAccessEmail({
    to: "a@b.es",
    magicLink: "https://iaoperators.com/api/verifactu-kit/consume-access?token=TOKEN123",
    expiresAt: new Date(),
    ttlMinutes: 60,
    accessExpiresAt: "2027-10-12T00:00:00Z",
    requestAccessUrl: "https://iaoperators.com/es/cumplimiento/verifactu/kit/acceso/",
    purpose: "purchase",
    invoiceByStripe: true,
  });
  check("email de acceso: enlace, caducidad y aviso legal", e.html.includes("TOKEN123") && e.html.includes("60 minutos") && e.html.includes("no certifica el cumplimiento"));
  check("email de acceso: token fuera del asunto", !e.subject.includes("TOKEN"));
  check("email de acceso: declara que es transaccional", e.html.includes("no te suscribe a ninguna comunicación comercial"));
}

// ------------------------------------------------------------------ contenido
{
  const ids = new Set<string>();
  const problemas: string[] = [];
  for (const m of KIT_MODULES) {
    if (ids.has(m.id)) problemas.push(`id duplicado ${m.id}`);
    ids.add(m.id);
    if (!m.titulo || !m.objetivo || !m.version || !m.lastVerifiedAt) problemas.push(`${m.id}: faltan campos`);
    if (!m.contenido.length) problemas.push(`${m.id}: sin contenido`);
    if (!m.fuentes.length || m.fuentes.some((f) => !/^https:\/\/(www\.boe\.es|sede\.agenciatributaria\.gob\.es)\//.test(f.url)))
      problemas.push(`${m.id}: fuentes no oficiales o vacías`);
    if (!m.checklist.length && !m.semanas?.length) problemas.push(`${m.id}: sin checklist`);
    const text = JSON.stringify(m);
    if (/garantiza(mos)? (el )?cumplimiento|certifica(mos)? que cumples|ya cumples/i.test(text)) problemas.push(`${m.id}: promete cumplimiento`);
  }
  check("contenido: 9 módulos completos con fuentes oficiales", KIT_MODULES.length === 9 && problemas.length === 0, problemas.join(" · "));
  const requeridos = ["me-aplica", "proveedor", "inventario", "matriz", "email-proveedor", "email-gestoria", "dossier", "plan-30-dias", "integracion"];
  check("contenido: todos los recursos pedidos", requeridos.every((id) => ids.has(id)));
  const proveedor = KIT_MODULES.find((m) => m.id === "proveedor")!;
  check("contenido: checklist del proveedor con respuestas sí/no/pendiente/no aplica", proveedor.checklistMode === "respuesta");
  const inv = KIT_MODULES.find((m) => m.id === "inventario")!;
  const camposInv = ["software", "modulos", "puntos", "series", "anulaciones", "rectificativas", "devoluciones", "conectividad", "responsables"];
  check("contenido: inventario con todos los campos", camposInv.every((c) => inv.campos?.some((f) => f.id === c)));
  check("contenido: aviso legal sin promesa de cumplimiento", /no acredita/.test(KIT_DISCLAIMER));
  check("contenido: exportaciones definidas", Object.keys(KIT_EXPORTS).length === 4);
  check(
    "landing: índice público coincide con los módulos de pago",
    KIT_PUBLIC_MODULES.length === KIT_MODULES.length && KIT_PUBLIC_MODULES.every((p, i) => p.titulo === KIT_MODULES[i].titulo),
  );
  const arbol = KIT_MODULES[0].arbol!;
  const nodos = new Set(arbol.nodos.map((n) => n.id));
  const resultados = new Set(arbol.resultados.map((r) => r.id));
  const rotos = arbol.nodos.flatMap((n) => n.opciones).filter((o) => (o.next && !nodos.has(o.next)) || (o.result && !resultados.has(o.result)) || (!o.next && !o.result));
  check("árbol de decisión: sin ramas rotas", rotos.length === 0 && nodos.has(arbol.inicio), JSON.stringify(rotos));
}

console.log(fallos ? `\n${fallos} fallo(s)` : "\nTodos los casos OK");
process.exit(fallos ? 1 : 0);
