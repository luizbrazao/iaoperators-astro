// Marca del informe del diagnóstico RGPD. Ningún texto de la Ley 10/2025 ni de
// Verifactu. Las afirmaciones normativas salen de src/data/rgpd.ts y la oferta
// del segmento de src/lib/rgpd-ops/segment.ts (la misma regla que la island).
//
// Imports relativos: el script de regresión ejecuta esto con tsx fuera de Astro.

import type { AssessmentBrand } from "../email";
import { escapeHtml } from "../email";
import { NORMAS, RGPD_DISCLAIMER } from "../../../data/rgpd";
import { RGPD_OPS_PRODUCT } from "../../../data/rgpd-ops";
import { rgpdOfferFor } from "../../rgpd-ops/segment";

const SITE = "https://iaoperators.com";
const PILLAR_URL = `${SITE}${RGPD_OPS_PRODUCT.paths.pilar}`;

export const RGPD_STATE_LABELS = {
  ok: "Operativo",
  parcial: "En proceso",
  gap: "Pendiente",
  desconocido: "Sin confirmar",
} as const;

export const RGPD_BRAND: AssessmentBrand = {
  norma: "RGPD",
  cabecera: "Protección de datos · Diagnóstico orientativo",
  origen: "Resultado generado por reglas deterministas a partir de tus respuestas sobre el RGPD y la LOPDGDD",
  legislationId: NORMAS.rgpd.identificador,
  pillarUrl: PILLAR_URL,
  disclaimer: RGPD_DISCLAIMER,
  perfilLabel: "Actividad declarada",
  evidenceIntro:
    "Con lo que conviene tener localizado para cada área. No es una certificación: es lo que te permite demostrar cómo trabajas.",
  evidenceLabel: "Qué tener localizado:",
  gapsTitle: "Área por área",
  stateLabels: RGPD_STATE_LABELS,
  dossier: {
    inventario: { evidencia: "El registro de actividades (o el mapa de tratamientos) con fecha de la última revisión y quién la hizo." },
    proveedores: { evidencia: "La lista de proveedores con su papel, dónde tratan los datos y dónde está cada contrato de encargo." },
    transparencia: { evidencia: "Una captura o copia de cada aviso de privacidad por punto de captación y cómo se registran los consentimientos." },
    transferencias: { evidencia: "Para cada proveedor fuera del EEE, la garantía en la que se apoya la transferencia y dónde consta." },
    derechos: { evidencia: "El procedimiento escrito y un registro de solicitudes con fecha de entrada, plazo y fecha de respuesta." },
    brechas: { evidencia: "El protocolo y el registro de incidentes, incluidos los que no se notificaron, con la decisión y su motivo." },
    seguridad: { evidencia: "Las fechas de las revisiones de accesos, la prueba de restauración de copias y la formación impartida." },
  },
  cta: (result) => {
    if (rgpdOfferFor(result) === "review-primary") {
      return {
        href: `${SITE}${RGPD_OPS_PRODUCT.paths.revision}`,
        label: "Solicitar una revisión profesional",
        note: "Tus respuestas incluyen señales de mayor riesgo: conviene revisar tu caso antes de organizarlo por tu cuenta.",
      };
    }
    return {
      href: `${SITE}${RGPD_OPS_PRODUCT.paths.landing}`,
      label: `Ver ${RGPD_OPS_PRODUCT.name} · ${RGPD_OPS_PRODUCT.price.displayFull}`,
      note: "Herramienta operativa: tratamientos, proveedores, solicitudes, incidentes, tareas y evidencias en un solo lugar.",
    };
  },
  extraHtml: (result) => {
    const review = result.review;
    if (!review?.recommended) return "";
    const items = review.motivos
      .map((m) => `<li style="margin-bottom:6px;color:#374151;font-size:13px;line-height:1.6;">${escapeHtml(m)}</li>`)
      .join("");
    return `<div style="border-left:3px solid #ea580c;padding:4px 0 4px 14px;margin:0 0 24px;">
        <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Por qué recomendamos una revisión profesional</p>
        <ul style="margin:0;padding-left:18px;">${items}</ul>
        <p style="margin:8px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">El test no determina si necesitas evaluación de impacto, delegado de protección de datos u otras medidas: eso requiere analizar tu caso.</p>
      </div>`;
  },
  plazoHtml: (result) =>
    `${escapeHtml(result.maturity?.label ?? "")}. Aplicable desde el ${escapeHtml(NORMAS.rgpd.aplicableDesdeLegible)} (RGPD) y el ${escapeHtml(NORMAS.lopdgdd.enVigorDesdeLegible)} (LOPDGDD): no hay un plazo de adaptación nuevo, se trata de mantener la operación al día.`,
  subjects: {
    obligado: (result) => `Tu diagnóstico de protección de datos: ${result.maturity?.label.toLowerCase() ?? "resultado"}`,
    noObligado: (result) => `Tu diagnóstico de protección de datos: ${result.maturity?.label.toLowerCase() ?? "resultado"}`,
  },
};
