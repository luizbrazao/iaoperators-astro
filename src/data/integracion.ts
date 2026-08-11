// Silo 2 — Integración y automatización de sistemas (core evergreen).
//
// Este fichero ya no contiene contenido: contiene la ESTRUCTURA del silo —los
// slugs de cada idioma, los helpers de URL y hreflang, y el ensamblado de los
// tres ficheros de contenido—. El texto vive en `src/data/casos-integracion/`,
// un fichero por idioma, y los tipos en `casos-integracion/types.ts`.
//
// Fase 3 (11/ago/2026): el hub pasó a los tres idiomas y los cinco casos se
// quedaron en español, tras el gate `CASOS_LOCALES`.
// Fase 4 (ago/2026): los cinco casos existen en los tres idiomas y el gate se
// abre. `hayCasos()` sigue existiendo porque es la única pieza que hay que
// tocar si algún día se añade un idioma sin traducir los casos.
//
// La clave de cada caso (`CasoKey`) es el slug español y NO se traduce: es un
// identificador de código. El slug público de cada idioma está en
// `CASO_SLUG_BY_LOC`, que es la única fuente de esas rutas. Consecuencia
// práctica: `/en/integration/api-and-webhooks/` y `/es/integracion/api-y-webhooks/`
// son la misma entidad y por eso pueden declararse hreflang recíproco.

import { CASOS_ES, SHARED_ES } from "./casos-integracion/es";
import { CASOS_EN, SHARED_EN } from "./casos-integracion/en";
import { CASOS_PT, SHARED_PT } from "./casos-integracion/pt";
import {
  CASO_SLUGS,
  type CasoIntegracion,
  type CasoKey,
  type CasoSlug,
  type Loc,
  type SharedIntegracion,
} from "./casos-integracion/types";

export { CASO_SLUGS };
export type { CasoIntegracion, CasoKey, CasoSlug, Loc, SharedIntegracion };

function asLoc(locale: string): Loc {
  return locale === "en" || locale === "pt" ? locale : "es";
}

// ---------------------------------------------------------------- slugs

/**
 * Slug del hub del silo, por idioma.
 *
 * El hub existe en los tres idiomas desde ago/2026 y el slug se localiza:
 * `integration` y `integracao` son las palabras que se buscan en cada mercado.
 * Fuente única — menú, home, footer y las propias páginas leen de aquí.
 */
export const INTEGRACION_SLUG: Record<Loc, string> = {
  es: "integracion/",
  en: "integration/",
  pt: "integracao/",
};

/**
 * Slug público de cada caso, por idioma.
 *
 * Tres de los cinco coinciden en los tres idiomas (`erp`, `crm`,
 * `whatsapp-business-api`: son siglas o nombres de producto, y traducirlos
 * sería inventar una query que nadie escribe). Los otros dos sí se traducen,
 * porque son palabras comunes y la ruta es una señal de idioma.
 *
 * Cambiar un valor de esta tabla es cambiar una URL: exige el 301 correspondiente
 * en `vercel.json`, con las dos variantes (con y sin barra final).
 */
export const CASO_SLUG_BY_LOC: Record<Loc, Record<CasoKey, string>> = {
  es: {
    erp: "erp",
    crm: "crm",
    "whatsapp-business-api": "whatsapp-business-api",
    "api-y-webhooks": "api-y-webhooks",
    "sistemas-legados": "sistemas-legados",
  },
  en: {
    erp: "erp",
    crm: "crm",
    "whatsapp-business-api": "whatsapp-business-api",
    "api-y-webhooks": "api-and-webhooks",
    "sistemas-legados": "legacy-systems",
  },
  pt: {
    erp: "erp",
    crm: "crm",
    "whatsapp-business-api": "whatsapp-business-api",
    "api-y-webhooks": "api-e-webhooks",
    "sistemas-legados": "sistemas-legados",
  },
};

/**
 * Idiomas en los que existen las cinco páginas hijas.
 *
 * Fue `["es"]` durante la fase 3, cuando el hub ya era trilingüe y el contenido
 * de los casos no. Mientras no cubra un idioma, ni el menú ni el hub deben
 * enlazar los casos en él: enlazarlos sería mandar a un lector a una página en
 * otra lengua.
 */
export const CASOS_LOCALES: readonly Loc[] = ["es", "en", "pt"];

export const hayCasos = (locale: string) => CASOS_LOCALES.includes(asLoc(locale));

// ---------------------------------------------------------------- URLs

/** Ruta del hub de integración para un idioma. */
export function integracionHref(locale: string): string {
  const loc = asLoc(locale);
  return `/${loc}/${INTEGRACION_SLUG[loc]}`;
}

/** Ruta de un caso concreto para un idioma. */
export function casoHref(locale: string, key: CasoKey): string {
  const loc = asLoc(locale);
  return `${integracionHref(loc)}${CASO_SLUG_BY_LOC[loc][key]}/`;
}

/**
 * Resuelve la clave canónica a partir del slug público de un idioma.
 * Devuelve `null` si el slug no pertenece a ese idioma, que es lo que permite
 * que `getStaticPaths` no genere rutas cruzadas por accidente.
 */
export function casoKeyFromSlug(locale: string, slug: string): CasoKey | null {
  const loc = asLoc(locale);
  const entry = (Object.entries(CASO_SLUG_BY_LOC[loc]) as [CasoKey, string][]).find(
    ([, value]) => value === slug,
  );
  return entry ? entry[0] : null;
}

/** Alternates de hreflang del hub, recíprocos entre los tres idiomas. */
export function integracionAlternates(site?: string) {
  return (["es", "en", "pt"] as const).map((lang) => ({
    lang,
    href: site
      ? new URL(`/${lang}/${INTEGRACION_SLUG[lang]}`, site).toString()
      : `/${lang}/${INTEGRACION_SLUG[lang]}`,
  }));
}

/**
 * Alternates de hreflang de un caso. Recíprocos porque la clave canónica es la
 * misma en los tres idiomas aunque el slug cambie — que es exactamente el caso
 * de uso para el que existe hreflang.
 */
export function casoAlternates(key: CasoKey, site?: string) {
  return (["es", "en", "pt"] as const).map((lang) => ({
    lang,
    href: site ? new URL(casoHref(lang, key), site).toString() : casoHref(lang, key),
  }));
}

// ---------------------------------------------------------------- contenido

/** Lo común a todos los casos, por idioma. */
export const SHARED_BY_LOC: Record<Loc, SharedIntegracion> = {
  es: SHARED_ES,
  en: SHARED_EN,
  pt: SHARED_PT,
};

export const CASOS_BY_LOC: Record<Loc, Record<CasoKey, CasoIntegracion>> = {
  es: CASOS_ES,
  en: CASOS_EN,
  pt: CASOS_PT,
};

export const getShared = (locale: string) => SHARED_BY_LOC[asLoc(locale)];
export const getCasos = (locale: string) => CASOS_BY_LOC[asLoc(locale)];
export const getCaso = (locale: string, key: CasoKey) => CASOS_BY_LOC[asLoc(locale)][key];

// ---------------------------------------------------------------- chrome

/**
 * Los rótulos fijos de la plantilla de caso. Estaban escritos en español dentro
 * del `.astro`, que era correcto mientras la página fuera ES-only y habría
 * servido cabeceras en español a EN y PT en cuanto dejó de serlo.
 */
export const CASO_UI: Record<
  Loc,
  {
    back: string;
    sintoma: string;
    patronesTitle: string;
    patronesSubtitle: string;
    riesgo: string;
    entregables: string;
    principios: string;
    procesoLink: { pre: string; label: string; post: string };
    puentesTitle: string;
    puentesSubtitle: string;
    puentesCta: string;
    faqTitle: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
    otros: string;
    breadcrumbHome: string;
    breadcrumbHub: string;
    hubName: string;
    serviceType: string;
    inLanguage: string;
  }
> = {
  es: {
    back: "← Integración y automatización",
    sintoma: "Cómo se reconoce desde fuera",
    patronesTitle: "Los flujos que hay que resolver",
    patronesSubtitle: "Cada uno con la decisión de diseño que decide si aguanta en producción.",
    riesgo: "Dónde se rompe",
    entregables: "Qué recibes",
    principios: "Cómo lo construimos",
    procesoLink: {
      pre: "El método completo y el resto de capacidades están en la",
      label: "página de integración de sistemas",
      post: ".",
    },
    puentesTitle: "Relacionado con este caso",
    puentesSubtitle: "Lo que suele venir antes o después, con el motivo por el que lo enlazamos.",
    puentesCta: "Ver →",
    faqTitle: "Preguntas de este caso",
    ctaTitle: "Empieza por el diagnóstico",
    ctaBody:
      "Tres a cinco días para saber qué se conecta primero, con alcance y precio cerrados antes de escribir una línea de código.",
    ctaButton: "Hablar con un especialista ↗",
    otros: "Otros casos",
    breadcrumbHome: "Inicio",
    // "Integración de sistemas": consistencia semántica con el title y el
    // Service del hub, que es el propietario de esa intención.
    breadcrumbHub: "Integración de sistemas",
    hubName: "Integración de sistemas",
    serviceType: "Systems integration and business automation",
    inLanguage: "es-ES",
  },
  en: {
    back: "← Integration and automation",
    sintoma: "How you recognize it from outside",
    patronesTitle: "The flows that have to be solved",
    patronesSubtitle: "Each one with the design decision that determines whether it survives production.",
    riesgo: "Where it breaks",
    entregables: "What you get",
    principios: "How we build it",
    procesoLink: {
      pre: "The full method and the rest of the capabilities are on the",
      label: "systems integration page",
      post: ".",
    },
    puentesTitle: "Related to this case",
    puentesSubtitle: "What usually comes before or after, with the reason we link it.",
    puentesCta: "Open →",
    faqTitle: "Questions about this case",
    ctaTitle: "Start with the diagnosis",
    ctaBody:
      "Three to five days to know what gets connected first, with scope and price closed before a line of code is written.",
    ctaButton: "Talk to a specialist ↗",
    otros: "Other cases",
    breadcrumbHome: "Home",
    breadcrumbHub: "Integration and automation",
    hubName: "Systems integration and automation",
    serviceType: "Systems integration and business automation",
    inLanguage: "en-US",
  },
  pt: {
    back: "← Integração e automação",
    sintoma: "Como isso se reconhece de fora",
    patronesTitle: "Os fluxos que precisam ser resolvidos",
    patronesSubtitle: "Cada um com a decisão de projeto que define se aguenta produção.",
    riesgo: "Onde quebra",
    entregables: "O que você recebe",
    principios: "Como construímos",
    procesoLink: {
      pre: "O método completo e o resto das capacidades estão na",
      label: "página de integração de sistemas",
      post: ".",
    },
    puentesTitle: "Relacionado a este caso",
    puentesSubtitle: "O que costuma vir antes ou depois, com o motivo do link.",
    puentesCta: "Ver →",
    faqTitle: "Perguntas deste caso",
    ctaTitle: "Comece pelo diagnóstico",
    ctaBody:
      "Três a cinco dias para saber o que se conecta primeiro, com escopo e preço fechados antes de escrever uma linha de código.",
    ctaButton: "Falar com um especialista ↗",
    otros: "Outros casos",
    breadcrumbHome: "Início",
    breadcrumbHub: "Integração e automação",
    hubName: "Integração e automação de sistemas",
    serviceType: "Systems integration and business automation",
    inLanguage: "pt-BR",
  },
};
