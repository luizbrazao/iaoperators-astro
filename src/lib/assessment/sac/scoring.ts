// Motor de resultado del test de cumplimiento de la Ley 10/2025.
//
// DECISIÓN DE DISEÑO: reglas deterministas, no LLM. Esto emite un veredicto de
// sujeción a una norma y una lista de brechas que el cliente va a enseñar a su
// asesoría. Tiene que ser reproducible, explicable y versionado: la misma
// respuesta da siempre el mismo resultado, y cada veredicto declara de qué
// pregunta sale (`derivadoDe`).
//
// Base normativa verificada en BOE-A-2025-26698:
//   art. 2.1 → sectores básicos, obligados sin umbral.
//   art. 2.2 → resto de empresas y grupos, umbrales ALTERNATIVOS
//              (≥250 personas O >50 M€ facturación O >43 M€ balance).
//   art. 10  → 95 % de llamadas atendidas, de media, en <3 min.
//   art. 17  → quejas y reclamaciones en ≤15 días hábiles.
//   disp. transitoria única → 12 meses desde 28/12/2025 ⇒ 28/12/2026.

import type {
  AssessmentAnswers,
  AssessmentResult,
  GapEvaluation,
  GapState,
  ObligadoVerdict,
  RiskLevel,
} from "../types";
import { SECTORES_BASICOS, SECTOR_LABELS } from "./questions";

export const ENGINE_VERSION = "sac-2026-07-v1";

/** Fin del plazo de adaptación. */
const DEADLINE_ISO = "2026-12-28T00:00:00+01:00";

/** Peso de cada obligación en el score. Las que tienen SLA duro pesan más. */
const WEIGHTS = {
  medicion: 3,
  plazos: 3,
  registro: 3,
  clave: 2,
  auditoria: 2,
  canales: 1,
} as const;

const STATE_POINTS: Record<GapState, number> = {
  ok: 0,
  parcial: 1,
  gap: 2,
  // Desconocido puntúa como parcial: no sabemos, pero tampoco podemos demostrarlo,
  // y ante una auditoría "no lo sé" se comporta como un incumplimiento no acreditado.
  desconocido: 1,
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

export function diasHastaPlazo(now: number = Date.now()): number {
  const deadline = new Date(DEADLINE_ISO).getTime();
  return Math.max(0, Math.ceil((deadline - now) / 86_400_000));
}

/** Art. 2: ¿la empresa queda dentro del ámbito de aplicación? */
function evaluarObligacion(answers: AssessmentAnswers): {
  obligado: ObligadoVerdict;
  motivo: string;
} {
  const sector = first(answers.sector);
  const plantilla = first(answers.plantilla);
  const umbrales = first(answers.umbrales);

  if ((SECTORES_BASICOS as readonly string[]).includes(sector)) {
    return {
      obligado: "si",
      motivo:
        "Prestáis un servicio básico de interés general (art. 2.1). La obligación aplica por la actividad, con independencia del número de personas empleadas o de la facturación.",
    };
  }

  if (plantilla === "250-mas") {
    return {
      obligado: "si",
      motivo:
        "Superáis las 250 personas trabajadoras (art. 2.2). Los umbrales son alternativos: basta con cumplir uno.",
    };
  }

  if (umbrales === "facturacion" || umbrales === "balance" || umbrales === "grupo") {
    const detalle =
      umbrales === "facturacion"
        ? "Superáis los 50 M€ de volumen de negocios anual"
        : umbrales === "balance"
          ? "Superáis los 43 M€ de balance anual"
          : "El grupo de sociedades al que pertenecéis supera alguno de los umbrales";
    return {
      obligado: "si",
      motivo: `${detalle} (art. 2.2). Los umbrales son alternativos: basta con cumplir uno, y el cómputo se hace también a nivel de grupo.`,
    };
  }

  if (plantilla === "no-lo-se" || umbrales === "no-lo-se") {
    return {
      obligado: "probable",
      motivo:
        "Con los datos indicados no se puede cerrar el veredicto. Los umbrales del art. 2.2 son alternativos y se computan también a nivel de grupo, así que conviene verificar las cifras consolidadas antes de descartar la obligación.",
    };
  }

  return {
    obligado: "no",
    motivo:
      "Con los datos indicados no alcanzáis los umbrales del art. 2.2 ni prestáis un servicio básico del art. 2.1. Conviene revisarlo si crecéis, si consolidáis en un grupo o si cambia vuestra actividad.",
  };
}

function evaluarMedicion(answers: AssessmentAnswers): GapEvaluation {
  const v = first(answers.medicion);
  const map: Record<string, [GapState, string]> = {
    "tiempo-real": [
      "ok",
      "Ya medís en tiempo real. Queda acreditar la media del 95 % en menos de 3 minutos con datos exportables.",
    ],
    informes: [
      "parcial",
      "Medir a posteriori demuestra el pasado pero no permite corregir dentro del plazo. Falta alerta en vivo y desbordamiento automático.",
    ],
    "solo-centralita": [
      "gap",
      "Los datos brutos de centralita no son evidencia de cumplimiento: falta el cálculo de la media exigida y su exportación.",
    ],
    no: ["gap", "Sin medición no podéis acreditar el 95 % en menos de 3 minutos ante una auditoría."],
    "no-lo-se": ["desconocido", "Sin saber qué se mide hoy, el primer paso es instrumentar la medición."],
  };
  const [estado, detalle] = map[v] ?? map["no-lo-se"];
  return {
    id: "medicion",
    obligacion: "95 % de las llamadas atendidas, de media, en menos de 3 minutos (art. 10)",
    estado,
    detalle,
    derivadoDe: ["medicion"],
  };
}

function evaluarClave(answers: AssessmentAnswers): GapEvaluation {
  const v = first(answers.clave);
  const map: Record<string, [GapState, string]> = {
    "unica-omnicanal": ["ok", "Cumplís el requisito. Queda comprobar que la clave sobrevive al traspaso entre canales y a la escalada."],
    parcial: ["parcial", "La clave existe pero se rompe al cambiar de canal: es justo donde la trazabilidad se pierde."],
    interno: ["gap", "Un número de ticket que no se comunica no cumple: la clave tiene que entregarse a la clientela para su seguimiento."],
    no: ["gap", "No se emite clave identificativa. Es uno de los incumplimientos más visibles desde fuera."],
  };
  const [estado, detalle] = map[v] ?? map.no;
  return {
    id: "clave",
    obligacion: "Clave identificativa única por interacción, consultable por la clientela",
    estado,
    detalle,
    derivadoDe: ["clave"],
  };
}

function evaluarPlazos(answers: AssessmentAnswers): GapEvaluation {
  const v = first(answers.plazos);
  const map: Record<string, [GapState, string]> = {
    automatico: ["ok", "Tenéis reloj y escalado. Queda validar que el cálculo usa días hábiles y el calendario laboral correcto."],
    manual: ["parcial", "El control manual sobrevive al volumen bajo y falla en los picos, que es cuando se incumple el plazo."],
    persona: ["gap", "Depender de seguimiento individual convierte el plazo legal en un riesgo de persona concreta."],
    no: ["gap", "Sin control sistemático del plazo de 15 días hábiles, el incumplimiento es cuestión de tiempo."],
  };
  const [estado, detalle] = map[v] ?? map.no;
  return {
    id: "plazos",
    obligacion: "Resolución de quejas y reclamaciones en 15 días hábiles (art. 17)",
    estado,
    detalle,
    derivadoDe: ["plazos"],
  };
}

function evaluarRegistro(answers: AssessmentAnswers): GapEvaluation {
  const v = first(answers.registro);
  const map: Record<string, [GapState, string]> = {
    inmutable: ["ok", "Tenéis la base de la evidencia. Queda organizarla por obligación para la auditoría anual."],
    "crm-editable": ["parcial", "Un registro editable es débil como evidencia: hay que poder demostrar que no se ha alterado."],
    disperso: ["gap", "La evidencia dispersa entre sistemas no se puede reconstruir a posteriori con garantías."],
    no: ["gap", "Sin registro sistemático no hay nada que presentar en la auditoría anual."],
  };
  const [estado, detalle] = map[v] ?? map.no;
  return {
    id: "registro",
    obligacion: "Registro y trazabilidad de las gestiones",
    estado,
    detalle,
    derivadoDe: ["registro"],
  };
}

function evaluarCanales(answers: AssessmentAnswers, esBasico: boolean): GapEvaluation {
  const canales = list(answers.canales);
  const tieneTelefono = canales.includes("telefono");
  const tieneDigital = canales.some((c) => ["whatsapp", "email", "chat-web", "formulario"].includes(c));

  let estado: GapState;
  let detalle: string;

  if (!tieneTelefono) {
    estado = "gap";
    detalle =
      "Sin canal telefónico atendido, los requisitos de espera y de atención personalizada bajo demanda son difíciles de sostener.";
  } else if (!tieneDigital) {
    estado = "parcial";
    detalle =
      "Solo teléfono concentra todo el volumen en el canal con el SLA más exigente. Descargarlo en digital es lo que hace sostenible la media de 3 minutos.";
  } else {
    estado = "ok";
    detalle = "La cobertura de canales es adecuada. El trabajo está en unificarlos bajo una misma clave y un mismo reloj.";
  }

  if (esBasico) {
    detalle += " Además, como servicio básico debéis permitir comunicar incidencias 24 h los 365 días del año.";
    if (estado === "ok") estado = "parcial";
  }

  return {
    id: "canales",
    obligacion: esBasico
      ? "Atención personalizada bajo demanda y disponibilidad 24/7/365 para incidencias"
      : "Atención personalizada bajo demanda, sin contestador automático como único canal",
    estado,
    detalle,
    derivadoDe: ["canales", "sector"],
  };
}

/** Derivada: solo se puede auditar lo que se registra de forma fiable y se mide. */
function evaluarAuditoria(registro: GapEvaluation, medicion: GapEvaluation): GapEvaluation {
  const peor = Math.max(STATE_POINTS[registro.estado], STATE_POINTS[medicion.estado]);
  const estado: GapState = peor >= 2 ? "gap" : peor === 1 ? "parcial" : "ok";
  const detalle =
    estado === "ok"
      ? "Con registro fiable y medición en vivo, el dossier anual es cuestión de organizar y exportar."
      : estado === "parcial"
        ? "El dossier se puede montar, pero con huecos que el auditor va a señalar. Conviene cerrarlos antes."
        : "Hoy no hay material con el que superar una auditoría acreditada: la evidencia se construye durante el año, no la semana antes.";
  return {
    id: "auditoria",
    obligacion: "Auditoría anual de calidad por entidad acreditada por ENAC",
    estado,
    detalle,
    derivadoDe: ["registro", "medicion"],
  };
}

function nivelRiesgo(score: number, max: number): RiskLevel {
  const ratio = max === 0 ? 0 : score / max;
  if (ratio >= 0.65) return "critico";
  if (ratio >= 0.4) return "alto";
  if (ratio >= 0.18) return "medio";
  return "bajo";
}

function construirTitular(
  obligado: ObligadoVerdict,
  riskLevel: RiskLevel,
  dias: number,
): string {
  if (obligado === "no") {
    return "Con los datos indicados, hoy no estáis dentro del ámbito de la ley";
  }
  const sujeto = obligado === "probable" ? "Es probable que estéis obligados" : "Estáis obligados";
  const riesgo: Record<RiskLevel, string> = {
    critico: `y la brecha es amplia: quedan ${dias} días`,
    alto: `y hay brechas relevantes que cerrar en ${dias} días`,
    medio: `y quedan piezas por cerrar antes del plazo`,
    bajo: `y estáis cerca de cumplir: falta acreditarlo`,
  };
  return `${sujeto} ${riesgo[riskLevel]}`;
}

function construirPrioridades(gaps: GapEvaluation[], obligado: ObligadoVerdict): string[] {
  if (obligado === "no") {
    return [
      "Revisar el cómputo a nivel de grupo antes de descartar la obligación.",
      "Volver a evaluar si cambia la actividad, la plantilla o la facturación.",
    ];
  }
  const orden = ["medicion", "plazos", "registro", "clave", "canales", "auditoria"];
  const acciones: Record<string, string> = {
    medicion: "Instrumentar la medición del tiempo de atención en vivo, con alerta y desbordamiento.",
    plazos: "Montar el reloj de plazo sobre calendario hábil, con escalado automático antes del vencimiento.",
    registro: "Levantar el registro inmutable de interacciones y cambios de estado, con exportación.",
    clave: "Emitir clave identificativa única y hacerla consultable desde cualquier canal.",
    canales: "Unificar los canales bajo un mismo flujo, con salida a persona explícita.",
    auditoria: "Organizar el cuadro de mando y el dossier de evidencias por obligación.",
  };
  return gaps
    .filter((g) => g.estado === "gap" || g.estado === "parcial" || g.estado === "desconocido")
    .sort((a, b) => {
      const porEstado = STATE_POINTS[b.estado] - STATE_POINTS[a.estado];
      if (porEstado !== 0) return porEstado;
      return orden.indexOf(a.id) - orden.indexOf(b.id);
    })
    .slice(0, 4)
    .map((g) => acciones[g.id])
    .filter(Boolean);
}

export function scoreAssessment(
  answers: AssessmentAnswers,
  now: number = Date.now(),
): AssessmentResult {
  const sector = first(answers.sector) || "otro";
  const esBasico = (SECTORES_BASICOS as readonly string[]).includes(sector);
  const { obligado, motivo } = evaluarObligacion(answers);

  const medicion = evaluarMedicion(answers);
  const clave = evaluarClave(answers);
  const plazos = evaluarPlazos(answers);
  const registro = evaluarRegistro(answers);
  const canales = evaluarCanales(answers, esBasico);
  const auditoria = evaluarAuditoria(registro, medicion);

  const gaps = [medicion, plazos, registro, clave, canales, auditoria];

  const riskScore = gaps.reduce(
    (acc, g) => acc + STATE_POINTS[g.estado] * WEIGHTS[g.id as keyof typeof WEIGHTS],
    0,
  );
  const riskScoreMax = Object.values(WEIGHTS).reduce((a, b) => a + b, 0) * 2;
  // `riskLevel` mide RIESGO REGULATORIO, no brecha operativa. Si la empresa queda
  // fuera del ámbito de aplicación, ese riesgo es bajo por definición aunque su
  // operación tenga brechas — mostrar "crítico" a quien no está obligado sería
  // alarmismo, y además ensuciaría la segmentación comercial en la base de datos.
  // El `riskScore` se conserva en bruto: sigue midiendo la brecha operativa real.
  const riskLevel: RiskLevel = obligado === "no" ? "bajo" : nivelRiesgo(riskScore, riskScoreMax);
  const diasRestantes = diasHastaPlazo(now);

  return {
    obligado,
    motivo,
    sector,
    sectorLabel: SECTOR_LABELS[sector] ?? "Otro sector",
    gaps,
    riskScore,
    riskScoreMax,
    riskLevel,
    diasRestantes,
    titular: construirTitular(obligado, riskLevel, diasRestantes),
    prioridades: construirPrioridades(gaps, obligado),
    engineVersion: ENGINE_VERSION,
  };
}
