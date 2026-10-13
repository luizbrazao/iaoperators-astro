// Cuestionario del diagnóstico RGPD (madurez operativa de protección de datos).
// 11 preguntas, menos de tres minutos. Misma regla que los otros tests: cada
// pregunta existe porque cambia el resultado (un área, una prioridad o la
// recomendación de revisión profesional). Si no mueve nada, no entra.
//
// Diferencia de fondo con los tests de la Ley 10/2025 y de Verifactu: aquí no
// hay un "¿te aplica?" con exclusiones. El RGPD se aplica a cualquier empresa
// que trate datos de personas. Lo que mide el test es MADUREZ (cómo de
// organizada está la operación), no cumplimiento, y nunca concluye si hace
// falta una EIPD, un DPD o notificar una brecha.

import type { AssessmentQuestion } from "../types";

export const ASSESSMENT_KEY = "rgpd-ops" as const;
export const ASSESSMENT_VERSION = "2026-10-v1";
export const ASSESSMENT_PUBLIC_PATH = "/es/cumplimiento/rgpd/test/";

/** Opciones de la pregunta de datos que disparan la recomendación de revisión profesional. */
export const SENSIBLES_REVISION = [
  "salud",
  "especiales",
  "menores",
  "geolocalizacion",
  "perfiles",
  "decisiones",
  "gran-escala",
] as const;

export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "actividad",
    type: "single",
    title: "¿A qué se dedica tu empresa?",
    description: "Sirve para ordenar las prioridades y detectar actividades con obligaciones específicas.",
    options: [
      { value: "agencia", label: "Agencia de marketing, publicidad o comunicación" },
      { value: "consultoria", label: "Consultoría o servicios profesionales" },
      { value: "inmobiliaria", label: "Inmobiliaria o administración de fincas" },
      { value: "formacion", label: "Academia, formación o centro educativo" },
      { value: "salud-bienestar", label: "Salud, estética, bienestar o deporte" },
      { value: "comercio", label: "Comercio, e-commerce u hostelería" },
      { value: "otra", label: "Otra actividad" },
    ],
  },
  {
    id: "tamano",
    type: "single",
    title: "¿Cuántas personas trabajan en la empresa?",
    description: "Cuenta la plantilla, no los colaboradores externos.",
    options: [
      { value: "1-9", label: "De 1 a 9" },
      { value: "10-49", label: "De 10 a 49" },
      { value: "50-249", label: "De 50 a 249" },
      { value: "250+", label: "250 o más" },
    ],
  },
  {
    id: "datos",
    type: "multi",
    title: "¿De quién tratáis datos y qué hacéis con ellos?",
    description: "Marca todo lo que aplique. Las últimas opciones son las que piden más cuidado.",
    min: 1,
    options: [
      { value: "clientes", label: "Clientes, leads o usuarios particulares" },
      { value: "contactos-b2b", label: "Personas de contacto de otras empresas" },
      { value: "empleados", label: "Empleados o candidatos" },
      { value: "salud", label: "Datos de salud", hint: "Incluye fichas de clientes con información médica, estética o de bienestar" },
      {
        value: "especiales",
        label: "Otras categorías especiales",
        hint: "Origen étnico, opiniones políticas, religión, afiliación sindical, datos genéticos o biométricos, vida u orientación sexual",
      },
      { value: "menores", label: "Datos de menores de edad" },
      { value: "geolocalizacion", label: "Ubicación de las personas o seguimiento de sus movimientos" },
      { value: "perfiles", label: "Perfiles o segmentación por comportamiento, intereses o preferencias" },
      { value: "decisiones", label: "Reglas o IA que puntúan, filtran o deciden sobre personas" },
      { value: "gran-escala", label: "Datos de un número muy alto de personas (decenas de miles o más)" },
    ],
  },
  {
    id: "canales",
    type: "multi",
    title: "¿Por dónde entran o circulan los datos?",
    description: "Cada canal es un punto donde hay que informar y, a veces, pedir consentimiento.",
    min: 1,
    options: [
      { value: "web", label: "Web y formularios" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "crm", label: "CRM" },
      { value: "email-marketing", label: "Newsletter o email marketing" },
      { value: "pixeles", label: "Google Analytics, Google Ads, Meta Pixel o LinkedIn Insight" },
      { value: "ia", label: "Automatizaciones, agentes o funciones de IA con datos de personas" },
      { value: "ninguno", label: "Ninguno de estos", exclusive: true },
    ],
  },
  {
    id: "proveedores",
    type: "single",
    title: "¿Sabéis qué proveedores tratan datos por vosotros y dónde?",
    description: "CRM, email, WhatsApp, analítica, hosting, herramientas de IA… Cuenta también las suscripciones de un solo departamento.",
    options: [
      { value: "lista-ue", label: "Sí, tenemos la lista y todos tratan los datos en la UE/EEE" },
      { value: "lista-fuera-revisado", label: "Sí, alguno está fuera del EEE y sabemos con qué garantía" },
      { value: "fuera-sin-revisar", label: "Alguno está fuera del EEE (p. ej., EE. UU.) y no lo hemos revisado" },
      { value: "sin-lista", label: "No tenemos una lista de proveedores" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "contratos",
    type: "single",
    title: "¿Tenéis localizados los contratos de encargo (DPA) con esos proveedores?",
    description: "Muchos SaaS lo incluyen en sus condiciones: hay que saber dónde está y qué dice.",
    options: [
      { value: "todos", label: "Sí, de todos, y sabemos dónde están" },
      { value: "algunos", label: "De algunos" },
      { value: "ninguno", label: "No los hemos revisado" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "rat",
    type: "single",
    title: "¿Tenéis un registro de actividades de tratamiento (RAT)?",
    description: "El documento interno que describe cada tratamiento: para qué, qué datos, de quién, a quién se comunican y cuánto se guardan.",
    options: [
      { value: "actualizado", label: "Sí, revisado en los últimos 12 meses" },
      { value: "desactualizado", label: "Sí, pero no se ha revisado en más de un año" },
      { value: "no", label: "No" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "transparencia",
    type: "single",
    title: "¿Cómo están los avisos de privacidad y los consentimientos?",
    description: "Formularios, WhatsApp, cookies, newsletter y píxeles.",
    options: [
      { value: "completos", label: "Hay aviso en cada punto de captación y consentimiento donde corresponde, revisados" },
      { value: "parcial", label: "Hay política de privacidad, pero no en todos los formularios o canales" },
      { value: "plantilla", label: "Usamos un texto copiado o generado y no lo hemos revisado" },
      { value: "no", label: "No tenemos avisos" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "derechos",
    type: "single",
    title: "Si alguien pide acceso, rectificación o supresión de sus datos, ¿qué pasa?",
    options: [
      { value: "procedimiento", label: "Hay un procedimiento con responsable, plazo y registro" },
      { value: "informal", label: "Se responde, pero sin procedimiento ni registro" },
      { value: "nada", label: "No sabríamos cómo hacerlo" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "incidentes",
    type: "single",
    title: "Si se pierde o se expone información personal, ¿qué pasa?",
    description: "Un portátil robado, un email al destinatario equivocado, una base de datos abierta.",
    options: [
      { value: "protocolo", label: "Hay un protocolo escrito y un registro de incidentes" },
      { value: "informal", label: "Sabríamos a quién avisar, pero no hay nada escrito" },
      { value: "nada", label: "No hay nada previsto" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "medidas",
    type: "multi",
    title: "¿Qué de esto hacéis de forma habitual?",
    description: "Medidas organizativas básicas. Marca solo lo que se hace de verdad.",
    min: 1,
    options: [
      { value: "accesos", label: "Revisamos quién tiene acceso a cada herramienta y quitamos los que sobran" },
      { value: "doble-factor", label: "Doble factor en el correo y en las herramientas principales" },
      { value: "copias", label: "Copias de seguridad que hemos probado a restaurar" },
      { value: "formacion", label: "Formación o instrucciones al equipo sobre datos personales" },
      { value: "revision", label: "Una revisión periódica de todo esto, con fecha" },
      { value: "ninguna", label: "Ninguna de estas", exclusive: true },
    ],
  },
];

export const ACTIVIDAD_LABELS: Record<string, string> = Object.fromEntries(
  QUESTIONS.find((q) => q.id === "actividad")!.options.map((o) => [o.value, o.label]),
);
