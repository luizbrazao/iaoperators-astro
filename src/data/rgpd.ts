// Base normativa del cluster RGPD (pilar, test y RGPD Ops Starter).
//
// Fuente ÚNICA de: nombres de las normas, fecha de la última verificación,
// fuentes oficiales, afirmaciones normativas que se muestran en la UI, módulos
// afectados por cada fuente y changelog normativo. Ninguna página, email o
// motor debe escribir a mano un plazo o un artículo: lo toma de aquí.
//
// Reglas de redacción (no reabrir sin motivo):
// - Solo fuentes primarias u oficiales (BOE, DOUE/EUR-Lex, AEPD).
// - Cada afirmación cita su fuente y el artículo cuando existe.
// - Lenguaje prudente: el producto es una herramienta operativa y un
//   diagnóstico orientativo. No dictamina, no certifica y no sustituye el
//   asesoramiento jurídico.
//
// Este módulo es público (se puede importar desde páginas estáticas e islands):
// no contiene secretos ni contenido de pago.
//
// Verificación del 13/10/2026: textos de los artículos citados leídos en el
// texto del RGPD publicado en el BOE (DOUE-L-2016-80807) y en la LOPDGDD
// consolidada (BOE-A-2018-16673, última actualización publicada el 27/12/2025);
// páginas de la AEPD leídas el mismo día.

export const RGPD_VERIFICACION = {
  /** Fecha de la última revisión normativa del contenido (ISO). */
  lastVerifiedAt: "2026-10-13",
  lastVerifiedAtLegible: "13 de octubre de 2026",
} as const;

export const NORMAS = {
  rgpd: {
    id: "rgpd",
    nombre: "Reglamento (UE) 2016/679, Reglamento General de Protección de Datos (RGPD)",
    corto: "RGPD",
    identificador: "Reglamento (UE) 2016/679",
    aplicableDesde: "2018-05-25",
    aplicableDesdeLegible: "25 de mayo de 2018",
    urlBoe: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807",
    urlEurLex: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679",
    eli: "https://data.europa.eu/eli/reg/2016/679/spa",
  },
  lopdgdd: {
    id: "lopdgdd",
    nombre: "Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)",
    corto: "LOPDGDD",
    identificador: "BOE-A-2018-16673",
    enVigorDesde: "2018-12-07",
    enVigorDesdeLegible: "7 de diciembre de 2018",
    consolidadaHasta: "2025-12-27",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673",
  },
} as const;

/** Módulos del producto (y áreas del test) a los que afecta cada fuente. */
export type RgpdModulo =
  | "perfil"
  | "tratamientos"
  | "proveedores"
  | "captacion"
  | "solicitudes"
  | "incidentes"
  | "plan"
  | "exportaciones"
  | "test";

export interface FuenteOficial {
  id: string;
  titulo: string;
  emisor: "AEPD" | "BOE" | "DOUE";
  url: string;
  /** Fecha en que se leyó y se contrastó (ISO). */
  verificadaEl: string;
  /**
   * false si en la revisión no se pudo leer el contenido. Se mantiene en la
   * lista para no perder la referencia, pero ninguna afirmación se apoya solo
   * en ella.
   */
  verificada: boolean;
  nota?: string;
  modulos: readonly RgpdModulo[];
}

export const FUENTES: readonly FuenteOficial[] = [
  {
    id: "rgpd-boe",
    titulo: "Reglamento (UE) 2016/679 (RGPD), texto publicado en el BOE",
    emisor: "DOUE",
    url: NORMAS.rgpd.urlBoe,
    verificadaEl: "2026-10-13",
    verificada: true,
    nota: "Artículos 2, 4, 9.1, 12.3, 22.1, 28.3, 30.1, 30.5, 33.1, 33.5, 34.1, 35.1, 35.3, 37.1 y 99.2 leídos en esta revisión.",
    modulos: ["perfil", "tratamientos", "proveedores", "captacion", "solicitudes", "incidentes", "plan", "test"],
  },
  {
    id: "rgpd-eurlex",
    titulo: "Reglamento (UE) 2016/679 en EUR-Lex",
    emisor: "DOUE",
    url: NORMAS.rgpd.urlEurLex,
    verificadaEl: "2026-10-13",
    verificada: true,
    nota: "Referencia canónica. El articulado se contrastó en la versión del BOE.",
    modulos: ["test"],
  },
  {
    id: "lopdgdd",
    titulo: "Ley Orgánica 3/2018 (LOPDGDD), texto consolidado",
    emisor: "BOE",
    url: NORMAS.lopdgdd.url,
    verificadaEl: "2026-10-13",
    verificada: true,
    nota: "Artículos 11, 28.2, 31.1 y 34.1 leídos en esta revisión. Última actualización publicada: 27/12/2025.",
    modulos: ["perfil", "tratamientos", "captacion", "test"],
  },
  {
    id: "aepd-pymes",
    titulo: "AEPD · Directrices de aplicación para PYMES",
    emisor: "AEPD",
    url: "https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/directrices-de-aplicacion/pymes",
    verificadaEl: "2026-10-13",
    verificada: true,
    modulos: ["perfil", "test"],
  },
  {
    id: "aepd-obligaciones",
    titulo: "AEPD · ¿Qué obligaciones establece el RGPD para los responsables?",
    emisor: "AEPD",
    url: "https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/3-que-obligaciones-establece-el-rgpd-para-los-responsables",
    verificadaEl: "2026-10-13",
    verificada: false,
    nota: "La página no devolvió contenido legible en la revisión del 13/10/2026. Ninguna afirmación depende solo de ella.",
    modulos: ["plan"],
  },
  {
    id: "aepd-rat",
    titulo: "AEPD · ¿Qué es el registro de actividades de tratamiento?",
    emisor: "AEPD",
    url: "https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/7-registro-de-actividades-de-tratamiento/FAQ-0220-que-es-el-registro-de-actividades-de-tratamiento",
    verificadaEl: "2026-10-13",
    verificada: true,
    modulos: ["tratamientos", "exportaciones", "test"],
  },
  {
    id: "aepd-plazo-derechos",
    titulo: "AEPD · ¿Cuál es el plazo para responder cuando se ejercitan estos derechos?",
    emisor: "AEPD",
    url: "https://www.aepd.es/preguntas-frecuentes/1-tus-derechos/2-tus-derechos-de-proteccion-de-datos/FAQ-0106-cual-es-el-plazo-para-responder-cuando-se-ejercitan-estos-derechos",
    verificadaEl: "2026-10-13",
    verificada: true,
    modulos: ["solicitudes", "test"],
  },
  {
    id: "aepd-brechas",
    titulo: "AEPD · Brechas de datos personales: notificación",
    emisor: "AEPD",
    url: "https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-datos-personales-notificacion",
    verificadaEl: "2026-10-13",
    verificada: true,
    modulos: ["incidentes", "test"],
  },
  {
    id: "aepd-herramientas",
    titulo: "AEPD · Guías y herramientas: herramientas",
    emisor: "AEPD",
    url: "https://www.aepd.es/guias-y-herramientas/herramientas",
    verificadaEl: "2026-10-13",
    verificada: true,
    modulos: ["perfil", "tratamientos", "incidentes", "test"],
  },
  {
    id: "aepd-gestiona",
    titulo: "AEPD · Gestiona RGPD",
    emisor: "AEPD",
    url: "https://www.aepd.es/guias-y-herramientas/herramientas/gestiona2",
    verificadaEl: "2026-10-13",
    verificada: true,
    modulos: ["tratamientos"],
  },
  {
    id: "aepd-listado",
    titulo: "AEPD · Listado de cumplimiento normativo del RGPD (PDF)",
    emisor: "AEPD",
    url: "https://www.aepd.es/guias/guia-listado-de-cumplimiento-del-rgpd.pdf",
    verificadaEl: "2026-10-13",
    verificada: true,
    nota: "El documento no indica fecha ni versión.",
    modulos: ["plan", "test"],
  },
];

export function fuente(id: string): FuenteOficial {
  const f = FUENTES.find((x) => x.id === id);
  if (!f) throw new Error(`Fuente desconocida: ${id}`);
  return f;
}

export interface Afirmacion {
  id: string;
  /** Texto tal y como se muestra en la UI. Prudente y sin conclusiones sobre el caso concreto. */
  texto: string;
  /** Referencia normativa legible (artículos). */
  referencia: string;
  fuentes: readonly string[];
  modulos: readonly RgpdModulo[];
}

/**
 * Afirmaciones normativas que usa la UI. Si una página necesita decir algo
 * sobre la norma, lo toma de aquí (y el test de contenido comprueba que todas
 * citan al menos una fuente verificada).
 */
export const AFIRMACIONES = {
  ambito: {
    id: "ambito",
    texto:
      "El RGPD se aplica a cualquier empresa que trate datos de personas físicas identificadas o identificables: clientes, contactos, empleados o usuarios de su web.",
    referencia: "RGPD, arts. 2 y 4",
    fuentes: ["rgpd-boe"],
    modulos: ["perfil", "test"],
  },
  ratContenido: {
    id: "ratContenido",
    texto:
      "El registro de actividades de tratamiento (RAT) describe cada tratamiento: responsable, fines, categorías de interesados y de datos, destinatarios, transferencias, plazos de supresión y medidas de seguridad cuando sea posible.",
    referencia: "RGPD, art. 30.1; LOPDGDD, art. 31",
    fuentes: ["rgpd-boe", "lopdgdd", "aepd-rat"],
    modulos: ["tratamientos", "exportaciones"],
  },
  ratExcepcion: {
    id: "ratExcepcion",
    texto:
      "La excepción del registro para organizaciones de menos de 250 personas no se aplica si el tratamiento puede entrañar un riesgo, no es ocasional o incluye categorías especiales de datos o datos penales. Gestionar clientes o una plantilla de forma continuada no suele ser ocasional: valora tu caso con quien te asesore.",
    referencia: "RGPD, art. 30.5",
    fuentes: ["rgpd-boe"],
    modulos: ["tratamientos", "test"],
  },
  encargado: {
    id: "encargado",
    texto:
      "Cuando un proveedor trata datos por cuenta de tu empresa, la relación debe regirse por un contrato u otro acto jurídico con el contenido que fija el RGPD (objeto, duración, naturaleza, finalidad, tipo de datos, categorías de interesados y obligaciones).",
    referencia: "RGPD, art. 28.3",
    fuentes: ["rgpd-boe"],
    modulos: ["proveedores", "test"],
  },
  informacionCapas: {
    id: "informacionCapas",
    texto:
      "Si recoges los datos de la propia persona, puedes informar por capas: una información básica (identidad del responsable, finalidad y cómo ejercer los derechos) y un enlace sencillo al resto.",
    referencia: "LOPDGDD, art. 11",
    fuentes: ["lopdgdd"],
    modulos: ["captacion", "test"],
  },
  plazoDerechos: {
    id: "plazoDerechos",
    texto:
      "Hay que responder a una solicitud de derechos en el plazo de un mes desde su recepción. Si es necesario, por su complejidad o por el número de solicitudes, puede prorrogarse otros dos meses, informando a la persona dentro del primer mes y explicando el motivo.",
    referencia: "RGPD, art. 12.3",
    fuentes: ["rgpd-boe", "aepd-plazo-derechos"],
    modulos: ["solicitudes", "test"],
  },
  brecha72h: {
    id: "brecha72h",
    texto:
      "Si una brecha de datos puede suponer un riesgo para las personas, se notifica a la autoridad de control sin dilación indebida y, si es posible, en un máximo de 72 horas desde que se tiene constancia de ella. Si el riesgo es alto, también se comunica a los afectados. La decisión depende de cada caso.",
    referencia: "RGPD, arts. 33.1 y 34.1",
    fuentes: ["rgpd-boe", "aepd-brechas"],
    modulos: ["incidentes", "test"],
  },
  brechaDocumentar: {
    id: "brechaDocumentar",
    texto:
      "Toda brecha se documenta, también las que no se notifican: hechos, efectos y medidas correctivas.",
    referencia: "RGPD, art. 33.5",
    fuentes: ["rgpd-boe", "aepd-brechas"],
    modulos: ["incidentes"],
  },
  eipd: {
    id: "eipd",
    texto:
      "Cuando un tratamiento puede entrañar un alto riesgo (por ejemplo, perfiles con efectos significativos, categorías especiales a gran escala u observación sistemática a gran escala), puede ser necesaria una evaluación de impacto. Si es tu caso lo determina un análisis específico, no este test.",
    referencia: "RGPD, art. 35; LOPDGDD, art. 28.2",
    fuentes: ["rgpd-boe", "lopdgdd"],
    modulos: ["perfil", "test"],
  },
  dpd: {
    id: "dpd",
    texto:
      "La obligación de designar delegado de protección de datos depende de la actividad principal (observación habitual y sistemática a gran escala, categorías especiales a gran escala) y, en España, de la lista de entidades de la LOPDGDD, que incluye, entre otras, la publicidad y prospección comercial basada en preferencias o perfiles.",
    referencia: "RGPD, art. 37.1; LOPDGDD, art. 34.1",
    fuentes: ["rgpd-boe", "lopdgdd"],
    modulos: ["perfil", "test"],
  },
  pymesRiesgo: {
    id: "pymesRiesgo",
    texto:
      "La AEPD presta especial consideración a pymes, micropymes y profesionales, y parte de que muchos de sus tratamientos presentan un escaso nivel de riesgo según la actividad que realizan.",
    referencia: "AEPD, directrices para pymes",
    fuentes: ["aepd-pymes"],
    modulos: ["perfil", "test"],
  },
} as const satisfies Record<string, Afirmacion>;

/** Herramientas gratuitas de la AEPD. Se presentan como punto de partida, nunca en competencia. */
export const HERRAMIENTAS_AEPD = [
  {
    nombre: "Facilita RGPD",
    uso: "Para tratamientos de escaso riesgo: ayuda a preparar el registro de actividades, cláusulas informativas, cláusulas para encargados y medidas de seguridad.",
    url: "https://www.aepd.es/guias-y-herramientas/herramientas",
  },
  {
    nombre: "Gestiona RGPD",
    uso: "Registro de actividades, análisis y gestión del riesgo y apoyo a evaluaciones de impacto. Funciona en tu navegador y se guarda en un archivo de tu ordenador.",
    url: "https://www.aepd.es/guias-y-herramientas/herramientas/gestiona2",
  },
  {
    nombre: "Evalúa-Riesgo RGPD v2",
    uso: "Ayuda a analizar si un tratamiento necesita evaluación de impacto.",
    url: "https://www.aepd.es/guias-y-herramientas/herramientas",
  },
  {
    nombre: "Asesora Brecha y Comunica-Brecha RGPD",
    uso: "Apoyo para decidir si una brecha se notifica a la autoridad y si se comunica a las personas afectadas.",
    url: "https://www.aepd.es/guias-y-herramientas/herramientas",
  },
] as const;

/**
 * Cambios normativos anunciados o en tramitación que podrían afectar al
 * contenido. Se mencionan, no se aplican, hasta su publicación oficial.
 */
export const PENDIENTES = [
  {
    id: "omnibus",
    texto:
      "La Comisión Europea ha propuesto modificaciones del RGPD dentro de sus paquetes de simplificación («Ómnibus»), entre ellas cambios en el registro de actividades. A fecha de la última revisión no se han publicado en el Diario Oficial de la UE: el producto aplica el texto vigente.",
    afecta: ["tratamientos", "incidentes"] as RgpdModulo[],
  },
] as const;

export const CHANGELOG_NORMATIVO: { fecha: string; cambios: string[] }[] = [
  {
    fecha: "2026-10-13",
    cambios: [
      "Revisión inicial: RGPD (arts. 12.3, 28.3, 30, 33, 34, 35, 37 y 99) y LOPDGDD consolidada a 27/12/2025 (arts. 11, 28.2, 31 y 34).",
      "Herramientas de la AEPD revisadas: Facilita RGPD, Gestiona RGPD, Evalúa-Riesgo RGPD v2, Asesora Brecha y Comunica-Brecha RGPD.",
      "Registradas como pendientes las propuestas «Ómnibus» de modificación del RGPD.",
    ],
  },
];

/** Avisos legales reutilizables. */
export const RGPD_DISCLAIMER =
  "Herramienta operativa y diagnóstico orientativo. No constituye asesoramiento jurídico, no certifica el cumplimiento y requiere validación según el caso.";

export const RGPD_BORRADOR =
  "BORRADOR de trabajo generado a partir de los datos introducidos por la empresa. Requiere revisión antes de usarse como documentación definitiva. No constituye asesoramiento jurídico ni certifica el cumplimiento.";

/** Fuentes verificadas que afectan a un módulo (para el pie de cada módulo). */
export function fuentesDe(modulo: RgpdModulo): FuenteOficial[] {
  return FUENTES.filter((f) => f.verificada && f.modulos.includes(modulo));
}
