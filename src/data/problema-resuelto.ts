// Programa «Problema Resuelto» — configuración PÚBLICA.
//
// Fuente única de nombre, rutas, cupo, versiones del consentimiento y de las
// bases, y de los textos cortos que comparten la página y la island. Se puede
// importar desde páginas estáticas e islands: no contiene secretos. Prompts,
// límites del agente y acceso a la BD viven en src/lib/problema-resuelto/.

export const PROBLEMA_PROGRAM = {
  /** Identificador estable (analítica, emails, BD). */
  key: "problema-resuelto",
  name: "Problema Resuelto",
  /** Plazas como máximo al mes. Es un tope, no un objetivo. */
  monthlySlots: 10,
  /** Días laborables máximos para responder a cada caso. */
  responseDays: 3,
  paths: {
    landing: "/es/problema-resuelto/",
    privacy: "/es/politica-de-privacidad/",
    about: "/es/sobre/",
    chatApi: "/api/problema-resuelto/chat",
    submitApi: "/api/problema-resuelto/submit",
    ogImage: "/og/es/problema-resuelto.png",
  },
  /** Valor de `lead_source` en el evento generate_lead de GTM. */
  leadSource: "Problema_Resuelto",
} as const;

/** Límites que la island muestra y que el servidor vuelve a comprobar. */
export const PROBLEMA_LIMITS = {
  messageMax: 1500,
  messageMin: 10,
  /** Mensajes de la persona por conversación con el agente. */
  userTurns: 6,
} as const;

/**
 * Versión del texto de consentimiento. Si cambia el texto de la casilla o la
 * finalidad, se crea una versión nueva y se añade a ACCEPTED_*_VERSIONS (las
 * anteriores siguen aceptándose mientras haya páginas en caché que las muestren).
 */
export const PROBLEMA_CONSENT = {
  version: "pr-consent-2026-11-04",
  text: "He leído la política de privacidad y acepto que IA Operators use lo que he escrito y mis datos de contacto para evaluar mi caso y responderme.",
} as const;

export const PROBLEMA_BASES_VERSION = "pr-bases-2026-11-04";

export const ACCEPTED_PROBLEMA_CONSENT_VERSIONS: readonly string[] = [PROBLEMA_CONSENT.version];
export const ACCEPTED_PROBLEMA_BASES_VERSIONS: readonly string[] = [PROBLEMA_BASES_VERSION];

export const COMPANY_SIZES = [
  { value: "1-9", label: "1 a 9 personas" },
  { value: "10-49", label: "10 a 49 personas" },
  { value: "50-249", label: "50 a 249 personas" },
  { value: "250+", label: "250 o más" },
] as const;

export const MANAGER_AWARE = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "todavia_no", label: "Todavía no" },
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number]["value"];
export type ManagerAware = (typeof MANAGER_AWARE)[number]["value"];

/** Ejemplos rotativos del cuadro de texto. Concretos a propósito: enseñan el tamaño del problema. */
export const PROBLEMA_EXAMPLES: readonly string[] = [
  "Cada lunes copio a mano los pedidos del correo al ERP y se me va la mañana.",
  "Recibimos 200 currículums por oferta y los filtramos uno a uno.",
  "Los clientes preguntan lo mismo por WhatsApp y contestamos a mano fuera de horario.",
  "Cada mes junto tres Excel para montar el informe de dirección.",
  "Revisamos las facturas de proveedores contra los albaranes, línea a línea.",
];

/** Preguntas del formulario de respaldo (cuando el agente no está disponible). */
export const FALLBACK_QUESTIONS = [
  { key: "situacion", label: "¿Qué pasa hoy, paso a paso?", required: true, rows: 5 },
  { key: "frecuencia", label: "¿Cada cuánto ocurre y cuánto tiempo os lleva?", required: false, rows: 2 },
  { key: "herramientas", label: "¿Qué herramientas intervienen? (Excel, correo, ERP, CRM…)", required: false, rows: 2 },
  { key: "resultado", label: "¿Cómo sabrías que está resuelto?", required: false, rows: 2 },
] as const;

export type FallbackKey = (typeof FALLBACK_QUESTIONS)[number]["key"];

/** Bases del programa. La página las muestra tal cual y el formulario las referencia por versión. */
export const PROBLEMA_BASES: readonly { title: string; body: string }[] = [
  { title: "Quién puede participar", body: "Personas que trabajan en una empresa u organización con actividad en España, con un correo de empresa." },
  { title: "Un problema por empresa", body: "Concreto, operativo y que se repita. Cuando entreguemos, la empresa puede enviar otro." },
  { title: "Plazas", body: "Hasta 10 al mes. Elegimos según el encaje, la claridad del problema y lo útil que sea resolverlo. Enviar un problema no garantiza plaza." },
  { title: "Respuesta", body: "Te contestamos en un máximo de 3 días laborables, también si no encaja." },
  { title: "Qué entregamos", body: "Una solución que funciona sin acceso a vuestros sistemas en producción, con datos de ejemplo o con datos que nos pases sin información personal. El plazo te lo confirmamos al aceptar el caso." },
  { title: "Si el problema es más grande", body: "Antes de empezar te decimos por escrito qué parte hacemos gratis. Para el resto te enviamos un presupuesto cerrado, que puedes aceptar o no." },
  { title: "Dos llamadas", body: "Una de inicio (unos 20 minutos) y una de entrega (unos 30 minutos). La entrega se hace siempre en llamada." },
  { title: "Propiedad", body: "La solución entregada es vuestra y la podéis usar libremente. IA Operators conserva el derecho a reutilizar conocimientos y componentes genéricos que no contengan información vuestra." },
  { title: "Publicación del caso", body: "Participar implica aceptar que publiquemos el caso de forma anónima, sin nombres de empresa ni de personas ni datos que permitan identificaros. Te enseñamos el texto antes de publicarlo." },
  { title: "Datos", body: "No envíes datos personales de terceros ni información confidencial. Si para resolverlo hicieran falta datos reales, lo hablamos aparte y firmamos el acuerdo que corresponda." },
  { title: "Sin mantenimiento", body: "La solución se entrega tal cual. No incluye soporte, mantenimiento ni garantía de resultados, salvo que lo acordemos aparte." },
  { title: "Cambios", body: "Podemos pausar o cerrar el programa, o cambiar estas bases, avisándolo en esta página. Los casos ya aceptados se terminan con las bases con las que entraron." },
];
