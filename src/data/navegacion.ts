// Navegación primaria — fuente única de los pilares del negocio.
//
// Fase 1 del reposicionamiento (2026-08-10): la empresa deja de presentarse en
// primer nivel como una agencia horizontal (IA + SEO + web + marketing +
// chatbots + automatización) y pasa a presentarse por sus pilares reales:
// integración de sistemas, cumplimiento tecnológico y arquitectura tecnológica.
//
// Extensión a EN y PT (ago/2026): la arquitectura de información deja de ser
// ES-only. Los dos pilares trilingües —integración y arquitectura— existen
// ahora en los tres idiomas, con slug localizado (ver INTEGRACION_SLUG y
// ARQUITECTURA_SLUG). **Cumplimiento sigue siendo ES-only por decisión**, y no
// por falta de traducción: Verifactu y la Ley 10/2025 son obligaciones
// españolas, así que un pilar de cumplimiento en /en/ o /pt/ vendería un plazo
// legal que no aplica a quien lo lee.
//
// Este módulo NO define rutas nuevas ni rótulos nuevos donde ya existían:
// compone lo que ya vive en `integracion.ts` (los casos del silo y el slug del
// hub), en `servicios.ts` (los tres pasos del pilar de arquitectura y las
// landings de servicio) y en las páginas de cumplimiento. Si mañana se añade un
// caso de integración, aparece aquí solo.

import {
  getCasos,
  casoHref,
  CASO_SLUGS,
  integracionHref,
  hayCasos,
  type CasoKey,
  type Loc,
} from "@/data/integracion";
import {
  getArquitectura,
  getServices,
  ARQUITECTURA_TITLE,
  arquitecturaHubHref,
} from "@/data/servicios";

export interface NavChild {
  label: string;
  href: string;
  /** Línea de apoyo en el panel de escritorio. Opcional. */
  desc?: string;
}

export interface NavPilar {
  key: "integracion" | "cumplimiento" | "arquitectura";
  label: string;
  /** Destino del propio pilar: el hub cuando existe. */
  href: string;
  /** Texto corto que explica el pilar dentro del panel. */
  tagline: string;
  children: NavChild[];
}

const CUMPLIMIENTO_BASE = "/es/cumplimiento/";

function asLoc(locale: string): Loc {
  return locale === "en" || locale === "pt" ? locale : "es";
}

const COPY: Record<
  Loc,
  {
    integracionLabel: string;
    integracionTagline: string;
    integracionOverview: string;
    arquitecturaLabel: string;
    arquitecturaTagline: string;
    overviewDesc: string;
  }
> = {
  es: {
    integracionLabel: "Integración",
    integracionTagline: "Conectamos tus sistemas",
    integracionOverview: "Integración de sistemas",
    arquitecturaLabel: "Arquitectura",
    arquitecturaTagline: "Qué tienes, qué cambiar, lo construimos",
    overviewDesc: "Visión general del pilar",
  },
  en: {
    integracionLabel: "Integration",
    integracionTagline: "We connect your systems",
    integracionOverview: "Systems integration",
    arquitecturaLabel: "Architecture",
    arquitecturaTagline: "What you have, what to change, we build it",
    overviewDesc: "Pillar overview",
  },
  pt: {
    integracionLabel: "Integração",
    integracionTagline: "Conectamos seus sistemas",
    integracionOverview: "Integração de sistemas",
    arquitecturaLabel: "Arquitetura",
    arquitecturaTagline: "O que você tem, o que mudar, nós construímos",
    overviewDesc: "Visão geral do pilar",
  },
};

/**
 * Orden de los hijos de integración. No se deriva de `CASO_SLUGS` porque el
 * orden de navegación es una decisión editorial (ERP primero, legados al final)
 * y el del array de datos responde a cuándo se escribió cada página.
 */
const INTEGRACION_ORDEN = [
  "erp",
  "api-y-webhooks",
  "crm",
  "whatsapp-business-api",
  "sistemas-legados",
] as const;

/** Rótulo de una landing de servicio, resuelto en el idioma pedido. */
function servicio(locale: string, key: string): NavChild | null {
  const item = getServices(locale).find((s) => s.key === key);
  return item ? { label: item.label, href: item.href } : null;
}

function integracionChildren(locale: string): NavChild[] {
  // Automatización no es un caso del silo: vive como landing de servicio y se
  // enlaza aquí porque, para quien navega, es parte de la misma pregunta.
  const automatizacion = servicio(locale, "automation");

  if (!hayCasos(locale)) {
    // Salvaguarda para un idioma futuro con hub traducido y casos sin traducir
    // (fue el estado de EN/PT durante la fase 3). Enlazar `/es/integracion/erp/`
    // desde /en/ sería mandar a un lector a otra lengua, así que el panel se
    // apoya en las landings trilingües. En cuanto `CASOS_LOCALES` incluya el
    // idioma, este `if` deja de aplicarse y los cinco casos aparecen solos.
    return [automatizacion, servicio(locale, "chatbots")].filter(Boolean) as NavChild[];
  }

  const casos = getCasos(locale);
  const ordenados = INTEGRACION_ORDEN.filter((key) =>
    (CASO_SLUGS as readonly string[]).includes(key),
  ) as readonly CasoKey[];

  const desdeDatos: NavChild[] = ordenados.map((key) => ({
    label: casos[key].nombreCorto,
    href: casoHref(locale, key),
  }));

  if (!automatizacion) return desdeDatos;

  // Automatización entra justo antes de sistemas legados, que cierra la lista.
  const legadosHref = casoHref(locale, "sistemas-legados");
  const legadosIndex = desdeDatos.findIndex((c) => c.href === legadosHref);
  if (legadosIndex === -1) return [...desdeDatos, automatizacion];

  return [
    ...desdeDatos.slice(0, legadosIndex),
    automatizacion,
    ...desdeDatos.slice(legadosIndex),
  ];
}

/**
 * Los pilares de un idioma, en orden de jerarquía.
 *
 * El primer hijo de cada pilar es siempre el propio hub: en un panel desplegable
 * el visitante necesita poder ir "al tema entero", no solo a una hoja.
 */
export function getPilares(locale: string): NavPilar[] {
  const loc = asLoc(locale);
  const c = COPY[loc];
  const arquitectura = getArquitectura(loc);
  const integracionBase = integracionHref(loc);
  const arquitecturaBase = arquitecturaHubHref(loc);

  const pilares: NavPilar[] = [
    {
      key: "integracion",
      label: c.integracionLabel,
      href: integracionBase,
      tagline: c.integracionTagline,
      children: [
        { label: c.integracionOverview, href: integracionBase, desc: c.overviewDesc },
        ...integracionChildren(loc),
      ],
    },
  ];

  // Cumplimiento: ES-only por decisión de negocio, no por traducción pendiente.
  if (loc === "es") {
    pilares.push({
      key: "cumplimiento",
      label: "Cumplimiento",
      href: CUMPLIMIENTO_BASE,
      tagline: "Adaptamos tu stack a la norma",
      children: [
        { label: "Cumplimiento tecnológico", href: CUMPLIMIENTO_BASE, desc: "Visión general del pilar" },
        { label: "Verifactu", href: `${CUMPLIMIENTO_BASE}verifactu/`, desc: "Sistemas de facturación · 2027" },
        {
          label: "Ley de Atención al Cliente",
          href: `${CUMPLIMIENTO_BASE}ley-atencion-al-cliente/`,
          desc: "Ley 10/2025 · plazo 28/12/2026",
        },
      ],
    });
  }

  pilares.push({
    key: "arquitectura",
    // Fase 2 (10/ago/2026): el pilar ya tiene hub propio. Antes entraba por
    // el paso 01 (/es/auditoria-de-sistemas/), que mezclaba la categoría con
    // uno de sus servicios. Las tres páginas hijas no se han movido.
    label: c.arquitecturaLabel,
    href: arquitecturaBase,
    tagline: c.arquitecturaTagline,
    children: [
      {
        label: ARQUITECTURA_TITLE[loc],
        href: arquitecturaBase,
        desc: c.overviewDesc,
      },
      ...arquitectura.map((paso) => ({
        label: `${paso.num} — ${paso.label}`,
        href: paso.href,
        desc: paso.promesa,
      })),
    ],
  });

  return pilares;
}

/**
 * Compatibilidad: `getPilaresEs()` era el nombre cuando los pilares existían
 * solo en español. Se conserva como alias para no romper llamadas antiguas.
 */
export const getPilaresEs = () => getPilares("es");

export const ARQUITECTURA_LABEL_ES = ARQUITECTURA_TITLE.es;
