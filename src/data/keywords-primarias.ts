/**
 * Registro de keyword primaria por ruta — fuente única para la regla
 * anti-canibalización del plan de arquitectura (docs/plan-arquitectura-2026-08.md, §7).
 *
 * Regla: una keyword primaria, una URL. `npm run check:keywords` falla si dos
 * rutas declaran la misma primaria, o si una ruta indexable no está declarada.
 *
 * Cómo mantenerlo:
 * - Página nueva indexable → añadir entrada aquí en el mismo commit.
 * - Página que pasa a `noindex` o desaparece → quitar la entrada.
 * - Las variantes y sinónimos van en `secundarias`, no en `primaria`: ahí sí
 *   puede repetirse un término entre páginas vecinas.
 *
 * `faixa` usa la codificación del estudio de agosto de 2026 (Keyword Planner):
 * b = 10–100 · c = 100–1 mil · d = 1 mil–10 mil · e = 10 mil–100 mil.
 * `estimada: true` marca las faixas no medidas directamente.
 */

export type Faixa = "b" | "c" | "d" | "e";
export type Silo = "cumplimiento" | "integracion" | "servicios" | "local" | "institucional";

export interface KeywordPrimaria {
  /** Ruta sin locale ni barra inicial, tal y como aparece en `src/pages`. */
  path: string;
  /** Locales en los que la ruta existe e es indexable. */
  locales: readonly ("es" | "en" | "pt")[];
  silo: Silo;
  primaria: string;
  secundarias?: readonly string[];
  faixa?: Faixa;
  estimada?: boolean;
}

export const KEYWORDS_PRIMARIAS: readonly KeywordPrimaria[] = [
  // ---------------------------------------------------------------- SILO 1
  {
    path: "cumplimiento/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "cumplimiento normativo",
    secundarias: ["normativa digital empresas", "obligaciones tecnológicas 2027"],
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/verifactu/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "verifactu",
    secundarias: ["qué es verifactu", "reglamento verifactu", "verifactu que es"],
    faixa: "e",
  },
  {
    path: "cumplimiento/verifactu/api/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "api verifactu",
    secundarias: ["api aeat verifactu", "servicio web verifactu", "conectar verifactu aeat"],
    faixa: "c",
  },
  {
    path: "cumplimiento/verifactu/integracion/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "integrar verifactu",
    secundarias: ["adaptar software a verifactu", "conector verifactu"],
    faixa: "b",
  },
  {
    path: "cumplimiento/verifactu/plazos/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "verifactu obligatorio",
    secundarias: ["verifactu cuando entra en vigor", "verifactu 2027", "verifactu autónomos"],
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/verifactu/erp-a-medida/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "verifactu erp",
    secundarias: ["erp a medida verifactu"],
    faixa: "b",
  },
  {
    path: "cumplimiento/verifactu/tpv-multitienda/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "verifactu tpv",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/verifactu/ecommerce-propio/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "verifactu ecommerce",
    secundarias: ["prestashop verifactu", "woocommerce verifactu"],
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/verifactu/software-vertical/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "verifactu software vertical",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "ley de atención al cliente",
    secundarias: [
      "ley atención al cliente",
      "nueva ley de atención al cliente",
      "ley de atención a la clientela",
      "ley 10/2025",
    ],
    faixa: "c",
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/energia-agua-gas/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "ley atención al cliente energía",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/transporte-viajeros/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "ley atención al cliente transporte de viajeros",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/servicios-postales/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "ley atención al cliente servicios postales",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/telecomunicaciones/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "ley atención al cliente telecomunicaciones",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/servicios-financieros/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "ley atención al cliente servicios financieros",
    faixa: "b",
    estimada: true,
  },
  {
    path: "cumplimiento/ley-atencion-al-cliente/test/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "test cumplimiento ley atención al cliente",
    faixa: "b",
    estimada: true,
  },

  // ---------------------------------------------------------------- SILO 2
  // El hub MVP existe desde el Sprint A (destino de la puerta 1 de la home);
  // los hijos y los 301 llegan en el Sprint C. `auditoria-de-sistemas` sigue
  // por ahora en la raíz; se moverá dentro del silo con su 301.
  {
    path: "integracion/",
    locales: ["es"],
    silo: "integracion",
    primaria: "integración de sistemas",
    secundarias: ["integración y automatización de sistemas", "integración de aplicaciones"],
    faixa: "c",
  },
  {
    path: "auditoria-de-sistemas/",
    locales: ["es", "en", "pt"],
    silo: "integracion",
    primaria: "auditoría informática",
    secundarias: ["radiografía digital", "auditoría de sistemas"],
    faixa: "b",
    estimada: true,
  },
  {
    path: "roadmap-tecnologico/",
    locales: ["es", "en", "pt"],
    silo: "integracion",
    primaria: "roadmap tecnológico",
    faixa: "b",
    estimada: true,
  },
  {
    path: "implementacion/",
    locales: ["es", "en", "pt"],
    silo: "integracion",
    primaria: "implementación tecnológica",
    faixa: "b",
    estimada: true,
  },

  // ---------------------------------------------------------------- SILO 3
  {
    path: "servicios/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "servicios de automatización e ia",
    faixa: "b",
    estimada: true,
  },
  {
    path: "servicios/automatizacion-ia/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "automatización de procesos",
    secundarias: ["automatización inteligente", "rpa", "automatización"],
    faixa: "c",
  },
  {
    path: "servicios/chatbots/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "chatbot para empresas",
    secundarias: ["chatbots para empresas", "chatbot atención al cliente"],
    faixa: "c",
  },
  {
    // ⚠️ CONFLICTO PENDIENTE DE DECISIÓN (Sprint 0, 09/ago/2026).
    // Search Console (90 días) muestra que Google sirve /es/agencia-de-ia/ —
    // no esta página — para todo el clúster: "agencia de ia" (146 impresiones),
    // "agencia de inteligencia artificial" (119), "agencia ia" (51),
    // "agencia con ia" (43). Esta URL tiene 7 impresiones; la otra, 505.
    // Ambas en posición media 77,9 y 0 clics, así que no hay tráfico en juego,
    // pero sí una señal clara de qué URL asocia Google al clúster.
    // Las primarias se mantienen separadas para no bloquear el build mientras
    // se decide la consolidación. NO es una separación real de intención.
    path: "servicios/agencia-ia/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "agencia de inteligencia artificial",
    secundarias: ["agencia inteligencia artificial"],
    faixa: "c",
  },
  {
    // Ver nota en servicios/agencia-ia/. Esta es la URL que Google sirve hoy.
    path: "agencia-de-ia/",
    locales: ["es"],
    silo: "local",
    primaria: "agencia de ia",
    secundarias: ["agencia ia", "agencias ia", "agencia con ia", "agencia de ia en españa"],
    faixa: "c",
  },
  {
    // Verificado en SERP (09/ago/2026): solo 1 dominio en común en el top 10 con
    // `agencia de inteligencia artificial`. No hay canibalización — se mantiene
    // como página propia.
    path: "servicios/consultoria-ia/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "consultoría inteligencia artificial",
    secundarias: ["consultoria de ia", "estrategia de ia para empresas"],
    faixa: "c",
  },
  {
    path: "servicios/agencia-seo/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "agencia seo",
    secundarias: ["posicionamiento web", "posicionamiento seo", "consultor seo"],
    faixa: "d",
  },
  {
    path: "servicios/diseno-web/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "diseño web",
    secundarias: ["diseño de paginas web", "agencia de diseño web"],
    faixa: "d",
  },
  {
    path: "servicios/marketing-digital/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "marketing digital",
    secundarias: ["agencia de marketing digital", "agencia de marketing"],
    faixa: "e",
  },

  // ------------------------------------------------------------- LOCAL (ES)
  {
    path: "agencia-de-ia/madrid/",
    locales: ["es"],
    silo: "local",
    primaria: "agencia de ia madrid",
    faixa: "b",
    estimada: true,
  },
  {
    path: "agencia-de-ia/barcelona/",
    locales: ["es"],
    silo: "local",
    primaria: "agencia de ia barcelona",
    faixa: "b",
    estimada: true,
  },
  {
    path: "agencia-de-ia/valencia/",
    locales: ["es"],
    silo: "local",
    primaria: "agencia de ia valencia",
    faixa: "b",
    estimada: true,
  },
];

/**
 * Rutas indexables que existen pero no persiguen ninguna keyword: home,
 * institucionales, índices y detalles de colección. No entran en la regla de
 * unicidad, pero se declaran para que el script sepa que no son un olvido.
 */
export const RUTAS_SIN_KEYWORD: readonly string[] = [
  "", // home
  "sobre/",
  "contact/",
  "blog/",
  "portfolio/",
  "autores/luiz-fernando-brazao/",
  "terminos-y-condiciones/",
  "politica-de-privacidad/",
  "roadmap/",
  "metodologia/",
  "estudio/segunda-factura-ia/encuesta/",
];
