// POST /api/rgpd-ops/webhook — eventos de Stripe. La lógica (firma,
// idempotencia por stripe_event_id, procesado) vive en
// src/lib/rgpd-ops/webhook.ts, que es lo que prueban los tests.
import type { APIRoute } from "astro";
import { getWebhookSecret, RgpdOpsConfigError } from "@/lib/rgpd-ops/env";
import { opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { processStripeWebhook } from "@/lib/rgpd-ops/webhook";
import { jsonResponse, methodNotAllowed } from "@/lib/rgpd-ops/http";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const requestId = requestIdFrom(request);
  let secret: string;
  try {
    secret = getWebhookSecret();
  } catch (error) {
    opsLog({
      request_id: requestId,
      action: "webhook_verify",
      status: "error",
      error_code: error instanceof RgpdOpsConfigError ? "rgpd_ops_config_missing" : "unknown_error",
    });
    return jsonResponse({ error: "not configured" }, 503);
  }
  // Cuerpo crudo: cualquier re-serialización del JSON invalida la firma.
  const rawBody = await request.text();
  const outcome = await processStripeWebhook({
    rawBody,
    signature: request.headers.get("stripe-signature"),
    secret,
    requestId,
  });
  return jsonResponse(outcome.body, outcome.status);
};

export const ALL: APIRoute = () => methodNotAllowed("POST");
