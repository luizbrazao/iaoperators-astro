// Integración con Stripe Checkout. Cliente perezoso (la clave se lee en la
// petición, nunca en el build), verificación del Price y creación de la sesión.
//
// Nada que llegue del navegador decide precio, moneda o producto: el Price ID
// es server-side y además se comprueba contra el precio que muestra la web.

import Stripe from "stripe";
import { KIT_PRODUCT } from "@/data/verifactu-kit";
import { getStripeConfig, type StripeConfig } from "./env";
import { isUuid } from "./crypto";
import { paymentStatusFromSession } from "./state";
import type { OrderFromSession } from "./storage";

let stripeClient: Stripe | null = null;
let clientKey = "";

export function getStripe(config: StripeConfig = getStripeConfig()): Stripe {
  if (!stripeClient || clientKey !== config.secretKey) {
    stripeClient = new Stripe(config.secretKey, {
      maxNetworkRetries: 2,
      timeout: 15_000,
      appInfo: { name: "iaoperators-verifactu-kit", version: KIT_PRODUCT.version },
    });
    clientKey = config.secretKey;
  }
  return stripeClient;
}

/**
 * Verifica la firma de un webhook con el cuerpo crudo. Usa la utilidad estática
 * del SDK: no necesita la clave secreta de la API, solo el secreto del endpoint.
 * Tolerancia por defecto de Stripe (300 s) frente a replays con firma antigua.
 */
export function verifyWebhookEvent(rawBody: string, signature: string, secret: string): Stripe.Event {
  return Stripe.webhooks.constructEvent(rawBody, signature, secret);
}

export class KitCheckoutError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "KitCheckoutError";
    this.code = code;
  }
}

/** Caché del resultado de la verificación del Price (por instancia, 10 min). */
let priceCheck: { priceId: string; at: number } | null = null;
const PRICE_CHECK_TTL_MS = 10 * 60_000;

/**
 * El precio mostrado ("59 € + IVA") y el cobrado tienen que coincidir. Si
 * alguien cambia el Price en Stripe sin tocar src/data/verifactu-kit.ts, el
 * checkout se cierra en lugar de cobrar algo distinto de lo anunciado.
 */
export async function assertPriceMatchesProduct(config: StripeConfig): Promise<void> {
  if (priceCheck && priceCheck.priceId === config.priceId && Date.now() - priceCheck.at < PRICE_CHECK_TTL_MS) {
    return;
  }
  const price = await getStripe(config).prices.retrieve(config.priceId);
  const expectedCents = Math.round(KIT_PRODUCT.price.amount * 100);
  const problems: string[] = [];
  if (!price.active) problems.push("price_inactive");
  if (price.type !== "one_time") problems.push("price_not_one_time");
  if (price.currency.toLowerCase() !== KIT_PRODUCT.price.currency.toLowerCase()) problems.push("price_currency_mismatch");
  if (price.unit_amount !== expectedCents) problems.push("price_amount_mismatch");
  // "+ IVA": el importe del Price es la base imponible.
  if (config.automaticTax && price.tax_behavior !== "exclusive") problems.push("price_tax_behavior_not_exclusive");
  if (problems.length) throw new KitCheckoutError(problems[0], `El Price de Stripe no coincide con el producto: ${problems.join(", ")}`);
  priceCheck = { priceId: config.priceId, at: Date.now() };
}

export interface CreateCheckoutInput {
  baseUrl: string;
  assessmentResponseId: string | null;
}

export function kitMetadata(assessmentResponseId: string | null): Record<string, string> {
  const metadata: Record<string, string> = {
    product_key: KIT_PRODUCT.key,
    product_version: KIT_PRODUCT.version,
  };
  // Solo el identificador del test: nunca respuestas ni datos del usuario.
  if (assessmentResponseId && isUuid(assessmentResponseId)) metadata.assessment_response_id = assessmentResponseId;
  return metadata;
}

export async function createKitCheckoutSession(input: CreateCheckoutInput): Promise<Stripe.Checkout.Session> {
  const config = getStripeConfig();
  if (!config.automaticTax && !config.taxRateId) {
    // El precio se anuncia "+ IVA": sin Stripe Tax ni Tax Rate no se cobra.
    throw new KitCheckoutError("tax_not_configured", "Falta configurar el IVA (Stripe Tax o Tax Rate).");
  }
  await assertPriceMatchesProduct(config);

  const metadata = kitMetadata(input.assessmentResponseId);
  const base = input.baseUrl.replace(/\/$/, "");
  const conditionsUrl = `${base}${KIT_PRODUCT.paths.condiciones}`;

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    locale: "es",
    line_items: [
      {
        price: config.priceId,
        quantity: 1,
        ...(config.automaticTax ? {} : { tax_rates: [config.taxRateId!] }),
      },
    ],
    customer_creation: "always",
    tax_id_collection: { enabled: true },
    billing_address_collection: config.automaticTax || config.invoiceCreation ? "required" : "auto",
    automatic_tax: { enabled: config.automaticTax },
    allow_promotion_codes: true,
    // Contenido digital: el consumidor solicita el acceso inmediato y reconoce
    // la pérdida del derecho de desistimiento (art. 103.m TRLGDCU). Requiere
    // la URL de condiciones configurada en Stripe (Settings → Public details).
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message: `Acepto las [condiciones de venta](${conditionsUrl}) y solicito el acceso inmediato al contenido digital. Entiendo que, al iniciarse el acceso, pierdo el derecho de desistimiento.`,
      },
      submit: {
        message: "Producto digital. Recibirás el enlace de acceso en el email que indiques. El Kit es orientativo y no certifica el cumplimiento.",
      },
    },
    metadata,
    payment_intent_data: {
      metadata,
      description: KIT_PRODUCT.name,
    },
    ...(config.invoiceCreation
      ? {
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: `${KIT_PRODUCT.name} · versión ${KIT_PRODUCT.version}`,
              metadata,
            },
          },
        }
      : {}),
    success_url: `${base}${KIT_PRODUCT.paths.gracias}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${KIT_PRODUCT.paths.landing}?checkout=cancelado`,
  };

  return getStripe(config).checkout.sessions.create(params);
}

/** ¿Es una sesión del Kit? Los demás productos de la cuenta se ignoran. */
export function isKitSession(session: Stripe.Checkout.Session): boolean {
  return session.mode === "payment" && session.metadata?.product_key === KIT_PRODUCT.key;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Traduce una Checkout Session al pedido. Datos mínimos: email, nombre, empresa. */
export function orderInputFromSession(
  session: Stripe.Checkout.Session,
  config: Pick<StripeConfig, "priceId">,
): OrderFromSession {
  const details = session.customer_details;
  const company =
    session.collected_information?.business_name ?? details?.business_name ?? null;
  const rid = session.metadata?.assessment_response_id ?? null;
  return {
    checkoutSessionId: session.id,
    email: (details?.email ?? session.customer_email ?? "").toLowerCase(),
    customerName: details?.name ?? null,
    companyName: company,
    stripeCustomerId: idOf(session.customer as string | { id: string } | null),
    paymentIntentId: idOf(session.payment_intent as string | { id: string } | null),
    priceId: config.priceId,
    productVersion: session.metadata?.product_version ?? KIT_PRODUCT.version,
    amountTotal: session.amount_total ?? 0,
    currency: (session.currency ?? "eur").toLowerCase(),
    paymentStatus: paymentStatusFromSession(session.payment_status),
    assessmentResponseId: rid && isUuid(rid) ? rid : null,
  };
}
