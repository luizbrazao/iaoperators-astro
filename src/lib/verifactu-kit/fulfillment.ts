// Lógica de negocio del webhook y de la emisión de enlaces de acceso.
//
// Garantías:
// - El acceso se concede solo con el pago confirmado (payment_status "paid").
// - Se concede una sola vez (claimAccessGrant), aunque Stripe reenvíe eventos.
// - Un fallo de email NO invalida el pedido: queda marcado como "failed" y el
//   comprador (o soporte) puede pedir un enlace nuevo.

import type Stripe from "stripe";
import { KIT_PRODUCT } from "@/data/verifactu-kit";
import { getEmailBaseUrl, getMagicLinkTtlMinutes, readEnv } from "./env";
import { sendAccessEmail, sendInternalSaleEmail } from "./email";
import { errorCode, kitLog } from "./log";
import { accessExpiry } from "./state";
import * as storage from "./storage";
import type { KitOrder, TokenPurpose } from "./storage";
import { isKitSession, orderInputFromSession } from "./stripe";

export const CONSUME_PATH = "/api/verifactu-kit/consume-access";

/**
 * Dependencias con efectos (base de datos y email). Inyectables para que
 * scripts/test-verifactu-kit.ts pruebe la idempotencia con dobles en memoria
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
}

export const defaultDeps: FulfillmentDeps = {
  upsertOrderFromSession: storage.upsertOrderFromSession,
  claimAccessGrant: storage.claimAccessGrant,
  createAccessToken: storage.createAccessToken,
  setAccessEmailStatus: storage.setAccessEmailStatus,
  applyRefund: storage.applyRefund,
  sendAccessEmail,
  sendInternalSaleEmail,
};

/** Crea un magic link y lo envía. Nunca lanza por el email; sí por la base de datos. */
export async function issueAccessLink(
  order: KitOrder,
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
    requestAccessUrl: `${base}${KIT_PRODUCT.paths.acceso}`,
    purpose,
    invoiceByStripe: (readEnv("VERIFACTU_KIT_STRIPE_INVOICE_CREATION") ?? "true").toLowerCase() !== "false",
  });
  await deps.setAccessEmailStatus(order.id, result.ok ? "sent" : "failed").catch((error) =>
    kitLog({ request_id: requestId, order_id: order.id, action: "email_status_update", status: "error", error_code: errorCode(error) }),
  );
  kitLog({
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
  order: KitOrder,
  requestId: string,
  deps: FulfillmentDeps = defaultDeps,
): Promise<"granted" | "already_granted" | "not_paid"> {
  if (order.payment_status !== "paid") return "not_paid";
  const paidAt = order.paid_at ? new Date(order.paid_at) : new Date();
  const claimed = await deps.claimAccessGrant(order.id, accessExpiry(paidAt, KIT_PRODUCT.updatesMonths));
  if (!claimed) return "already_granted";

  let accessEmailOk = false;
  try {
    accessEmailOk = (await issueAccessLink(claimed, "purchase", requestId, deps)).ok;
  } catch (error) {
    // El acceso ya está concedido. Si el token o el email fallan, no se relanza:
    // un reintento de Stripe no volvería a enviarlo (el claim ya está hecho) y
    // el comprador puede pedir un enlace nuevo desde la web.
    kitLog({ request_id: requestId, order_id: claimed.id, action: "access_email_purchase", status: "error", error_code: errorCode(error) });
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
  });
  if (!internal.ok) {
    kitLog({ request_id: requestId, order_id: claimed.id, action: "internal_sale_email", status: "error", error_code: internal.code });
  }

  kitLog({ request_id: requestId, order_id: claimed.id, action: "access_granted", status: "ok" });
  return "granted";
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

/** Procesa un evento ya verificado. "ignored" = no es del Kit o no aplica. */
export async function handleStripeEvent(
  event: Stripe.Event,
  requestId: string,
  deps: FulfillmentDeps = defaultDeps,
): Promise<"processed" | "ignored"> {
  if (SESSION_EVENTS.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!isKitSession(session)) return "ignored";

    const input = orderInputFromSession(session, { priceId: readEnv("VERIFACTU_KIT_STRIPE_PRICE_ID") ?? "" });
    if (event.type === "checkout.session.async_payment_succeeded") input.paymentStatus = "paid";
    if (event.type === "checkout.session.async_payment_failed") input.paymentStatus = "failed";

    const order = await deps.upsertOrderFromSession(input);
    kitLog({
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
      kitLog({
        request_id: requestId,
        stripe_event_id: event.id,
        order_id: order.id,
        action: "grant_access",
        status: grant === "granted" ? "ok" : "skipped",
        detail: grant,
      });
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
    kitLog({
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
