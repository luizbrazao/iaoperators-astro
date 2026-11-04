// Notificación INTERNA de caso nuevo (Resend REST, mismo patrón que el resto
// del sitio). A la persona no se le envía nada: la confirmación es la página.

import { COMPANY_SIZES, MANAGER_AWARE, PROBLEMA_PROGRAM, FALLBACK_QUESTIONS } from "@/data/problema-resuelto";
import type { Ficha, NormalizedSubmission } from "../types";
import type { NotificationConfig } from "./env";

export interface InternalCasoEmail {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const ENCAJE_LABEL: Record<Ficha["encaje_sugerido"], string> = {
  encaja: "Encaja",
  reducido: "Versión reducida",
  no_encaja: "No encaja",
  dudoso: "Dudoso (falta información)",
};

function label<T extends { value: string; label: string }>(list: readonly T[], value: string): string {
  return list.find((i) => i.value === value)?.label ?? value;
}

export function buildInternalCasoEmail(input: {
  sub: NormalizedSubmission;
  ficha: Ficha | null;
  casoId: string;
  config: Pick<NotificationConfig, "from" | "to">;
  tableEditorUrl: string | null;
}): InternalCasoEmail {
  const { sub, ficha, casoId, config, tableEditorUrl } = input;
  const origin = [
    sub.utm.utm_source && `source=${sub.utm.utm_source}`,
    sub.utm.utm_medium && `medium=${sub.utm.utm_medium}`,
    sub.utm.utm_campaign && `campaign=${sub.utm.utm_campaign}`,
    sub.utm.utm_content && `content=${sub.utm.utm_content}`,
    sub.utm.utm_term && `term=${sub.utm.utm_term}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const contact: [string, string][] = [
    ["Nombre", sub.name],
    ["Cargo", sub.jobTitle],
    ["Empresa", sub.company],
    ["Email", sub.email],
    ["Tamaño", label(COMPANY_SIZES, sub.companySize)],
    ["¿Su responsable lo sabe?", label(MANAGER_AWARE, sub.managerAware)],
    ["Vía", sub.mode === "chat" ? "Agente de triaje" : "Formulario de respaldo (agente no disponible)"],
    ["Datos ocultados", sub.piiMasked ? "Sí: el servidor ocultó emails, teléfonos, DNI/NIE o IBAN" : "No"],
    ["Origen / UTM", origin || "sin UTM"],
    ["Referrer", sub.referrerHost ?? "directo / desconocido"],
  ];

  const fichaRows: [string, string][] = ficha
    ? [
        ["Encaje sugerido", `${ENCAJE_LABEL[ficha.encaje_sugerido]} · complejidad ${ficha.complejidad}/5`],
        ["Motivo", ficha.motivo_encaje],
        ["Resumen", ficha.resumen],
        ["Situación actual", ficha.situacion_actual],
        ["Frecuencia · tiempo", `${ficha.frecuencia} · ${ficha.tiempo_estimado}`],
        ["Herramientas", ficha.herramientas.join(", ") || "no consta"],
        ["Resultado deseado", ficha.resultado_deseado],
        ["Entregable sugerido", ficha.entregable_sugerido],
        ["Riesgos", ficha.riesgos.join(", ") || "ninguno señalado"],
        ["Señales comerciales", ficha.senales_comerciales],
      ]
    : [["Ficha", "No se pudo generar. Lee la conversación de abajo."]];

  const conversation: [string, string][] =
    sub.mode === "chat"
      ? (sub.transcript ?? []).map((m) => [m.role === "user" ? "Persona" : "Agente", m.content])
      : FALLBACK_QUESTIONS.map((q) => [q.label, sub.answers?.[q.key] || "—"]);

  const locate = `Supabase → tabla problema_resuelto_casos → id = ${casoId}`;
  const sql = `select * from public.problema_resuelto_casos where id = '${casoId}';`;

  const table = (rows: [string, string][]) =>
    `<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5;">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #e2e0d6;color:#666960;vertical-align:top;width:30%;">${escapeHtml(k)}</td><td style="padding:8px 0;border-top:1px solid #e2e0d6;vertical-align:top;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}</table>`;

  const h2 = (t: string) => `<h2 style="margin:26px 0 8px;font-size:15px;">${escapeHtml(t)}</h2>`;

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f3f1eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#22241f;">
  <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
    <div style="background:#ffffff;padding:28px;">
      <div style="font-size:12px;font-weight:700;color:#ae3810;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">${escapeHtml(PROBLEMA_PROGRAM.name)} · caso nuevo</div>
      <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;">${escapeHtml(sub.company)} · ${escapeHtml(sub.jobTitle)}</h1>
      ${h2("Ficha sugerida por el agente (no es una decisión)")}
      ${table(fichaRows)}
      ${h2("Contacto")}
      ${table(contact)}
      ${h2(sub.mode === "chat" ? "Conversación" : "Respuestas")}
      ${table(conversation)}
      <p style="margin:22px 0 6px;font-size:13px;color:#666960;">Localizar el registro: ${escapeHtml(locate)}</p>
      ${tableEditorUrl ? `<p style="margin:0 0 6px;font-size:13px;"><a href="${escapeHtml(tableEditorUrl)}" style="color:#22241f;">Abrir el editor de tablas de Supabase</a></p>` : ""}
      <pre style="margin:6px 0 0;font-size:12px;background:#f3f1eb;padding:10px;white-space:pre-wrap;">${escapeHtml(sql)}</pre>
      <p style="margin:18px 0 0;font-size:12px;color:#666960;">Responder antes de ${PROBLEMA_PROGRAM.responseDays} días laborables. Cambia el status en la tabla al decidir. Responder a este email contesta directamente a la persona.</p>
    </div>
  </div>
</body></html>`;

  const text = [
    `${PROBLEMA_PROGRAM.name} · caso nuevo`,
    "",
    "FICHA (sugerencia del agente)",
    ...fichaRows.map(([k, v]) => `${k}: ${v}`),
    "",
    "CONTACTO",
    ...contact.map(([k, v]) => `${k}: ${v}`),
    "",
    sub.mode === "chat" ? "CONVERSACIÓN" : "RESPUESTAS",
    ...conversation.map(([k, v]) => `${k}: ${v}`),
    "",
    `Localizar: ${locate}`,
    tableEditorUrl ? `Editor: ${tableEditorUrl}` : "",
    sql,
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");

  const encaje = ficha ? ENCAJE_LABEL[ficha.encaje_sugerido] : "sin ficha";
  return {
    to: config.to,
    from: config.from,
    replyTo: sub.email,
    subject: `[Problema Resuelto] ${sub.company} · ${encaje}`.slice(0, 200),
    html,
    text,
  };
}

export async function sendInternalCasoEmail(
  email: InternalCasoEmail,
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
