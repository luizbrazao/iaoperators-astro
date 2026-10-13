// Contenido guiado de RGPD Ops — SOLO SERVER-SIDE.
//
// Se importa únicamente desde la página protegida (/ops/acceso/, SSR) y desde
// el webhook (tareas iniciales). La island recibe estos textos como props
// después de autorizar la petición; nunca los importa. El centinela permite a
// scripts/check-rgpd-ops-bundle.mjs detectar si este archivo se cuela en un
// recurso estático.

import { AFIRMACIONES, fuentesDe, HERRAMIENTAS_AEPD, PENDIENTES, type RgpdModulo } from "./rgpd";

export const RGPD_OPS_CONTENT_SENTINEL = "rgo-content-4f2a91d3-paid-only";

export interface ModuleGuide {
  id: string;
  titulo: string;
  objetivo: string;
  pasos: string[];
  avisos: string[];
  fuentes: { titulo: string; url: string }[];
}

const src = (m: RgpdModulo) => fuentesDe(m).map((f) => ({ titulo: f.titulo, url: f.url }));

export const MODULE_GUIDES: ModuleGuide[] = [
  {
    id: "perfil",
    titulo: "Perfil y alcance",
    objetivo: "Dejar escrito qué papel tiene la empresa, por dónde entran los datos, de quién son y si hay señales que pidan un análisis específico.",
    pasos: [
      "Indica si decidís para qué y cómo se tratan los datos (responsable), si los tratáis por cuenta de clientes (encargado) o ambas cosas según el servicio.",
      "Marca todos los canales, aunque los use un solo departamento: cada uno es un punto de captación y casi siempre un proveedor.",
      "Si marcas alguna señal de mayor riesgo, el panel recomendará una revisión profesional. No significa que algo esté mal: significa que tu caso pide un análisis que esta herramienta no hace.",
    ],
    avisos: [AFIRMACIONES.pymesRiesgo.texto, AFIRMACIONES.eipd.texto, AFIRMACIONES.dpd.texto],
    fuentes: src("perfil"),
  },
  {
    id: "tratamientos",
    titulo: "Mapa de tratamientos",
    objetivo: "Tener un inventario vivo de las actividades de tratamiento, con los datos que pide el registro de actividades, y exportarlo como borrador.",
    pasos: [
      "Empieza por los tratamientos de siempre: clientes y facturación, consultas (web y WhatsApp), marketing, personal y selección.",
      "Para cada uno: finalidad, personas, categorías de datos, destinatarios, transferencias, conservación y medidas.",
      "La base jurídica es un campo de trabajo: anótala como hipótesis y valídala según el caso.",
      "Marca «Revisado internamente» cuando lo hayáis repasado; no equivale a una validación jurídica.",
    ],
    avisos: [AFIRMACIONES.ratContenido.texto, AFIRMACIONES.ratExcepcion.texto, ...PENDIENTES.filter((p) => p.afecta.includes("tratamientos")).map((p) => p.texto)],
    fuentes: src("tratamientos"),
  },
  {
    id: "proveedores",
    titulo: "Proveedores y encargados",
    objetivo: "Saber qué herramientas tratan datos por vosotros, dónde, con qué contrato y cuándo toca revisarlas.",
    pasos: [
      "Lista CRM, WhatsApp, email, analítica, anuncios, hosting, automatizaciones e IA. También las suscripciones de un solo departamento.",
      "Para cada uno, localiza el contrato de encargo (DPA): muchos SaaS lo incluyen en sus condiciones. Apunta dónde está, no lo copies aquí.",
      "Si trata datos fuera del EEE, identifica en qué garantía se apoya la transferencia.",
      "Fija una próxima revisión: al renovar, al cambiar de plan o cuando el proveedor cambie sus condiciones.",
    ],
    avisos: [AFIRMACIONES.encargado.texto],
    fuentes: src("proveedores"),
  },
  {
    id: "captacion",
    titulo: "Puntos de captación y transparencia",
    objetivo: "Comprobar que cada formulario, canal o etiqueta que recoge datos informa como corresponde y, cuando hace falta, recoge un consentimiento que se puede demostrar.",
    pasos: [
      "Recorre la web, los formularios, WhatsApp, la newsletter, el banner de cookies y los píxeles.",
      "Para cada punto, anota el estado del aviso y si hay información básica por capas con enlace al resto.",
      "Marca el consentimiento como «por determinar» si no sabes si hace falta: es una decisión que depende del caso.",
    ],
    avisos: [AFIRMACIONES.informacionCapas.texto],
    fuentes: src("captacion"),
  },
  {
    id: "solicitudes",
    titulo: "Solicitudes de derechos",
    objetivo: "Registrar cada solicitud con una referencia interna y controlar su plazo orientativo, sin guardar aquí los datos de la persona.",
    pasos: [
      "Usa una referencia interna (por ejemplo SOL-2026-001). El nombre, el email, el documento y el contenido de la solicitud se quedan en vuestro sistema seguro, no aquí.",
      "La fecha de recepción calcula el plazo orientativo de un mes. Si aplicáis la prórroga, registra la fecha en que avisasteis a la persona.",
      "Al cerrar, apunta la fecha de respuesta y el estado.",
    ],
    avisos: [
      AFIRMACIONES.plazoDerechos.texto,
      "Conserva la documentación de cada solicitud (petición, verificación de identidad y respuesta) en vuestro sistema seguro: esta herramienta solo guarda la referencia y las fechas.",
    ],
    fuentes: src("solicitudes"),
  },
  {
    id: "incidentes",
    titulo: "Incidentes y brechas",
    objetivo: "Documentar cada incidente con datos personales, controlar el reloj orientativo de 72 horas y registrar vuestra decisión y su motivo.",
    pasos: [
      "Registra el momento en que la empresa tuvo constancia: es el inicio del reloj orientativo.",
      "Describe el hecho, las categorías de datos y el alcance aproximado. Nunca los registros afectados ni datos de personas.",
      "Registra vuestra valoración del riesgo y la decisión. La herramienta no decide si hay que notificar y no notifica a nadie.",
      "Las herramientas de la AEPD Asesora Brecha y Comunica-Brecha RGPD ayudan a tomar esa decisión.",
    ],
    avisos: [AFIRMACIONES.brecha72h.texto, AFIRMACIONES.brechaDocumentar.texto],
    fuentes: src("incidentes"),
  },
  {
    id: "plan",
    titulo: "Plan de acción y evidencias",
    objetivo: "Convertir lo pendiente en tareas con responsable, prioridad y fecha, saber dónde está cada evidencia y revisar todo cada trimestre.",
    pasos: [
      "Asigna cada tarea a un rol (Dirección, Marketing, Administración), no a una persona con nombre y apellidos.",
      "En evidencias, apunta solo la referencia de dónde está guardado cada documento: no se suben archivos.",
      "Cada trimestre, abre una revisión, repasa la lista de comprobación y ciérrala con conclusiones.",
    ],
    avisos: [],
    fuentes: src("plan"),
  },
  {
    id: "exportaciones",
    titulo: "Exportaciones",
    objetivo: "Llevarte tus datos cuando quieras: CSV por módulo, copia de seguridad completa en JSON y una vista imprimible del borrador de registro de actividades.",
    pasos: [
      "El CSV abre en Excel en español (separador punto y coma) y neutraliza fórmulas.",
      "La copia JSON incluye todo el espacio y su versión: guárdala junto a tu documentación.",
      "El borrador de RAT se imprime o se guarda en PDF desde el navegador. Es un borrador: revísalo antes de usarlo como documentación definitiva.",
    ],
    avisos: [],
    fuentes: src("exportaciones"),
  },
];

/** Checklist de la revisión trimestral (claves en src/lib/rgpd-ops/schema.ts → REVIEW_KEYS). */
export const REVIEW_CHECKLIST: { key: string; texto: string }[] = [
  { key: "perfil", texto: "El perfil refleja los canales, personas y señales de riesgo actuales." },
  { key: "tratamientos", texto: "El mapa incluye las finalidades y herramientas nuevas del trimestre." },
  { key: "proveedores", texto: "Los proveedores nuevos tienen contrato localizado y ubicación identificada." },
  { key: "captacion", texto: "Los formularios y canales nuevos o cambiados tienen su aviso revisado." },
  { key: "solicitudes", texto: "Ninguna solicitud quedó fuera de plazo y las cerradas tienen fecha de respuesta." },
  { key: "incidentes", texto: "Todos los incidentes del trimestre están documentados con su decisión." },
  { key: "accesos", texto: "Se han revisado los accesos a las herramientas y retirado los que sobran." },
  { key: "evidencias", texto: "Las evidencias siguen donde dice el catálogo y las vencidas se han revisado." },
];

/** Tareas iniciales que se crean una sola vez con el espacio de trabajo. */
export const SEED_TASKS: { seed_key: string; title: string; area: string; priority: "alta" | "media" | "baja"; owner_role: string; due_in_days: number }[] = [
  { seed_key: "seed:perfil", title: "Completar el perfil y alcance", area: "perfil", priority: "alta", owner_role: "Dirección", due_in_days: 7 },
  { seed_key: "seed:proveedores", title: "Listar los proveedores que tratan datos y localizar sus contratos de encargo", area: "proveedores", priority: "alta", owner_role: "Administración", due_in_days: 14 },
  { seed_key: "seed:tratamientos", title: "Documentar los tratamientos principales (clientes, marketing y personal)", area: "tratamientos", priority: "alta", owner_role: "Dirección", due_in_days: 21 },
  { seed_key: "seed:captacion", title: "Revisar los avisos de privacidad de cada formulario y canal", area: "captacion", priority: "alta", owner_role: "Marketing", due_in_days: 21 },
  { seed_key: "seed:derechos", title: "Definir el procedimiento de solicitudes de derechos: quién las recibe, cómo se verifica la identidad y cómo se controla el plazo", area: "solicitudes", priority: "media", owner_role: "Administración", due_in_days: 30 },
  { seed_key: "seed:incidentes", title: "Escribir el protocolo de incidentes: quién decide, qué se documenta y cómo se controla el reloj de 72 horas", area: "incidentes", priority: "media", owner_role: "Dirección", due_in_days: 30 },
  { seed_key: "seed:accesos", title: "Revisar los accesos a las herramientas y activar el doble factor", area: "plan", priority: "media", owner_role: "Sistemas", due_in_days: 30 },
  { seed_key: "seed:evidencias", title: "Registrar dónde se guardan contratos, avisos y procedimientos", area: "plan", priority: "media", owner_role: "Administración", due_in_days: 45 },
  { seed_key: "seed:revision", title: "Completar la primera revisión trimestral", area: "plan", priority: "media", owner_role: "Dirección", due_in_days: 90 },
];

/** Plantillas de alta rápida. Sin marcas: el comprador pone el nombre de su herramienta. */
export const QUICK_ADD = {
  tratamientos: [
    { name: "Gestión de clientes y facturación", purpose: "Prestar el servicio contratado, gestionar la relación comercial y facturar.", data_subjects: ["clientes"], data_categories: ["identificativos", "contacto", "economicos"] },
    { name: "Atención de consultas (web y WhatsApp)", purpose: "Responder a las consultas que llegan por formularios y mensajería.", data_subjects: ["leads", "clientes"], data_categories: ["identificativos", "contacto", "comunicaciones"] },
    { name: "Marketing y newsletter", purpose: "Enviar comunicaciones comerciales a quien lo haya aceptado.", data_subjects: ["leads", "clientes"], data_categories: ["contacto", "comerciales"] },
    { name: "Analítica y publicidad web", purpose: "Medir el uso de la web y la eficacia de las campañas.", data_subjects: ["usuarios_web"], data_categories: ["navegacion"] },
    { name: "Gestión de personal", purpose: "Gestionar la relación laboral, las nóminas y las obligaciones asociadas.", data_subjects: ["empleados"], data_categories: ["identificativos", "contacto", "economicos", "laborales"] },
    { name: "Selección de personal", purpose: "Valorar candidaturas para puestos vacantes.", data_subjects: ["candidatos"], data_categories: ["identificativos", "contacto", "laborales"] },
  ],
  proveedores: [
    { name: "CRM", service_category: "crm" },
    { name: "WhatsApp Business", service_category: "whatsapp" },
    { name: "Email marketing", service_category: "email" },
    { name: "Analítica web", service_category: "analitica" },
    { name: "Plataformas de anuncios", service_category: "publicidad" },
    { name: "Hosting de la web", service_category: "hosting" },
    { name: "Automatizaciones", service_category: "automatizacion" },
    { name: "Herramienta de IA", service_category: "ia" },
    { name: "Pasarela de pago", service_category: "pagos" },
    { name: "Correo y ofimática", service_category: "ofimatica" },
  ],
  captacion: [
    { name: "Formulario de contacto", kind: "formulario" },
    { name: "WhatsApp", kind: "whatsapp" },
    { name: "Banner de cookies", kind: "cookies" },
    { name: "Alta en newsletter", kind: "newsletter" },
    { name: "Píxeles de medición y publicidad", kind: "pixel" },
    { name: "Chat o agente de IA", kind: "chat_ia" },
  ],
} as const;

export const AEPD_TOOLS = HERRAMIENTAS_AEPD;

export const WORKSPACE_DISCLAIMER =
  "Herramienta operativa. Lo que registras aquí es documentación de trabajo de tu empresa: no constituye asesoramiento jurídico, no certifica el cumplimiento y requiere validación según el caso. No escribas nombres, emails, teléfonos ni documentos de personas.";
