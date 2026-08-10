// Cuestionario del test de Verifactu (RD 1007/2023, RRSIF).
// 8 preguntas, menos de dos minutos. Misma regla que el test de la Ley 10/2025:
// cada pregunta existe porque cambia el resultado. Si una pregunta no mueve
// ningún veredicto ni ninguna prioridad, no entra — alarga el test y baja la
// tasa de finalización sin cualificar mejor.
//
// El orden no es casual: la primera pregunta es la de exclusión. Decir pronto
// "esto no te aplica" ahorra tiempo a todos y es lo que genera confianza en un
// test de cumplimiento. Un test que siempre concluye "necesitas ayuda" no es un
// diagnóstico, es un formulario disfrazado.

import type { AssessmentQuestion } from "../types";

export const ASSESSMENT_KEY = "verifactu-rrsif" as const;
export const ASSESSMENT_VERSION = "2026-08-v1";
export const ASSESSMENT_PUBLIC_PATH = "/es/cumplimiento/verifactu/test/";

export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "exclusion",
    type: "single",
    title: "¿Estás en alguno de estos supuestos?",
    description:
      "El reglamento deja fuera a quien ya suministra sus libros por el SII y a quien tributa en territorio foral.",
    options: [
      { value: "sii", label: "Llevamos los libros registro de IVA por el SII" },
      {
        value: "foral",
        label: "Tributamos en País Vasco o Navarra",
        hint: "Territorio foral: normativa propia (TicketBAI y equivalentes)",
      },
      { value: "ninguno", label: "Ninguno de los dos" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "tributacion",
    type: "single",
    title: "¿Cómo tributa la empresa?",
    description: "Determina cuál de las dos fechas de 2027 te aplica.",
    options: [
      { value: "sociedades", label: "Impuesto sobre Sociedades (S.L., S.A., etc.)" },
      { value: "irpf", label: "IRPF — autónomo o entidad en atribución de rentas" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "sistema",
    type: "single",
    title: "¿Con qué emites las facturas?",
    description: "Define tu caso y, con él, dónde suelen estar las trampas.",
    options: [
      { value: "erp-propio", label: "ERP propio o muy adaptado" },
      { value: "tpv", label: "TPV en una o varias tiendas" },
      { value: "ecommerce", label: "E-commerce propio o muy personalizado" },
      { value: "vertical", label: "Software vertical de mi sector" },
      { value: "estandar", label: "Software estándar de mercado, sin adaptar" },
      { value: "manual", label: "Hoja de cálculo, plantillas o a mano" },
    ],
  },
  {
    id: "puntos_emision",
    type: "single",
    title: "¿Desde cuántos sitios se emiten facturas?",
    description:
      "Cuenta módulos, cajas, tiendas, integraciones y procesos automáticos — no solo las personas.",
    options: [
      { value: "uno", label: "Uno solo" },
      { value: "dos-cinco", label: "Entre dos y cinco" },
      { value: "mas-cinco", label: "Más de cinco" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "series",
    type: "single",
    title: "¿Cómo están las series de facturación?",
    description: "La cadena de huellas se define por serie y punto de emisión.",
    options: [
      { value: "una", label: "Una sola serie, correlativa" },
      { value: "varias-documentadas", label: "Varias series, y sabemos por qué existe cada una" },
      { value: "varias-opacas", label: "Varias series, y hay saltos que nadie sabe explicar" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "integracion",
    type: "single",
    title: "¿Cómo se deja enganchar tu sistema?",
    description: "Es lo que decide la viabilidad técnica, más que la marca del software.",
    options: [
      { value: "api", label: "Tiene API documentada" },
      { value: "eventos", label: "Tiene webhooks o eventos" },
      { value: "bbdd", label: "Solo acceso a la base de datos" },
      { value: "caja-negra", label: "Es una caja negra: no expone nada" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "conectividad",
    type: "single",
    title: "¿Cómo es la conectividad de los puntos de emisión?",
    description:
      "Decide entre VERI*FACTU (remisión inmediata) y sistema no verificable, que exige firma, registro de eventos y alarmas.",
    options: [
      { value: "estable", label: "Siempre conectados, sin incidencias relevantes" },
      { value: "intermitente", label: "Algún punto con conectividad poco fiable" },
      { value: "offline", label: "Hay puntos que trabajan offline con normalidad" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "estado",
    type: "multi",
    min: 1,
    title: "¿Qué tiene ya tu sistema, hoy?",
    description: "Marca todo lo que exista y funcione. Si dudas, no lo marques.",
    options: [
      { value: "registro", label: "Genera un registro por cada factura emitida y anulada" },
      { value: "encadenamiento", label: "Encadena los registros por huella o hash" },
      { value: "remision", label: "Envía registros a la AEAT con cola y reintento" },
      { value: "qr", label: "Imprime el QR y la mención en todas las plantillas" },
      { value: "inalterable", label: "Guarda la evidencia en almacenamiento inalterable" },
      { value: "nada", label: "Nada de lo anterior" },
    ],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;

export const QUESTION_IDS = QUESTIONS.map((q) => q.id);

export function getQuestion(id: string) {
  return QUESTIONS.find((q) => q.id === id);
}

/** Etiquetas del perfil detectado, que el informe muestra como chip. */
export const SISTEMA_LABELS: Record<string, string> = {
  "erp-propio": "ERP propio o muy adaptado",
  tpv: "TPV en tienda",
  ecommerce: "E-commerce propio",
  vertical: "Software vertical de sector",
  estandar: "Software estándar de mercado",
  manual: "Facturación manual o por plantillas",
};

/** Caso del silo al que deriva cada sistema, cuando existe página propia. */
export const SISTEMA_CASO: Record<string, string | null> = {
  "erp-propio": "erp-a-medida",
  tpv: "tpv-multitienda",
  ecommerce: "ecommerce-propio",
  vertical: "software-vertical",
  estandar: null,
  manual: null,
};
