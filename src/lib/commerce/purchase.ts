// Datos de la conversión de compra para analítica (GTM). Compartido por los
// productos de pago (Kit VERI*FACTU y RGPD Ops). Server-side.
//
// - Valor SIN impuestos: el IVA no es ingreso. Mandar el total con IVA infla el
//   valor de conversión y el ROAS de las campañas un 21 %.
// - Con descuentos: el valor es lo que se ha cobrado de verdad, no el precio de
//   lista (los códigos promocionales de partners lo reducen).
// - Id de transacción opaco: HMAC del id del pedido. Estable (GA4 y Google Ads
//   deduplican por él) y sin exponer identificadores internos.

import { createHmac } from "node:crypto";

export interface CheckoutAmounts {
  amount_total: number | null;
  total_details?: { amount_tax?: number | null } | null;
}

/** Importe cobrado sin impuestos, en céntimos. null si la sesión no lo permite calcular. */
export function netAmountCents(session: CheckoutAmounts): number | null {
  const total = session.amount_total;
  const tax = session.total_details?.amount_tax;
  if (typeof total !== "number" || !Number.isInteger(total) || total < 0) return null;
  if (typeof tax !== "number" || !Number.isInteger(tax) || tax < 0 || tax > total) return null;
  return total - tax;
}

/**
 * Valor de la conversión en euros: el neto de la sesión de Stripe si se puede
 * calcular; si no, el precio de lista sin IVA (nunca el total con IVA).
 */
export function conversionValue(session: CheckoutAmounts | null, listPriceEuros: number): number {
  const net = session ? netAmountCents(session) : null;
  return net === null ? listPriceEuros : net / 100;
}

/** Id de transacción para analítica: `<namespace>_<32 hex>`, derivado con HMAC del id del pedido. */
export function opaqueTransactionId(namespace: string, secret: string, orderId: string): string {
  const digest = createHmac("sha256", secret).update(`${namespace}.purchase.${orderId}`, "utf8").digest("hex");
  return `${namespace}_${digest.slice(0, 32)}`;
}
