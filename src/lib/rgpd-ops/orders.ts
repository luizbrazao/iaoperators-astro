// Persistencia de pedidos, enlaces de acceso, eventos de Stripe y rate limit de
// RGPD Ops (service role, solo server-side). Mismo diseño que el Kit
// VERI*FACTU, con tablas propias (rgpd_ops_*). Duplicación deliberada: los
// nombres de tablas y el producto son distintos y el código es corto.
//
// Toda la idempotencia vive en la base de datos:
// - stripe_checkout_session_id UNIQUE → una sesión, un pedido.
// - stripe_payment_intent_id UNIQUE → un pago, un pedido.
// - stripe_event_id PRIMARY KEY → un evento se procesa una vez.
// - access_granted_at con UPDATE condicional → un solo email de compra.
// - consumed_at con UPDATE condicional → cada magic link sirve una sola vez.
// - rgpd_ops_workspaces.order_id UNIQUE → un espacio de trabajo por pedido.

import { generateAccessToken, hashAccessToken } from "../commerce/tokens";
import {
  nextAccessStatus,
  nextPaymentStatus,
  type AccessStatus,
  type PaymentStatus,
} from "../commerce/payment-state";
import { db, fail } from "./db";

const ORDERS = "rgpd_ops_orders";
const TOKENS = "rgpd_ops_access_tokens";
const EVENTS = "rgpd_ops_webhook_events";

export interface OpsOrder {
  id: string;
  email: string;
  customer_name: string | null;
  company_name: string | null;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_price_id: string;
  product_key: string;
  product_version: string;
  amount_total: number;
  currency: string;
  payment_status: PaymentStatus;
  access_status: AccessStatus;
  assessment_response_id: string | null;
  access_granted_at: string | null;
  access_expires_at: string | null;
  access_email_status: "pending" | "sent" | "failed";
  access_email_sent_at: string | null;
  last_access_at: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  refunded_at: string | null;
}

// ---------------------------------------------------------------- pedidos

export async function getOrderById(id: string): Promise<OpsOrder | null> {
  const { data, error } = await db().from(ORDERS).select("*").eq("id", id).maybeSingle();
  if (error) fail(error, "order_select_failed");
  return (data as OpsOrder | null) ?? null;
}

export async function getOrderBySessionId(sessionId: string): Promise<OpsOrder | null> {
  const { data, error } = await db()
    .from(ORDERS)
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) fail(error, "order_select_failed");
  return (data as OpsOrder | null) ?? null;
}

export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<OpsOrder | null> {
  const { data, error } = await db()
    .from(ORDERS)
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (error) fail(error, "order_select_failed");
  return (data as OpsOrder | null) ?? null;
}

/** Pedidos con acceso vigente para un email (el más reciente primero). */
export async function findActiveOrdersByEmail(email: string): Promise<OpsOrder[]> {
  const { data, error } = await db()
    .from(ORDERS)
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("access_status", "active")
    .in("payment_status", ["paid", "partially_refunded"])
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) fail(error, "order_select_failed");
  return (data as OpsOrder[]) ?? [];
}

export interface OrderFromSession {
  checkoutSessionId: string;
  email: string;
  customerName: string | null;
  companyName: string | null;
  stripeCustomerId: string | null;
  paymentIntentId: string | null;
  priceId: string;
  productVersion: string;
  amountTotal: number;
  currency: string;
  paymentStatus: PaymentStatus;
  assessmentResponseId: string | null;
}

/**
 * Crea o actualiza el pedido de una Checkout Session. Seguro ante eventos
 * duplicados, concurrentes o fuera de orden: el estado solo avanza (state.ts).
 */
export async function upsertOrderFromSession(input: OrderFromSession): Promise<OpsOrder> {
  const nowIso = new Date().toISOString();
  let existing = await getOrderBySessionId(input.checkoutSessionId);

  if (!existing) {
    const row = {
      email: input.email.toLowerCase(),
      customer_name: input.customerName,
      company_name: input.companyName,
      stripe_customer_id: input.stripeCustomerId,
      stripe_checkout_session_id: input.checkoutSessionId,
      stripe_payment_intent_id: input.paymentIntentId,
      stripe_price_id: input.priceId,
      product_version: input.productVersion,
      amount_total: input.amountTotal,
      currency: input.currency,
      payment_status: input.paymentStatus,
      access_status: nextAccessStatus(null, input.paymentStatus),
      assessment_response_id: input.assessmentResponseId,
      paid_at: input.paymentStatus === "paid" ? nowIso : null,
    };
    const { data, error } = await db().from(ORDERS).insert(row).select("*").single();
    if (!error) return data as OpsOrder;
    // 23505: otra invocación creó el pedido a la vez. Se continúa como update.
    if (error.code !== "23505") fail(error, "order_insert_failed");
    existing = await getOrderBySessionId(input.checkoutSessionId);
    if (!existing) fail(error, "order_insert_conflict");
  }

  const payment = nextPaymentStatus(existing.payment_status, input.paymentStatus);
  const patch: Record<string, unknown> = {
    payment_status: payment,
    access_status: nextAccessStatus(existing.access_status, payment),
  };
  if (!existing.email && input.email) patch.email = input.email.toLowerCase();
  if (!existing.customer_name && input.customerName) patch.customer_name = input.customerName;
  if (!existing.company_name && input.companyName) patch.company_name = input.companyName;
  if (!existing.stripe_customer_id && input.stripeCustomerId) patch.stripe_customer_id = input.stripeCustomerId;
  if (!existing.stripe_payment_intent_id && input.paymentIntentId) patch.stripe_payment_intent_id = input.paymentIntentId;
  if (!existing.amount_total && input.amountTotal) patch.amount_total = input.amountTotal;
  if (payment === "paid" && !existing.paid_at) patch.paid_at = nowIso;

  const { data, error } = await db().from(ORDERS).update(patch).eq("id", existing.id).select("*").single();
  if (error) fail(error, "order_update_failed");
  return data as OpsOrder;
}

/**
 * Concede el acceso UNA vez. Devuelve el pedido si esta llamada es la que lo
 * concedió; null si ya estaba concedido o el pedido no está pagado.
 */
export async function claimAccessGrant(orderId: string, expiresAt: Date): Promise<OpsOrder | null> {
  const { data, error } = await db()
    .from(ORDERS)
    .update({
      access_status: "active",
      access_granted_at: new Date().toISOString(),
      access_expires_at: expiresAt.toISOString(),
    })
    .eq("id", orderId)
    .eq("payment_status", "paid")
    .is("access_granted_at", null)
    .select("*");
  if (error) fail(error, "order_grant_failed");
  return ((data as OpsOrder[]) ?? [])[0] ?? null;
}

export async function setAccessEmailStatus(orderId: string, status: "sent" | "failed") {
  const patch: Record<string, unknown> = { access_email_status: status };
  if (status === "sent") patch.access_email_sent_at = new Date().toISOString();
  const { error } = await db().from(ORDERS).update(patch).eq("id", orderId);
  if (error) fail(error, "order_email_status_failed");
}

export async function touchLastAccess(orderId: string) {
  const { error } = await db().from(ORDERS).update({ last_access_at: new Date().toISOString() }).eq("id", orderId);
  if (error) fail(error, "order_touch_failed");
}

/** Reembolso total → refunded + acceso revocado. Parcial → se conserva el acceso. */
export async function applyRefund(paymentIntentId: string, fully: boolean): Promise<OpsOrder | null> {
  const order = await getOrderByPaymentIntent(paymentIntentId);
  if (!order) return null;
  const payment = nextPaymentStatus(order.payment_status, fully ? "refunded" : "partially_refunded");
  const patch: Record<string, unknown> = {
    payment_status: payment,
    access_status: nextAccessStatus(order.access_status, payment),
  };
  if (payment === "refunded" && !order.refunded_at) patch.refunded_at = new Date().toISOString();
  const { data, error } = await db().from(ORDERS).update(patch).eq("id", order.id).select("*").single();
  if (error) fail(error, "order_refund_failed");
  return data as OpsOrder;
}

// ---------------------------------------------------------------- tokens

export type TokenPurpose = "purchase" | "resend" | "admin_resend";

/** Crea un magic link. Devuelve el token en claro UNA vez; solo se guarda el hash. */
export async function createAccessToken(
  orderId: string,
  purpose: TokenPurpose,
  ttlMinutes: number,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const { error } = await db().from(TOKENS).insert({
    order_id: orderId,
    token_hash: hashAccessToken(token),
    purpose,
    expires_at: expiresAt.toISOString(),
  });
  if (error) fail(error, "token_insert_failed");
  return { token, expiresAt };
}

/**
 * Consume un magic link de forma atómica: el UPDATE solo afecta a una fila no
 * consumida y no caducada. Dos clics simultáneos → solo uno obtiene el pedido.
 */
export async function consumeAccessToken(token: string): Promise<string | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await db()
    .from(TOKENS)
    .update({ consumed_at: nowIso })
    .eq("token_hash", hashAccessToken(token))
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .select("order_id");
  if (error) fail(error, "token_consume_failed");
  return ((data as { order_id: string }[]) ?? [])[0]?.order_id ?? null;
}

// ---------------------------------------------------------------- eventos

export type EventClaim = "new" | "retry" | "duplicate";

/**
 * Registra un evento de Stripe antes de procesarlo. Si ya se procesó (o se
 * ignoró), es un duplicado o un replay: no se vuelve a ejecutar nada.
 */
export async function claimWebhookEvent(eventId: string, eventType: string): Promise<EventClaim> {
  const { error } = await db()
    .from(EVENTS)
    .insert({ stripe_event_id: eventId, event_type: eventType, processing_status: "processing" });
  if (!error) return "new";
  if (error.code !== "23505") fail(error, "event_insert_failed");

  const { data, error: selectError } = await db()
    .from(EVENTS)
    .select("processing_status, attempts")
    .eq("stripe_event_id", eventId)
    .single();
  if (selectError) fail(selectError, "event_select_failed");
  const row = data as { processing_status: string; attempts: number };
  if (row.processing_status === "processed" || row.processing_status === "ignored") return "duplicate";

  const { error: updateError } = await db()
    .from(EVENTS)
    .update({ processing_status: "processing", attempts: (row.attempts ?? 1) + 1, error_message: null })
    .eq("stripe_event_id", eventId);
  if (updateError) fail(updateError, "event_update_failed");
  return "retry";
}

export async function finishWebhookEvent(
  eventId: string,
  status: "processed" | "ignored" | "failed",
  errorCode?: string,
) {
  const { error } = await db()
    .from(EVENTS)
    .update({
      processing_status: status,
      processed_at: status === "failed" ? null : new Date().toISOString(),
      error_message: errorCode ? errorCode.slice(0, 200) : null,
    })
    .eq("stripe_event_id", eventId);
  if (error) fail(error, "event_finish_failed");
}

// ---------------------------------------------------------------- rate limit

/** true si la petición entra en el límite. Lanza si la base de datos falla. */
export async function rateLimitHit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await db().rpc("rgpd_ops_rate_limit_hit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) fail(error, "rate_limit_failed");
  return data === true;
}
