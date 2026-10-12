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
// Import relativo (no "@/"): el script de regresión lo ejecuta con tsx fuera de Astro.
import { ANUNCIO, DECLARACION_PRUDENTE, FACTURA_ELECTRONICA, NORMA } from "../../../data/verifactu";

// v3 (oct/2026): exclusión por operaciones sin factura, "papel" fuera del ámbito,
// "no lo sé" en tributación → probable, declaración responsable prudente, fechas
// desde la fuente central.
export const ENGINE_VERSION = "verifactu-2026-10-v3";

/** Fechas vigentes del RD-ley 15/2025, desde la fuente central. El aplazamiento
 *  a octubre de 2028 está anunciado y no publicado: se menciona, no se aplica. */
const ANUNCIO_TEXTO = ANUNCIO.texto;
const DEADLINE_SOCIEDADES_ISO = NORMA.fechaSociedadesISO;
const DEADLINE_RESTO_ISO = NORMA.fechaRestoISO;

/** Motivo de exclusión, para redactar el informe de quien queda fuera. */
type MotivoExclusion = "sii" | "foral" | "sin-factura" | "papel";

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

/**
 * Estado declarado del sistema. "nada" es exclusiva: la validación ya rechaza
 * combinarla con otras opciones, pero si llegara una respuesta contradictoria
 * el motor se queda con la lectura conservadora (nada montado). Dar por
 * cubierta una obligación por una respuesta incoherente sería peor que no darla.
 */
function estadoSistema(answers: AssessmentAnswers): string[] {
  const declarado = list(answers.estado);
  return declarado.includes("nada") ? [] : declarado;
}

function motivoExclusion(answers: AssessmentAnswers): MotivoExclusion | null {
  const exclusion = first(answers.exclusion);
  if (exclusion === "sii" || exclusion === "foral" || exclusion === "sin-factura") return exclusion;
  if (first(answers.sistema) === "papel") return "papel";
  return null;
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

/** Ámbito de aplicación: exclusiones del reglamento primero.
 *
 *  Regla de prudencia: el test no emite un dictamen fiscal. Cuando falta un dato
 *  que podría cambiar el ámbito ("no lo sé"), el veredicto es "probable" y se
 *  remite a la asesoría; nunca "si" ni "no".
 */
function evaluarObligacion(answers: AssessmentAnswers): {
  obligado: ObligadoVerdict;
  motivo: string;
} {
  const exclusion = first(answers.exclusion);
  const tributacion = first(answers.tributacion);
  const fechas = `${NORMA.fechaSociedadesLegible} para contribuyentes del Impuesto sobre Sociedades y ${NORMA.fechaRestoLegible} para el resto`;

  switch (motivoExclusion(answers)) {
    case "sii":
      return {
        obligado: "no",
        motivo:
          "Quien lleva los libros registro de IVA a través de la sede electrónica de la AEAT (SII) queda excluido del reglamento. Si el SII cubre toda tu facturación, Verifactu no te aplica. Confírmalo con tu asesoría si solo una parte de la actividad está en el SII.",
      };
    case "foral":
      return {
        obligado: "no",
        motivo:
          "El reglamento alcanza a quienes tributan en territorio español de régimen común. País Vasco y Navarra quedan fuera, con normativa foral propia — TicketBAI y equivalentes —, que tiene sus propias exigencias y plazos.",
      };
    case "sin-factura":
      return {
        obligado: "no",
        motivo:
          "La obligación se mide por operación: lo que no debe documentarse en factura queda fuera del reglamento. Si ninguna de tus operaciones obliga a expedir factura (tampoco simplificada, como un ticket), Verifactu no te alcanza. Es una conclusión delicada: confírmala con tu asesoría.",
      };
    case "papel":
      return {
        obligado: "no",
        motivo: `El reglamento regula los sistemas informáticos de facturación. Si todas tus facturas se expiden a mano, en papel y sin ningún programa, hoy no te obliga a usar uno. En cuanto factures con cualquier programa, hoja de cálculo incluida, pasa a aplicarte. Y si tus clientes son empresas o profesionales, la factura electrónica B2B será exigible desde el ${FACTURA_ELECTRONICA.restoLegible} (desde el ${FACTURA_ELECTRONICA.grandesLegible} si superas 8 M€ de volumen de operaciones).`,
      };
    default:
      break;
  }

  if (exclusion === "no-lo-se") {
    return {
      obligado: "probable",
      motivo: `Con la información dada, lo más probable es que te aplique: las exclusiones son estar en el SII, tributar en territorio foral o no tener operaciones que obliguen a facturar, y ninguna es fácil de tener sin saberlo. Confírmalo con tu asesoría antes de planificar. Fechas vigentes: ${fechas}. ${ANUNCIO_TEXTO}`,
    };
  }

  if (tributacion === "no-lo-se") {
    return {
      obligado: "probable",
      motivo: `Lo más probable es que te aplique, pero sin saber cómo tributas no podemos decir en qué fecha ni descartar supuestos especiales (por ejemplo, entidades exentas del Impuesto sobre Sociedades). Fechas vigentes: ${fechas}. ${ANUNCIO_TEXTO} Confírmalo con tu asesoría.`,
    };
  }

  return {
    obligado: "si",
    motivo:
      tributacion === "irpf"
        ? `Con lo que nos cuentas, te aplica, con fecha vigente ${NORMA.fechaRestoLegible} por tributar en IRPF. ${ANUNCIO_TEXTO}`
        : `Con lo que nos cuentas, te aplica, con fecha vigente ${NORMA.fechaSociedadesLegible} por ser contribuyente del Impuesto sobre Sociedades. ${ANUNCIO_TEXTO}`,
  };
}

/** Obligación 1: un registro de alta por factura y de anulación por anulación. */
function evaluarRegistro(answers: AssessmentAnswers): GapEvaluation {
  const estado = estadoSistema(answers);
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
        "Una hoja de cálculo o una plantilla con la que se expiden facturas no genera el registro exigido. Aquí el trabajo no es adaptar: es elegir un programa de facturación cuyo productor declare la conformidad con el reglamento.",
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
  const estado = estadoSistema(answers);
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
  const estado = estadoSistema(answers);
  const conectividad = first(answers.conectividad);
  const tiene = estado.includes("remision");

  const modalidad =
    conectividad === "offline"
      ? "Con puntos que trabajan sin conexión con normalidad, VERI*FACTU sigue siendo posible gestionando incidencias y reintentos, pero si trabajar offline es la norma y no la excepción conviene valorar NO VERI*FACTU, que exige firma electrónica, registro de eventos, verificación de integridad y gestión de alarmas."
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
  const estado = estadoSistema(answers);
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
  const estado = estadoSistema(answers);
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
      detalle: `${DECLARACION_PRUDENTE} Si un tercero desarrolló o adaptó el sistema, hay que dejar por escrito quién la firma. Es el punto que casi nadie ve venir y el que más veces se descubre tarde.`,
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

const AMBITO_DETALLE: Record<MotivoExclusion, string> = {
  sii: "Quedas fuera del RRSIF por estar en el SII, así que las obligaciones de registro, encadenamiento, remisión, QR e inalterabilidad no te alcanzan. Esto no valora si tu facturación es buena o mala: valora si esta norma concreta te obliga.",
  foral:
    "Quedas fuera del RRSIF por tributar en territorio foral. Tus obligaciones de facturación las fija la normativa foral (TicketBAI y equivalentes), que este test no evalúa.",
  "sin-factura":
    "Si ninguna operación obliga a expedir factura, no hay registros que generar. Revísalo cada vez que cambie tu actividad: basta una operación con factura para que el reglamento te alcance en ella.",
  papel:
    "Sin sistema informático de facturación no hay registro que generar. La obligación nace cuando empiezas a facturar con un programa, incluida una hoja de cálculo.",
};

const AMBITO_PRIORIDADES: Record<MotivoExclusion, string[]> = {
  sii: [
    "Confirmar con tu asesoría que la exclusión cubre toda tu facturación, no solo una parte.",
    "Si en algún momento salís del SII, revisar esta conclusión.",
  ],
  foral: [
    "Confirmar con tu asesoría qué normativa foral te aplica y en qué plazos.",
    "Si cambia el domicilio fiscal, revisar esta conclusión.",
  ],
  "sin-factura": [
    "Confirmar con tu asesoría que ninguna operación exige factura, tampoco simplificada.",
    "Revisar la conclusión si incorporas actividades o clientes nuevos.",
  ],
  papel: [
    "Si vas a pasar a facturar con un programa, elegir uno cuyo productor declare la conformidad con el RRSIF para la versión que instales.",
    "Si facturas a empresas o profesionales, planificar la factura electrónica B2B con tu asesoría.",
  ],
};

/**
 * Con software estándar u hojas de cálculo, el usuario no va a construir
 * nada: el trabajo es exigírselo a su proveedor o elegir un programa que lo
 * haga. Los textos de ingeniería (colas, append-only) no le sirven, así que
 * para esos dos perfiles se sustituye el detalle de cada brecha.
 */
const DETALLE_SIN_DESARROLLO: Record<"estandar" | "manual", Partial<Record<string, string>>> = {
  estandar: {
    registro:
      "Es tarea del programa: debe generar un registro por cada factura y por cada anulación en el momento de emitirla. Pide a tu proveedor que te confirme por escrito que su versión conforme lo hace en todas las vías por las que facturas.",
    encadenamiento:
      "El programa debe encadenar los registros por huella. Si facturas desde varios puestos o tiendas, pregunta a tu proveedor cómo lo resuelve.",
    remision:
      "En modalidad VERI*FACTU el programa envía los registros a la AEAT; en NO VERI*FACTU los firma y lleva un registro de eventos. Pregunta a tu proveedor qué modalidad ofrece y qué pasa si no hay conexión.",
    inalterable:
      "El programa debe impedir que los registros se modifiquen y permitir exportarlos. Pide a tu proveedor que te explique cómo lo hace y cómo los exportarías si cambias de programa.",
    qr: "Las facturas deben llevar el QR y, en VERI*FACTU, la mención correspondiente. Cuando tengas la versión conforme, comprueba cada formato (PDF, ticket, email) leyendo el QR con el móvil.",
  },
  manual: {
    encadenamiento:
      "Una hoja de cálculo no puede encadenar registros. Lo hará el programa de facturación que elijas: compruébalo antes de contratarlo.",
    remision:
      "Una hoja de cálculo no envía registros a la AEAT ni lleva registro de eventos. El programa que elijas debe hacerlo, en modalidad VERI*FACTU o NO VERI*FACTU.",
    inalterable:
      "Una hoja de cálculo se puede editar en cualquier momento, así que no sirve como registro inalterable. El programa que elijas debe garantizarlo y permitir exportar los registros.",
    qr: "Las facturas deberán llevar el QR y, en VERI*FACTU, la mención correspondiente. Será el programa que elijas el que lo genere: compruébalo con una factura de prueba.",
  },
};

const PRIORIDADES_SIN_DESARROLLO: Record<"estandar" | "manual", string[]> = {
  estandar: [
    "Pedir a tu proveedor la declaración responsable de la versión que usas y la fecha de la versión conforme.",
    "Confirmar que todas las vías por las que facturas (tickets, tienda online, integraciones) pasan por el programa.",
    "Preguntar qué modalidad ofrece (VERI*FACTU o NO VERI*FACTU) y qué ocurre si no hay conexión.",
    "Revisar con tu proveedor cómo gestiona series, anulaciones y rectificativas.",
    "Cuando tengas la versión conforme, comprobar el QR en cada formato de factura.",
  ],
  manual: [
    "Elegir un programa de facturación cuyo productor declare la conformidad con el reglamento para la versión que instales.",
    "Hacer inventario de tus series y de cómo anulas y rectificas hoy, para cambiar de herramienta sin perder la numeración.",
    "Confirmar con tu asesoría la fecha que te aplica y la modalidad que tiene sentido para ti.",
    "Comprobar con una factura de prueba que el programa elegido genera el QR y la mención.",
  ],
};

function construirTitular(
  obligado: ObligadoVerdict,
  riskLevel: RiskLevel,
  _dias: number,
  viabilidad: string,
): string {
  if (obligado === "no") {
    return "Por lo que nos cuentas, Verifactu no te aplica";
  }
  if (obligado === "probable") {
    return "Lo más probable es que te aplique: confírmalo y empieza por lo que falta";
  }

  if (viabilidad === "caja-negra") {
    return "Te aplica, pero antes hay una pregunta que resolver sobre tu software";
  }

  if (riskLevel === "critico") {
    return "Te aplica y hoy tu sistema no cumple casi ninguna obligación";
  }
  if (riskLevel === "alto") {
    return "Te aplica y faltan piezas centrales del sistema";
  }
  if (riskLevel === "medio") {
    return "Vas por delante de la media, pero quedan huecos que cerrar";
  }
  return "Tu sistema está cerca de cumplir: quedan detalles, no cimientos";
}

function construirPrioridades(
  gaps: GapEvaluation[],
  obligado: ObligadoVerdict,
  viabilidad: string,
  series: string,
  exclusion: MotivoExclusion | null,
  sistema: string,
): string[] {
  if (obligado === "no") {
    return AMBITO_PRIORIDADES[exclusion ?? "sii"];
  }
  if (sistema === "estandar" || sistema === "manual") {
    // Todo cubierto con software estándar: queda acreditarlo, no construir.
    if (sistema === "estandar" && gaps.every((g) => g.estado === "ok")) {
      return [
        "Guardar la declaración responsable de tu versión y una factura de cada formato con el QR.",
        "Revisar cada actualización del programa: la conformidad se declara por versión.",
      ];
    }
    return PRIORIDADES_SIN_DESARROLLO[sistema];
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
  const exclusion = motivoExclusion(answers);

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
            detalle: AMBITO_DETALLE[exclusion ?? "sii"],
            derivadoDe: exclusion === "papel" ? ["sistema"] : ["exclusion"],
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

  if ((sistema === "estandar" || sistema === "manual") && obligado !== "no") {
    for (const g of gaps) {
      const texto = DETALLE_SIN_DESARROLLO[sistema][g.id];
      if (texto && g.estado !== "ok") g.detalle = texto;
    }
  }

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
    prioridades: construirPrioridades(gaps, obligado, viabilidad, series, exclusion, sistema),
    engineVersion: ENGINE_VERSION,
  };
}
