// Marca del informe del test de Verifactu. Ningún texto de la Ley 10/2025:
// pilar, BOE, dossier, CTA y plazos son propios del RRSIF. Las fechas salen de
// la fuente central (src/data/verifactu.ts) y la oferta del segmento de
// src/lib/verifactu-kit/segment.ts, la misma regla que usa la island.
//
// Imports relativos: el script de regresión ejecuta esto con tsx fuera de Astro.

import type { AssessmentBrand } from "../email";
import { escapeHtml } from "../email";
import { ANUNCIO, NORMA } from "../../../data/verifactu";
import { KIT_PRODUCT } from "../../../data/verifactu-kit";
import { kitOfferFor } from "../../verifactu-kit/segment";

const SITE = "https://iaoperators.com";
const PILLAR_URL = `${SITE}/es/cumplimiento/verifactu/`;

export const VERIFACTU_BRAND: AssessmentBrand = {
  norma: "Verifactu",
  cabecera: "Verifactu · Informe orientativo",
  origen:
    "Resultado generado por reglas deterministas sobre el Real Decreto 1007/2023 y su calendario vigente",
  legislationId: NORMA.boeId,
  pillarUrl: PILLAR_URL,
  disclaimer:
    "Resultado orientativo. Información técnica sobre sistemas de facturación: no constituye asesoramiento fiscal ni jurídico. Confirma tu caso con tu asesoría.",
  perfilLabel: "Sistema declarado",
  evidenceIntro:
    "Con la documentación que conviene pedir o conservar para cada pieza. No es una certificación: es lo que te permite demostrar qué hace tu sistema.",
  evidenceLabel: "Qué pedir o conservar:",
  dossier: {
    ambito: {
      evidencia:
        "La justificación de la exclusión: alta en el SII, domicilio fiscal foral o análisis de tu asesoría sobre las operaciones sin obligación de factura.",
    },
    registro: {
      evidencia:
        "Muestra de registros de alta y de anulación vinculados uno a uno con sus facturas, y la confirmación de que ninguna vía de emisión (importaciones, procesos automáticos, integraciones) factura sin generar registro.",
    },
    encadenamiento: {
      evidencia:
        "Inventario de series y puntos de emisión, descripción de cómo se encadenan los registros por huella y una comprobación de la cadena sin huecos sobre un periodo real.",
    },
    remision: {
      evidencia:
        "En VERI*FACTU: las respuestas de la AEAT por registro, el histórico de incidencias y los reenvíos. En NO VERI*FACTU: registro de eventos, firma de los registros y procedimiento de exportación.",
    },
    qr: {
      evidencia:
        "Una factura de cada plantilla de salida (PDF, ticket, email, portal) con el QR legible y, en VERI*FACTU, la mención «VERI*FACTU» o «Factura verificable». Prueba de lectura en el dispositivo real.",
    },
    inalterable: {
      evidencia:
        "Descripción de dónde se guardan los registros y cómo se impide modificarlos, política de conservación y una exportación de prueba.",
    },
    declaracion: {
      evidencia:
        "Declaración responsable del productor para la versión exacta instalada, identificación del sistema y de la versión y, si hay desarrollo propio o adaptaciones de terceros, quién responde de esa versión.",
    },
  },
  cta: (result) => {
    const mode = kitOfferFor(result);
    if (mode === "none") {
      return {
        href: `${PILLAR_URL}plazos/`,
        label: "Ver fechas y exclusiones",
        note: "No necesitas contratar nada. Confirma la conclusión con tu asesoría.",
      };
    }
    if (mode === "kit-primary") {
      return {
        href: `${SITE}${KIT_PRODUCT.paths.landing}`,
        label: `Ver el ${KIT_PRODUCT.shortName} · ${KIT_PRODUCT.price.displayFull}`,
        note: "Producto digital: qué te aplica, qué pedir a tu proveedor, inventario de facturación y plan de 30 días.",
      };
    }
    return {
      href: `${SITE}${KIT_PRODUCT.paths.auditoria}`,
      label: "Solicitar la auditoría de tu sistema",
      note: "Tres a cinco días. Sale con el alcance cerrado y la modalidad recomendada.",
    };
  },
  extraHtml: (result) => {
    if (kitOfferFor(result) !== "audit-primary") return "";
    return `<p style="text-align:center;margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">
        ¿Prefieres ordenar antes la documentación y las preguntas a tu proveedor?
        <a href="${escapeHtml(`${SITE}${KIT_PRODUCT.paths.landing}`)}" style="color:#ea580c;">${escapeHtml(KIT_PRODUCT.shortName)}</a>
        (${escapeHtml(KIT_PRODUCT.price.displayFull)}).
      </p>`;
  },
  plazoHtml: (result) =>
    result.obligado === "no"
      ? `Fechas vigentes del reglamento, por si cambia tu situación: <strong style="color:#111827;">${escapeHtml(NORMA.fechaSociedadesLegible)}</strong> (Impuesto sobre Sociedades) y <strong style="color:#111827;">${escapeHtml(NORMA.fechaRestoLegible)}</strong> (resto).`
      : `Fechas vigentes: <strong style="color:#111827;">${escapeHtml(NORMA.fechaSociedadesLegible)}</strong> (Impuesto sobre Sociedades) y <strong style="color:#111827;">${escapeHtml(NORMA.fechaRestoLegible)}</strong> (resto). ${escapeHtml(ANUNCIO.texto)}`,
  subjects: {
    obligado: () => "Tu informe de Verifactu: qué le falta a tu sistema",
    noObligado: () => "Tu resultado del test de Verifactu",
  },
};
