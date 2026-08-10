// Identidad de la marca — fuente única de verdad.
//
// Antes de este archivo, el nodo `Organization` se emitía al menos dos veces
// (home y metodología) con contenido divergente y sin `@id`, y `sameAs` existía
// en tres versiones distintas (home con 3 perfiles, footer con 4, página de
// autor con 1). Sin `@id`, cada emisión es un nodo suelto: el buscador ve
// varias organizaciones parecidas en lugar de una sola entidad.
//
// Todo lo que emita JSON-LD de la marca o de su fundador lee de aquí.
// Añadir un perfil social = añadir una entrada en SOCIAL_PROFILES.

export type Loc = "es" | "pt" | "en";

export const SITE = "https://iaoperators.com";

/** Identificadores estables del grafo. Son fragmentos, no URLs navegables:
 *  no dependen del idioma, así que las tres versiones de una página apuntan
 *  al mismo nodo. */
export const ORG_ID = `${SITE}/#organization`;
export const PERSON_ID = `${SITE}/#luiz-fernando-brazao`;
export const WEBSITE_ID = `${SITE}/#website`;

/** Referencias por `@id` — para citar un nodo sin volver a describirlo. */
export const ORG_REF = { "@id": ORG_ID } as const;
export const PERSON_REF = { "@id": PERSON_ID } as const;
export const WEBSITE_REF = { "@id": WEBSITE_ID } as const;

export const ORG_NAME = "IA Operators";
/**
 * Logo del Organization schema. Google exige un logotipo rastreable e indexable
 * de al menos 112 x 112 px; el favicon de 32 x 32 no cumple la especificación.
 * https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export const ORG_LOGO = `${SITE}/android-chrome-512x512.png`;
export const ORG_LOGO_SIZE = 512;

export const PERSON_NAME = "Luiz Fernando Brazão";
export const PERSON_SHORT_NAME = "Luiz Brazão";
export const PERSON_PHOTO =
  "https://framerusercontent.com/images/F57rOWtJqaFD6Xm3xWmqp6bM.png";

/** Ruta de la página de autor, sin idioma ni barra inicial. */
export const AUTHOR_PATH = "autores/luiz-fernando-brazao";
/** Ruta de la página de entidad de la empresa. */
export const ABOUT_PATH = "sobre";

export type SocialLabel = "LinkedIn" | "X" | "Instagram" | "YouTube";

export interface SocialProfile {
  /** Debe coincidir con una clave de SOCIAL_ICONS (src/components/social-icons.ts). */
  label: SocialLabel;
  href: string;
}

export const SOCIAL_PROFILES: readonly SocialProfile[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ferbrazao/" },
  { label: "X", href: "https://x.com/LuizBrazaoAI" },
  { label: "Instagram", href: "https://www.instagram.com/iaoperators/" },
  { label: "YouTube", href: "https://www.youtube.com/@IAOperators" },
];

/** `sameAs` único para Organization y Person: son los mismos perfiles. */
export const SAME_AS: readonly string[] = SOCIAL_PROFILES.map((p) => p.href);

export const CONTACT = {
  email: "info@iaoperators.com",
  /** Formato E.164, para `telephone` en JSON-LD y para `tel:`. */
  phone: "+34662423523",
  phoneDisplay: "+34 662 423 523",
  whatsapp: "https://wa.me/34662423523",
} as const;

export const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Málaga",
  addressRegion: "Andalucía",
  addressCountry: "ES",
} as const;

export const PLACE = {
  "@type": "Place",
  name: "Málaga, España",
  address: POSTAL_ADDRESS,
} as const;

/** Datos identificativos (LSSI-CE art. 10). Publicados en
 *  /[locale]/terminos-y-condiciones/ — aquí solo para el JSON-LD. */
export const LEGAL = {
  legalName: "Luiz Fernando Costa Brazao",
  taxId: "Y8219331L",
  city: "Málaga, España",
} as const;

/** Coherente con la NAP usada en directorios y citaciones. */
export const FOUNDING_DATE = "2023";

export const AREA_SERVED: readonly string[] = ["ES", "PT", "BR"];
export const KNOWS_LANGUAGE: readonly string[] = ["es", "pt", "en"];

export const KNOWS_ABOUT: readonly string[] = [
  "Artificial intelligence",
  "AI automation",
  "Conversational agents",
  "Systems integration",
  "Legacy system modernization",
  "Regulatory technology compliance",
  "Technology architecture",
  "Technology audit",
  "Technology roadmap",
  "Digital transformation",
  "Digital marketing",
  "SEO",
  "n8n",
  "LangChain",
  "Supabase",
  "WhatsApp Business Platform",
  "API integration",
];

function asLoc(locale: string): Loc {
  return locale === "pt" || locale === "en" ? locale : "es";
}

/** URL absoluta con idioma y barra final. `localeUrl("es")` → `${SITE}/es/` */
export function localeUrl(locale: string, path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean
    ? `${SITE}/${asLoc(locale)}/${clean}/`
    : `${SITE}/${asLoc(locale)}/`;
}

export function authorUrl(locale: string): string {
  return localeUrl(locale, AUTHOR_PATH);
}

export function aboutUrl(locale: string): string {
  return localeUrl(locale, ABOUT_PATH);
}

const JOB_TITLE: Record<Loc, string> = {
  es: "Fundador de IA Operators",
  pt: "Fundador da IA Operators",
  en: "Founder of IA Operators",
};

export function jobTitle(locale: string): string {
  return JOB_TITLE[asLoc(locale)];
}

export function contactPointNode(): Record<string, unknown> {
  return {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: CONTACT.email,
    telephone: CONTACT.phone,
    areaServed: [...AREA_SERVED],
    availableLanguage: [...KNOWS_LANGUAGE],
  };
}

/** Stub de Person para citar al fundador desde una página que no describe
 *  la entidad completa (la home, por ejemplo). El nodo completo vive en la
 *  página de autor; ambos comparten `@id`, así que se fusionan. */
export function founderRef(locale: string): Record<string, unknown> {
  return {
    "@id": PERSON_ID,
    "@type": "Person",
    name: PERSON_NAME,
    url: authorUrl(locale),
  };
}

export interface OrganizationNodeOptions {
  locale: string;
  description?: string;
  /** URL de la página que *es* la entidad. Solo /sobre debe pasarlo. */
  mainEntityOfPage?: string;
  /** Campos adicionales (hasOfferCatalog, etc.). Se fusionan al final. */
  extra?: Record<string, unknown>;
}

/** Nodo `Organization` canónico. Todas las páginas emiten este mismo `@id`. */
export function organizationNode(
  options: OrganizationNodeOptions,
): Record<string, unknown> {
  const { locale, description, mainEntityOfPage, extra } = options;

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: ORG_NAME,
    legalName: LEGAL.legalName,
    taxID: LEGAL.taxId,
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO,
      width: ORG_LOGO_SIZE,
      height: ORG_LOGO_SIZE,
    },
    image: ORG_LOGO,
    foundingDate: FOUNDING_DATE,
    founder: founderRef(locale),
    address: { ...POSTAL_ADDRESS },
    areaServed: [...AREA_SERVED],
    knowsLanguage: [...KNOWS_LANGUAGE],
    knowsAbout: [...KNOWS_ABOUT],
    email: CONTACT.email,
    telephone: CONTACT.phone,
    contactPoint: contactPointNode(),
    sameAs: [...SAME_AS],
  };

  if (description) node.description = description;
  if (mainEntityOfPage) node.mainEntityOfPage = mainEntityOfPage;

  return extra ? { ...node, ...extra } : node;
}

export interface PersonNodeOptions {
  locale: string;
  description?: string;
  jobTitle?: string;
  url?: string;
  extra?: Record<string, unknown>;
}

/** Nodo `Person` canónico del fundador. `worksFor` cierra el ciclo con
 *  `Organization`, que a su vez lo declara como `founder`. */
export function personNode(
  options: PersonNodeOptions,
): Record<string, unknown> {
  const { locale, description, url, extra } = options;

  const node: Record<string, unknown> = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PERSON_NAME,
    alternateName: PERSON_SHORT_NAME,
    jobTitle: options.jobTitle ?? jobTitle(locale),
    url: url ?? authorUrl(locale),
    image: PERSON_PHOTO,
    address: { ...POSTAL_ADDRESS },
    homeLocation: { ...PLACE },
    workLocation: { ...PLACE },
    knowsLanguage: [...KNOWS_LANGUAGE],
    worksFor: {
      "@id": ORG_ID,
      "@type": "Organization",
      name: ORG_NAME,
      url: SITE,
    },
    sameAs: [...SAME_AS],
  };

  if (description) node.description = description;

  return extra ? { ...node, ...extra } : node;
}
