// Lógica de negocio del webhook de RGPD Ops y de la emisión de enlaces.
//
// Garantías:
// - El acceso se concede solo con el pago confirmado (payment_status "paid").
// - Se concede una sola vez (claimAccessGrant), aunque Stripe reenvíe eventos.
// - El espacio de trabajo se crea de forma idempotente justo después del claim
//   (rgpd_ops_ensure_workspace). Si falla, NO se relanza: el enlace sale igual y
//   el espacio se crea en el primer acceso (red de seguridad en auth.ts).
// - Un fallo de email NO invalida el pedido: queda marcado como "failed" y el
//   comprador (o soporte) puede pedir un enlace nuevo.

import type Stripe from "stripe";
import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { getEmailBaseUrl, getMagicLinkTtlMinutes, readEnv } from "./env";
import { sendAccessEmail, sendInternalSaleEmail } from "./email";
import { errorCode, opsLog } from "./log";
import { accessExpiry } from "../commerce/payment-state";
import * as storage from "./orders";
import type { OpsOrder, TokenPurpose } from "./orders";
import { isOpsSession, orderInputFromSession } from "./stripe";
import { supabaseRepo } from "./workspace";

export const CONSUME_PATH = "/api/rgpd-ops/consume-access";

/**
 * Dependencias con efectos (base de datos y email). Inyectables para que
 * scripts/test-rgpd-ops.ts pruebe la idempotencia con dobles en memoria
 * que reproducen las restricciones de la migración.
 */
export interface FulfillmentDeps {
  upsertOrderFromSession: typeof storage.upsertOrderFromSession;
  claimAccessGrant: typeof storage.claimAccessGrant;
  createAccessToken: typeof storage.createAccessToken;
  setAccessEmailStatus: typeof storage.setAccessEmailStatus;
  applyRefund: typeof storage.applyRefund;
  sendAccessEmail: typeof sendAccessEmail;
  sendInternalSaleEmail: typeof sendInternalSaleEmail;
  ensureWorkspace: (orderId: string) => Promise<{ workspace_id: string; created: boolean }>;
}

export const defaultDeps: FulfillmentDeps = {
  upsertOrderFromSession: storage.upsertOrderFromSession,
  claimAccessGrant: storage.claimAccessGrant,
  createAccessToken: storage.createAccessToken,
  setAccessEmailStatus: storage.setAccessEmailStatus,
  applyRefund: storage.applyRefund,
  sendAccessEmail,
  sendInternalSaleEmail,
  ensureWorkspace: (orderId) => supabaseRepo.ensureWorkspace(orderId),
};

/** Crea un magic link y lo envía. Nunca lanza por el email; sí por la base de datos. */
export async function issueAccessLink(
  order: OpsOrder,
  purpose: TokenPurpose,
  requestId: string,
  deps: FulfillmentDeps = defaultDeps,
): Promise<{ ok: boolean; code: string }> {
  const ttlMinutes = getMagicLinkTtlMinutes();
  const { token, expiresAt } = await deps.createAccessToken(order.id, purpose, ttlMinutes);
  const base = getEmailBaseUrl();
  const result = await deps.sendAccessEmail({
    to: order.email,
    magicLink: `${base}${CONSUME_PATH}?token=${encodeURIComponent(token)}`,
    expiresAt,
    ttlMinutes,
    accessExpiresAt: order.access_expires_at,
    requestAccessUrl: `${base}${RGPD_OPS_PRODUCT.paths.acceso}`,
    purpose,
    invoiceByStripe: (readEnv("RGPD_OPS_STRIPE_INVOICE_CREATION") ?? "true").toLowerCase() !== "false",
  });
  await deps.setAccessEmailStatus(order.id, result.ok ? "sent" : "failed").catch((error) =>
    opsLog({ request_id: requestId, order_id: order.id, action: "email_status_update", status: "error", error_code: errorCode(error) }),
  );
  opsLog({
    request_id: requestId,
    order_id: order.id,
    action: `access_email_${purpose}`,
    status: result.ok ? "ok" : "error",
    error_code: result.ok ? undefined : result.code,
  });
  return result;
}

/** Concede el acceso de un pedido pagado. Idempotente. */
export async function grantAccessOnce(
  order: OpsOrder,
  requestId: string,
  deps: FulfillmentDeps = defaultDeps,
): Promise<"granted" | "already_granted" | "not_paid"> {
  if (order.payment_status !== "paid") return "not_paid";
  const paidAt = order.paid_at ? new Date(order.paid_at) : new Date();
  const claimed = await deps.claimAccessGrant(order.id, accessExpiry(paidAt, RGPD_OPS_PRODUCT.accessMonths));
  if (!claimed) return "already_granted";

  const workspaceOk = await ensureWorkspaceSafe(claimed.id, requestId, deps);

  let accessEmailOk = false;
  try {
    accessEmailOk = (await issueAccessLink(claimed, "purchase", requestId, deps)).ok;
  } catch (error) {
    // El acceso ya está concedido. Si el token o el email fallan, no se relanza:
    // un reintento de Stripe no volvería a enviarlo (el claim ya está hecho) y
    // el comprador puede pedir un enlace nuevo desde la web.
    opsLog({ request_id: requestId, order_id: claimed.id, action: "access_email_purchase", status: "error", error_code: errorCode(error) });
    await deps.setAccessEmailStatus(claimed.id, "failed").catch(() => undefined);
  }

  const internal = await deps.sendInternalSaleEmail({
    orderId: claimed.id,
    email: claimed.email,
    companyName: claimed.company_name,
    amountTotal: claimed.amount_total,
    currency: claimed.currency,
    assessmentResponseId: claimed.assessment_response_id,
    accessEmailOk,
    workspaceOk,
  });
  if (!internal.ok) {
    opsLog({ request_id: requestId, order_id: claimed.id, action: "internal_sale_email", status: "error", error_code: internal.code });
  }

  opsLog({ request_id: requestId, order_id: claimed.id, action: "access_granted", status: "ok" });
  return "granted";
}

/** Crea el espacio si no existe. Nunca lanza: devuelve si lo consiguió. */
export async function ensureWorkspaceSafe(orderId: string, requestId: string, deps: FulfillmentDeps = defaultDeps): Promise<boolean> {
  try {
    const r = await deps.ensureWorkspace(orderId);
    opsLog({ request_id: requestId, order_id: orderId, workspace_id: r.workspace_id, action: "workspace_ensure", status: "ok", detail: r.created ? "created" : "existing" });
    return true;
  } catch (error) {
    opsLog({ request_id: requestId, order_id: orderId, action: "workspace_ensure", status: "error", error_code: errorCode(error) });
    return false;
  }
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

const SESSION_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

export const HANDLED_EVENTS = [...SESSION_EVENTS, "charge.refunded"];

/** Procesa un evento ya verificado. "ignored" = no es de RGPD Ops o no aplica. */
export async function handleStripeEvent(
  event: Stripe.Event,
  requestId: string,
  deps: FulfillmentDeps = defaultDeps,
): Promise<"processed" | "ignored"> {
  if (SESSION_EVENTS.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!isOpsSession(session)) return "ignored";

    const input = orderInputFromSession(session, { priceId: readEnv("RGPD_OPS_STRIPE_PRICE_ID") ?? "" });
    if (event.type === "checkout.session.async_payment_succeeded") input.paymentStatus = "paid";
    if (event.type === "checkout.session.async_payment_failed") input.paymentStatus = "failed";

    const order = await deps.upsertOrderFromSession(input);
    opsLog({
      request_id: requestId,
      stripe_event_id: event.id,
      checkout_session_id: session.id,
      order_id: order.id,
      action: "order_upserted",
      status: "ok",
      detail: `${event.type}:${order.payment_status}`,
    });

    if (order.payment_status === "paid") {
      const grant = await grantAccessOnce(order, requestId, deps);
      opsLog({
        request_id: requestId,
        stripe_event_id: event.id,
        order_id: order.id,
        action: "grant_access",
        status: grant === "granted" ? "ok" : "skipped",
        detail: grant,
      });
      // Reintento o evento posterior de un pedido ya concedido: asegura el
      // espacio (idempotente) por si la primera creación falló.
      if (grant === "already_granted") await ensureWorkspaceSafe(order.id, requestId, deps);
    }
    return "processed";
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = idOf(charge.payment_intent as string | { id: string } | null);
    if (!paymentIntentId) return "ignored";
    const fully = charge.refunded === true || charge.amount_refunded >= charge.amount;
    const order = await deps.applyRefund(paymentIntentId, fully);
    if (!order) return "ignored";
    opsLog({
      request_id: requestId,
      stripe_event_id: event.id,
      order_id: order.id,
      action: "refund_applied",
      status: "ok",
      detail: `${order.payment_status}:${order.access_status}`,
    });
    return "processed";
  }

  return "ignored";
}
