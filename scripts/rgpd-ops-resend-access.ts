// Reenvío manual de un enlace de acceso a RGPD Ops (soporte).
//
// Uso:
//   npx tsx --env-file=.env scripts/rgpd-ops-resend-access.ts --order <uuid>
//   npx tsx --env-file=.env scripts/rgpd-ops-resend-access.ts --email cliente@empresa.com
//
// Necesita SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
// CONTACT_FROM_EMAIL y RGPD_OPS_SESSION_SECRET en el entorno.
// Solo reenvía a pedidos con acceso vigente. No imprime el token.

import { isUuid } from "../src/lib/commerce/tokens";
import { issueAccessLink } from "../src/lib/rgpd-ops/fulfillment";
import { isAccessAllowed } from "../src/lib/commerce/payment-state";
import { findActiveOrdersByEmail, getOrderById } from "../src/lib/rgpd-ops/orders";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const orderId = flag("--order");
const email = flag("--email")?.trim().toLowerCase();

if (!orderId && !email) {
  console.error("Indica --order <uuid> o --email <email>.");
  process.exit(2);
}

const order = orderId
  ? isUuid(orderId)
    ? await getOrderById(orderId)
    : null
  : (await findActiveOrdersByEmail(email!)).find((o) => isAccessAllowed(o)) ?? null;

if (!order) {
  console.error("No hay pedido con ese identificador o email.");
  process.exit(1);
}
if (!isAccessAllowed(order)) {
  console.error(`El pedido ${order.id} no tiene acceso vigente (pago: ${order.payment_status}, acceso: ${order.access_status}).`);
  process.exit(1);
}

const result = await issueAccessLink(order, "admin_resend", `cli-${Date.now()}`);
console.log(result.ok ? `Enlace reenviado para el pedido ${order.id}.` : `No se pudo enviar (${result.code}).`);
process.exit(result.ok ? 0 : 1);
