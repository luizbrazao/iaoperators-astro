// Núcleo del webhook de Stripe, separado de la ruta para poder probarlo.
//
// 1. Firma verificada con el cuerpo crudo (sin firma válida no se toca nada).
// 2. Evento registrado por stripe_event_id: un replay o un reintento de un
//    evento ya procesado no ejecuta nada (protección contra replay en BD).
// 3. Procesado y marcado. Si falla, 500 para que Stripe reintente; la
//    idempotencia del pedido y del acceso hace seguro el reintento.

import type Stripe from "stripe";
import { defaultDeps, handleStripeEvent, HANDLED_EVENTS, type FulfillmentDeps } from "./fulfillment";
import { errorCode, kitLog } from "./log";
import * as storage from "./storage";
import { verifyWebhookEvent } from "./stripe";

export interface WebhookDeps {
  verify: (rawBody: string, signature: string, secret: string) => Stripe.Event;
  claimWebhookEvent: typeof storage.claimWebhookEvent;
  finishWebhookEvent: typeof storage.finishWebhookEvent;
  fulfillment: FulfillmentDeps;
}

export const defaultWebhookDeps: WebhookDeps = {
  verify: verifyWebhookEvent,
  claimWebhookEvent: storage.claimWebhookEvent,
  finishWebhookEvent: storage.finishWebhookEvent,
  fulfillment: defaultDeps,
};

export interface WebhookOutcome {
  status: number;
  body: Record<string, unknown>;
}

export async function processStripeWebhook(
  input: { rawBody: string; signature: string | null; secret: string; requestId: string },
  deps: WebhookDeps = defaultWebhookDeps,
): Promise<WebhookOutcome> {
  const { rawBody, signature, secret, requestId } = input;
  if (!signature) {
    kitLog({ request_id: requestId, action: "webhook_verify", status: "denied", error_code: "signature_missing" });
    return { status: 400, body: { error: "missing signature" } };
  }

  let event: Stripe.Event;
  try {
    event = deps.verify(rawBody, signature, secret);
  } catch {
    kitLog({ request_id: requestId, action: "webhook_verify", status: "denied", error_code: "signature_invalid" });
    return { status: 400, body: { error: "invalid signature" } };
  }

  if (!HANDLED_EVENTS.includes(event.type)) {
    kitLog({ request_id: requestId, stripe_event_id: event.id, action: "webhook_event", status: "skipped", detail: event.type });
    return { status: 200, body: { received: true, ignored: true } };
  }

  let claim: storage.EventClaim;
  try {
    claim = await deps.claimWebhookEvent(event.id, event.type);
  } catch (error) {
    kitLog({ request_id: requestId, stripe_event_id: event.id, action: "webhook_claim", status: "error", error_code: errorCode(error) });
    return { status: 500, body: { error: "storage unavailable" } };
  }

  if (claim === "duplicate") {
    kitLog({ request_id: requestId, stripe_event_id: event.id, action: "webhook_event", status: "duplicate", detail: event.type });
    return { status: 200, body: { received: true, duplicate: true } };
  }

  try {
    const outcome = await handleStripeEvent(event, requestId, deps.fulfillment);
    await deps.finishWebhookEvent(event.id, outcome);
    kitLog({
      request_id: requestId,
      stripe_event_id: event.id,
      action: "webhook_event",
      status: outcome === "processed" ? "ok" : "skipped",
      detail: `${event.type}${claim === "retry" ? ":retry" : ""}`,
    });
    return { status: 200, body: { received: true } };
  } catch (error) {
    const code = errorCode(error);
    await deps.finishWebhookEvent(event.id, "failed", code).catch(() => undefined);
    kitLog({ request_id: requestId, stripe_event_id: event.id, action: "webhook_event", status: "error", error_code: code, detail: event.type });
    return { status: 500, body: { error: "processing failed" } };
  }
}
