// Emails transaccionales de RGPD Ops (Resend REST, mismo patrón que el resto
// del sitio). La compra autoriza solo estos envíos: enlace de acceso y aviso
// interno de venta. Ninguno añade al comprador a comunicaciones comerciales.

import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { escapeHtml } from "@/lib/assessment/email";
import { readEnv } from "./env";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendEmail(input: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const apiKey = readEnv("RESEND_API_KEY");
  if (!apiKey) return { ok: false as const, code: "resend_not_configured" };
  const from = readEnv("CONTACT_FROM_EMAIL") || "IA Operators <onboarding@resend.dev>";
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [input.to],
        reply_to: input.replyTo ?? readEnv("CONTACT_TO_EMAIL") ?? undefined,
        subject: input.subject,
        html: input.html,
        text: input.text,
        // El seguimiento de clics de Resend debe estar desactivado (reescribiría el enlace).
        headers: { "X-Entity-Ref-ID": `rgo-${Date.now()}` },
      }),
    });
    if (!response.ok) return { ok: false as const, code: `resend_http_${response.status}` };
    return { ok: true as const, code: "sent" };
  } catch {
    return { ok: false as const, code: "resend_network_error" };
  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(new Date(iso));
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f4f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1d1f1a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;padding:32px;">
      <div style="font-size:12px;font-weight:700;color:#ae3810;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
        ${escapeHtml(RGPD_OPS_PRODUCT.name)}
      </div>
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">${escapeHtml(title)}</h1>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e2e0d6;margin:28px 0 16px;" />
      <p style="margin:0 0 8px;color:#6b6f63;font-size:12px;line-height:1.6;">
        Recibes este mensaje porque has comprado ${escapeHtml(RGPD_OPS_PRODUCT.name)}. Es un email
        transaccional: no te suscribe a ninguna comunicación comercial.
      </p>
      <p style="margin:0 0 8px;color:#6b6f63;font-size:12px;line-height:1.6;">
        ${escapeHtml(RGPD_OPS_PRODUCT.name)} es una herramienta operativa. No constituye asesoramiento jurídico
        y no certifica el cumplimiento.
      </p>
      <p style="margin:0;color:#6b6f63;font-size:12px;">IA Operators · Málaga · iaoperators.com</p>
    </div>
  </div>
</body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;background:#1d1f1a;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;">${escapeHtml(label)}</a></p>`;
}

export interface AccessEmailInput {
  to: string;
  magicLink: string;
  expiresAt: Date;
  ttlMinutes: number;
  accessExpiresAt: string | null;
  requestAccessUrl: string;
  purpose: "purchase" | "resend" | "admin_resend";
  invoiceByStripe: boolean;
}

export function buildAccessEmail(input: AccessEmailInput) {
  const isPurchase = input.purpose === "purchase";
  const subject = isPurchase ? `Tu acceso a ${RGPD_OPS_PRODUCT.name}` : `Tu nuevo enlace de acceso a ${RGPD_OPS_PRODUCT.name}`;
  const title = isPurchase ? "Gracias por tu compra. Aquí tienes tu acceso" : "Tu nuevo enlace de acceso";
  const hasta = formatDate(input.accessExpiresAt);
  const html = layout(
    title,
    `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.65;">
        ${isPurchase ? "Tu pago está confirmado y tu espacio de trabajo está listo. " : ""}Entra con este enlace personal:
      </p>
      ${button(input.magicLink, "Entrar a mi espacio")}
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b4f45;">
        El enlace sirve <strong>una sola vez</strong> y caduca en ${input.ttlMinutes} minutos. Lo que guardas
        queda en tu espacio, no en el navegador: puedes entrar desde otro dispositivo pidiendo un enlace nuevo en
        <a href="${escapeHtml(input.requestAccessUrl)}" style="color:#ae3810;">${escapeHtml(input.requestAccessUrl)}</a>
        con el email de tu compra.
      </p>
      ${
        hasta
          ? `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b4f45;">Acceso y actualizaciones hasta el <strong>${escapeHtml(hasta)}</strong>. Puedes exportarlo todo en JSON y CSV cuando quieras.</p>`
          : ""
      }
      ${
        isPurchase && input.invoiceByStripe
          ? `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b4f45;">La factura de tu compra te llega en un email aparte, enviado por Stripe.</p>`
          : ""
      }
      <p style="margin:0;font-size:14px;line-height:1.6;color:#4b4f45;">
        Si no has pedido este enlace, ignora este mensaje: nadie puede entrar sin él.
      </p>`,
  );
  const text = [
    title,
    "",
    `Entra con este enlace personal (un solo uso, caduca en ${input.ttlMinutes} minutos):`,
    input.magicLink,
    "",
    `Si caduca o cambias de dispositivo, pide uno nuevo en ${input.requestAccessUrl} con el email de tu compra.`,
    hasta ? `Acceso y actualizaciones hasta el ${hasta}.` : "",
    "",
    `${RGPD_OPS_PRODUCT.name} es una herramienta operativa: no constituye asesoramiento jurídico ni certifica el cumplimiento.`,
  ].join("\n");
  return { subject, html, text };
}

export async function sendAccessEmail(input: AccessEmailInput) {
  const { subject, html, text } = buildAccessEmail(input);
  return sendEmail({ to: input.to, subject, html, text });
}

/** Aviso interno de venta. Va al buzón propio, no a logs. */
export async function sendInternalSaleEmail(input: {
  orderId: string;
  email: string;
  companyName: string | null;
  amountTotal: number;
  currency: string;
  assessmentResponseId: string | null;
  accessEmailOk: boolean;
  workspaceOk: boolean;
}) {
  const to = readEnv("CONTACT_TO_EMAIL") || "info@iaoperators.com";
  const amount = `${(input.amountTotal / 100).toFixed(2)} ${input.currency.toUpperCase()}`;
  const flags = [!input.accessEmailOk && "EMAIL DE ACCESO FALLIDO", !input.workspaceOk && "ESPACIO NO CREADO"].filter(Boolean).join(" · ");
  const subject = `[RGPD Ops] Nueva venta · ${amount}${flags ? ` · ${flags}` : ""}`;
  const rows = [
    ["Pedido", input.orderId],
    ["Email", input.email],
    ["Empresa", input.companyName || "—"],
    ["Importe", amount],
    ["Versión", RGPD_OPS_PRODUCT.version],
    ["Test (response_id)", input.assessmentResponseId || "—"],
    ["Email de acceso", input.accessEmailOk ? "enviado" : "FALLIDO — reenviar con npm run rgpd-ops:resend-access"],
    ["Espacio de trabajo", input.workspaceOk ? "creado" : "NO CREADO — se creará al primer acceso; revisar logs"],
  ];
  const html = `<!doctype html><html lang="es"><body style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding:24px;">
    <h2 style="margin:0 0 16px;">Nueva venta de RGPD Ops</h2>
    <table style="border-collapse:collapse;">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(v)}</td></tr>`)
      .join("")}</table></body></html>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  return sendEmail({ to, subject, html, text, replyTo: input.email });
}
