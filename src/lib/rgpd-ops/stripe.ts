// Integración de RGPD Ops con Stripe Checkout. Mismo diseño que el Kit
// VERI*FACTU: cliente perezoso, verificación del Price contra el precio
// anunciado y sesión creada solo con datos del servidor.
//
// Nada que llegue del navegador decide precio, moneda o producto: el Price ID
// es server-side y además se comprueba contra el precio que muestra la web.

import Stripe from "stripe";
import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { getStripeConfig, type StripeConfig } from "./env";
import { isUuid } from "../commerce/tokens";
import { paymentStatusFromSession } from "../commerce/payment-state";
import type { OrderFromSession } from "./orders";

let stripeClient: Stripe | null = null;
let clientKey = "";

export function getStripe(config: StripeConfig = getStripeConfig()): Stripe {
  if (!stripeClient || clientKey !== config.secretKey) {
    stripeClient = new Stripe(config.secretKey, {
      maxNetworkRetries: 2,
      timeout: 15_000,
      appInfo: { name: "iaoperators-rgpd-ops", version: RGPD_OPS_PRODUCT.version },
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

export class OpsCheckoutError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "OpsCheckoutError";
    this.code = code;
  }
}

/** Caché del resultado de la verificación del Price (por instancia, 10 min). */
let priceCheck: { priceId: string; at: number } | null = null;
const PRICE_CHECK_TTL_MS = 10 * 60_000;

/** Problemas de un Price frente al producto anunciado. Pura: la prueban los tests. */
export function priceProblems(
  price: Pick<Stripe.Price, "active" | "type" | "currency" | "unit_amount" | "tax_behavior">,
  automaticTax: boolean,
): string[] {
  const expectedCents = Math.round(RGPD_OPS_PRODUCT.price.amount * 100);
  const problems: string[] = [];
  if (!price.active) problems.push("price_inactive");
  if (price.type !== "one_time") problems.push("price_not_one_time");
  if (price.currency.toLowerCase() !== RGPD_OPS_PRODUCT.price.currency.toLowerCase()) problems.push("price_currency_mismatch");
  if (price.unit_amount !== expectedCents) problems.push("price_amount_mismatch");
  // "+ IVA": el importe del Price es la base imponible. Con Stripe Tax, el
  // Price debe ser exclusive; con Tax Rate fijo, un Price "inclusive" haría que
  // el IVA se descontara del importe en vez de sumarse.
  if (automaticTax && price.tax_behavior !== "exclusive") problems.push("price_tax_behavior_not_exclusive");
  if (!automaticTax && price.tax_behavior === "inclusive") problems.push("price_tax_behavior_inclusive");
  return problems;
}

/** Con IVA por Tax Rate fijo, el tipo debe estar activo y sumarse al precio. */
export function taxRateProblems(rate: Pick<Stripe.TaxRate, "active" | "inclusive">): string[] {
  const problems: string[] = [];
  if (!rate.active) problems.push("tax_rate_inactive");
  if (rate.inclusive) problems.push("tax_rate_inclusive");
  return problems;
}

/**
 * El precio mostrado ("149 € + IVA") y el cobrado tienen que coincidir. Si
 * alguien cambia el Price en Stripe sin tocar src/data/rgpd-ops.ts, el checkout
 * se cierra en lugar de cobrar algo distinto de lo anunciado.
 */
export async function assertPriceMatchesProduct(config: StripeConfig): Promise<void> {
  if (priceCheck && priceCheck.priceId === config.priceId && Date.now() - priceCheck.at < PRICE_CHECK_TTL_MS) {
    return;
  }
  const price = await getStripe(config).prices.retrieve(config.priceId);
  const problems = priceProblems(price, config.automaticTax);
  if (!config.automaticTax && config.taxRateId) {
    problems.push(...taxRateProblems(await getStripe(config).taxRates.retrieve(config.taxRateId)));
  }
  if (problems.length) throw new OpsCheckoutError(problems[0], `El Price de Stripe no coincide con el producto: ${problems.join(", ")}`);
  priceCheck = { priceId: config.priceId, at: Date.now() };
}

export interface CreateCheckoutInput {
  baseUrl: string;
  assessmentResponseId: string | null;
}

export function opsMetadata(assessmentResponseId: string | null): Record<string, string> {
  const metadata: Record<string, string> = {
    product_key: RGPD_OPS_PRODUCT.key,
    product_version: RGPD_OPS_PRODUCT.version,
  };
  // Solo el identificador del test: nunca respuestas ni datos del usuario.
  if (assessmentResponseId && isUuid(assessmentResponseId)) metadata.assessment_response_id = assessmentResponseId;
  return metadata;
}

export async function createOpsCheckoutSession(input: CreateCheckoutInput): Promise<Stripe.Checkout.Session> {
  const config = getStripeConfig();
  if (!config.automaticTax && !config.taxRateId) {
    // El precio se anuncia "+ IVA": sin Stripe Tax ni Tax Rate no se cobra.
    throw new OpsCheckoutError("tax_not_configured", "Falta configurar el IVA (Stripe Tax o Tax Rate).");
  }
  await assertPriceMatchesProduct(config);

  const metadata = opsMetadata(input.assessmentResponseId);
  const base = input.baseUrl.replace(/\/$/, "");
  const conditionsUrl = `${base}${RGPD_OPS_PRODUCT.paths.condiciones}`;

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
        message: `Acepto las [condiciones de venta](${conditionsUrl}), incluido el encargo de tratamiento de los datos que introduzca, y solicito el acceso inmediato al servicio digital. Entiendo que, al iniciarse el acceso, pierdo el derecho de desistimiento.`,
      },
      submit: {
        message: "Producto digital. Recibirás el enlace de acceso en el email que indiques. Herramienta operativa: no constituye asesoramiento jurídico ni certifica el cumplimiento.",
      },
    },
    metadata,
    payment_intent_data: {
      metadata,
      description: RGPD_OPS_PRODUCT.name,
    },
    ...(config.invoiceCreation
      ? {
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: `${RGPD_OPS_PRODUCT.name} · versión ${RGPD_OPS_PRODUCT.version} · ${RGPD_OPS_PRODUCT.accessMonths} meses de acceso`,
              metadata,
            },
          },
        }
      : {}),
    success_url: `${base}${RGPD_OPS_PRODUCT.paths.gracias}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${RGPD_OPS_PRODUCT.paths.landing}?checkout=cancelado`,
  };

  return getStripe(config).checkout.sessions.create(params);
}

/** ¿Es una sesión de RGPD Ops? Los demás productos de la cuenta se ignoran. */
export function isOpsSession(session: Stripe.Checkout.Session): boolean {
  return session.mode === "payment" && session.metadata?.product_key === RGPD_OPS_PRODUCT.key;
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
    productVersion: session.metadata?.product_version ?? RGPD_OPS_PRODUCT.version,
    amountTotal: session.amount_total ?? 0,
    currency: (session.currency ?? "eur").toLowerCase(),
    paymentStatus: paymentStatusFromSession(session.payment_status),
    assessmentResponseId: rid && isUuid(rid) ? rid : null,
  };
}
