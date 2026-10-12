// CONTENIDO DE PAGO del Kit de Preparación VERI*FACTU.
//
// ⚠️ SOLO SERVER-SIDE. Este módulo solo puede importarse desde:
//   - src/pages/es/cumplimiento/verifactu/kit/acceso/index.astro (prerender = false)
//   - src/pages/api/verifactu-kit/export.ts
// Nunca desde una island, una página prerenderizada ni nada bajo public/.
// La island KitWorkspace recibe el contenido como props, solo en la respuesta
// autenticada. scripts/check-client-bundle.mjs busca KIT_CONTENT_SENTINEL en el
// build del cliente y falla si aparece.
//
// Versionado: cada módulo lleva su versión y la fecha de la última verificación
// normativa. Al cambiar contenido, subir la versión del módulo, la de
// KIT_PRODUCT.version y añadir la entrada en KIT_CHANGELOG.
//
// Regla editorial: el Kit orienta, organiza y ayuda a decidir. No dictamina,
// no certifica y nunca afirma que completarlo acredite el cumplimiento.

import { CALENDARIO, DECLARACION_PRUDENTE, FACTURA_ELECTRONICA, NORMA, ANUNCIO } from "./verifactu";

export const KIT_CONTENT_SENTINEL = "vfk-content-7c1e9a0b-paid-only";

const VERIFIED = CALENDARIO.lastVerifiedAt;

export type KitAnswer = "si" | "no" | "pendiente" | "no-aplica";

export const KIT_ANSWER_LABELS: Record<KitAnswer, string> = {
  si: "Sí",
  no: "No",
  pendiente: "Pendiente",
  "no-aplica": "No aplica",
};

export interface KitSource {
  titulo: string;
  url: string;
}

export interface KitBlock {
  h?: string;
  p?: string;
  list?: string[];
  aviso?: string;
}

export interface KitChecklistItem {
  id: string;
  texto: string;
  ayuda?: string;
}

export interface KitField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  ayuda?: string;
}

export interface KitTemplate {
  id: string;
  titulo: string;
  asunto: string;
  cuerpo: string;
}

export interface KitTreeOption {
  label: string;
  next?: string;
  result?: string;
}

export interface KitTreeNode {
  id: string;
  pregunta: string;
  ayuda?: string;
  opciones: KitTreeOption[];
}

export interface KitTreeResult {
  id: string;
  tono: "fuera" | "confirmar" | "dentro";
  titulo: string;
  texto: string;
  siguiente: string[];
}

export type KitExportType = "matriz-proveedores" | "inventario-puntos" | "preguntas-proveedor" | "dossier-evidencias";

export interface KitColumn {
  key: string;
  label: string;
  type?: "text" | "select";
  options?: string[];
}

export interface KitTable {
  exportType: KitExportType;
  titulo: string;
  ayuda: string;
  columns: KitColumn[];
  ejemplo: Record<string, string>;
  maxRows: number;
}

export interface KitWeek {
  semana: number;
  titulo: string;
  acciones: KitChecklistItem[];
}

export interface KitModule {
  id: string;
  numero: number;
  titulo: string;
  objetivo: string;
  version: string;
  lastVerifiedAt: string;
  contenido: KitBlock[];
  /** "check" = casilla hecha/no hecha; "respuesta" = sí / no / pendiente / no aplica. */
  checklistMode: "check" | "respuesta";
  checklist: KitChecklistItem[];
  campos?: KitField[];
  arbol?: { inicio: string; nodos: KitTreeNode[]; resultados: KitTreeResult[] };
  tabla?: KitTable;
  plantillas?: KitTemplate[];
  semanas?: KitWeek[];
  fuentes: KitSource[];
}

const F = {
  aeat: {
    titulo: "AEAT · Sistemas Informáticos de Facturación y VERI*FACTU",
    url: "https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html",
  },
  faq: {
    titulo: "AEAT · Preguntas frecuentes: cuestiones generales, conceptos y definiciones",
    url: "https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-conceptos-definiciones.html",
  },
  rd: {
    titulo: "BOE · Real Decreto 1007/2023 (texto consolidado)",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840",
  },
  orden: {
    titulo: "BOE · Orden HAC/1177/2024 (especificaciones técnicas)",
    url: "https://www.boe.es/eli/es/o/2024/10/17/hac1177",
  },
  appAeat: {
    titulo: "AEAT · Aplicación gratuita VERI*FACTU",
    url: "https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/presentacion-declaraciones-ayuda-tecnica/aplicacion-gratuita-verifactu-aeat.html",
  },
  feCalendario: {
    titulo: "AEAT · Calendario de implantación de la factura electrónica",
    url: "https://sede.agenciatributaria.gob.es/Sede/iva/factura-electronica/calendario-implantacion.html",
  },
} satisfies Record<string, KitSource>;

const FECHAS = `${NORMA.fechaSociedadesLegible} para contribuyentes del Impuesto sobre Sociedades y ${NORMA.fechaRestoLegible} para el resto de obligados, autónomos incluidos`;

// ---------------------------------------------------------------------------
// 1. ¿Me aplica?
// ---------------------------------------------------------------------------
const meAplica: KitModule = {
  id: "me-aplica",
  numero: 1,
  titulo: "¿Me aplica?",
  objetivo:
    "Saber, con una respuesta orientativa y razonada, si el reglamento te alcanza, desde cuándo y qué tienes que confirmar con tu asesoría.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "El reglamento de sistemas informáticos de facturación (RRSIF, Real Decreto 1007/2023) no obliga a emitir facturas de una forma concreta: regula cómo tiene que comportarse el programa con el que ya las emites. Por eso la primera pregunta no es «qué programa compro», sino «facturo con un sistema informático y estoy dentro del ámbito».",
    },
    {
      h: "Fechas vigentes",
      p: `Hoy, las fechas en vigor son las del Real Decreto-ley 15/2025: ${FECHAS}. ${ANUNCIO.texto} Hasta que se publique la norma, planifica con las fechas vigentes.`,
    },
    {
      h: "Quién queda fuera",
      list: [
        "Quien lleva los libros registro de IVA por el SII (Suministro Inmediato de Información).",
        "Quien tributa en territorio foral (País Vasco, Navarra), que tiene su propia normativa, como TicketBAI.",
        "Las operaciones que no obligan a expedir factura. Ojo: un ticket de caja es una factura simplificada y sí cuenta.",
        "Quien expide todas sus facturas a mano, en papel, sin ningún programa. En cuanto usa cualquier programa para facturar, entra.",
        "Las entidades exentas del Impuesto sobre Sociedades, en los términos del artículo 3 del reglamento. Si es tu caso, confírmalo con tu asesoría.",
      ],
    },
    {
      aviso:
        "Este árbol es orientativo. No sustituye el análisis de tu asesoría, sobre todo si tienes actividades mixtas, parte de la facturación en el SII o dudas sobre tu domicilio fiscal.",
    },
  ],
  arbol: {
    inicio: "sii",
    nodos: [
      {
        id: "sii",
        pregunta: "¿Llevas los libros registro de IVA por el SII?",
        ayuda: "Lo sabes si presentas el IVA con suministro inmediato. Si no te suena, lo normal es que no.",
        opciones: [
          { label: "Sí, toda mi facturación", result: "fuera-sii" },
          { label: "No", next: "foral" },
          { label: "No lo sé", result: "confirmar" },
        ],
      },
      {
        id: "foral",
        pregunta: "¿Tributas en País Vasco o Navarra?",
        opciones: [
          { label: "Sí", result: "fuera-foral" },
          { label: "No", next: "factura" },
          { label: "No lo sé", result: "confirmar" },
        ],
      },
      {
        id: "factura",
        pregunta: "¿Alguna de tus operaciones te obliga a expedir factura, completa o simplificada (ticket)?",
        opciones: [
          { label: "Sí", next: "programa" },
          { label: "Ninguna", result: "fuera-sin-factura" },
          { label: "No lo sé", result: "confirmar" },
        ],
      },
      {
        id: "programa",
        pregunta: "¿Con qué expides las facturas?",
        ayuda: "Cuenta cualquier programa: software de facturación, ERP, TPV, tienda online, app del móvil, hoja de cálculo o procesador de texto.",
        opciones: [
          { label: "Con algún programa (incluida una hoja de cálculo)", next: "tributacion" },
          { label: "Solo a mano, en papel", result: "fuera-papel" },
        ],
      },
      {
        id: "tributacion",
        pregunta: "¿Cómo tributas?",
        opciones: [
          { label: "Impuesto sobre Sociedades (S.L., S.A., cooperativa…)", result: "dentro-sociedades" },
          { label: "IRPF: autónomo, comunidad de bienes o similar", result: "dentro-resto" },
          { label: "No lo sé", result: "confirmar" },
        ],
      },
    ],
    resultados: [
      {
        id: "fuera-sii",
        tono: "fuera",
        titulo: "Por lo que indicas, el reglamento no te aplica",
        texto: "Quien lleva los libros por el SII queda excluido. Si solo una parte de tu actividad está en el SII, la conclusión puede cambiar.",
        siguiente: [
          "Confirma con tu asesoría que el SII cubre toda tu facturación.",
          "Guarda esta conclusión en el dossier (módulo 7) con la fecha en que la revisaste.",
        ],
      },
      {
        id: "fuera-foral",
        tono: "fuera",
        titulo: "Tu referencia es la normativa foral",
        texto: "El RRSIF alcanza al territorio de régimen común. En País Vasco y Navarra rige su propia normativa de facturación (TicketBAI y equivalentes), con exigencias y plazos distintos que este Kit no cubre.",
        siguiente: ["Pide a tu asesoría el calendario foral que te corresponde."],
      },
      {
        id: "fuera-sin-factura",
        tono: "fuera",
        titulo: "Si ninguna operación exige factura, el reglamento no te alcanza",
        texto: "La obligación se mide por operación. Basta una operación con factura, aunque sea un ticket, para que el reglamento te alcance en ella.",
        siguiente: [
          "Confírmalo por escrito con tu asesoría.",
          "Revísalo cuando cambie tu actividad o tus clientes.",
        ],
      },
      {
        id: "fuera-papel",
        tono: "fuera",
        titulo: "Hoy no te obliga, pero en cuanto uses un programa, sí",
        texto: `Facturar solo a mano, en papel, queda fuera del reglamento. Si facturas a empresas o profesionales, la factura electrónica B2B será exigible desde el ${FACTURA_ELECTRONICA.restoLegible} (desde el ${FACTURA_ELECTRONICA.grandesLegible} si superas 8 M€ de volumen de operaciones), y eso implicará dejar el papel en esas operaciones.`,
        siguiente: [
          "Si vas a pasar a un programa, usa el módulo 4 para comparar proveedores.",
          "Habla con tu asesoría sobre la factura electrónica B2B.",
        ],
      },
      {
        id: "dentro-sociedades",
        tono: "dentro",
        titulo: `Con lo que indicas, te aplica desde el ${NORMA.fechaSociedadesLegible}`,
        texto: `Es la fecha vigente para contribuyentes del Impuesto sobre Sociedades. ${ANUNCIO.texto}`,
        siguiente: [
          "Haz el inventario de facturación (módulo 3).",
          "Envía las preguntas a tu proveedor (módulos 2 y 5).",
        ],
      },
      {
        id: "dentro-resto",
        tono: "dentro",
        titulo: `Con lo que indicas, te aplica desde el ${NORMA.fechaRestoLegible}`,
        texto: `Es la fecha vigente para autónomos y el resto de obligados que no tributan por Sociedades. ${ANUNCIO.texto}`,
        siguiente: [
          "Haz el inventario de facturación (módulo 3).",
          "Envía las preguntas a tu proveedor (módulos 2 y 5).",
        ],
      },
      {
        id: "confirmar",
        tono: "confirmar",
        titulo: "Probablemente te aplica, pero hay un dato que confirmar",
        texto: `Te falta un dato que puede cambiar la conclusión. Mientras lo confirmas, planifica como si te aplicara: las fechas vigentes son ${FECHAS}.`,
        siguiente: [
          "Usa el email a la gestoría (módulo 6) para resolver la duda por escrito.",
          "Avanza con el inventario (módulo 3): te servirá en cualquier caso.",
        ],
      },
    ],
  },
  checklistMode: "check",
  checklist: [
    { id: "arbol", texto: "He recorrido el árbol y anotado el resultado." },
    { id: "fecha", texto: "Sé qué fecha vigente me corresponde y que hay un aplazamiento anunciado sin publicar." },
    { id: "asesoria", texto: "He confirmado (o he pedido confirmar) la conclusión con mi asesoría." },
  ],
  fuentes: [F.rd, F.aeat, F.faq],
};

// ---------------------------------------------------------------------------
// 2. Qué preguntar a tu proveedor
// ---------------------------------------------------------------------------
const proveedor: KitModule = {
  id: "proveedor",
  numero: 2,
  titulo: "Qué preguntar a tu proveedor",
  objetivo:
    "Saber si tu programa de facturación estará preparado, en qué versión, con qué coste y qué te toca hacer a ti.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "Si usas un software de mercado, la mayor parte del trabajo técnico es de tu proveedor: es el productor del sistema y quien firma la declaración responsable. Tu trabajo es obtener respuestas concretas y por escrito. «Estamos en ello» no es una respuesta.",
    },
    {
      p: "Marca cada pregunta con Sí, No, Pendiente o No aplica según lo que te conteste. Lo que quede en «No» o «Pendiente» cerca de tu fecha es la señal para valorar otro proveedor o pedir ayuda.",
    },
    {
      aviso: `La normativa obligaba a los productores a ofrecer sistemas adaptados desde el ${NORMA.fechaFabricantesLegible}. Si tu proveedor todavía no puede enseñarte la declaración responsable de la versión que usas, anótalo.`,
    },
  ],
  checklistMode: "respuesta",
  checklist: [
    { id: "declaracion", texto: "¿Tenéis la declaración responsable del sistema para la versión que uso? ¿Dónde la consulto dentro del programa?", ayuda: "La Orden HAC/1177/2024 exige que esté disponible de forma legible dentro del propio sistema." },
    { id: "version", texto: "¿Qué versión exacta tengo instalada y cuál es la versión conforme?" },
    { id: "modalidad", texto: "¿Funciona en modalidad VERI*FACTU, NO VERI*FACTU o ambas? ¿Cuál me recomendáis y por qué?" },
    { id: "registro", texto: "¿Genera el registro de alta y de anulación en el mismo momento de emitir o anular cada factura?" },
    { id: "huella", texto: "¿Encadena los registros por huella y cómo lo hace si facturo desde varios puestos o tiendas?" },
    { id: "qr", texto: "¿Incluye el QR y, en VERI*FACTU, la mención «VERI*FACTU» o «Factura verificable en la sede electrónica de la AEAT» en todos los formatos (PDF, ticket, email)?" },
    { id: "incidencias", texto: "¿Qué pasa si no hay conexión o la AEAT no responde? ¿Se puede seguir facturando y cómo se reenvían los registros?" },
    { id: "rectificativas", texto: "¿Cómo se gestionan anulaciones, facturas rectificativas y devoluciones?" },
    { id: "simplificadas", texto: "¿Cubre las facturas simplificadas (tickets) y, si las hago, las sustitutivas?" },
    { id: "integraciones", texto: "Si el programa recibe ventas de otras herramientas (tienda online, TPV, marketplace), ¿esas facturas pasan también por el registro?" },
    { id: "exportacion", texto: "¿Puedo exportar los registros y las facturas en un formato legible si cambio de proveedor?" },
    { id: "coste", texto: "¿La adaptación tiene coste adicional, cambio de plan o de licencia? ¿Desde cuándo?" },
    { id: "calendario", texto: "¿En qué fecha estará disponible para mí la versión conforme y cuándo tengo que actualizar?" },
    { id: "factura-electronica", texto: `¿Está previsto que emita y reciba factura electrónica B2B para el ${FACTURA_ELECTRONICA.restoLegible} (o el ${FACTURA_ELECTRONICA.grandesLegible} si supero 8 M€)?` },
    { id: "soporte", texto: "¿Quién me ayuda a configurarlo y en qué plazo responde el soporte?" },
  ],
  fuentes: [F.orden, F.aeat, F.faq],
};

// ---------------------------------------------------------------------------
// 3. Inventario de facturación
// ---------------------------------------------------------------------------
const inventario: KitModule = {
  id: "inventario",
  numero: 3,
  titulo: "Inventario de facturación",
  objetivo:
    "Tener en una página todos los sitios desde los que sale una factura y cómo se gestionan los casos difíciles. Es lo primero que te pedirá un proveedor, tu gestoría o un integrador.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "La mayoría de sorpresas no están en el programa principal, sino en lo que nadie recuerda: la tienda online que factura sola, el TPV de la feria, la plantilla de Word para clientes especiales, el proceso mensual que genera cuotas.",
    },
    {
      p: "Rellena los campos con lo que sepas hoy. «No lo sé» también es una respuesta útil: te dice qué preguntar. Los datos se guardan solo en este navegador.",
    },
    {
      h: "Por qué importan las series",
      p: "La cadena de huellas se construye registro a registro. Si varios puntos emiten facturas y están conectados entre sí, la AEAT indica que la cadena debe ser única; si son sistemas independientes, cada uno puede llevar la suya. Saber qué series existen y quién las usa evita decisiones que luego no se pueden deshacer.",
    },
  ],
  campos: [
    { id: "software", label: "Programa o programas de facturación", type: "text", placeholder: "Nombre, versión y proveedor" },
    { id: "modulos", label: "Módulos o canales que emiten factura", type: "textarea", placeholder: "Ventas, servicios, cuotas, tienda online, TPV, app…" },
    { id: "puntos", label: "Puntos de emisión", type: "textarea", placeholder: "Cajas, tiendas, ordenadores, usuarios, procesos automáticos", ayuda: "Detalla cada uno en la tabla de abajo." },
    { id: "series", label: "Series de facturación en uso", type: "textarea", placeholder: "Serie, para qué se usa y quién la usa" },
    { id: "anulaciones", label: "Cómo se anulan facturas hoy", type: "textarea", placeholder: "¿Se borran, se marcan, se emite otra?" },
    { id: "rectificativas", label: "Cómo se hacen las rectificativas", type: "textarea" },
    { id: "devoluciones", label: "Cómo se gestionan devoluciones y abonos", type: "textarea" },
    { id: "simplificadas", label: "¿Emites facturas simplificadas (tickets)?", type: "select", options: ["Sí", "No", "No lo sé"] },
    { id: "conectividad", label: "Conectividad de los puntos de emisión", type: "select", options: ["Siempre conectados", "Algún punto con conexión poco fiable", "Hay puntos que trabajan sin conexión", "No lo sé"] },
    { id: "responsables", label: "Responsables internos", type: "textarea", placeholder: "Quién factura, quién decide el programa, quién habla con la gestoría" },
  ],
  tabla: {
    exportType: "inventario-puntos",
    titulo: "Puntos de emisión",
    ayuda: "Una fila por cada sitio desde el que sale una factura.",
    columns: [
      { key: "punto", label: "Punto de emisión" },
      { key: "programa", label: "Programa" },
      { key: "serie", label: "Serie(s)" },
      { key: "tipo", label: "Tipo de factura", type: "select", options: ["Completa", "Simplificada", "Ambas"] },
      { key: "conexion", label: "Conexión", type: "select", options: ["Estable", "Intermitente", "Sin conexión", "No lo sé"] },
      { key: "responsable", label: "Responsable" },
      { key: "notas", label: "Notas" },
    ],
    ejemplo: { punto: "Caja tienda centro", programa: "TPV (marca y versión)", serie: "T1", tipo: "Simplificada", conexion: "Estable", responsable: "Encargada de tienda", notas: "" },
    maxRows: 50,
  },
  checklistMode: "check",
  checklist: [
    { id: "todos-puntos", texto: "He listado todos los puntos de emisión, incluidos los automáticos." },
    { id: "series", texto: "Sé qué series existen y por qué existe cada una." },
    { id: "casos", texto: "He descrito cómo se anulan, rectifican y devuelven facturas." },
    { id: "responsables", texto: "Hay una persona responsable de este proyecto." },
  ],
  fuentes: [F.faq, F.orden],
};

// ---------------------------------------------------------------------------
// 4. Matriz de proveedores
// ---------------------------------------------------------------------------
const matriz: KitModule = {
  id: "matriz",
  numero: 4,
  titulo: "Matriz de proveedores",
  objetivo:
    "Comparar tu programa actual con alternativas usando los mismos criterios, y decidir con datos si te quedas, actualizas o cambias.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "Cambiar de programa tiene costes que no salen en la tarifa: migrar clientes y series, formar al equipo, rehacer plantillas, perder integraciones. Compara siempre contra tu situación actual, no contra cero.",
    },
    {
      p: `Incluye la aplicación gratuita de la AEAT como referencia si tu volumen es pequeño: trabaja en modalidad VERI*FACTU y puede bastar a algunos autónomos. Comprueba en la sede si encaja con tu forma de facturar.`,
    },
    {
      p: "Rellena una fila por opción y descarga la tabla en CSV para compartirla con tu gestoría o tu socio.",
    },
  ],
  tabla: {
    exportType: "matriz-proveedores",
    titulo: "Comparativa",
    ayuda: "Una fila por proveedor u opción (incluida «quedarme como estoy»).",
    columns: [
      { key: "proveedor", label: "Proveedor / opción" },
      { key: "declaracion", label: "Declaración responsable", type: "select", options: ["Sí, la he visto", "Prometida", "No", "No lo sé"] },
      { key: "modalidad", label: "Modalidad", type: "select", options: ["VERI*FACTU", "NO VERI*FACTU", "Ambas", "No lo sé"] },
      { key: "tickets", label: "Tickets / simplificadas", type: "select", options: ["Sí", "No", "No aplica", "No lo sé"] },
      { key: "multipunto", label: "Varios puntos o tiendas", type: "select", options: ["Sí", "No", "No aplica", "No lo sé"] },
      { key: "offline", label: "Funciona sin conexión", type: "select", options: ["Sí", "No", "No lo sé"] },
      { key: "integraciones", label: "Integraciones que necesito" },
      { key: "factura_e", label: "Factura electrónica B2B", type: "select", options: ["Sí", "Prevista", "No", "No lo sé"] },
      { key: "exportacion", label: "Exportación de datos", type: "select", options: ["Sí", "No", "No lo sé"] },
      { key: "coste_anual", label: "Coste anual estimado (€)" },
      { key: "coste_cambio", label: "Coste de cambio (migración, formación)" },
      { key: "notas", label: "Notas" },
    ],
    ejemplo: { proveedor: "Mi programa actual", declaracion: "Prometida", modalidad: "No lo sé", tickets: "Sí", multipunto: "No aplica", offline: "No lo sé", integraciones: "Tienda online", factura_e: "No lo sé", exportacion: "Sí", coste_anual: "", coste_cambio: "0", notas: "" },
    maxRows: 12,
  },
  checklistMode: "check",
  checklist: [
    { id: "actual", texto: "He incluido mi programa actual como primera fila." },
    { id: "dos", texto: "He comparado al menos dos alternativas." },
    { id: "coste-cambio", texto: "He estimado el coste de cambio, no solo la cuota." },
    { id: "decision", texto: "He decidido: me quedo, actualizo o cambio, y antes de qué fecha." },
  ],
  fuentes: [F.appAeat, F.aeat, F.orden],
};

// ---------------------------------------------------------------------------
// 5. Email al proveedor
// ---------------------------------------------------------------------------
const emailProveedor: KitModule = {
  id: "email-proveedor",
  numero: 5,
  titulo: "Email al proveedor",
  objetivo: "Pedir por escrito las respuestas del módulo 2, con plazo y sin ambigüedades.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "Cópialo, sustituye lo que va entre corchetes y envíalo desde el email con el que tienes contratado el servicio. Guarda la respuesta en el dossier (módulo 7): es parte de tu evidencia.",
    },
  ],
  plantillas: [
    {
      id: "proveedor-completo",
      titulo: "Solicitud de información sobre la adaptación al RRSIF",
      asunto: "Adaptación al Reglamento de sistemas de facturación (RD 1007/2023) — [Nombre de la empresa]",
      cuerpo: `Hola, [nombre de la persona de contacto]:

Somos clientes de [nombre del programa] con la cuenta/licencia [identificador]. Estamos preparando la adaptación al Reglamento de sistemas informáticos de facturación (Real Decreto 1007/2023) y necesitamos que nos confirméis por escrito lo siguiente:

1. Declaración responsable del sistema para la versión que usamos, y dónde se consulta dentro del programa.
2. Versión que tenemos instalada y versión conforme con el reglamento.
3. Modalidad disponible (VERI*FACTU, NO VERI*FACTU o ambas) y cuál nos recomendáis para nuestro caso.
4. Cómo se generan y encadenan los registros si facturamos desde [número] puestos o tiendas.
5. Si el QR y la mención correspondiente aparecen en todos nuestros formatos: [PDF / ticket / email].
6. Qué ocurre si no hay conexión o la AEAT no responde, y cómo se reenvían los registros.
7. Cómo se gestionan anulaciones, rectificativas y devoluciones.
8. Si las facturas que llegan desde [tienda online / TPV / otra herramienta] pasan también por el registro.
9. Coste de la adaptación (si lo hay) y fecha en que estará disponible para nosotros.
10. Si está prevista la factura electrónica B2B y en qué fecha.

Nos ayudaría tener la respuesta antes del [fecha]. Si alguna pregunta no aplica a vuestro producto, indicadlo también, por favor.

Gracias,
[Nombre y apellidos]
[Cargo] · [Empresa] · [NIF]
[Teléfono]`,
    },
    {
      id: "proveedor-recordatorio",
      titulo: "Recordatorio breve",
      asunto: "Re: Adaptación al RD 1007/2023 — pendiente de respuesta",
      cuerpo: `Hola, [nombre]:

Os escribí el [fecha] sobre la adaptación al Reglamento de sistemas de facturación. Sigo pendiente de la declaración responsable de nuestra versión y de la fecha en que tendremos la versión conforme.

¿Podéis confirmármelo antes del [fecha]? Lo necesito para planificar con mi gestoría.

Gracias,
[Nombre]`,
    },
  ],
  checklistMode: "check",
  checklist: [
    { id: "enviado", texto: "He enviado el email al proveedor." },
    { id: "respuesta", texto: "He recibido respuesta por escrito y la he guardado." },
    { id: "matriz", texto: "He pasado las respuestas al módulo 2 y a la matriz." },
  ],
  fuentes: [F.orden, F.rd],
};

// ---------------------------------------------------------------------------
// 6. Email a la gestoría
// ---------------------------------------------------------------------------
const emailGestoria: KitModule = {
  id: "email-gestoria",
  numero: 6,
  titulo: "Email a la gestoría",
  objetivo: "Resolver por escrito las dudas fiscales que el Kit no puede resolver por ti.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "Tu gestoría o asesoría es quien puede confirmar si estás dentro del ámbito, qué fecha te aplica y cómo encaja con el resto de tus obligaciones. Llevarle el inventario (módulo 3) hecho ahorra tiempo a los dos.",
    },
  ],
  plantillas: [
    {
      id: "gestoria",
      titulo: "Consulta a la gestoría",
      asunto: "Consulta sobre el Reglamento de sistemas de facturación (VERI*FACTU) — [Empresa]",
      cuerpo: `Hola, [nombre]:

Estoy preparando la adaptación al Reglamento de sistemas informáticos de facturación (Real Decreto 1007/2023) y quería confirmar contigo algunos puntos antes de tomar decisiones:

1. ¿Nos aplica el reglamento? Te resumo nuestra situación: [SII sí/no], [domicilio fiscal], [tipo de facturas que emitimos: completas / tickets].
2. ¿Qué fecha vigente nos corresponde? Entiendo que hoy es el ${NORMA.fechaSociedadesLegible} para Sociedades y el ${NORMA.fechaRestoLegible} para el resto, y que Hacienda ha anunciado un aplazamiento a ${ANUNCIO.nuevaFechaLegible} pendiente de publicación.
3. ¿Hay alguna operación nuestra que no deba documentarse en factura y quede fuera?
4. ¿Ves algún inconveniente en que usemos [programa] en modalidad [VERI*FACTU / NO VERI*FACTU]?
5. Si cambiamos de programa, ¿qué tenemos que tener en cuenta con las series y la numeración?
6. Sobre la factura electrónica B2B: ¿en qué fecha nos afecta según nuestro volumen de operaciones?

Te adjunto el inventario de cómo facturamos hoy (puntos de emisión, series y casos especiales).

Gracias,
[Nombre]
[Empresa] · [NIF]`,
    },
  ],
  checklistMode: "check",
  checklist: [
    { id: "enviado", texto: "He enviado la consulta con el inventario adjunto." },
    { id: "ambito", texto: "Tengo confirmado por escrito si me aplica y desde cuándo." },
    { id: "modalidad", texto: "He comentado la modalidad elegida con la gestoría." },
  ],
  fuentes: [F.rd, F.aeat, F.feCalendario],
};

// ---------------------------------------------------------------------------
// 7. Dossier de evidencias
// ---------------------------------------------------------------------------
const dossier: KitModule = {
  id: "dossier",
  numero: 7,
  titulo: "Dossier de evidencias",
  objetivo:
    "Reunir en una carpeta la documentación que conviene pedir o conservar, para poder explicar qué hace tu sistema si alguien lo pregunta.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "El dossier no certifica nada. Sirve para que, ante una pregunta de la AEAT, de tu gestoría o de un nuevo proveedor, puedas enseñar qué sistema usas, desde cuándo y cómo se comporta. Crea una carpeta con fecha y ve guardando aquí lo que obtengas.",
    },
    {
      aviso:
        "Completar este dossier no acredita el cumplimiento del reglamento. La conformidad del sistema la declara su productor; la calificación fiscal de tu caso la hace tu asesoría.",
    },
    {
      h: "Sobre la declaración responsable",
      p: `${DECLARACION_PRUDENTE} Si usas software de mercado, la emite tu proveedor y debe estar disponible dentro del propio programa.`,
    },
  ],
  checklistMode: "respuesta",
  checklist: [
    { id: "declaracion", texto: "Declaración responsable del productor para la versión que usas (copia o captura con fecha)." },
    { id: "version", texto: "Identificación del sistema y de la versión instalada, con la fecha de instalación o actualización." },
    { id: "modalidad", texto: "Modalidad elegida (VERI*FACTU o NO VERI*FACTU) y la fecha en que se activó." },
    { id: "registro", texto: "Una muestra de facturas con su registro de alta, y de una anulación con su registro de anulación." },
    { id: "encadenamiento", texto: "Descripción de series y puntos de emisión y cómo se encadenan los registros (puede ser la respuesta del proveedor)." },
    { id: "remision", texto: "En VERI*FACTU: constancia de los envíos a la AEAT y de cómo se gestionaron las incidencias. En NO VERI*FACTU: registro de eventos y forma de exportar los registros." },
    { id: "qr", texto: "Una factura de cada formato (PDF, ticket, email) con el QR legible y la mención exigida, comprobada con el móvil." },
    { id: "inalterabilidad", texto: "Explicación del proveedor sobre cómo se conservan los registros y cómo se impide modificarlos." },
    { id: "exportacion", texto: "Una exportación de prueba de registros y facturas." },
    { id: "correspondencia", texto: "Los emails con el proveedor y la gestoría (módulos 5 y 6)." },
    { id: "exclusion", texto: "Si concluyes que no te aplica: la justificación y la confirmación de tu asesoría." },
  ],
  tabla: {
    exportType: "dossier-evidencias",
    titulo: "Índice del dossier",
    ayuda: "Anota dónde guardas cada documento para encontrarlo en un minuto.",
    columns: [
      { key: "documento", label: "Documento" },
      { key: "fecha", label: "Fecha" },
      { key: "ubicacion", label: "Dónde está guardado" },
      { key: "responsable", label: "Responsable" },
    ],
    ejemplo: { documento: "Declaración responsable v. [x]", fecha: "", ubicacion: "Carpeta compartida / VERI*FACTU / 01", responsable: "" },
    maxRows: 40,
  },
  fuentes: [F.orden, F.aeat, F.rd],
};

// ---------------------------------------------------------------------------
// 8. Plan de 30 días
// ---------------------------------------------------------------------------
const plan: KitModule = {
  id: "plan-30-dias",
  numero: 8,
  titulo: "Plan de 30 días",
  objetivo: "Pasar de «tengo que mirar lo de Verifactu» a tener decisión, proveedor y evidencias en cuatro semanas.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "Cuatro semanas, una o dos horas por semana. Si alguna tarea depende de una respuesta que no llega, márcala y sigue: el plan está pensado para avanzar en paralelo.",
    },
  ],
  semanas: [
    {
      semana: 1,
      titulo: "Saber dónde estás",
      acciones: [
        { id: "s1-arbol", texto: "Recorre el árbol «¿Me aplica?» (módulo 1)." },
        { id: "s1-inventario", texto: "Completa el inventario de facturación (módulo 3)." },
        { id: "s1-gestoria", texto: "Envía la consulta a la gestoría con el inventario (módulo 6)." },
      ],
    },
    {
      semana: 2,
      titulo: "Preguntar al proveedor",
      acciones: [
        { id: "s2-email", texto: "Envía el email al proveedor con fecha de respuesta (módulo 5)." },
        { id: "s2-declaracion", texto: "Busca la declaración responsable dentro de tu programa." },
        { id: "s2-alternativas", texto: "Identifica dos alternativas por si la respuesta no convence (módulo 4)." },
      ],
    },
    {
      semana: 3,
      titulo: "Decidir",
      acciones: [
        { id: "s3-respuestas", texto: "Pasa las respuestas al módulo 2 y a la matriz." },
        { id: "s3-decision", texto: "Decide: actualizar, cambiar de programa o pedir una integración (módulo 9)." },
        { id: "s3-fecha", texto: "Fija la fecha de puesta en marcha, con margen sobre tu fecha vigente." },
      ],
    },
    {
      semana: 4,
      titulo: "Dejarlo documentado",
      acciones: [
        { id: "s4-dossier", texto: "Crea la carpeta del dossier y guarda lo que ya tienes (módulo 7)." },
        { id: "s4-prueba", texto: "Cuando tengas la versión conforme, emite una factura de prueba de cada formato y lee el QR con el móvil." },
        { id: "s4-revision", texto: "Pon en el calendario una revisión trimestral y cuando se publique el aplazamiento anunciado." },
      ],
    },
  ],
  checklistMode: "check",
  checklist: [],
  fuentes: [F.aeat],
};

// ---------------------------------------------------------------------------
// 9. Cuándo necesitas una integración
// ---------------------------------------------------------------------------
const integracion: KitModule = {
  id: "integracion",
  numero: 9,
  titulo: "Cuándo necesitas una integración",
  objetivo:
    "Reconocer los casos en los que actualizar o cambiar de programa no basta y hace falta trabajo técnico sobre tu sistema.",
  version: "1.0.0",
  lastVerifiedAt: VERIFIED,
  contenido: [
    {
      p: "Para la mayoría de autónomos y pymes con software de mercado, la solución es actualizar o cambiar de programa. Hay casos en los que no: cuando la facturación vive dentro de un sistema propio o muy adaptado que no se puede sustituir sin romper la operación.",
    },
    {
      h: "Señales de que necesitas una auditoría técnica",
      list: [
        "Facturas desde un ERP propio, a medida o muy modificado.",
        "Tienes un TPV con varias cajas o tiendas, o puntos que trabajan sin conexión.",
        "Tu tienda online emite las facturas por su cuenta, fuera del programa de facturación.",
        "Usas un software vertical de tu sector y el fabricante no da fechas claras.",
        "Varias herramientas emiten facturas y nadie sabe explicar todas las series.",
        "Tu proveedor no puede o no quiere adaptar el sistema y migrar supone rehacer procesos críticos.",
      ],
    },
    {
      h: "Qué incluye una auditoría técnica",
      p: "Revisión de puntos de emisión, series, anulaciones y rectificativas; vía de integración disponible (API, eventos o base de datos); modalidad recomendada desde el punto de vista técnico; y alcance cerrado del trabajo. La calificación fiscal sigue siendo de tu asesoría.",
    },
    {
      p: `${DECLARACION_PRUDENTE}`,
    },
  ],
  checklistMode: "respuesta",
  checklist: [
    { id: "propio", texto: "La facturación sale de un sistema propio, a medida o muy adaptado." },
    { id: "multipunto", texto: "Hay varios puntos de emisión que facturan en paralelo." },
    { id: "offline", texto: "Algún punto trabaja sin conexión de forma habitual." },
    { id: "integraciones", texto: "Otras herramientas (tienda online, marketplace, app) emiten facturas." },
    { id: "sin-proveedor", texto: "El proveedor no tiene fecha o la versión conforme no cubre mi caso." },
  ],
  fuentes: [F.aeat, F.faq, F.orden],
};

export const KIT_MODULES: KitModule[] = [
  meAplica,
  proveedor,
  inventario,
  matriz,
  emailProveedor,
  emailGestoria,
  dossier,
  plan,
  integracion,
];

/** Definición de las exportaciones CSV (las usa el endpoint autenticado). */
export const KIT_EXPORTS: Record<KitExportType, { filename: string; columns: KitColumn[]; fromChecklist?: string }> = {
  "matriz-proveedores": { filename: "verifactu-matriz-proveedores.csv", columns: matriz.tabla!.columns },
  "inventario-puntos": { filename: "verifactu-inventario-puntos-emision.csv", columns: inventario.tabla!.columns },
  "dossier-evidencias": { filename: "verifactu-indice-dossier.csv", columns: dossier.tabla!.columns },
  "preguntas-proveedor": {
    filename: "verifactu-preguntas-proveedor.csv",
    columns: [
      { key: "pregunta", label: "Pregunta" },
      { key: "respuesta", label: "Respuesta" },
      { key: "nota", label: "Nota" },
    ],
    fromChecklist: "proveedor",
  },
};

export const KIT_DISCLAIMER =
  "El Kit es material orientativo de preparación. No emite facturas, no envía registros a la AEAT, no genera registros fiscales y no certifica el cumplimiento. Completarlo no acredita que tu sistema cumpla el reglamento. La calificación fiscal de tu caso corresponde a tu asesoría.";
