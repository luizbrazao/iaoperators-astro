// Envío de emails del test de cumplimiento vía Resend REST (sin SDK), siguiendo
// el patrón ya usado en src/pages/api/contact.ts.
//
// Dos envíos por lead:
//   1. Interno → aviso inmediato con el resultado completo, para poder atacar el
//      lead caliente el mismo día. reply_to apunta al prospecto.
//   2. Al prospecto → el informe que promete la landing: detalle por obligación,
//      checklist de evidencias y estimación de esfuerzo.
//
// Ningún fallo de email debe romper la captación: el lead ya está persistido
// cuando se llama aquí. Se registra en consola y se sigue.

import type { AssessmentAnswers, AssessmentResult, GapState } from "./types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SITE = "https://iaoperators.com";
const PILAR_URL = `${SITE}/es/cumplimiento/ley-atencion-al-cliente/`;
const CONTACT_URL = `${SITE}/es/contact/`;

function readEnv(name: string) {
  const importMetaEnv =
    typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;
  return importMetaEnv?.[name] ?? process.env[name];
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const ESTADO_LABEL: Record<GapState, string> = {
  ok: "Cubierto",
  parcial: "Parcial",
  gap: "Brecha",
  desconocido: "Sin datos",
};

const ESTADO_COLOR: Record<GapState, string> = {
  ok: "#16a34a",
  parcial: "#d97706",
  gap: "#dc2626",
  desconocido: "#6b7280",
};

/**
 * Evidencia que el auditor acreditado va a pedir por cada obligación, y esfuerzo
 * orientativo de implementación. Orientativo a propósito: el número firme sale
 * del diagnóstico de brecha, no de ocho preguntas.
 */
const DOSSIER: Record<string, { evidencia: string; esfuerzo: string }> = {
  medicion: {
    evidencia:
      "Serie temporal de tiempos de espera con el cálculo de la media y el percentil del 95 %, exportable por periodo.",
    esfuerzo: "1–2 semanas",
  },
  plazos: {
    evidencia:
      "Histórico de cada queja con fecha de entrada, fecha de resolución y cómputo en días hábiles.",
    esfuerzo: "2–3 semanas",
  },
  registro: {
    evidencia:
      "Log de interacciones y cambios de estado con sellado temporal y prueba de no alteración.",
    esfuerzo: "2–4 semanas",
  },
  clave: {
    evidencia:
      "Trazabilidad de la clave: emisión, entrega a la clientela y consultas realizadas por canal.",
    esfuerzo: "1–2 semanas",
  },
  canales: {
    evidencia:
      "Inventario de canales con horarios de cobertura y registro de los traspasos de bot a persona.",
    esfuerzo: "1–3 semanas",
  },
  auditoria: {
    evidencia:
      "Cuadro de mando anual por obligación, con los datos de origen enlazados y exportables.",
    esfuerzo: "1 semana (sobre lo anterior)",
  },
};

function gapsTableHtml(result: AssessmentResult) {
  return result.gaps
    .map((gap) => {
      const dossier = DOSSIER[gap.id];
      const color = ESTADO_COLOR[gap.estado];
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-weight:600;color:#111827;font-size:15px;margin-bottom:6px;">
              ${escapeHtml(gap.obligacion)}
            </div>
            <div style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color};color:#ffffff;font-size:11px;font-weight:700;margin-bottom:8px;">
              ${ESTADO_LABEL[gap.estado]}
            </div>
            <div style="color:#4b5563;font-size:14px;line-height:1.6;margin-bottom:8px;">
              ${escapeHtml(gap.detalle)}
            </div>
            ${
              dossier
                ? `<div style="color:#6b7280;font-size:13px;line-height:1.6;">
                     <strong style="color:#374151;">Evidencia para la auditoría:</strong> ${escapeHtml(dossier.evidencia)}<br />
                     <strong style="color:#374151;">Esfuerzo orientativo:</strong> ${escapeHtml(dossier.esfuerzo)}
                   </div>`
                : ""
            }
          </td>
        </tr>`;
    })
    .join("");
}

/**
 * Textos de marca del informe. Los valores por defecto son los del test de la
 * Ley 10/2025, que fue el primero: así los correos existentes no cambian ni una
 * coma al añadir el test de Verifactu.
 */
export interface AssessmentBrand {
  /** Nombre corto de la norma, para asuntos y cabeceras. */
  norma: string;
  /** Etiqueta del informe en la cabecera del correo. */
  cabecera: string;
  /** Frase de origen del resultado en el pie. */
  origen: string;
}

export const DEFAULT_BRAND: AssessmentBrand = {
  norma: "Ley 10/2025",
  cabecera: "Ley 10/2025 · Informe de cumplimiento",
  origen: "Resultado generado por reglas deterministas sobre el texto de la Ley 10/2025",
};

export function buildProspectEmail(result: AssessmentResult, brand: AssessmentBrand = DEFAULT_BRAND) {
  const prioridades = result.prioridades
    .map(
      (p, i) =>
        `<li style="margin-bottom:8px;color:#374151;font-size:14px;line-height:1.6;"><strong>${i + 1}.</strong> ${escapeHtml(p)}</li>`,
    )
    .join("");

  const subject =
    result.obligado === "no"
      ? `Tu resultado del test de ${brand.norma}`
      : `Tu informe de cumplimiento — quedan ${result.diasRestantes} días`;

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;">

      <div style="font-size:12px;font-weight:700;color:#ea580c;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">
        ${escapeHtml(brand.cabecera)}
      </div>

      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#111827;">
        ${escapeHtml(result.titular)}
      </h1>

      <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.7;">
        ${escapeHtml(result.motivo)}
      </p>

      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:28px;">
        <div style="color:#6b7280;font-size:13px;">
          Sector declarado: <strong style="color:#111827;">${escapeHtml(result.sectorLabel)}</strong><br />
          Plazo de adaptación: <strong style="color:#111827;">28 de diciembre de 2026</strong>
          (quedan ${result.diasRestantes} días)
        </div>
      </div>

      <h2 style="margin:0 0 4px;font-size:18px;color:#111827;">Obligación por obligación</h2>
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
        Con la evidencia que pedirá la auditoría acreditada y el esfuerzo orientativo de cada pieza.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        ${gapsTableHtml(result)}
      </table>

      ${
        prioridades
          ? `<h2 style="margin:0 0 12px;font-size:18px;color:#111827;">Por dónde empezar</h2>
             <ol style="margin:0 0 28px;padding-left:20px;">${prioridades}</ol>`
          : ""
      }

      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${CONTACT_URL}" style="display:inline-block;padding:14px 28px;border-radius:9999px;background:#f97316;color:#000000;font-weight:600;font-size:15px;text-decoration:none;">
          Reservar una llamada de 30 minutos
        </a>
      </div>
      <p style="text-align:center;margin:0 0 24px;color:#6b7280;font-size:13px;">
        Salimos de la llamada con el diagnóstico de brecha acotado y con precio cerrado.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

      <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;line-height:1.6;">
        ${escapeHtml(brand.origen)}
        (BOE-A-2025-26698), motor ${escapeHtml(result.engineVersion)}. Información técnica sobre
        implementación de sistemas: no constituye asesoramiento jurídico.
      </p>
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        IA Operators · Málaga · <a href="${PILAR_URL}" style="color:#ea580c;">iaoperators.com</a>
      </p>
    </div>
  </div>
</body></html>`;

  return { subject, html };
}

export function buildInternalEmail(input: {
  email: string;
  result: AssessmentResult;
  answers: AssessmentAnswers;
  responseId: string;
  utmSource?: string;
  utmCampaign?: string;
  brand?: AssessmentBrand;
}) {
  const { email, result, answers, responseId } = input;
  const brand = input.brand ?? DEFAULT_BRAND;

  const subject = `[Test ${brand.norma}] ${result.obligado.toUpperCase()} · ${result.riskLevel} · ${result.sectorLabel} — ${email}`;

  const answerRows = Object.entries(answers)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">${escapeHtml(k)}</td><td style="padding:4px 0;color:#111827;font-size:13px;">${escapeHtml(Array.isArray(v) ? v.join(", ") : v)}</td></tr>`,
    )
    .join("");

  const gapRows = result.gaps
    .map(
      (g) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">${escapeHtml(g.id)}</td><td style="padding:4px 0;font-size:13px;color:${ESTADO_COLOR[g.estado]};font-weight:600;">${ESTADO_LABEL[g.estado]}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="es"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;padding:24px;">
  <h2 style="margin:0 0 4px;">Lead del test de ${escapeHtml(brand.norma)}</h2>
  <p style="margin:0 0 20px;color:#4b5563;">${escapeHtml(result.titular)}</p>

  <table style="border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:4px 0;font-size:13px;"><strong>${escapeHtml(email)}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Veredicto</td><td style="padding:4px 0;font-size:13px;"><strong>${escapeHtml(result.obligado)}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Riesgo</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(result.riskLevel)} (${result.riskScore}/${result.riskScoreMax})</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">Sector</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(result.sectorLabel)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">utm_source</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(input.utmSource || "—")}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">utm_campaign</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(input.utmCampaign || "—")}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;">response_id</td><td style="padding:4px 0;font-size:12px;color:#6b7280;">${escapeHtml(responseId)}</td></tr>
  </table>

  <h3 style="margin:0 0 8px;font-size:15px;">Brechas</h3>
  <table style="border-collapse:collapse;margin-bottom:24px;">${gapRows}</table>

  <h3 style="margin:0 0 8px;font-size:15px;">Respuestas</h3>
  <table style="border-collapse:collapse;">${answerRows}</table>
</body></html>`;

  return { subject, html };
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = readEnv("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("[assessment/email] RESEND_API_KEY no configurada — email no enviado", {
      to: input.to,
      subject: input.subject,
    });
    return false;
  }

  const from = readEnv("CONTACT_FROM_EMAIL") || "IA Operators <onboarding@resend.dev>";

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[assessment/email] Resend error", response.status, text);
    return false;
  }
  return true;
}

/**
 * Envía los dos emails. Nunca lanza: el lead ya está guardado y no queremos
 * devolver error al prospecto por un fallo del proveedor de correo.
 */
export async function sendAssessmentEmails(input: {
  email: string;
  result: AssessmentResult;
  answers: AssessmentAnswers;
  responseId: string;
  utmSource?: string;
  utmCampaign?: string;
  brand?: AssessmentBrand;
}): Promise<{ internal: boolean; prospect: boolean }> {
  const internalTo = readEnv("CONTACT_TO_EMAIL") || "info@iaoperators.com";
  const brand = input.brand ?? DEFAULT_BRAND;
  const internal = buildInternalEmail({ ...input, brand });
  const prospect = buildProspectEmail(input.result, brand);

  const [internalResult, prospectResult] = await Promise.allSettled([
    sendViaResend({
      to: internalTo,
      subject: internal.subject,
      html: internal.html,
      replyTo: input.email,
    }),
    sendViaResend({ to: input.email, subject: prospect.subject, html: prospect.html }),
  ]);

  const ok = (r: PromiseSettledResult<boolean>) => r.status === "fulfilled" && r.value;

  if (!ok(internalResult)) {
    // Crítico: hay un lead en base de datos del que nadie se ha enterado.
    console.error("[assessment/email] AVISO INTERNO NO ENVIADO", {
      email: input.email,
      responseId: input.responseId,
    });
  }

  return { internal: ok(internalResult), prospect: ok(prospectResult) };
}
