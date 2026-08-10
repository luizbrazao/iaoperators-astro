// Navegación primaria en ES — fuente única de los tres pilares.
//
// Fase 1 del reposicionamiento (2026-08-10): la empresa deja de presentarse en
// primer nivel como una agencia horizontal (IA + SEO + web + marketing +
// chatbots + automatización) y pasa a presentarse por sus tres pilares reales:
// integración de sistemas, cumplimiento tecnológico y arquitectura tecnológica.
//
// Este módulo NO define rutas nuevas ni rótulos nuevos donde ya existían: compone
// lo que ya vive en `integracion.ts` (los cinco casos del silo), en `servicios.ts`
// (los tres pasos del pilar de arquitectura) y en las páginas de cumplimiento.
// Si mañana se añade un caso de integración, aparece aquí solo.
//
// ES-only a propósito: `/es/integracion/` y `/es/cumplimiento/` no tienen
// equivalente en EN/PT, y traducirlos no es objeto de esta fase. El Header
// consume estos pilares únicamente cuando el locale es "es".

import { CASOS as CASOS_INTEGRACION, CASO_SLUGS as INTEGRACION_SLUGS } from "@/data/integracion";
import { getArquitectura, ARQUITECTURA_TITLE } from "@/data/servicios";

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

const INTEGRACION_BASE = "/es/integracion/";
const CUMPLIMIENTO_BASE = "/es/cumplimiento/";

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

function integracionChildren(): NavChild[] {
  const ordenados = INTEGRACION_ORDEN.filter((slug) =>
    (INTEGRACION_SLUGS as readonly string[]).includes(slug),
  );

  const desdeDatos: NavChild[] = ordenados.map((slug) => ({
    label: CASOS_INTEGRACION[slug].nombreCorto,
    href: `${INTEGRACION_BASE}${slug}/`,
  }));

  // Automatización no es un caso del silo: vive como landing de servicio y se
  // enlaza aquí porque, para quien navega, es parte de la misma pregunta.
  const automatizacion: NavChild = {
    label: "Automatización",
    href: "/es/servicios/automatizacion-ia/",
  };

  const legadosIndex = desdeDatos.findIndex((c) => c.href.endsWith("/sistemas-legados/"));
  if (legadosIndex === -1) return [...desdeDatos, automatizacion];

  return [
    ...desdeDatos.slice(0, legadosIndex),
    automatizacion,
    ...desdeDatos.slice(legadosIndex),
  ];
}

/**
 * Los tres pilares en ES, en orden de jerarquía.
 *
 * El primer hijo de cada pilar es siempre el propio hub: en un panel desplegable
 * el visitante necesita poder ir "al tema entero", no solo a una hoja.
 */
export function getPilaresEs(): NavPilar[] {
  const arquitectura = getArquitectura("es");

  return [
    {
      key: "integracion",
      label: "Integración",
      href: INTEGRACION_BASE,
      tagline: "Conectamos tus sistemas",
      children: [
        { label: "Integración de sistemas", href: INTEGRACION_BASE, desc: "Visión general del pilar" },
        ...integracionChildren(),
      ],
    },
    {
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
    },
    {
      key: "arquitectura",
      // Sin hub propio todavía: la entrada del pilar es el paso 01. Crear
      // /es/arquitectura-tecnologica/ es una decisión de fase 2, documentada.
      label: "Arquitectura",
      href: arquitectura[0]?.href ?? "/es/auditoria-de-sistemas/",
      tagline: "Qué tienes, qué cambiar, lo construimos",
      children: arquitectura.map((paso) => ({
        label: `${paso.num} — ${paso.label}`,
        href: paso.href,
        desc: paso.promesa,
      })),
    },
  ];
}

export const ARQUITECTURA_LABEL_ES = ARQUITECTURA_TITLE.es;
