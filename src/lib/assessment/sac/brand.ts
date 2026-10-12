// Marca del informe del test de la Ley 10/2025 (Frente A). Antes estos textos
// eran los valores por defecto de email.ts; viven aquí para que el generador de
// emails no conozca ninguna norma y el test de Verifactu no pueda heredarlos.
// Los textos son los mismos que se enviaban: el correo de la Ley 10/2025 no cambia.

import type { AssessmentBrand } from "../email";

const SITE = "https://iaoperators.com";

export const SAC_BRAND: AssessmentBrand = {
  norma: "Ley 10/2025",
  cabecera: "Ley 10/2025 · Informe de cumplimiento",
  origen: "Resultado generado por reglas deterministas sobre el texto de la Ley 10/2025",
  legislationId: "BOE-A-2025-26698",
  pillarUrl: `${SITE}/es/cumplimiento/ley-atencion-al-cliente/`,
  disclaimer:
    "Información técnica sobre implementación de sistemas: no constituye asesoramiento jurídico.",
  perfilLabel: "Sector declarado",
  evidenceIntro:
    "Con la evidencia que pedirá la auditoría acreditada y el esfuerzo orientativo de cada pieza.",
  evidenceLabel: "Evidencia para la auditoría:",
  // Evidencia que el auditor acreditado va a pedir por cada obligación, y esfuerzo
  // orientativo. Orientativo a propósito: el número firme sale del diagnóstico.
  dossier: {
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
  },
  cta: () => ({
    href: `${SITE}/es/contact/`,
    label: "Reservar una llamada de 30 minutos",
    note: "Salimos de la llamada con el diagnóstico de brecha acotado y con precio cerrado.",
  }),
  plazoHtml: (result) =>
    `Plazo de adaptación: <strong style="color:#111827;">28 de diciembre de 2026</strong>
          (quedan ${result.diasRestantes} días)`,
  subjects: {
    obligado: (result) => `Tu informe de cumplimiento — quedan ${result.diasRestantes} días`,
    noObligado: () => "Tu resultado del test de Ley 10/2025",
  },
};
