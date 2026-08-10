// Motor de resultado del test de Verifactu. Reglas deterministas: mismas
// respuestas, mismo informe. Sin llamadas a modelos, para que el resultado sea
// explicable y reproducible ante la asesoría del cliente.
//
// Estructura, idéntica en espíritu a la del test de la Ley 10/2025:
//   1. ¿te aplica?            → veredicto de ámbito (exclusiones primero)
//   2. ¿qué te falta?         → una evaluación por obligación del reglamento
//   3. ¿cuánto riesgo?        → score ponderado y nivel
//   4. ¿por dónde empiezas?   → prioridades ordenadas
//
// Regla que gobierna el tono: si el usuario está excluido, el informe lo dice
// sin matizarlo para vender igual. Un test que nunca concluye "no te aplica"
// no es un diagnóstico.

import type {
  AssessmentAnswers,
  AssessmentResult,
  GapEvaluation,
  GapState,
  ObligadoVerdict,
  RiskLevel,
} from "../types";
import { SISTEMA_LABELS } from "./questions";

export const ENGINE_VERSION = "verifactu-2026-08-v1";

/** Fechas del RD-ley 15/2025. Deben coincidir con NORMA en src/data/verifactu.ts. */
const DEADLINE_SOCIEDADES_ISO = "2027-01-01T00:00:00+01:00";
const DEADLINE_RESTO_ISO = "2027-07-01T00:00:00+02:00";

/**
 * Peso de cada obligación. Pesan más las que, si faltan, invalidan el resto:
 * sin registro por factura y sin cadena de huellas no hay nada que enviar.
 */
const WEIGHTS = {
  registro: 3,
  encadenamiento: 3,
  remision: 3,
  inalterable: 2,
  qr: 2,
  declaracion: 1,
} as const;

const STATE_POINTS: Record<GapState, number> = {
  ok: 0,
  parcial: 1,
  gap: 2,
  // "No lo sé" puntúa como parcial: ante una inspección, lo que no se puede
  // acreditar se comporta como un incumplimiento no documentado.
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

export function diasHastaPlazo(
  tributacion: string,
  now: number = Date.now(),
): number {
  // Ante la duda, se usa la fecha más temprana: planificar sobre la más lejana
  // es la forma barata de llegar tarde.
  const iso = tributacion === "irpf" ? DEADLINE_RESTO_ISO : DEADLINE_SOCIEDADES_ISO;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86_400_000));
}

/** Ámbito de aplicación: exclusiones del reglamento primero. */
function evaluarObligacion(answers: AssessmentAnswers): {
  obligado: ObligadoVerdict;
  motivo: string;
} {
  const exclusion = first(answers.exclusion);
  const tributacion = first(answers.tributacion);

  if (exclusion === "sii") {
    return {
      obligado: "no",
      motivo:
        "Quien lleva los libros registro de IVA a través de la sede electrónica de la AEAT (SII) queda excluido del reglamento. Si el SII cubre toda tu facturación, Verifactu no te aplica y no necesitas hacer nada.",
    };
  }

  if (exclusion === "foral") {
    return {
      obligado: "no",
      motivo:
        "El reglamento alcanza a quienes tributan en territorio español de régimen común. País Vasco y Navarra quedan fuera, con normativa foral propia — TicketBAI y equivalentes —, que tiene sus propias exigencias y plazos.",
    };
  }

  if (exclusion === "no-lo-se") {
    return {
      obligado: "probable",
      motivo:
        "Con la información dada, lo más probable es que te aplique: las dos exclusiones relevantes son estar en el SII o tributar en territorio foral, y ninguna es fácil de tener sin saberlo. Conviene confirmarlo con tu asesoría antes de planificar.",
    };
  }

  if (tributacion === "no-lo-se") {
    return {
      obligado: "si",
      motivo:
        "Te aplica. La forma de tributación solo cambia la fecha: 1 de enero de 2027 para contribuyentes del Impuesto sobre Sociedades y 1 de julio de 2027 para el resto. Hasta confirmarlo, planifica sobre la primera.",
    };
  }

  return {
    obligado: "si",
    motivo:
      tributacion === "irpf"
        ? "Te aplica, con fecha 1 de julio de 2027 por tributar en IRPF. Seis meses más de margen que las sociedades, no una exención."
        : "Te aplica, con fecha 1 de enero de 2027 por ser contribuyente del Impuesto sobre Sociedades. Es la primera de las dos fechas del calendario.",
  };
}

/** Obligación 1: un registro de alta por factura y de anulación por anulación. */
function evaluarRegistro(answers: AssessmentAnswers): GapEvaluation {
  const estado = list(answers.estado);
  const sistema = first(answers.sistema);
  const tiene = estado.includes("registro");

  if (tiene) {
    return {
      id: "registro",
      obligacion: "Registro de facturación de alta y de anulación por cada factura",
      estado: "ok",
      detalle:
        "Ya generáis el registro por factura. Queda verificar que se crea en el mismo acto de emisión y que ninguna vía de facturación puede saltárselo.",
      derivadoDe: ["estado"],
    };
  }

  if (sistema === "manual") {
    return {
      id: "registro",
      obligacion: "Registro de facturación de alta y de anulación por cada factura",
      estado: "gap",
      detalle:
        "Facturar con hojas de cálculo o plantillas no permite generar el registro exigido. Aquí el trabajo no es adaptar: es dotarse de un sistema de facturación que cumpla.",
      derivadoDe: ["estado", "sistema"],
    };
  }

  return {
    id: "registro",
    obligacion: "Registro de facturación de alta y de anulación por cada factura",
    estado: "gap",
    detalle:
      "Es la base de todo lo demás: sin un registro creado en el mismo acto de emisión, no hay cadena que encadenar ni nada que remitir. Un proceso nocturno que recorra la tabla de facturas no cumple.",
    derivadoDe: ["estado"],
  };
}

/** Obligación 2: encadenamiento por huella. */
function evaluarEncadenamiento(answers: AssessmentAnswers): GapEvaluation {
  const estado = list(answers.estado);
  const series = first(answers.series);
  const puntos = first(answers.puntos_emision);
  const tiene = estado.includes("encadenamiento");

  const complejo = puntos === "mas-cinco" || puntos === "dos-cinco" || series === "varias-opacas";

  if (tiene && series !== "varias-opacas") {
    return {
      id: "encadenamiento",
      obligacion: "Encadenamiento de los registros mediante huella o hash",
      estado: "ok",
      detalle:
        "La cadena existe. Con varios puntos de emisión conviene confirmar que cada serie tiene su cadena y que no hay condiciones de carrera al facturar en paralelo.",
      derivadoDe: ["estado", "series"],
    };
  }

  if (tiene && series === "varias-opacas") {
    return {
      id: "encadenamiento",
      obligacion: "Encadenamiento de los registros mediante huella o hash",
      estado: "parcial",
      detalle:
        "Tenéis cadena, pero hay series con saltos que nadie sabe explicar. Ese detalle, invisible durante años, es exactamente lo que rompe una cadena de huellas: hay que auditar las series antes de dar por buena la implementación.",
      derivadoDe: ["estado", "series"],
    };
  }

  if (series === "no-lo-se" || puntos === "no-lo-se") {
    return {
      id: "encadenamiento",
      obligacion: "Encadenamiento de los registros mediante huella o hash",
      estado: "desconocido",
      detalle:
        "Sin saber cuántos puntos de emisión y cuántas series hay en uso, no se puede diseñar la cadena. Ese inventario es la primera tarea de la auditoría, y suele ser donde aparecen las sorpresas.",
      derivadoDe: ["series", "puntos_emision"],
    };
  }

  return {
    id: "encadenamiento",
    obligacion: "Encadenamiento de los registros mediante huella o hash",
    estado: "gap",
    detalle: complejo
      ? "Falta la cadena, y con varios puntos de emisión la estrategia de series hay que decidirla antes de escribir código: varias cajas facturando contra una única cadena es una condición de carrera esperando a ocurrir."
      : "Falta la cadena de huellas. Con un único punto de emisión y una sola serie es el escenario más simple posible, lo que juega a favor.",
    derivadoDe: ["estado", "puntos_emision", "series"],
  };
}

/** Obligación 3: remisión a la AEAT (modalidad VERI*FACTU) o exigencias locales. */
function evaluarRemision(answers: AssessmentAnswers): GapEvaluation {
  const estado = list(answers.estado);
  const conectividad = first(answers.conectividad);
  const tiene = estado.includes("remision");

  const modalidad =
    conectividad === "offline"
      ? "Con puntos que trabajan offline con normalidad, la modalidad VERI*FACTU es inviable: toca sistema no verificable, con firma electrónica, registro de eventos, verificación de integridad y gestión de alarmas."
      : conectividad === "intermitente"
        ? "Con algún punto de conectividad poco fiable, VERI*FACTU sigue siendo posible si la cola tolera cortes largos. Es una decisión de diseño, no de preferencia."
        : "Con conectividad estable, la modalidad VERI*FACTU suele ser el camino más barato: remite en el momento y te ahorra las exigencias locales de firma, eventos y alarmas.";

  if (tiene) {
    return {
      id: "remision",
      obligacion: "Remisión de los registros a la AEAT con cola, reintento e idempotencia",
      estado: "ok",
      detalle: `Ya enviáis con cola y reintento, que es lo que evita que una incidencia de la AEAT se convierta en una incidencia de tu facturación. ${modalidad}`,
      derivadoDe: ["estado", "conectividad"],
    };
  }

  if (conectividad === "no-lo-se") {
    return {
      id: "remision",
      obligacion: "Remisión de los registros a la AEAT con cola, reintento e idempotencia",
      estado: "desconocido",
      detalle:
        "La elección entre VERI*FACTU y sistema no verificable depende de la conectividad real de cada punto de emisión, y todavía no la conocemos. Es de las primeras cosas que cierra la auditoría porque condiciona todo el diseño.",
      derivadoDe: ["conectividad"],
    };
  }

  return {
    id: "remision",
    obligacion: "Remisión de los registros a la AEAT con cola, reintento e idempotencia",
    estado: "gap",
    detalle: `Falta la capa de envío. El error caro aquí es acoplarla a la transacción de venta: hay que encolar, reintentar con espaciado creciente y mantener el estado de cada registro. ${modalidad}`,
    derivadoDe: ["estado", "conectividad"],
  };
}

/** Obligación 4: QR verificable y mención en todas las plantillas. */
function evaluarQr(answers: AssessmentAnswers): GapEvaluation {
  const estado = list(answers.estado);
  const sistema = first(answers.sistema);
  const tiene = estado.includes("qr");

  if (tiene) {
    return {
      id: "qr",
      obligacion: "QR verificable y mención «VERI*FACTU» en la factura",
      estado: "ok",
      detalle:
        "Está resuelto. Conviene revisar cada plantilla de salida por separado — PDF, ticket, email y portal —, porque cada una es un punto de fallo distinto.",
      derivadoDe: ["estado"],
    };
  }

  return {
    id: "qr",
    obligacion: "QR verificable y mención «VERI*FACTU» en la factura",
    estado: "gap",
    detalle:
      sistema === "tpv"
        ? "Falta el QR. En TPV es donde más veces se rompe: en un ticket térmico de 58 mm el código entra, pero deja de ser legible. Hay que probarlo en la impresora real, no en el PDF."
        : "Falta el QR y la mención. Hay que llevarlo a todas las plantillas de salida: PDF, impresión, email y portal de cliente.",
    derivadoDe: ["estado", "sistema"],
  };
}

/** Obligación 5: integridad, conservación e inalterabilidad. */
function evaluarInalterable(answers: AssessmentAnswers): GapEvaluation {
  const estado = list(answers.estado);
  const tiene = estado.includes("inalterable");

  if (tiene) {
    return {
      id: "inalterable",
      obligacion: "Registro inalterable, conservación y exportación",
      estado: "ok",
      detalle:
        "Hay almacenamiento de evidencia separado. Queda comprobar que la exportación produce un formato legible por la Administración y que la retención está definida.",
      derivadoDe: ["estado"],
    };
  }

  return {
    id: "inalterable",
    obligacion: "Registro inalterable, conservación y exportación",
    estado: "gap",
    detalle:
      "Un registro que vive en la misma tabla que tu aplicación edita a diario no es inalterable, por mucho que nadie lo toque en la práctica. Hace falta almacenamiento append-only separado del sistema de trabajo.",
    derivadoDe: ["estado"],
  };
}

/** Obligación 6: declaración responsable del productor del sistema. */
function evaluarDeclaracion(answers: AssessmentAnswers): GapEvaluation {
  const sistema = first(answers.sistema);
  const propio = sistema === "erp-propio" || sistema === "ecommerce";

  if (propio) {
    return {
      id: "declaracion",
      obligacion: "Declaración responsable del sistema informático de facturación",
      estado: "gap",
      detalle:
        "Con software propio o a medida para uso interno, el productor del sistema eres tú: la declaración responsable la firma tu empresa, no un proveedor. Es el punto que casi nadie ve venir y el que más veces se descubre tarde.",
      derivadoDe: ["sistema"],
    };
  }

  if (sistema === "manual") {
    return {
      id: "declaracion",
      obligacion: "Declaración responsable del sistema informático de facturación",
      estado: "gap",
      detalle:
        "Una hoja de cálculo o una plantilla no tiene productor que pueda declarar conformidad. La declaración responsable llega cuando exista un sistema de facturación real, y la firmará quien lo produzca — tu proveedor o tu empresa, según cómo se resuelva.",
      derivadoDe: ["sistema"],
    };
  }

  if (sistema === "estandar") {
    return {
      id: "declaracion",
      obligacion: "Declaración responsable del sistema informático de facturación",
      estado: "ok",
      detalle:
        "Con software estándar de mercado, la declaración responsable corresponde a tu proveedor. Pídesela por escrito e identifica la versión concreta que tienes instalada.",
      derivadoDe: ["sistema"],
    };
  }

  return {
    id: "declaracion",
    obligacion: "Declaración responsable del sistema informático de facturación",
    estado: "parcial",
    detalle:
      "Con software vertical o de terceros adaptado, hay que aclarar por escrito quién firma la declaración: el fabricante responde de su producto, pero no de las adaptaciones que se hayan hecho encima.",
    derivadoDe: ["sistema"],
  };
}

function nivelRiesgo(score: number, max: number): RiskLevel {
  const ratio = max ? score / max : 0;
  if (ratio >= 0.7) return "critico";
  if (ratio >= 0.45) return "alto";
  if (ratio >= 0.2) return "medio";
  return "bajo";
}

function construirTitular(
  obligado: ObligadoVerdict,
  riskLevel: RiskLevel,
  dias: number,
  viabilidad: string,
): string {
  if (obligado === "no") {
    return "Por lo que nos cuentas, Verifactu no te aplica";
  }

  if (viabilidad === "caja-negra") {
    return `Te aplica y quedan ${dias} días, pero antes hay una pregunta que resolver sobre tu software`;
  }

  if (riskLevel === "critico") {
    return `Quedan ${dias} días y hoy no cumple casi ninguna obligación`;
  }
  if (riskLevel === "alto") {
    return `Quedan ${dias} días y faltan piezas centrales del sistema`;
  }
  if (riskLevel === "medio") {
    return `Vas por delante de la media, pero quedan huecos que cerrar en ${dias} días`;
  }
  return "Tu sistema está cerca de cumplir: quedan detalles, no cimientos";
}

function construirPrioridades(
  gaps: GapEvaluation[],
  obligado: ObligadoVerdict,
  viabilidad: string,
  series: string,
): string[] {
  if (obligado === "no") {
    return [
      "Confirmar con tu asesoría que la exclusión cubre toda tu facturación, no solo una parte.",
      "Si en algún momento salís del SII o cambia el domicilio fiscal, revisar esta conclusión.",
    ];
  }

  const acciones: Record<string, string> = {
    registro: "Generar el registro de alta y anulación en el mismo acto de emisión, en todas las vías de facturación.",
    encadenamiento: "Auditar series y puntos de emisión, y definir la estrategia de encadenamiento antes de escribir código.",
    remision: "Construir la cola de remisión con reintento, idempotencia y estado observable por registro.",
    inalterable: "Separar el registro de evidencia del sistema de trabajo, en almacenamiento append-only.",
    qr: "Llevar el QR y la mención a todas las plantillas de salida y probarlo en el dispositivo real.",
    declaracion: "Aclarar por escrito quién firma la declaración responsable y documentar la versión del sistema.",
  };

  const orden = ["registro", "encadenamiento", "remision", "inalterable", "qr", "declaracion"];

  const base = gaps
    .filter((g) => g.estado !== "ok")
    .sort((a, b) => {
      const porEstado = STATE_POINTS[b.estado] - STATE_POINTS[a.estado];
      if (porEstado !== 0) return porEstado;
      return orden.indexOf(a.id) - orden.indexOf(b.id);
    })
    .map((g) => acciones[g.id])
    .filter(Boolean);

  // Dos condicionantes que van por delante de cualquier obligación concreta,
  // porque si no se resuelven, lo demás no se puede ni planificar.
  const previas: string[] = [];
  if (viabilidad === "caja-negra") {
    previas.push(
      "Confirmar con el fabricante si su software será conforme y en qué fecha: si es una caja negra sin punto de enganche, la decisión es suya, no tuya.",
    );
  }
  if (viabilidad === "no-lo-se") {
    previas.push(
      "Averiguar qué vía de integración expone tu sistema — API, eventos o base de datos —: es lo que decide la viabilidad técnica.",
    );
  }
  if (series === "varias-opacas") {
    previas.push(
      "Reconstruir por qué existe cada serie y de dónde salen los saltos, antes de diseñar la cadena de huellas.",
    );
  }

  const prioridades = [...previas, ...base].slice(0, 5);

  // Un informe sin siguientes pasos es un callejón sin salida. Cuando todas las
  // obligaciones salen cubiertas, el trabajo no desaparece: cambia de construir
  // a acreditar y mantener.
  if (prioridades.length === 0) {
    return [
      "Verificar con casos reales que ninguna vía de facturación puede emitir sin generar su registro.",
      "Probar el comportamiento ante una caída de la AEAT y ante anulaciones y rectificativas.",
      "Documentar la conformidad del sistema y la versión, que es lo que sostiene la declaración responsable.",
      "Fijar el mantenimiento normativo: cuando cambien las especificaciones técnicas, el conector tiene que moverse con ellas.",
    ];
  }

  return prioridades;
}

export function scoreAssessment(
  answers: AssessmentAnswers,
  now: number = Date.now(),
): AssessmentResult {
  const sistema = first(answers.sistema) || "estandar";
  const tributacion = first(answers.tributacion);
  const viabilidad = first(answers.integracion);
  const series = first(answers.series);

  const { obligado, motivo } = evaluarObligacion(answers);

  // Si el reglamento no aplica, no hay obligaciones que incumplir. Listar seis
  // brechas en rojo bajo un titular que dice "no te aplica" sería contradictorio
  // y, peor, falso: no se puede incumplir una obligación inexistente. Se sustituye
  // por un único ítem informativo que explica el ámbito.
  const gaps: GapEvaluation[] =
    obligado === "no"
      ? [
          {
            id: "ambito",
            obligacion: "Ámbito de aplicación del reglamento",
            estado: "ok",
            detalle:
              "Quedas fuera del RRSIF, así que las obligaciones de registro, encadenamiento, remisión, QR e inalterabilidad no te alcanzan. Esto no valora si tu facturación es buena o mala: valora si esta norma concreta te obliga.",
            derivadoDe: ["exclusion"],
          },
        ]
      : [
          evaluarRegistro(answers),
          evaluarEncadenamiento(answers),
          evaluarRemision(answers),
          evaluarInalterable(answers),
          evaluarQr(answers),
          evaluarDeclaracion(answers),
        ];

  // El `?? 0` no es defensivo por costumbre: el ítem sintético "ambito" que se
  // devuelve a quien está excluido no tiene peso en WEIGHTS, y sin esto el score
  // salía NaN y el informe mostraba "NaN %".
  const riskScore = gaps.reduce(
    (acc, g) => acc + STATE_POINTS[g.estado] * (WEIGHTS[g.id as keyof typeof WEIGHTS] ?? 0),
    0,
  );
  const riskScoreMax = Object.values(WEIGHTS).reduce((a, b) => a + b, 0) * 2;

  // Igual que en el test de la Ley 10/2025: `riskLevel` mide riesgo REGULATORIO.
  // Quien está excluido tiene riesgo bajo por definición, aunque su sistema tenga
  // brechas. Mostrar "crítico" a quien no está obligado sería alarmismo y además
  // ensuciaría la segmentación comercial. `riskScore` conserva la brecha real.
  const riskLevel: RiskLevel = obligado === "no" ? "bajo" : nivelRiesgo(riskScore, riskScoreMax);
  const diasRestantes = diasHastaPlazo(tributacion, now);

  return {
    obligado,
    motivo,
    sector: sistema,
    sectorLabel: SISTEMA_LABELS[sistema] ?? "Sistema de facturación",
    gaps,
    riskScore,
    riskScoreMax,
    riskLevel,
    diasRestantes,
    titular: construirTitular(obligado, riskLevel, diasRestantes, viabilidad),
    prioridades: construirPrioridades(gaps, obligado, viabilidad, series),
    engineVersion: ENGINE_VERSION,
  };
}
