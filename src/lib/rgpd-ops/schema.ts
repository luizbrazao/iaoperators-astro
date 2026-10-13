// Esquema de las entidades del espacio de trabajo de RGPD Ops.
//
// Fuente única de: qué entidades existen, qué campos puede escribir el
// comprador, tipos, enums con sus etiquetas, longitudes y campos derivados.
// La usan el servidor (validación de cada alta y cambio) y la island (labels,
// selects y límites). Es pura y pública: no contiene secretos ni datos.
//
// Defensa en profundidad: la base de datos aplica su propia lista blanca de
// columnas (rgpd_ops_entity_columns) y sus CHECK. Si este archivo y la
// migración divergieran, la escritura fallaría en vez de abrir un campo.
//
// Minimización: ningún campo pide nombres, emails ni documentos de personas.
// Además, todo texto libre rechaza emails, teléfonos y DNI/NIE.

import { addMonths, isValidDate } from "./dates";

export type EntitySlug =
  | "tratamientos"
  | "proveedores"
  | "captacion"
  | "solicitudes"
  | "incidentes"
  | "tareas"
  | "evidencias"
  | "revisiones";

export const ENTITY_SLUGS: readonly EntitySlug[] = [
  "tratamientos",
  "proveedores",
  "captacion",
  "solicitudes",
  "incidentes",
  "tareas",
  "evidencias",
  "revisiones",
];

export function isEntitySlug(value: unknown): value is EntitySlug {
  return typeof value === "string" && (ENTITY_SLUGS as readonly string[]).includes(value);
}

export interface Option {
  value: string;
  label: string;
}

export type FieldDef =
  | { key: string; label: string; type: "text"; max: number; multiline?: boolean; required?: boolean; placeholder?: string; help?: string; pattern?: RegExp; patternMessage?: string }
  | { key: string; label: string; type: "enum"; options: Option[]; help?: string }
  | { key: string; label: string; type: "enumArray"; options: Option[]; help?: string }
  | { key: string; label: string; type: "date"; nullable: boolean; required?: boolean; help?: string }
  | { key: string; label: string; type: "datetime"; nullable: boolean; required?: boolean; help?: string }
  | { key: string; label: string; type: "boolean"; help?: string }
  | { key: string; label: string; type: "checklist"; keys: string[]; help?: string };

// ---------------------------------------------------------------- enums

const o = (pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

export const INTERESADOS = o([
  ["clientes", "Clientes"],
  ["leads", "Leads o potenciales clientes"],
  ["contactos_b2b", "Contactos de empresas"],
  ["empleados", "Empleados"],
  ["candidatos", "Candidatos"],
  ["proveedores", "Proveedores (personas de contacto)"],
  ["usuarios_web", "Usuarios de la web"],
  ["alumnos", "Alumnos"],
  ["pacientes", "Pacientes"],
  ["menores", "Menores de edad"],
  ["otros", "Otros"],
]);

export const CATEGORIAS = o([
  ["identificativos", "Identificativos"],
  ["contacto", "Contacto"],
  ["economicos", "Económicos o de pago"],
  ["comerciales", "Comerciales e historial"],
  ["navegacion", "Navegación e identificadores en línea"],
  ["comunicaciones", "Contenido de comunicaciones (WhatsApp, email)"],
  ["laborales", "Laborales o profesionales"],
  ["imagen_voz", "Imagen o voz"],
  ["ubicacion", "Ubicación"],
  ["salud", "Salud (categoría especial)"],
  ["otras_especiales", "Otras categorías especiales"],
  ["penales", "Condenas o infracciones penales"],
  ["otros", "Otros"],
]);

export const BASES = o([
  ["por_determinar", "Por determinar"],
  ["consentimiento", "Consentimiento"],
  ["contrato", "Ejecución de un contrato o medidas precontractuales"],
  ["obligacion_legal", "Obligación legal"],
  ["interes_legitimo", "Interés legítimo"],
  ["interes_vital", "Interés vital"],
  ["interes_publico", "Interés público o poderes públicos"],
]);

export const AREAS = o([
  ["general", "General"],
  ["perfil", "Perfil y alcance"],
  ["tratamientos", "Mapa de tratamientos"],
  ["proveedores", "Proveedores"],
  ["captacion", "Puntos de captación"],
  ["solicitudes", "Solicitudes de derechos"],
  ["incidentes", "Incidentes"],
  ["plan", "Plan y evidencias"],
]);

/** Claves de la checklist de la revisión trimestral (el texto vive en el contenido). */
export const REVIEW_KEYS = ["perfil", "tratamientos", "proveedores", "captacion", "solicitudes", "incidentes", "accesos", "evidencias"] as const;

// ---------------------------------------------------------------- texto libre

const NOTES: FieldDef = {
  key: "notes",
  label: "Notas internas",
  type: "text",
  max: 1000,
  multiline: true,
  help: "Sin nombres, emails, teléfonos ni documentos de personas.",
};

/** Referencia interna: letras, números y . _ / - (sin espacios ni @). */
export const REFERENCE_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,39}$/;

// ---------------------------------------------------------------- entidades

export interface EntityDef {
  slug: EntitySlug;
  label: string;
  singular: string;
  /** Campos que puede escribir el comprador. */
  fields: FieldDef[];
  /** Campos obligatorios en el alta. */
  requiredOnCreate: string[];
  /** Campo que titula la fila en la UI. */
  titleKey: string;
  /**
   * Campos derivados por el servidor. Nunca llegan del cliente. Reciben los
   * valores ya validados del parche y devuelven lo que hay que añadir.
   */
  derive?: (patch: Record<string, unknown>, now: Date) => Record<string, unknown>;
  /** Campos que deben enviarse juntos (si llega uno, llegan todos). */
  together?: string[][];
}

export const ENTITIES: Record<EntitySlug, EntityDef> = {
  tratamientos: {
    slug: "tratamientos",
    label: "Mapa de tratamientos",
    singular: "tratamiento",
    titleKey: "name",
    requiredOnCreate: ["name"],
    fields: [
      { key: "name", label: "Actividad de tratamiento", type: "text", max: 160, required: true, placeholder: "Gestión de clientes y facturación" },
      { key: "purpose", label: "Finalidad", type: "text", max: 1000, multiline: true, placeholder: "Para qué se tratan los datos" },
      { key: "data_subjects", label: "Personas (interesados)", type: "enumArray", options: INTERESADOS },
      { key: "data_categories", label: "Categorías de datos", type: "enumArray", options: CATEGORIAS },
      { key: "recipients", label: "Destinatarios", type: "text", max: 1000, multiline: true, help: "A quién se comunican: proveedores, administraciones, otras empresas." },
      { key: "transfers", label: "¿Transferencias fuera del EEE?", type: "enum", options: o([["por_determinar", "Por determinar"], ["no", "No"], ["si", "Sí"]]) },
      { key: "transfer_details", label: "Detalle de transferencias", type: "text", max: 500, multiline: true },
      { key: "retention", label: "Plazo de conservación", type: "text", max: 500, multiline: true, placeholder: "Durante la relación y después los plazos legales" },
      { key: "security_measures", label: "Medidas de seguridad", type: "text", max: 1000, multiline: true },
      {
        key: "legal_basis",
        label: "Base jurídica (campo de trabajo)",
        type: "enum",
        options: BASES,
        help: "Anotación de trabajo, no una conclusión: la base jurídica de cada tratamiento requiere validación según el caso.",
      },
      { key: "legal_basis_note", label: "Notas sobre la base jurídica", type: "text", max: 500, multiline: true },
      { key: "status", label: "Estado", type: "enum", options: o([["borrador", "Borrador"], ["en_revision", "En revisión"], ["revisado", "Revisado internamente"]]) },
      { key: "last_reviewed_on", label: "Última revisión", type: "date", nullable: true },
      NOTES,
    ],
  },
  proveedores: {
    slug: "proveedores",
    label: "Proveedores y encargados",
    singular: "proveedor",
    titleKey: "name",
    requiredOnCreate: ["name"],
    fields: [
      { key: "name", label: "Proveedor o herramienta", type: "text", max: 120, required: true, placeholder: "CRM, email marketing, WhatsApp Business…" },
      {
        key: "service_category",
        label: "Tipo de servicio",
        type: "enum",
        options: o([
          ["otro", "Otro"],
          ["crm", "CRM"],
          ["whatsapp", "WhatsApp / mensajería"],
          ["email", "Email o newsletter"],
          ["analitica", "Analítica"],
          ["publicidad", "Publicidad"],
          ["hosting", "Hosting o web"],
          ["automatizacion", "Automatizaciones"],
          ["ia", "IA"],
          ["pagos", "Pagos"],
          ["ofimatica", "Ofimática y almacenamiento"],
        ]),
      },
      {
        key: "role_estimate",
        label: "Papel estimado",
        type: "enum",
        options: o([
          ["por_determinar", "Por determinar"],
          ["encargado", "Encargado del tratamiento"],
          ["responsable_independiente", "Responsable independiente"],
          ["corresponsable", "Corresponsable"],
        ]),
        help: "Estimación de trabajo. Si dudas, márcalo por determinar y consúltalo.",
      },
      {
        key: "location",
        label: "Dónde trata los datos",
        type: "enum",
        options: o([["desconocida", "No lo sé"], ["ue_eee", "UE / EEE"], ["fuera_eee", "Fuera del EEE"], ["mixta", "Mixta"]]),
      },
      {
        key: "transfer_mechanism",
        label: "Garantía de la transferencia",
        type: "enum",
        options: o([
          ["por_determinar", "Por determinar"],
          ["no_aplica", "No aplica"],
          ["decision_adecuacion", "Decisión de adecuación"],
          ["clausulas_tipo", "Cláusulas contractuales tipo"],
          ["otra", "Otra"],
        ]),
      },
      { key: "dpa_status", label: "Contrato de encargo (DPA)", type: "enum", options: o([["pendiente", "Pendiente"], ["verificado", "Verificado"], ["no_aplica", "No aplica"]]) },
      { key: "dpa_reference", label: "Dónde está el contrato", type: "text", max: 300, placeholder: "Enlace a las condiciones o ruta de la carpeta" },
      { key: "last_review_on", label: "Última revisión", type: "date", nullable: true },
      { key: "next_review_on", label: "Próxima revisión", type: "date", nullable: true },
      NOTES,
    ],
  },
  captacion: {
    slug: "captacion",
    label: "Puntos de captación",
    singular: "punto de captación",
    titleKey: "name",
    requiredOnCreate: ["name"],
    fields: [
      { key: "name", label: "Punto de captación", type: "text", max: 120, required: true, placeholder: "Formulario de contacto de la web" },
      {
        key: "kind",
        label: "Tipo",
        type: "enum",
        options: o([
          ["otro", "Otro"],
          ["formulario", "Formulario"],
          ["landing", "Landing page"],
          ["whatsapp", "WhatsApp"],
          ["cookies", "Cookies"],
          ["newsletter", "Newsletter"],
          ["pixel", "Píxel o etiqueta"],
          ["chat_ia", "Chat o agente de IA"],
          ["telefono", "Teléfono"],
          ["presencial", "Presencial"],
        ]),
      },
      { key: "location_ref", label: "Dónde está", type: "text", max: 300, placeholder: "URL o ubicación" },
      { key: "notice_status", label: "Aviso de privacidad", type: "enum", options: o([["pendiente", "Pendiente"], ["parcial", "Parcial"], ["completo", "Completo"], ["no_aplica", "No aplica"]]) },
      { key: "layered_info", label: "Información por capas", type: "enum", options: o([["no", "No"], ["si", "Sí"], ["no_aplica", "No aplica"]]) },
      {
        key: "consent_status",
        label: "Consentimiento",
        type: "enum",
        options: o([["por_determinar", "Por determinar si hace falta"], ["pendiente", "Hace falta y está pendiente"], ["registrado", "Se recoge y se puede demostrar"], ["no_aplica", "No aplica"]]),
      },
      { key: "last_review_on", label: "Última revisión", type: "date", nullable: true },
      NOTES,
    ],
  },
  solicitudes: {
    slug: "solicitudes",
    label: "Solicitudes de derechos",
    singular: "solicitud",
    titleKey: "reference",
    requiredOnCreate: ["reference", "received_on"],
    together: [["received_on", "extended"]],
    fields: [
      {
        key: "reference",
        label: "Referencia interna",
        type: "text",
        max: 40,
        required: true,
        placeholder: "SOL-2026-001",
        pattern: REFERENCE_RE,
        patternMessage: "Usa una referencia interna (letras, números y . _ / -), nunca el nombre ni el email de la persona.",
      },
      {
        key: "request_type",
        label: "Tipo",
        type: "enum",
        options: o([
          ["acceso", "Acceso"],
          ["rectificacion", "Rectificación"],
          ["supresion", "Supresión"],
          ["oposicion", "Oposición"],
          ["limitacion", "Limitación"],
          ["portabilidad", "Portabilidad"],
          ["decisiones_automatizadas", "Decisiones automatizadas"],
          ["otro", "Otro"],
        ]),
      },
      { key: "received_on", label: "Fecha de recepción", type: "date", nullable: false, required: true },
      { key: "extended", label: "Prórroga de dos meses", type: "boolean", help: "Solo si es necesaria por complejidad o volumen, avisando dentro del primer mes." },
      { key: "extension_notified_on", label: "Aviso de prórroga enviado el", type: "date", nullable: true },
      {
        key: "status",
        label: "Estado",
        type: "enum",
        options: o([["recibida", "Recibida"], ["en_curso", "En curso"], ["respondida", "Respondida"], ["denegada", "Denegada"], ["archivada", "Archivada"]]),
      },
      { key: "responded_on", label: "Fecha de respuesta", type: "date", nullable: true },
      NOTES,
    ],
    derive: (patch) => {
      if (!("received_on" in patch)) return {};
      const received = patch.received_on as string;
      return {
        due_on: addMonths(received, 1),
        extended_due_on: patch.extended ? addMonths(received, 3) : null,
      };
    },
  },
  incidentes: {
    slug: "incidentes",
    label: "Incidentes y brechas",
    singular: "incidente",
    titleKey: "reference",
    requiredOnCreate: ["reference", "detected_at"],
    fields: [
      {
        key: "reference",
        label: "Referencia interna",
        type: "text",
        max: 40,
        required: true,
        placeholder: "INC-2026-001",
        pattern: REFERENCE_RE,
        patternMessage: "Usa una referencia interna (letras, números y . _ / -).",
      },
      { key: "detected_at", label: "Constancia del incidente", type: "datetime", nullable: false, required: true, help: "Cuándo tuvo constancia la empresa. Inicia el reloj orientativo de 72 horas." },
      { key: "data_categories", label: "Categorías de datos afectadas", type: "enumArray", options: CATEGORIAS },
      {
        key: "affected_scope",
        label: "Alcance aproximado",
        type: "enum",
        options: o([["desconocido", "Desconocido"], ["pocos", "Unas pocas personas"], ["decenas", "Decenas"], ["cientos", "Cientos"], ["miles_o_mas", "Miles o más"]]),
      },
      { key: "description", label: "Qué ha pasado", type: "text", max: 1000, multiline: true, help: "Describe el hecho, no a las personas: sin nombres, emails ni registros afectados." },
      {
        key: "internal_assessment",
        label: "Valoración interna del riesgo",
        type: "enum",
        options: o([["sin_evaluar", "Sin evaluar"], ["riesgo_improbable", "Riesgo improbable"], ["riesgo", "Riesgo"], ["alto_riesgo", "Alto riesgo"]]),
        help: "Es vuestra valoración. La herramienta no la calcula.",
      },
      {
        key: "escalation_decision",
        label: "Decisión",
        type: "enum",
        options: o([
          ["pendiente", "Pendiente"],
          ["no_notificar_documentado", "No notificar (documentado)"],
          ["notificar_aepd", "Notificar a la AEPD"],
          ["notificar_aepd_y_afectados", "Notificar a la AEPD y comunicar a los afectados"],
        ]),
        help: "La decisión es de la empresa. La herramienta no notifica nada a nadie.",
      },
      { key: "decision_reason", label: "Motivo de la decisión", type: "text", max: 1000, multiline: true },
      { key: "measures", label: "Medidas adoptadas", type: "text", max: 1000, multiline: true },
      { key: "aepd_notified_at", label: "Notificado a la AEPD el", type: "datetime", nullable: true },
      { key: "subjects_communicated_at", label: "Comunicado a los afectados el", type: "datetime", nullable: true },
      { key: "status", label: "Estado", type: "enum", options: o([["abierto", "Abierto"], ["cerrado", "Cerrado"]]) },
      NOTES,
    ],
    derive: (patch, now) => ("status" in patch ? { closed_at: patch.status === "cerrado" ? now.toISOString() : null } : {}),
  },
  tareas: {
    slug: "tareas",
    label: "Plan de acción",
    singular: "tarea",
    titleKey: "title",
    requiredOnCreate: ["title"],
    fields: [
      { key: "title", label: "Tarea", type: "text", max: 200, required: true },
      { key: "area", label: "Área", type: "enum", options: AREAS },
      {
        key: "owner_role",
        label: "Responsable (rol)",
        type: "text",
        max: 60,
        placeholder: "Dirección, Marketing, Administración…",
        help: "Un rol, no el nombre de una persona.",
        pattern: /^[\p{L} .,&/()+-]{0,60}$/u,
        patternMessage: "Indica un rol con letras (p. ej. «Marketing»), sin números, emails ni nombres propios.",
      },
      { key: "priority", label: "Prioridad", type: "enum", options: o([["media", "Media"], ["alta", "Alta"], ["baja", "Baja"]]) },
      { key: "due_on", label: "Vencimiento", type: "date", nullable: true },
      { key: "status", label: "Estado", type: "enum", options: o([["pendiente", "Pendiente"], ["en_curso", "En curso"], ["hecha", "Hecha"], ["descartada", "Descartada"]]) },
      NOTES,
    ],
    derive: (patch, now) => ("status" in patch ? { completed_at: patch.status === "hecha" ? now.toISOString() : null } : {}),
  },
  evidencias: {
    slug: "evidencias",
    label: "Evidencias",
    singular: "evidencia",
    titleKey: "title",
    requiredOnCreate: ["title"],
    fields: [
      { key: "title", label: "Evidencia", type: "text", max: 200, required: true, placeholder: "Contrato de encargo del CRM" },
      { key: "area", label: "Área", type: "enum", options: AREAS },
      {
        key: "kind",
        label: "Tipo",
        type: "enum",
        options: o([
          ["documento", "Documento"],
          ["contrato", "Contrato"],
          ["registro", "Registro"],
          ["captura", "Captura"],
          ["politica", "Política o procedimiento"],
          ["formacion", "Formación"],
          ["acta", "Acta"],
          ["otro", "Otro"],
        ]),
      },
      { key: "location_ref", label: "Dónde está guardada", type: "text", max: 300, placeholder: "Carpeta, sistema o enlace interno", help: "Solo la referencia: no se suben archivos." },
      { key: "evidence_date", label: "Fecha de la evidencia", type: "date", nullable: true },
      { key: "review_due_on", label: "Revisar antes del", type: "date", nullable: true },
      NOTES,
    ],
  },
  revisiones: {
    slug: "revisiones",
    label: "Revisiones trimestrales",
    singular: "revisión",
    titleKey: "period",
    requiredOnCreate: ["period"],
    fields: [
      {
        key: "period",
        label: "Trimestre",
        type: "text",
        max: 7,
        required: true,
        pattern: /^\d{4}-T[1-4]$/,
        patternMessage: "Formato AAAA-T1 a AAAA-T4.",
      },
      { key: "status", label: "Estado", type: "enum", options: o([["en_curso", "En curso"], ["completada", "Completada"]]) },
      { key: "checklist", label: "Comprobaciones", type: "checklist", keys: [...REVIEW_KEYS] },
      { key: "summary", label: "Conclusiones", type: "text", max: 2000, multiline: true },
      NOTES,
    ],
    derive: (patch, now) => ("status" in patch ? { completed_at: patch.status === "completada" ? now.toISOString() : null } : {}),
  },
};

// ---------------------------------------------------------------- perfil

export const PERFIL_SENALES = o([
  ["ninguna", "Ninguna de estas"],
  ["especiales", "Categorías especiales (salud, biometría…)"],
  ["menores", "Datos de menores"],
  ["geolocalizacion", "Ubicación o seguimiento"],
  ["perfiles", "Perfiles o segmentación por comportamiento"],
  ["decisiones_automatizadas", "Reglas o IA que deciden sobre personas"],
  ["gran_escala", "Gran escala"],
  ["videovigilancia", "Videovigilancia"],
]);

export const PROFILE_FIELDS: FieldDef[] = [
  { key: "empresa", label: "Nombre de la empresa", type: "text", max: 120 },
  {
    key: "rol",
    label: "Papel de la empresa",
    type: "enum",
    options: o([["por_determinar", "Por determinar"], ["responsable", "Responsable del tratamiento"], ["encargado", "Encargado del tratamiento"], ["ambos", "Ambos, según el servicio"]]),
    help: "Responsable si decides para qué y cómo se tratan los datos; encargado si los tratas por cuenta de un cliente.",
  },
  {
    key: "actividad",
    label: "Actividad",
    type: "enum",
    options: o([
      ["otra", "Otra actividad"],
      ["agencia", "Agencia de marketing, publicidad o comunicación"],
      ["consultoria", "Consultoría o servicios profesionales"],
      ["inmobiliaria", "Inmobiliaria o administración de fincas"],
      ["formacion", "Academia, formación o centro educativo"],
      ["salud-bienestar", "Salud, estética, bienestar o deporte"],
      ["comercio", "Comercio, e-commerce u hostelería"],
    ]),
  },
  { key: "plantilla", label: "Personas en plantilla", type: "enum", options: o([["1-9", "De 1 a 9"], ["10-49", "De 10 a 49"], ["50-249", "De 50 a 249"], ["250+", "250 o más"]]) },
  {
    key: "canales",
    label: "Canales que usáis",
    type: "enumArray",
    options: o([
      ["web", "Web y formularios"],
      ["whatsapp", "WhatsApp"],
      ["crm", "CRM"],
      ["email-marketing", "Newsletter o email marketing"],
      ["pixeles", "Analítica y píxeles publicitarios"],
      ["ia", "Automatizaciones o IA"],
      ["telefono", "Teléfono"],
      ["presencial", "Presencial"],
    ]),
  },
  { key: "interesados", label: "Personas de las que tratáis datos", type: "enumArray", options: INTERESADOS },
  { key: "categorias", label: "Categorías de datos", type: "enumArray", options: CATEGORIAS },
  {
    key: "senales",
    label: "Señales de mayor riesgo",
    type: "enumArray",
    options: PERFIL_SENALES,
    help: "Si marcas alguna, el panel recomendará una revisión profesional. La herramienta no determina si necesitas evaluación de impacto o delegado.",
  },
  { key: "dpd", label: "Delegado de protección de datos", type: "enum", options: o([["por_determinar", "Por determinar"], ["designado", "Designado"], ["no_designado", "No designado"]]) },
  { key: "notas", label: "Notas sobre el alcance", type: "text", max: 1000, multiline: true },
];

// ---------------------------------------------------------------- validación

export interface ValidationIssue {
  field: string;
  message: string;
}

export type ValidationResult = { ok: true; values: Record<string, unknown> } | { ok: false; issues: ValidationIssue[] };

// Datos de contacto o identificación que no deben estar en ningún texto libre.
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
const DNI_RE = /\b\d{8}[A-HJ-NP-TV-Z]\b|\b[XYZ]\d{7}[A-Z]\b/i;
const PHONE_RE = /(?:\+|\b00)\d[\d\s.-]{7,}\d|\b[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/;
// Caracteres de control salvo salto de línea y tabulador.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export const CONTACT_DATA_MESSAGE =
  "No escribas emails, teléfonos ni documentos de identidad: usa referencias internas.";

export function containsContactData(text: string): boolean {
  return EMAIL_RE.test(text) || DNI_RE.test(text) || PHONE_RE.test(text);
}

function validateField(def: FieldDef, raw: unknown): { value?: unknown; error?: string } {
  switch (def.type) {
    case "text": {
      if (typeof raw !== "string") return { error: "Debe ser texto." };
      const value = raw.replace(/\r\n?/g, "\n");
      if (value.length > def.max) return { error: `Máximo ${def.max} caracteres.` };
      if (CONTROL_RE.test(value)) return { error: "Contiene caracteres no válidos." };
      if (!def.multiline && value.includes("\n")) return { error: "Debe ir en una sola línea." };
      if (def.required && value.trim() === "") return { error: "Es obligatorio." };
      if (def.pattern && value !== "" && !def.pattern.test(value)) return { error: def.patternMessage ?? "Formato no válido." };
      if (containsContactData(value)) return { error: CONTACT_DATA_MESSAGE };
      return { value: def.required || def.pattern ? value.trim() : value };
    }
    case "enum": {
      if (typeof raw !== "string" || !def.options.some((x) => x.value === raw)) return { error: "Valor no permitido." };
      return { value: raw };
    }
    case "enumArray": {
      if (!Array.isArray(raw) || raw.length > def.options.length) return { error: "Lista no válida." };
      const allowed = new Set(def.options.map((x) => x.value));
      const clean = [...new Set(raw)];
      if (clean.some((v) => typeof v !== "string" || !allowed.has(v))) return { error: "Valor no permitido." };
      if (def.key === "senales" && clean.includes("ninguna") && clean.length > 1) return { error: "«Ninguna» no se combina con otras opciones." };
      return { value: clean };
    }
    case "date": {
      if (raw === null || raw === "") return def.nullable && !def.required ? { value: null } : { error: "Es obligatorio." };
      if (!isValidDate(raw)) return { error: "Fecha no válida (AAAA-MM-DD)." };
      return { value: raw };
    }
    case "datetime": {
      if (raw === null || raw === "") return def.nullable && !def.required ? { value: null } : { error: "Es obligatorio." };
      if (typeof raw !== "string" || raw.length > 40) return { error: "Fecha y hora no válidas." };
      const t = Date.parse(raw);
      if (!Number.isFinite(t)) return { error: "Fecha y hora no válidas." };
      const year = new Date(t).getUTCFullYear();
      if (year < 2000 || t > Date.now() + 86_400_000) return { error: "Fecha y hora fuera de rango." };
      return { value: new Date(t).toISOString() };
    }
    case "boolean": {
      if (typeof raw !== "boolean") return { error: "Debe ser sí o no." };
      return { value: raw };
    }
    case "checklist": {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Checklist no válida." };
      const out: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        if (!def.keys.includes(k) || typeof v !== "boolean") return { error: "Checklist no válida." };
        out[k] = v;
      }
      return { value: out };
    }
  }
}

function validateObject(
  fields: FieldDef[],
  raw: unknown,
  opts: { required: string[]; partial: boolean; together?: string[][] },
): ValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, issues: [{ field: "_", message: "Datos no válidos." }] };
  const input = raw as Record<string, unknown>;
  const byKey = new Map(fields.map((f) => [f.key, f]));
  const issues: ValidationIssue[] = [];
  const values: Record<string, unknown> = {};

  for (const key of Object.keys(input)) {
    // Lista blanca: cualquier campo no declarado (id, workspace_id, version,
    // due_on, seed_key…) se rechaza en vez de ignorarse en silencio.
    if (!byKey.has(key)) issues.push({ field: key, message: "Campo no permitido." });
  }
  for (const def of fields) {
    if (!(def.key in input)) {
      if (!opts.partial && opts.required.includes(def.key)) issues.push({ field: def.key, message: "Es obligatorio." });
      continue;
    }
    const { value, error } = validateField(def, input[def.key]);
    if (error) issues.push({ field: def.key, message: error });
    else values[def.key] = value;
  }
  if (opts.partial) {
    for (const key of opts.required) {
      if (key in input && (values[key] === "" || values[key] === null)) issues.push({ field: key, message: "Es obligatorio." });
    }
  }
  for (const group of opts.together ?? []) {
    const present = group.filter((k) => k in input);
    if (present.length > 0 && present.length < group.length) {
      for (const k of group.filter((x) => !(x in input))) issues.push({ field: k, message: `Debe enviarse junto con ${present.join(", ")}.` });
    }
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true, values };
}

/** Alta: campos obligatorios presentes, solo campos permitidos, derivados añadidos. */
export function validateCreate(slug: EntitySlug, raw: unknown, now: Date = new Date()): ValidationResult {
  const def = ENTITIES[slug];
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : raw;
  // En el alta de solicitudes, "extended" es opcional: por defecto, sin prórroga.
  if (slug === "solicitudes" && input && typeof input === "object" && !("extended" in input) && "received_on" in input) {
    (input as Record<string, unknown>).extended = false;
  }
  const res = validateObject(def.fields, input, { required: def.requiredOnCreate, partial: false, together: def.together });
  if (!res.ok) return res;
  return { ok: true, values: { ...res.values, ...(def.derive?.(res.values, now) ?? {}) } };
}

/** Cambio parcial: al menos un campo, solo campos permitidos, derivados añadidos. */
export function validatePatch(slug: EntitySlug, raw: unknown, now: Date = new Date()): ValidationResult {
  const def = ENTITIES[slug];
  const res = validateObject(def.fields, raw, { required: def.requiredOnCreate, partial: true, together: def.together });
  if (!res.ok) return res;
  if (Object.keys(res.values).length === 0) return { ok: false, issues: [{ field: "_", message: "No hay cambios." }] };
  return { ok: true, values: { ...res.values, ...(def.derive?.(res.values, now) ?? {}) } };
}

/** Perfil completo (se reemplaza entero, con la versión del espacio). */
export function validateProfile(raw: unknown): ValidationResult {
  return validateObject(PROFILE_FIELDS, raw, { required: [], partial: true });
}

export function optionLabel(options: Option[], value: unknown): string {
  return options.find((x) => x.value === value)?.label ?? (value === null || value === undefined ? "" : String(value));
}

export function fieldDef(slug: EntitySlug, key: string): FieldDef | undefined {
  return ENTITIES[slug].fields.find((f) => f.key === key);
}
