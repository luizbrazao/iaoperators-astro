// Catálogo de servicios — fuente única de verdad.
//
// Antes, los rótulos de cada servicio vivían duplicados en siete constantes del
// Header, otra vez en el objeto `labels`, y habrían vuelto a duplicarse en el hub
// y en el Footer. El síntoma clásico de esa duplicación ya estaba en el menú:
// dos entradas numeradas "07". Todo lo que necesite listar servicios lee de aquí.
//
// Añadir un servicio = añadir una entrada. La numeración se calcula por grupo.

export type Loc = "es" | "pt" | "en";
export type GroupKey = "agencia" | "auditoria";

export interface ServiceDefinition {
  key: string;
  /** Ruta sin locale ni barra inicial. */
  path: string;
  group: GroupKey;
  label: Record<Loc, string>;
  desc: Record<Loc, string>;
  /**
   * Locales en los que la página existe. Si se omite, existe en los tres.
   * Sin esto, un servicio publicado solo en ES aparecería en el catálogo EN y
   * PT como enlace a una URL que no existe.
   */
  locales?: Loc[];
}

export const SERVICE_HUB_PATH = "servicios/";

export const GROUP_TITLES: Record<GroupKey, Record<Loc, string>> = {
  agencia: { es: "Servicios", pt: "Serviços", en: "Services" },
  auditoria: {
    es: "Auditoría e implementación",
    pt: "Auditoria e implementação",
    en: "Audit & implementation",
  },
};

export const SERVICES: ServiceDefinition[] = [
  {
    key: "automation",
    path: "servicios/automatizacion-ia/",
    group: "agencia",
    label: {
      es: "Automatización con IA",
      pt: "Automação com IA",
      en: "AI Automation",
    },
    desc: {
      es: "Agentes, procesos y n8n a medida",
      pt: "Agentes, processos e n8n sob medida",
      en: "Agents, processes and custom n8n",
    },
  },
  {
    key: "chatbots",
    path: "servicios/chatbots/",
    group: "agencia",
    label: { es: "Chatbots con IA", pt: "Chatbots com IA", en: "AI Chatbots" },
    desc: {
      es: "WhatsApp, asistentes y reservas 24/7",
      pt: "WhatsApp, assistentes e agendamentos 24/7",
      en: "WhatsApp, assistants and 24/7 booking",
    },
  },
  {
    // ES-only por ahora: la SERP que justifica esta landing es la española
    // (ver la cabecera de src/pages/es/servicios/agentes-de-ia/index.astro).
    key: "agents",
    path: "servicios/agentes-de-ia/",
    group: "agencia",
    locales: ["es"],
    label: { es: "Agentes de IA", pt: "Agentes de IA", en: "AI Agents" },
    desc: {
      es: "Que consultan tus sistemas y ejecutan",
      pt: "Que consultam seus sistemas e executam",
      en: "That query your systems and act",
    },
  },
  {
    key: "web",
    path: "servicios/diseno-web/",
    group: "agencia",
    label: { es: "Diseño web", pt: "Criação de sites", en: "Web design" },
    desc: {
      es: "Sitios rápidos, SEO y conversión",
      pt: "Sites rápidos, SEO e conversão",
      en: "Fast sites, SEO and conversion",
    },
  },
  {
    key: "seo",
    path: "servicios/agencia-seo/",
    group: "agencia",
    label: { es: "Agencia SEO", pt: "Agência de SEO", en: "SEO agency" },
    desc: {
      es: "Posicionamiento y AI Search",
      pt: "Posicionamento e AI Search",
      en: "Rankings and AI Search",
    },
  },
  {
    key: "marketing",
    path: "servicios/marketing-digital/",
    group: "agencia",
    label: { es: "Marketing digital", pt: "Marketing digital", en: "Digital marketing" },
    desc: {
      es: "Estrategia, ads y automatización",
      pt: "Estratégia, ads e automação",
      en: "Strategy, ads and automation",
    },
  },
  {
    key: "ia",
    path: "servicios/agencia-ia/",
    group: "agencia",
    label: { es: "Agencia de IA", pt: "Agência de IA", en: "AI agency" },
    desc: {
      es: "Estrategia e implementación de IA",
      pt: "Estratégia e implementação de IA",
      en: "AI strategy and implementation",
    },
  },
  {
    key: "consultoria",
    path: "servicios/consultoria-ia/",
    group: "agencia",
    label: { es: "Consultoría de IA", pt: "Consultoria de IA", en: "AI consulting" },
    desc: {
      es: "Diagnóstico, estrategia y roadmap de IA",
      pt: "Diagnóstico, estratégia e roadmap de IA",
      en: "Diagnosis, strategy and AI roadmap",
    },
  },
  {
    key: "audit",
    path: "auditoria-de-sistemas/",
    group: "auditoria",
    label: { es: "Auditoría", pt: "Auditoria", en: "Audit" },
    desc: {
      es: "Radiografía Digital — inventario completo",
      pt: "Radiografia Digital — inventário completo",
      en: "Digital X-Ray — full inventory",
    },
  },
  {
    key: "roadmap",
    path: "roadmap-tecnologico/",
    group: "auditoria",
    label: { es: "Roadmap", pt: "Roadmap", en: "Roadmap" },
    desc: {
      es: "Plan de evolución con arquitectura objetivo y ROI",
      pt: "Plano de evolução com arquitetura objetivo e ROI",
      en: "Evolution plan with target architecture and ROI",
    },
  },
  {
    key: "implementation",
    path: "implementacion/",
    group: "auditoria",
    label: { es: "Implementación", pt: "Implementação", en: "Implementation" },
    desc: {
      es: "Construimos automatizaciones, integraciones y sistemas",
      pt: "Construímos automações, integrações e sistemas",
      en: "We build automations, integrations, and systems",
    },
  },
];

export interface ResolvedService {
  key: string;
  href: string;
  label: string;
  desc: string;
  num: string;
  group: GroupKey;
}

export interface ResolvedGroup {
  key: GroupKey;
  title: string;
  items: ResolvedService[];
}

function asLoc(locale: string): Loc {
  return locale === "pt" || locale === "en" ? locale : "es";
}

function href(locale: string, path: string) {
  return `/${locale}/${path}`.replace(/\/+$/, "/");
}

/** Servicios resueltos para un idioma, agrupados y numerados dentro de su grupo. */
export function getServiceGroups(locale: string): ResolvedGroup[] {
  const loc = asLoc(locale);
  const groups: GroupKey[] = ["agencia", "auditoria"];

  return groups.map((key) => ({
    key,
    title: GROUP_TITLES[key][loc],
    items: SERVICES.filter(
      (s) => s.group === key && (s.locales ?? ["es", "pt", "en"]).includes(loc),
    ).map((s, index) => ({
      key: s.key,
      href: href(locale, s.path),
      label: s.label[loc],
      desc: s.desc[loc],
      num: String(index + 1).padStart(2, "0"),
      group: s.group,
    })),
  }));
}

/** Lista plana, en el orden del catálogo. */
export function getServices(locale: string): ResolvedService[] {
  return getServiceGroups(locale).flatMap((g) => g.items);
}

const HUB_CTA: Record<Loc, string> = {
  es: "Ver todos los servicios",
  pt: "Ver todos os serviços",
  en: "See all services",
};

export function hubCtaLabel(locale: string) {
  return HUB_CTA[asLoc(locale)];
}

export const HUB_META: Record<Loc, { title: string; description: string; h1: string; intro: string }> = {
  es: {
    title: "Servicios de IA, automatización y crecimiento digital",
    description:
      "Automatización con IA, chatbots, diseño web, SEO, marketing y auditoría de sistemas. Diagnosticamos, priorizamos y construimos — sin hand-offs entre consultora y proveedor.",
    h1: "Nuestros servicios",
    intro:
      "Dos formas de trabajar con nosotros: servicios de agencia para crecer y captar, y auditoría e implementación para ordenar y evolucionar el parque tecnológico. El mismo equipo diagnostica y construye.",
  },
  pt: {
    title: "Serviços de IA, automação e crescimento digital",
    description:
      "Automação com IA, chatbots, criação de sites, SEO, marketing e auditoria de sistemas. Diagnosticamos, priorizamos e construímos — sem hand-offs entre consultoria e fornecedor.",
    h1: "Nossos serviços",
    intro:
      "Duas formas de trabalhar com a gente: serviços de agência para crescer e captar, e auditoria e implementação para organizar e evoluir o parque tecnológico. A mesma equipe diagnostica e constrói.",
  },
  en: {
    title: "AI, automation and digital growth services",
    description:
      "AI automation, chatbots, web design, SEO, marketing and systems audit. We diagnose, prioritize and build — no hand-offs between consultancy and vendor.",
    h1: "Our services",
    intro:
      "Two ways to work with us: agency services to grow and capture demand, and audit and implementation to order and evolve your technology stack. The same team diagnoses and builds.",
  },
};

export function getHubMeta(locale: string) {
  return HUB_META[asLoc(locale)];
}
