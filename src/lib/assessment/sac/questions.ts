// Cuestionario del test de cumplimiento de la Ley 10/2025.
// 8 preguntas, todas de opción única salvo canales. Objetivo: menos de 2 minutos.
//
// Cada pregunta existe porque alimenta una decisión del motor de scoring
// (ver ./scoring.ts). No añadir preguntas que no cambien el resultado:
// alargan el test y bajan la tasa de finalización sin mejorar la cualificación.

import type { AssessmentQuestion } from "../types";

export const ASSESSMENT_KEY = "sac-ley-10-2025" as const;
export const ASSESSMENT_VERSION = "2026-07-v1";
export const ASSESSMENT_PUBLIC_PATH = "/es/cumplimiento/ley-atencion-al-cliente/test/";

/** Sectores del art. 2.1: obligados sin umbral de tamaño. */
export const SECTORES_BASICOS = [
  "agua-gas-electricidad",
  "transporte-viajeros",
  "postales",
  "telecomunicaciones",
  "financieros",
] as const;

export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "sector",
    type: "single",
    title: "¿A qué se dedica tu empresa?",
    description: "Determina si la obligación te aplica por actividad, con independencia del tamaño.",
    options: [
      { value: "agua-gas-electricidad", label: "Suministro o distribución de agua, gas o electricidad" },
      { value: "transporte-viajeros", label: "Transporte de viajeros (aéreo, ferroviario, marítimo, autobús)" },
      { value: "postales", label: "Servicios postales o de mensajería postal" },
      { value: "telecomunicaciones", label: "Comunicaciones electrónicas o telefonía" },
      { value: "financieros", label: "Servicios financieros, banca o seguros" },
      { value: "otro", label: "Otro sector" },
    ],
  },
  {
    id: "plantilla",
    type: "single",
    title: "¿Cuántas personas trabajan en la empresa?",
    description: "Se computa también a nivel de grupo de sociedades.",
    options: [
      { value: "menos-50", label: "Menos de 50" },
      { value: "50-249", label: "Entre 50 y 249" },
      { value: "250-mas", label: "250 o más" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "umbrales",
    type: "single",
    title: "¿Superáis alguno de estos umbrales financieros?",
    description: "Son alternativos: basta con superar uno para quedar dentro del ámbito de la ley.",
    options: [
      { value: "ninguno", label: "No superamos ninguno" },
      { value: "facturacion", label: "Más de 50 M€ de volumen de negocios anual" },
      { value: "balance", label: "Más de 43 M€ de balance anual" },
      { value: "grupo", label: "El grupo al que pertenecemos supera alguno de los dos" },
      { value: "no-lo-se", label: "No lo sé con certeza" },
    ],
  },
  {
    id: "canales",
    type: "multi",
    min: 1,
    title: "¿Por qué canales atendéis hoy a la clientela?",
    description: "Marca todos los que uséis.",
    options: [
      { value: "telefono", label: "Teléfono" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "email", label: "Email" },
      { value: "chat-web", label: "Chat o bot en la web" },
      { value: "formulario", label: "Formulario web" },
      { value: "presencial", label: "Presencial u oficina" },
      { value: "redes", label: "Redes sociales" },
    ],
  },
  {
    id: "medicion",
    type: "single",
    title: "¿Medís el tiempo que tarda la clientela en ser atendida?",
    description: "La norma exige que el 95 % de las llamadas se atienda, de media, en menos de 3 minutos.",
    options: [
      { value: "tiempo-real", label: "Sí, en tiempo real y con alertas cuando se degrada" },
      { value: "informes", label: "Sí, pero a posteriori, en informes periódicos" },
      { value: "solo-centralita", label: "Solo lo que da la centralita, sin analizar" },
      { value: "no", label: "No lo medimos" },
      { value: "no-lo-se", label: "No lo sé" },
    ],
  },
  {
    id: "clave",
    type: "single",
    title: "¿Dais a la clientela una clave para seguir su gestión?",
    description: "La ley exige una clave identificativa por interacción, consultable por quien la solicita.",
    options: [
      { value: "unica-omnicanal", label: "Sí, una clave única que sirve en cualquier canal" },
      { value: "parcial", label: "Sí, pero solo en algunos canales" },
      { value: "interno", label: "Tenemos número de ticket interno, pero no se comunica" },
      { value: "no", label: "No damos ninguna clave" },
    ],
  },
  {
    id: "plazos",
    type: "single",
    title: "¿Cómo controláis el plazo de resolución de quejas y reclamaciones?",
    description: "El plazo máximo es de 15 días hábiles desde la presentación.",
    options: [
      { value: "automatico", label: "Sistema con reloj de plazo y escalado automático" },
      { value: "manual", label: "Control manual en CRM u hoja de cálculo" },
      { value: "persona", label: "Depende de que cada persona haga seguimiento" },
      { value: "no", label: "No lo controlamos de forma sistemática" },
    ],
  },
  {
    id: "registro",
    type: "single",
    title: "¿Qué registro queda de cada gestión de atención?",
    description: "La auditoría anual acreditada por ENAC se sostiene sobre esa evidencia.",
    options: [
      { value: "inmutable", label: "Registro completo, no editable y exportable" },
      { value: "crm-editable", label: "Queda en el CRM, pero es editable" },
      { value: "disperso", label: "Parcial y disperso entre varios sistemas" },
      { value: "no", label: "No hay registro sistemático" },
    ],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;

export const QUESTION_IDS = QUESTIONS.map((q) => q.id);

export function getQuestion(id: string) {
  return QUESTIONS.find((q) => q.id === id);
}

/** Etiqueta legible del sector, para el informe y para los cross-tabs. */
export const SECTOR_LABELS: Record<string, string> = {
  "agua-gas-electricidad": "Suministro de agua, gas o electricidad",
  "transporte-viajeros": "Transporte de viajeros",
  postales: "Servicios postales",
  telecomunicaciones: "Comunicaciones electrónicas",
  financieros: "Servicios financieros",
  otro: "Otro sector",
};
