// Programa Pyme Digital (Cámaras de Comercio + FEDER): catálogo de módulos de
// IA Operators y cálculo de la ayuda. ES-only. Fuente única para la página
// /es/pyme-digital/ y el island PymeDigitalSimulador: no contiene secretos.
//
// QUÉ ES EL PROGRAMA (comprobado en las convocatorias 2026 de Sevilla, Granada,
// Cádiz, Córdoba y Huelva, nov/2026):
//   - Fase I: diagnóstico gratuito con un asesor de la Cámara.
//   - Fase II: ayuda a la implantación con un proveedor elegido libremente por
//     la empresa. Coste directo máximo 7.000 € sin IVA, +7 % de costes
//     indirectos a tipo fijo, ayuda del 85 % (máximo 6.366,50 €), 6 meses.
//   - Anexo II: solo se subvencionan consultoría, implantación/parametrización,
//     licencias SaaS hasta 12 meses pagadas por adelantado y capacitación.
//     Fuera: lo ya financiado con el Kit Digital y las actividades para cumplir
//     normativa (por eso aquí no aparecen Ley 10/2025, Verifactu ni RGPD).
//
// MANTENIMIENTO: si cambian precios, límites o las reglas del programa, cambiar
// aquí y subir PYME_DIGITAL_VERSION. Los porcentajes y topes son los de 2026 en
// Andalucía; otras comunidades pueden tener otro porcentaje (Alicante 2026: 60 %).

export const PYME_DIGITAL_VERSION = "2026-11-04";

export const PYME_DIGITAL_RULES = {
  /** Coste directo máximo subvencionable por empresa, sin IVA, en céntimos. */
  maxDirectCents: 700_000,
  /** Costes indirectos a tipo fijo sobre el coste directo (art. 54 a) Reglamento (UE) 2021/1060). */
  indirectPct: 7,
  /** Porcentaje de ayuda sobre el coste elegible (convocatorias andaluzas 2026). */
  aidPct: 85,
  /** Ayuda máxima por empresa en céntimos: 7.490 € × 85 %. */
  maxAidCents: 636_650,
  /** Tipo general de IVA, solo para mostrar lo que la empresa adelanta. */
  vatPct: 21,
  /** Meses que dura la fase de ayudas. */
  phaseMonths: 6,
} as const;

export const PYME_DIGITAL_SOURCES = {
  anexoII: {
    label: "Anexo II, gastos elegibles Pyme Digital 2026 (Cámara de Sevilla)",
    url: "https://camaradesevilla.com/wp-content/uploads/2026/02/2026_Anexo-II.-Tipologia-y-Justificacion-de-Gastos-elegibles-Fase-de-Ayudas-1.pdf",
  },
  convocatoria: {
    label: "Convocatoria Pyme Digital 2026 (Cámara de Granada)",
    url: "https://sede.camara.es/sede/granada/tramites/TR0000006706/documento/003000067214",
  },
} as const;

export type ComponenteKey = "consultoria" | "implantacion" | "saas" | "capacitacion";

export const COMPONENTE_LABEL: Record<ComponenteKey, string> = {
  consultoria: "Consultoría",
  implantacion: "Implantación y parametrización",
  saas: "Licencia SaaS 12 meses",
  capacitacion: "Capacitación",
};

export type ModuloId = "asistente" | "crm" | "automatizacion" | "panel";

export type Modulo = {
  id: ModuloId;
  num: string;
  nombre: string;
  /** Ítem del catálogo de gastos elegibles del Anexo II. */
  item: string;
  resumen: string;
  paraQuien: string;
  incluye: string[];
  limites: string;
  /** Desglose por componente elegible, en céntimos sin IVA. */
  componentes: Partial<Record<ComponenteKey, number>>;
  /** Cuota mensual desde el mes 13, en céntimos sin IVA. 0 = sin cuota. */
  renovacionMensualCents: number;
  renovacionNota?: string;
  /** Semanas hasta la puesta en marcha. */
  semanas: number;
};

export const MODULOS: readonly Modulo[] = [
  {
    id: "asistente",
    num: "01",
    nombre: "Asistente de atención",
    item: "11.4 Chatbot",
    resumen: "Un asistente de IA que responde por WhatsApp y en la web, cualifica al contacto y agenda la cita.",
    paraQuien: "Clínicas, academias, turismo, hostelería, gimnasios y despachos con muchas consultas repetidas.",
    incluye: [
      "Asistente en WhatsApp Business Platform y como widget en la web",
      "Base de conocimiento con servicios, precios, horarios y políticas de la empresa",
      "Hasta 5 preguntas de cualificación",
      "Citas en una agenda: Google Calendar, Outlook o un software de reservas con API",
      "Derivación a una persona del equipo cuando hace falta",
      "Recordatorios de cita con plantillas aprobadas por Meta",
    ],
    limites: "Un número de WhatsApp, una agenda y hasta 1.000 conversaciones al mes. Sin voz ni envíos masivos.",
    componentes: { consultoria: 40_000, implantacion: 190_000, saas: 120_000, capacitacion: 30_000 },
    renovacionMensualCents: 10_000,
    semanas: 5,
  },
  {
    id: "crm",
    num: "02",
    nombre: "CRM implantado",
    item: "1.3 Gestión de clientes (CRM)",
    resumen: "Un CRM configurado para tu proceso comercial, para que ningún contacto se pierda entre el correo, el WhatsApp y las notas.",
    paraQuien: "Empresas que venden por presupuesto o por citas y hoy siguen a sus clientes en hojas de cálculo.",
    incluye: [
      "Diseño del embudo de ventas y de los campos de cada ficha",
      "Importación de hasta 2.000 contactos existentes",
      "Formulario de la web conectado al CRM",
      "Conexión con el correo del equipo (Gmail u Outlook)",
      "Conexión con el asistente si contratas el módulo 01",
    ],
    limites: "Funciones del plan gratuito de HubSpot CRM. Los planes de pago de HubSpot quedan fuera.",
    componentes: { consultoria: 40_000, implantacion: 150_000, capacitacion: 30_000 },
    renovacionMensualCents: 0,
    renovacionNota: "Sin cuota: el CRM queda a nombre de tu empresa en el plan gratuito de HubSpot.",
    semanas: 3,
  },
  {
    id: "automatizacion",
    num: "03",
    nombre: "Automatización administrativa",
    item: "2.6 Solución RPA",
    resumen: "Un proceso repetitivo que pasa a hacerse solo: pedidos que se leen con IA y se cargan en el ERP, facturas de proveedor que se registran sin teclearlas.",
    paraQuien: "Distribuidores, comercios, industria y asesorías que pasan horas copiando datos de documentos.",
    incluye: [
      "Análisis del proceso y diseño del flujo automatizado",
      "Lectura con IA de pedidos, facturas o albaranes que llegan por correo o WhatsApp",
      "Validación de datos y carga en el sistema de destino",
      "Bandeja de excepciones para revisar lo que el sistema no resuelve solo",
    ],
    limites: "Un proceso, hasta dos sistemas conectados por API o ficheros y hasta 500 documentos al mes.",
    componentes: { consultoria: 50_000, implantacion: 180_000, saas: 60_000, capacitacion: 30_000 },
    renovacionMensualCents: 5_000,
    semanas: 5,
  },
  {
    id: "panel",
    num: "04",
    nombre: "Panel de gestión",
    item: "8.2 Business Analytics",
    resumen: "Los números que importan para dirigir el negocio en un panel que se actualiza solo, en lugar de montar hojas de cálculo cada semana.",
    paraQuien: "Comercios con varias tiendas, distribuidores y empresas con datos repartidos en varias herramientas.",
    incluye: [
      "Definición de hasta 10 indicadores con la dirección",
      "Conexión de hasta 3 fuentes: ERP o TPV, analítica web o publicidad, CRM u hojas de cálculo",
      "Un panel con actualización automática",
      "Informe semanal por correo",
    ],
    limites: "Fuentes con API o exportación de ficheros, un panel.",
    componentes: { consultoria: 50_000, implantacion: 170_000, saas: 60_000, capacitacion: 20_000 },
    renovacionMensualCents: 5_000,
    semanas: 4,
  },
];

export function precioModuloCents(m: Modulo): number {
  return Object.values(m.componentes).reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

export type CalculoAyuda = {
  facturadoCents: number;
  elegibleCents: number;
  ayudaCents: number;
  netoCents: number;
  adelantoConIvaCents: number;
  /** El facturado supera el coste directo máximo: la ayuda ya no sube. */
  superaTope: boolean;
  /** Coste neto sobre lo facturado, en tanto por ciento con un decimal. */
  netoPct: number;
};

/**
 * Ayuda estimada para un importe facturado (sin IVA). Aritmética entera en
 * céntimos: elegible = min(facturado, tope) × 1,07; ayuda = min(elegible × 0,85,
 * ayuda máxima). Es una estimación: la cuantía final la fija la Cámara.
 */
export function calcularAyuda(facturadoCents: number): CalculoAyuda {
  const r = PYME_DIGITAL_RULES;
  const base = Math.max(0, Math.min(Math.round(facturadoCents), r.maxDirectCents));
  const elegibleCents = Math.round((base * (100 + r.indirectPct)) / 100);
  const ayudaCents = Math.min(Math.round((elegibleCents * r.aidPct) / 100), r.maxAidCents);
  const facturado = Math.max(0, Math.round(facturadoCents));
  const netoCents = facturado - ayudaCents;
  return {
    facturadoCents: facturado,
    elegibleCents,
    ayudaCents,
    netoCents,
    adelantoConIvaCents: Math.round((facturado * (100 + r.vatPct)) / 100),
    superaTope: facturado > r.maxDirectCents,
    netoPct: facturado > 0 ? Math.round((netoCents / facturado) * 1000) / 10 : 0,
  };
}

export function calcularSeleccion(ids: readonly ModuloId[]): CalculoAyuda {
  const total = MODULOS.filter((m) => ids.includes(m.id)).reduce((acc, m) => acc + precioModuloCents(m), 0);
  return calcularAyuda(total);
}

/**
 * 380000 → "3.800 €", 636650 → "6.366,50 €". Formato manual y no Intl: es-ES
 * no agrupa los números de 4 cifras ("3800 €") y el resto del sitio escribe
 * "3.800 €". Muestra céntimos solo si los hay, salvo `siempreCentimos` (tablas
 * de importes, para que las columnas se lean alineadas).
 */
export function formatEur(cents: number, siempreCentimos = false): string {
  const c = Math.round(cents);
  const sign = c < 0 ? "-" : "";
  const abs = Math.abs(c);
  const entero = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const resto = abs % 100;
  const decimales = resto || siempreCentimos ? `,${String(resto).padStart(2, "0")}` : "";
  return `${sign}${entero}${decimales} €`;
}
