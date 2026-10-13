// Máquina de estados de un pedido de producto digital. Funciones puras: las
// usan los webhooks del Kit VERI*FACTU y de RGPD Ops y sus pruebas. Los eventos
// de Stripe pueden llegar duplicados o fuera de orden; estas reglas hacen que
// el estado final no dependa del orden.

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
export type AccessStatus = "pending" | "active" | "revoked";

/**
 * Siguiente estado de pago a partir del actual y del que trae un evento.
 * - "refunded" es terminal.
 * - Un pago confirmado nunca vuelve a "pending" ni a "failed" por un evento atrasado.
 * - "partially_refunded" solo avanza a "refunded".
 */
export function nextPaymentStatus(current: PaymentStatus | null | undefined, incoming: PaymentStatus): PaymentStatus {
  if (!current) return incoming;
  if (current === "refunded") return "refunded";
  if (incoming === "refunded") return "refunded";
  if (current === "partially_refunded") return "partially_refunded";
  if (incoming === "partially_refunded") return current === "paid" ? "partially_refunded" : current;
  if (current === "paid") return "paid";
  if (incoming === "paid") return "paid";
  if (current === "failed") return "failed";
  return incoming;
}

/** Un reembolso total revoca el acceso; el resto de estados no lo concede por sí mismo. */
export function nextAccessStatus(current: AccessStatus | null | undefined, payment: PaymentStatus): AccessStatus {
  if (payment === "refunded") return "revoked";
  return current ?? "pending";
}

export interface AccessCheckInput {
  payment_status: string;
  access_status: string;
  access_expires_at: string | null;
}

/** Regla única de acceso al contenido de pago. */
export function isAccessAllowed(order: AccessCheckInput | null | undefined, now: Date = new Date()): boolean {
  if (!order) return false;
  if (order.access_status !== "active") return false;
  if (order.payment_status !== "paid" && order.payment_status !== "partially_refunded") return false;
  if (order.access_expires_at && new Date(order.access_expires_at).getTime() <= now.getTime()) return false;
  return true;
}

/** Fecha de fin de acceso y actualizaciones: N meses desde el pago. */
export function accessExpiry(paidAt: Date, months: number): Date {
  const d = new Date(paidAt.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

/** Estado de pago a partir de una Checkout Session. */
export function paymentStatusFromSession(sessionPaymentStatus: string | null | undefined): PaymentStatus {
  // "no_payment_required": cupón del 100 %. Es una compra válida.
  if (sessionPaymentStatus === "paid" || sessionPaymentStatus === "no_payment_required") return "paid";
  return "pending";
}
