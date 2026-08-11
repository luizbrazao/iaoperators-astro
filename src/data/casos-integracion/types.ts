// Tipos compartidos por los tres ficheros de contenido del silo de integración.
//
// Viven aquí y no en `src/data/integracion.ts` para romper el ciclo de imports:
// `integracion.ts` importa los datos de es/en/pt, y esos ficheros necesitan los
// tipos. Con un módulo de tipos aparte, el grafo queda en árbol.

export type Loc = "es" | "en" | "pt";

/**
 * Claves canónicas de los cinco casos. Son los slugs españoles y NO se
 * traducen: identifican el caso dentro del código. El slug público de cada
 * idioma vive en `CASO_SLUG_BY_LOC` (src/data/integracion.ts).
 */
export const CASO_SLUGS = [
  "erp",
  "crm",
  "whatsapp-business-api",
  "api-y-webhooks",
  "sistemas-legados",
] as const;

export type CasoKey = (typeof CASO_SLUGS)[number];

/** Alias histórico: antes de la traducción, la clave y el slug eran lo mismo. */
export type CasoSlug = CasoKey;

export interface CasoIntegracion {
  /** Etiqueta larga, usada en el `audience` del schema. */
  nombre: string;
  /** Etiqueta corta para breadcrumb, chips y enlaces entre hermanos. */
  nombreCorto: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** `name` del Service en el JSON-LD. Sin él se usa el h1. */
  schemaName?: string;
  /** `serviceType` del Service en el JSON-LD. Sin él, el genérico de CASO_UI. */
  serviceType?: string;
  /** CTA discreto bajo el párrafo del hero. Sin él no se renderiza nada. */
  heroCta?: { label: string; href: string };
  /**
   * Overrides por caso de los rótulos de CASO_UI ("Relacionado con este caso",
   * "Preguntas de este caso", "Otros casos"). Sin ellos se usan los del idioma,
   * así el cambio de un caso no arrastra a sus hermanos ni a otros idiomas.
   */
  labels?: { back?: string; puentesTitle?: string; faqTitle?: string; otros?: string };
  /**
   * Explicación breve para lectores no técnicos, entre el hero y "Cómo se
   * reconoce desde fuera". Sin ella no se renderiza la sección (opt-in por
   * caso, no cambia el comportamiento de los que no la declaran).
   */
  queEs?: { title: string; p1: string; p2: string };
  intro: string;
  /** La señal por la que se reconoce el problema desde fuera. */
  sintoma: string;
  /** Por qué comprar otro software no lo resuelve. Título + cuerpo. */
  porQue: { title: string; body: string };
  /** Los patrones de integración concretos de este caso. Entre 3 y 4. */
  patrones: { title: string; body: string; riesgo: string }[];
  /** Qué se entrega. Frases cortas, no adjetivos. */
  entregables: string[];
  /**
   * Puentes a otras páginas del sitio, con motivo explícito.
   * `href` es una ruta absoluta CON locale y debe existir en ese idioma: es la
   * única parte de estos ficheros que puede romper el build de enlaces.
   */
  puentes: { href: string; label: string; body: string }[];
  faq: { q: string; a: string }[];
}

/** Lo común a todos los casos: se resume una vez y se enlaza al hub. */
export interface SharedIntegracion {
  proceso: {
    title: string;
    subtitle: string;
    phases: { code: string; title: string; plazo: string; body: string }[];
  };
  principios: { title: string; body: string }[];
  tech: string[];
}
