// Máquina de estados del pedido del Kit. Desde oct/2026 la implementación vive
// en src/lib/commerce/payment-state.ts (compartida con RGPD Ops); este módulo
// se conserva como wrapper con la misma API.

export {
  nextPaymentStatus,
  nextAccessStatus,
  isAccessAllowed,
  accessExpiry,
  paymentStatusFromSession,
} from "../commerce/payment-state";
export type { PaymentStatus, AccessStatus, AccessCheckInput } from "../commerce/payment-state";
