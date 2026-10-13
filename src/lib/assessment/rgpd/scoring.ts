// Motor del diagnóstico RGPD. Reglas deterministas: mismas respuestas, mismo
// informe. Sin llamadas a modelos, para que el resultado sea explicable y
// reproducible.
//
// Estructura:
//   1. ¿cómo de organizada está la operación? → una evaluación por área
//   2. ¿qué madurez?                         → inicial / en_proceso / operativo
//   3. ¿hay señales de mayor riesgo?          → recomendación de revisión profesional
//   4. ¿por dónde empiezas?                   → prioridades ordenadas
//
// Reglas que gobiernan el tono (no reabrir sin motivo):
// - El resultado NO es "cumple / no cumple". Es madurez operativa.
// - El motor nunca concluye si hace falta una evaluación de impacto (EIPD), un
//   delegado de protección de datos (DPD) o notificar una brecha: cuando hay
//   señales, recomienda revisión profesional y dice de qué respuesta sale.
// - "No lo sé" no puntúa como cubierto: lo que no se puede demostrar no está
//   operativo.
// - `obligado` se rellena con "si" por compatibilidad con la columna de
//   assessment_responses (CHECK si/probable/no): el RGPD se aplica a cualquier
//   empresa que trate datos de personas. La island no lo muestra en la vista
//   de madurez.
//
// Imports relativos (no "@/"): el script de regresión lo ejecuta con tsx.

import type {
  AssessmentAnswers,
  AssessmentResult,
  GapEvaluation,
  GapState,
  MaturityLevel,
  ProfessionalReview,
  RiskLevel,
} from "../types";
import { ACTIVIDAD_LABELS, SENSIBLES_REVISION } from "./questions";
import { AFIRMACIONES } from "../../../data/rgpd";

export const ENGINE_VERSION = "rgpd-2026-10-v1";

export type AreaId =
  | "inventario"
  | "proveedores"
  | "transferencias"
  | "transparencia"
  | "derechos"
  | "brechas"
  | "seguridad";

/**
 * Peso de cada área en la madurez. Pesan más las que sostienen al resto: sin
 * mapa de tratamientos, sin proveedores identificados y sin avisos en los
 * puntos de captación no hay nada que mantener.
 */
export const WEIGHTS: Record<AreaId, number> = {
  inventario: 3,
  proveedores: 3,
  transparencia: 3,
  transferencias: 2,
  derechos: 2,
  brechas: 2,
  seguridad: 2,
};

const POINTS: Record<GapState, number> = { ok: 2, parcial: 1, gap: 0, desconocido: 0 };

export const MATURITY_LABEL: Record<MaturityLevel, string> = {
  inicial: "Madurez inicial",
  en_proceso: "Madurez en proceso",
  operativo: "Madurez operativa",
};

function first(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value ?? "");
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value === undefined || value === null || value === "") return [];
  return [String(value)];
}

/** Opciones exclusivas: si llegaran combinadas, el motor se queda con la lectura conservadora. */
function canales(answers: AssessmentAnswers): string[] {
  const c = list(answers.canales);
  return c.includes("ninguno") ? [] : c;
}

function medidas(answers: AssessmentAnswers): string[] {
  const m = list(answers.medidas);
  return m.includes("ninguna") ? [] : m;
}

// ---------------------------------------------------------------- áreas

function areaInventario(a: AssessmentAnswers): GapEvaluation {
  const rat = first(a.rat);
  const base = {
    id: "inventario",
    obligacion: "Mapa de tratamientos y registro de actividades (RAT)",
    derivadoDe: ["rat", "tamano", "datos"],
  };
  if (rat === "actualizado")
    return { ...base, estado: "ok", detalle: "Tenéis un registro revisado en el último año. Mantenlo vivo: cada canal, herramienta o finalidad nueva es un tratamiento que revisar." };
  if (rat === "desactualizado")
    return { ...base, estado: "parcial", detalle: "Existe, pero lleva más de un año sin revisarse. Lo habitual es que falten canales y herramientas recientes (WhatsApp, CRM, automatizaciones, IA)." };
  if (rat === "no") {
    const menos250 = first(a.tamano) !== "250+";
    return {
      ...base,
      estado: "gap",
      detalle: menos250
        ? `No hay registro. ${AFIRMACIONES.ratExcepcion.texto} Aunque no te obligara, sin mapa de tratamientos no hay forma ordenada de responder a una solicitud o a una brecha.`
        : "No hay registro. Con 250 personas o más, la excepción del registro no está disponible.",
    };
  }
  return { ...base, estado: "desconocido", detalle: "No sabes si existe. A efectos prácticos, si nadie lo encuentra, no está operativo." };
}

function areaProveedores(a: AssessmentAnswers): GapEvaluation {
  const p = first(a.proveedores);
  const c = first(a.contratos);
  const lista: number | null =
    p === "lista-ue" || p === "lista-fuera-revisado" ? 2 : p === "fuera-sin-revisar" ? 1 : p === "sin-lista" ? 0 : null;
  const contratos: number | null = c === "todos" ? 2 : c === "algunos" ? 1 : c === "ninguno" ? 0 : null;
  const base = {
    id: "proveedores",
    obligacion: "Proveedores que tratan datos por tu cuenta y contratos de encargo",
    derivadoDe: ["proveedores", "contratos"],
  };
  let estado: GapState;
  if (lista === null && contratos === null) estado = "desconocido";
  else if (lista !== null && contratos !== null) {
    const s = lista + contratos;
    estado = s === 4 ? "ok" : s === 0 ? "gap" : "parcial";
  } else {
    const known = (lista ?? contratos)!;
    estado = known === 0 ? "gap" : "parcial";
  }
  const detalles: Record<GapState, string> = {
    ok: "Sabéis qué proveedores tratan datos y tenéis localizados sus contratos de encargo. Toca revisarlos cuando cambie la herramienta o sus condiciones.",
    parcial: `Hay trabajo hecho, pero incompleto. ${AFIRMACIONES.encargado.texto}`,
    gap: `No hay lista de proveedores ni contratos revisados. ${AFIRMACIONES.encargado.texto}`,
    desconocido: "No sabes qué proveedores tratan datos ni si hay contratos. Es la primera pregunta de cualquier revisión.",
  };
  return { ...base, estado, detalle: detalles[estado] };
}

function areaTransferencias(a: AssessmentAnswers): GapEvaluation {
  const p = first(a.proveedores);
  const base = {
    id: "transferencias",
    obligacion: "Transferencias de datos fuera del Espacio Económico Europeo",
    derivadoDe: ["proveedores"],
  };
  if (p === "lista-ue")
    return { ...base, estado: "ok", detalle: "Según tu respuesta, todos los proveedores tratan los datos en la UE/EEE. Compruébalo de nuevo al contratar herramientas nuevas, sobre todo de IA." };
  if (p === "lista-fuera-revisado")
    return { ...base, estado: "ok", detalle: "Hay proveedores fuera del EEE y sabéis con qué garantía tratan los datos. Guarda esa referencia junto al contrato." };
  if (p === "fuera-sin-revisar")
    return { ...base, estado: "gap", detalle: "Hay proveedores fuera del EEE sin revisar. Es habitual con CRM, email, analítica e IA de empresas de EE. UU.: hay que saber con qué garantía se transfieren los datos." };
  return { ...base, estado: "desconocido", detalle: "Sin lista de proveedores no se puede saber si hay transferencias internacionales." };
}

function areaTransparencia(a: AssessmentAnswers): GapEvaluation {
  const t = first(a.transparencia);
  const c = canales(a);
  const pixeles = c.includes("pixeles");
  const base = {
    id: "transparencia",
    obligacion: "Información en los puntos de captación y consentimientos",
    derivadoDe: ["transparencia", "canales"],
  };
  const extraPixeles = pixeles ? " Revisa también la configuración de cookies y píxeles de medición y publicidad." : "";
  if (t === "completos")
    return { ...base, estado: "ok", detalle: `Cada punto de captación tiene su aviso y se ha revisado. Repite la revisión cuando cambie la web, un formulario o una herramienta.${extraPixeles}` };
  if (t === "parcial")
    return { ...base, estado: "parcial", detalle: `Hay política, pero no llega a todos los canales. ${AFIRMACIONES.informacionCapas.texto}${extraPixeles}` };
  if (t === "plantilla")
    return { ...base, estado: "parcial", detalle: `Un texto copiado o generado sin revisar suele describir tratamientos que no haces y omitir los que sí (WhatsApp, CRM, IA).${extraPixeles}` };
  if (t === "no")
    return { ...base, estado: "gap", detalle: `No hay avisos. ${AFIRMACIONES.informacionCapas.texto}${extraPixeles}` };
  return { ...base, estado: "desconocido", detalle: `No sabes cómo están los avisos. Recorre cada formulario y canal y apúntalo.${extraPixeles}` };
}

function areaDerechos(a: AssessmentAnswers): GapEvaluation {
  const d = first(a.derechos);
  const base = { id: "derechos", obligacion: "Gestión de solicitudes de derechos", derivadoDe: ["derechos"] };
  if (d === "procedimiento")
    return { ...base, estado: "ok", detalle: "Hay procedimiento, responsable, plazo y registro. Comprueba que el plazo se controla con fechas, no de memoria." };
  if (d === "informal")
    return { ...base, estado: "parcial", detalle: `Se responde, pero sin registro no se puede demostrar ni controlar el plazo. ${AFIRMACIONES.plazoDerechos.texto}` };
  if (d === "nada")
    return { ...base, estado: "gap", detalle: `No hay forma prevista de atenderlas. ${AFIRMACIONES.plazoDerechos.texto}` };
  return { ...base, estado: "desconocido", detalle: "No sabes cómo se atenderían. Define quién recibe las solicitudes y cómo se controla el plazo." };
}

function areaBrechas(a: AssessmentAnswers): GapEvaluation {
  const i = first(a.incidentes);
  const base = { id: "brechas", obligacion: "Protocolo y registro de incidentes", derivadoDe: ["incidentes"] };
  if (i === "protocolo")
    return { ...base, estado: "ok", detalle: `Hay protocolo y registro. ${AFIRMACIONES.brechaDocumentar.texto}` };
  if (i === "informal")
    return { ...base, estado: "parcial", detalle: `Sabéis a quién avisar, pero sin protocolo escrito la decisión se improvisa con el reloj en marcha. ${AFIRMACIONES.brecha72h.texto}` };
  if (i === "nada")
    return { ...base, estado: "gap", detalle: `No hay nada previsto. ${AFIRMACIONES.brecha72h.texto}` };
  return { ...base, estado: "desconocido", detalle: `No sabes qué pasaría. ${AFIRMACIONES.brechaDocumentar.texto}` };
}

function areaSeguridad(a: AssessmentAnswers): GapEvaluation {
  const m = medidas(a);
  const base = { id: "seguridad", obligacion: "Medidas organizativas y revisión periódica", derivadoDe: ["medidas"] };
  if (m.length === 0)
    return { ...base, estado: "gap", detalle: "Ninguna de las medidas básicas se hace de forma habitual: accesos, doble factor, copias probadas, formación y revisión periódica." };
  if (m.length >= 4 && m.includes("revision"))
    return { ...base, estado: "ok", detalle: "Las medidas básicas están en marcha y hay una revisión con fecha. Mantén la evidencia de cada revisión." };
  const faltan = 5 - m.length;
  return {
    ...base,
    estado: "parcial",
    detalle: m.includes("revision")
      ? `Hay revisión periódica, pero faltan ${faltan} de las medidas básicas.`
      : `Hay medidas en marcha, pero sin una revisión periódica con fecha no se sabe si siguen vigentes${faltan > 1 ? ` y faltan ${faltan - 1} de las básicas` : ""}.`,
  };
}

// ---------------------------------------------------------------- revisión profesional

const MOTIVOS_DATOS: Record<(typeof SENSIBLES_REVISION)[number], string> = {
  salud: "Tratáis datos de salud, una categoría especial (art. 9 RGPD) que exige una base específica y medidas reforzadas.",
  especiales: "Tratáis otras categorías especiales de datos (art. 9 RGPD), que exigen una base específica y medidas reforzadas.",
  menores: "Tratáis datos de menores, un supuesto de mayor riesgo según la LOPDGDD (art. 28.2.e).",
  geolocalizacion: "Tratáis la ubicación o los movimientos de las personas, un supuesto de mayor riesgo según la LOPDGDD (art. 28.2.d).",
  perfiles: "Elaboráis perfiles o segmentación por comportamiento o preferencias, un supuesto de mayor riesgo según la LOPDGDD (art. 28.2.d).",
  decisiones: "Usáis reglas o IA que puntúan o deciden sobre personas. Si las decisiones son automatizadas y tienen efectos significativos, el RGPD prevé garantías específicas (art. 22).",
  "gran-escala": "Tratáis datos de un número muy alto de personas, un supuesto de mayor riesgo según la LOPDGDD (art. 28.2.f).",
};

export function evaluarRevision(a: AssessmentAnswers): ProfessionalReview {
  const datos = list(a.datos);
  const motivos: string[] = [];
  const derivadoDe = new Set<string>();
  for (const flag of SENSIBLES_REVISION) {
    if (datos.includes(flag)) {
      motivos.push(MOTIVOS_DATOS[flag]);
      derivadoDe.add("datos");
    }
  }
  if (first(a.actividad) === "agencia" && canales(a).includes("pixeles") && !datos.includes("perfiles")) {
    motivos.push(
      "Hacéis publicidad con píxeles de medición. La LOPDGDD obliga a designar delegado de protección de datos a quien hace publicidad o prospección comercial basada en preferencias o perfiles (art. 34.1.k): confirma si es tu caso.",
    );
    derivadoDe.add("actividad");
    derivadoDe.add("canales");
  }
  if (first(a.tamano) === "250+") {
    motivos.push("Con 250 personas o más, una herramienta estándar no basta como único soporte: tu caso pide un análisis a medida.");
    derivadoDe.add("tamano");
  }
  return { recommended: motivos.length > 0, motivos, derivadoDe: [...derivadoDe] };
}

function areaRiesgo(review: ProfessionalReview): GapEvaluation {
  const base = {
    id: "riesgo",
    obligacion: "Análisis de riesgo, evaluación de impacto y delegado de protección de datos",
    derivadoDe: review.derivadoDe.length ? review.derivadoDe : ["datos", "actividad", "canales", "tamano"],
  };
  if (review.recommended)
    return {
      ...base,
      estado: "desconocido",
      detalle:
        "Tus respuestas incluyen señales de mayor riesgo. Este test no determina si necesitas una evaluación de impacto o un delegado de protección de datos: eso requiere un análisis específico de tu caso por un profesional.",
    };
  return {
    ...base,
    estado: "ok",
    detalle:
      "Tus respuestas no incluyen las señales de mayor riesgo que revisa el test. Si cambian (datos de salud, menores, perfiles, IA que decide, gran escala), vuelve a hacerlo.",
  };
}

// ---------------------------------------------------------------- prioridades

const ACCION: Record<AreaId, { gap: string; parcial: string }> = {
  inventario: {
    gap: "Haz el mapa de tratamientos: empieza por clientes y leads, empleados y marketing. Para cada uno, finalidad, datos, de quién, a quién se comunican y cuánto se guardan.",
    parcial: "Revisa el registro de actividades: añade los canales y herramientas nuevos (WhatsApp, CRM, automatizaciones, IA) y actualiza los plazos de conservación.",
  },
  proveedores: {
    gap: "Haz la lista de proveedores que tratan datos por vosotros y localiza el contrato de encargo (DPA) de cada uno.",
    parcial: "Completa los contratos de encargo que faltan y apunta dónde está cada uno y cuándo revisarlo.",
  },
  transparencia: {
    gap: "Pon un aviso de privacidad en cada punto de captación (formularios, WhatsApp, newsletter) y revisa la configuración de cookies y píxeles.",
    parcial: "Revisa que cada formulario y canal tenga su información básica por capas y, donde haga falta, un consentimiento que puedas demostrar.",
  },
  transferencias: {
    gap: "Identifica qué proveedores tratan datos fuera del EEE y con qué garantía lo hacen; guarda la referencia junto al contrato.",
    parcial: "Completa la información de transferencias de los proveedores que faltan.",
  },
  derechos: {
    gap: "Define quién recibe las solicitudes de derechos, cómo se verifica la identidad y cómo se controla el plazo de un mes.",
    parcial: "Empieza a registrar cada solicitud con una referencia interna, la fecha de entrada y el plazo de respuesta.",
  },
  brechas: {
    gap: "Escribe un protocolo de incidentes: quién decide, cómo se documenta y cómo se controla el plazo de 72 horas cuando una brecha deba notificarse.",
    parcial: "Pon por escrito lo que ya sabéis hacer ante un incidente y abre un registro, también para los que no se notifican.",
  },
  seguridad: {
    gap: "Revisa quién tiene acceso a cada herramienta, activa el doble factor, prueba a restaurar una copia y fija una fecha de revisión periódica.",
    parcial: "Completa las medidas básicas que faltan y fija una revisión trimestral con fecha.",
  },
};

const MANTENIMIENTO = [
  "Programa la revisión trimestral y guarda la evidencia de cada una.",
  "Revisa el mapa de tratamientos y la lista de proveedores cada vez que incorpores una herramienta nueva, sobre todo de IA.",
  "Comprueba los avisos de privacidad tras cualquier cambio en la web o en los formularios.",
  "Haz un simulacro de incidente: quién decide, qué se documenta y cómo se controla el reloj de 72 horas.",
];

const STATE_ORDER: Record<GapState, number> = { gap: 0, desconocido: 1, parcial: 2, ok: 3 };

function prioridadesDe(areas: GapEvaluation[], review: ProfessionalReview): string[] {
  const out: string[] = [];
  if (review.recommended) {
    out.push(
      "Antes de seguir por tu cuenta, pide una revisión profesional de tu caso: hay señales de mayor riesgo que una herramienta operativa no resuelve sola.",
    );
  }
  const pendientes = areas
    .filter((g) => g.estado !== "ok")
    .sort(
      (x, y) =>
        STATE_ORDER[x.estado] - STATE_ORDER[y.estado] ||
        WEIGHTS[y.id as AreaId] - WEIGHTS[x.id as AreaId] ||
        x.id.localeCompare(y.id),
    );
  for (const g of pendientes) {
    const accion = ACCION[g.id as AreaId];
    out.push(g.estado === "parcial" ? accion.parcial : accion.gap);
  }
  if (out.length === 0 || (out.length === 1 && review.recommended)) out.push(...MANTENIMIENTO);
  return out.slice(0, 6);
}

// ---------------------------------------------------------------- resultado

export function maturityFrom(areas: GapEvaluation[]): { level: MaturityLevel; score: number; scoreMax: number } {
  let score = 0;
  let scoreMax = 0;
  for (const g of areas) {
    const w = WEIGHTS[g.id as AreaId] ?? 0;
    score += w * POINTS[g.estado];
    scoreMax += w * 2;
  }
  const ratio = scoreMax ? score / scoreMax : 0;
  const anyGap = areas.some((g) => g.estado === "gap");
  const level: MaturityLevel = ratio >= 0.8 && !anyGap ? "operativo" : ratio >= 0.4 ? "en_proceso" : "inicial";
  return { level, score, scoreMax };
}

function riskLevelFrom(level: MaturityLevel, review: boolean): RiskLevel {
  if (level === "inicial") return review ? "critico" : "alto";
  if (level === "en_proceso") return review ? "alto" : "medio";
  return review ? "medio" : "bajo";
}

const TITULAR: Record<MaturityLevel, string> = {
  inicial: "Tu protección de datos está en fase inicial: faltan piezas básicas de la operación",
  en_proceso: "Tu protección de datos está en marcha, pero todavía no funciona como un sistema",
  operativo: "Tu protección de datos funciona como un sistema: ahora toca mantenerlo",
};

export function scoreAssessment(answers: AssessmentAnswers): AssessmentResult {
  const areas: GapEvaluation[] = [
    areaInventario(answers),
    areaProveedores(answers),
    areaTransparencia(answers),
    areaTransferencias(answers),
    areaDerechos(answers),
    areaBrechas(answers),
    areaSeguridad(answers),
  ];
  const review = evaluarRevision(answers);
  const { level, score, scoreMax } = maturityFrom(areas);
  const actividad = first(answers.actividad);

  return {
    obligado: "si",
    motivo: `${AFIRMACIONES.ambito.texto} El resultado mide cómo de organizada está tu operación, no si cumples: eso requiere revisar tu caso concreto.`,
    sector: actividad || "otra",
    sectorLabel: ACTIVIDAD_LABELS[actividad] ?? "Otra actividad",
    gaps: [...areas, areaRiesgo(review)],
    riskScore: scoreMax - score,
    riskScoreMax: scoreMax,
    riskLevel: riskLevelFrom(level, review.recommended),
    // Sin plazo legal nuevo: el RGPD es aplicable desde 2018.
    diasRestantes: 0,
    titular: TITULAR[level],
    prioridades: prioridadesDe(areas, review),
    engineVersion: ENGINE_VERSION,
    maturity: { level, label: MATURITY_LABEL[level], score, scoreMax },
    review,
  };
}
