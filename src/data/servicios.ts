// Catálogo de servicios — fuente única de verdad.
//
// Antes, los rótulos de cada servicio vivían duplicados en siete constantes del
// Header, otra vez en el objeto `labels`, y habrían vuelto a duplicarse en el hub
// y en el Footer. El síntoma clásico de esa duplicación ya estaba en el menú:
// dos entradas numeradas "07". Todo lo que necesite listar servicios lee de aquí.
//
// Añadir un servicio = añadir una entrada. La numeración se calcula por grupo.
//
// Reagrupación de 2026-08-10 (fase 1 del reposicionamiento): los grupos pasan de
// dos ("agencia" / "auditoría") a tres, para que el catálogo deje de presentar
// once servicios con el mismo peso estratégico. El orden de los grupos es la
// jerarquía: arquitectura primero, IA después, y los servicios digitales
// —web, SEO, marketing— explícitamente como complementarios. Ninguna URL cambia.

export type Loc = "es" | "pt" | "en";
export type GroupKey = "arquitectura" | "ia" | "digital";

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
  arquitectura: {
    es: "Arquitectura y transformación",
    pt: "Arquitetura e transformação",
    en: "Architecture & transformation",
  },
  ia: {
    es: "Inteligencia artificial y automatización",
    pt: "Inteligência artificial e automação",
    en: "AI & automation",
  },
  digital: {
    es: "Servicios digitales complementarios",
    pt: "Serviços digitais complementares",
    en: "Complementary digital services",
  },
};

/**
 * Descripción de cada grupo. Sirve para que el hub explique por qué un bloque
 * está antes que otro en vez de dejar que el visitante lo deduzca del orden.
 */
export const GROUP_INTROS: Record<GroupKey, Record<Loc, string>> = {
  arquitectura: {
    es: "Entender qué tienes, decidir qué cambiar y construirlo. Es el trabajo que sostiene todo lo demás.",
    pt: "Entender o que você tem, decidir o que mudar e construir. É o trabalho que sustenta todo o resto.",
    en: "Understand what you have, decide what to change, and build it. This is the work everything else rests on.",
  },
  ia: {
    es: "Agentes, asistentes y automatizaciones que se apoyan en tus sistemas reales, no al margen de ellos.",
    pt: "Agentes, assistentes e automações apoiados nos seus sistemas reais, não à margem deles.",
    en: "Agents, assistants and automations grounded in your actual systems, not beside them.",
  },
  digital: {
    es: "Capacidades que usamos dentro de los proyectos y que también prestamos por separado.",
    pt: "Capacidades que usamos dentro dos projetos e que também prestamos separadamente.",
    en: "Capabilities we use inside projects and also deliver on their own.",
  },
};

export const SERVICES: ServiceDefinition[] = [
  {
    key: "audit",
    path: "auditoria-de-sistemas/",
    group: "arquitectura",
    label: { es: "Radiografía Digital", pt: "Radiografia Digital", en: "Digital X-Ray" },
    desc: {
      es: "Auditoría e inventario completo del parque tecnológico",
      pt: "Auditoria e inventário completo do parque tecnológico",
      en: "Audit and full inventory of your technology stack",
    },
  },
  {
    key: "roadmap",
    path: "roadmap-tecnologico/",
    group: "arquitectura",
    label: { es: "Roadmap tecnológico", pt: "Roadmap tecnológico", en: "Technology roadmap" },
    desc: {
      es: "Plan de evolución con arquitectura objetivo y ROI",
      pt: "Plano de evolução com arquitetura objetivo e ROI",
      en: "Evolution plan with target architecture and ROI",
    },
  },
  {
    key: "implementation",
    path: "implementacion/",
    group: "arquitectura",
    label: { es: "Implementación", pt: "Implementação", en: "Implementation" },
    desc: {
      es: "Construimos automatizaciones, integraciones y sistemas",
      pt: "Construímos automações, integrações e sistemas",
      en: "We build automations, integrations, and systems",
    },
  },
  {
    key: "automation",
    path: "servicios/automatizacion-ia/",
    group: "ia",
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
    // ES-only por ahora: la SERP que justifica esta landing es la española
    // (ver la cabecera de src/pages/es/servicios/agentes-de-ia/index.astro).
    key: "agents",
    path: "servicios/agentes-de-ia/",
    group: "ia",
    locales: ["es"],
    label: { es: "Agentes de IA", pt: "Agentes de IA", en: "AI Agents" },
    desc: {
      es: "Que consultan tus sistemas y ejecutan",
      pt: "Que consultam seus sistemas e executam",
      en: "That query your systems and act",
    },
  },
  {
    key: "chatbots",
    path: "servicios/chatbots/",
    group: "ia",
    label: { es: "Chatbots con IA", pt: "Chatbots com IA", en: "AI Chatbots" },
    desc: {
      es: "WhatsApp, asistentes y reservas 24/7",
      pt: "WhatsApp, assistentes e agendamentos 24/7",
      en: "WhatsApp, assistants and 24/7 booking",
    },
  },
  {
    key: "consultoria",
    path: "servicios/consultoria-ia/",
    group: "ia",
    label: { es: "Consultoría de IA", pt: "Consultoria de IA", en: "AI consulting" },
    desc: {
      es: "Diagnóstico, estrategia y roadmap de IA",
      pt: "Diagnóstico, estratégia e roadmap de IA",
      en: "Diagnosis, strategy and AI roadmap",
    },
  },
  {
    key: "ia",
    path: "servicios/agencia-ia/",
    group: "ia",
    label: { es: "Agencia de IA", pt: "Agência de IA", en: "AI agency" },
    desc: {
      es: "Estrategia e implementación de IA",
      pt: "Estratégia e implementação de IA",
      en: "AI strategy and implementation",
    },
  },
  {
    key: "web",
    path: "servicios/diseno-web/",
    group: "digital",
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
    group: "digital",
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
    group: "digital",
    label: { es: "Marketing digital", pt: "Marketing digital", en: "Digital marketing" },
    desc: {
      es: "Estrategia, ads y automatización",
      pt: "Estratégia, ads e automação",
      en: "Strategy, ads and automation",
    },
  },
];

/**
 * El pilar de arquitectura tecnológica: tres páginas que ya existían sueltas
 * (`auditoria-de-sistemas/`, `roadmap-tecnologico/`, `implementacion/`) y que
 * pasan a presentarse como una sola familia de tres pasos.
 *
 * No hay página hub para el pilar todavía —crearla es una decisión de fase 2—,
 * así que la entrada del pilar es el paso 01. La promesa de cada paso es lo
 * que convierte tres servicios en una secuencia legible: qué tienes, qué
 * debería cambiar, lo construimos.
 */
export const ARQUITECTURA_KEYS = ["audit", "roadmap", "implementation"] as const;

/**
 * Hub del pilar (fase 2). ES-only: la página existe solo en español, así que
 * quien lo enlace debe condicionar por locale. Constante única para que el
 * menú, la home, el footer y el bloque de los tres pasos no la escriban cada
 * uno por su cuenta.
 */
export const ARQUITECTURA_HUB_HREF = "/es/arquitectura-tecnologica/";

export const ARQUITECTURA_PROMESAS: Record<
  (typeof ARQUITECTURA_KEYS)[number],
  Record<Loc, string>
> = {
  audit: { es: "Qué tienes.", pt: "O que você tem.", en: "What you have." },
  roadmap: {
    es: "Qué debería cambiar.",
    pt: "O que deveria mudar.",
    en: "What should change.",
  },
  implementation: { es: "Lo construimos.", pt: "Nós construímos.", en: "We build it." },
};

export const ARQUITECTURA_TITLE: Record<Loc, string> = {
  es: "Arquitectura tecnológica",
  pt: "Arquitetura tecnológica",
  en: "Technology architecture",
};

export interface PasoArquitectura {
  key: string;
  num: string;
  href: string;
  label: string;
  promesa: string;
  desc: string;
}

/** Los tres pasos del pilar de arquitectura, resueltos para un idioma. */
export function getArquitectura(locale: string): PasoArquitectura[] {
  const loc = asLoc(locale);
  return ARQUITECTURA_KEYS.map((key, index) => {
    const service = SERVICES.find((s) => s.key === key)!;
    return {
      key,
      num: String(index + 1).padStart(2, "0"),
      href: href(locale, service.path),
      label: service.label[loc],
      promesa: ARQUITECTURA_PROMESAS[key][loc],
      desc: service.desc[loc],
    };
  });
}

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
  intro: string;
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
  const groups: GroupKey[] = ["arquitectura", "ia", "digital"];

  return groups.map((key) => ({
    key,
    title: GROUP_TITLES[key][loc],
    intro: GROUP_INTROS[key][loc],
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
    title: "Servicios de arquitectura tecnológica, IA y crecimiento digital",
    description:
      "Arquitectura tecnológica, automatización con IA, chatbots, diseño web, SEO y marketing. Diagnosticamos, priorizamos y construimos — sin hand-offs entre consultora y proveedor.",
    h1: "Nuestros servicios",
    intro:
      "El trabajo principal es de arquitectura: entender el parque tecnológico, decidir qué cambiar y construirlo. Alrededor de eso prestamos capacidades de IA y servicios digitales, que usamos dentro de los proyectos y también por separado.",
  },
  pt: {
    title: "Serviços de arquitetura tecnológica, IA e crescimento digital",
    description:
      "Arquitetura tecnológica, automação com IA, chatbots, criação de sites, SEO e marketing. Diagnosticamos, priorizamos e construímos — sem hand-offs entre consultoria e fornecedor.",
    h1: "Nossos serviços",
    intro:
      "O trabalho principal é de arquitetura: entender o parque tecnológico, decidir o que mudar e construir. Em volta disso prestamos capacidades de IA e serviços digitais, que usamos dentro dos projetos e também separadamente.",
  },
  en: {
    title: "Technology architecture, AI and digital growth services",
    description:
      "Technology architecture, AI automation, chatbots, web design, SEO and marketing. We diagnose, prioritize and build — no hand-offs between consultancy and vendor.",
    h1: "Our services",
    intro:
      "The core work is architectural: understand the technology stack, decide what to change, and build it. Around that we provide AI capabilities and digital services, used inside projects and also on their own.",
  },
};

export function getHubMeta(locale: string) {
  return HUB_META[asLoc(locale)];
}
