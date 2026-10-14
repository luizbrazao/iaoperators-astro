// Notificación INTERNA de lead nuevo (Resend REST, mismo patrón que el resto
// del sitio). En la Fase 1 no se envía nada al lead: ni informe ni secuencia.

import { HOTEL_REVENUE_PRODUCT } from "@/data/hotel-revenue";
import { escapeHtml } from "@/lib/assessment/email";
import { formatEuros, formatPct } from "../calculator";
import type { CalculatorResult, NormalizedLead } from "../types";
import type { NotificationConfig } from "./env";

export interface InternalLeadEmail {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function buildInternalLeadEmail(input: {
  lead: NormalizedLead;
  result: CalculatorResult;
  leadId: string;
  config: Pick<NotificationConfig, "from" | "to">;
  tableEditorUrl: string | null;
}): InternalLeadEmail {
  const { lead, result, leadId, config, tableEditorUrl } = input;
  const r = result.scenarios.realistic;
  const i = result.inputs;
  const origin = [
    lead.utm.utm_source && `source=${lead.utm.utm_source}`,
    lead.utm.utm_medium && `medium=${lead.utm.utm_medium}`,
    lead.utm.utm_campaign && `campaign=${lead.utm.utm_campaign}`,
    lead.utm.utm_content && `content=${lead.utm.utm_content}`,
    lead.utm.utm_term && `term=${lead.utm.utm_term}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const rows: [string, string][] = [
    ["Nombre", lead.name],
    ["Hotel / grupo", lead.hotelName],
    ["Email", lead.email],
    ["Teléfono", lead.phone ?? "—"],
    ["Web", lead.website ?? "—"],
    ["Propiedades", String(lead.propertyCount)],
    ["Habitaciones (total)", String(lead.roomCount)],
    [
      "Datos de la calculadora",
      `${i.rooms} hab. · ocupación ${i.occupancyPct} % · ADR ${formatEuros(i.adr)} · estancia ${i.avgStayNights} noches · OTA ${i.otaSharePct} % · comisión ${i.otaCommissionPct} % · extra medio ${formatEuros(i.upsellAvg)}`,
    ],
    [
      "Escenario realista",
      `${formatEuros(r.totalMonthly)}/mes (${formatEuros(r.totalAnnual)}/año): comisión ${formatEuros(r.commissionSavingsMonthly)} + extras ${formatEuros(r.upsellRevenueMonthly)} · recuperación OTA ${formatPct(r.otaRecoveryRate)}, adopción ${formatPct(r.upsellAdoptionRate)}`,
    ],
    ["Origen / UTM", origin || "sin UTM"],
    ["Referrer", lead.referrerHost ?? "directo / desconocido"],
    ["Página · CTA", `${lead.landingPath} · ${lead.ctaOrigin}`],
    ["Modelo · consentimiento", `calculadora ${result.version} · ${lead.consentVersion}`],
  ];

  const locate = `Supabase → tabla hotel_revenue_leads → id = ${leadId}`;
  const sql = `select * from public.hotel_revenue_leads where id = '${leadId}';`;

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f3f1eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#22241f;">
  <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
    <div style="background:#ffffff;padding:28px;">
      <div style="font-size:12px;font-weight:700;color:#ae3810;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">${escapeHtml(HOTEL_REVENUE_PRODUCT.name)} · lead interno</div>
      <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;">${escapeHtml(lead.hotelName)}</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5;">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #e2e0d6;color:#666960;vertical-align:top;width:34%;">${escapeHtml(k)}</td><td style="padding:8px 0;border-top:1px solid #e2e0d6;vertical-align:top;">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:22px 0 6px;font-size:13px;color:#666960;">Localizar el registro: ${escapeHtml(locate)}</p>
      ${tableEditorUrl ? `<p style="margin:0 0 6px;font-size:13px;"><a href="${escapeHtml(tableEditorUrl)}" style="color:#22241f;">Abrir el editor de tablas de Supabase</a></p>` : ""}
      <pre style="margin:6px 0 0;font-size:12px;background:#f3f1eb;padding:10px;white-space:pre-wrap;">${escapeHtml(sql)}</pre>
      <p style="margin:18px 0 0;font-size:12px;color:#666960;">Cifras recalculadas en el servidor. Estimación orientativa: no es una previsión ni una garantía. Responder a este email contesta directamente al lead.</p>
    </div>
  </div>
</body></html>`;

  const text = [
    `${HOTEL_REVENUE_PRODUCT.name} · lead interno`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Localizar: ${locate}`,
    tableEditorUrl ? `Editor: ${tableEditorUrl}` : "",
    sql,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    to: config.to,
    from: config.from,
    replyTo: lead.email,
    subject: `[Hotel Revenue] ${lead.hotelName} · ${lead.roomCount} hab. · ${formatEuros(r.totalMonthly)}/mes (realista)`.slice(0, 200),
    html,
    text,
  };
}

export async function sendInternalLeadEmail(
  email: InternalLeadEmail,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; code: string }> {
  if (!apiKey) return { ok: false, code: "resend_not_configured" };
  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: email.from,
        to: [email.to],
        reply_to: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, code: `resend_http_${response.status}` };
    return { ok: true, code: "sent" };
  } catch (error) {
    const name = error && typeof error === "object" && "name" in error ? String((error as { name: unknown }).name) : "";
    return { ok: false, code: name === "TimeoutError" ? "resend_timeout" : "resend_network_error" };
  }
}
