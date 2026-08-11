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
    path: "cumplimiento/verifactu/test/",
    locales: ["es"],
    silo: "cumplimiento",
    primaria: "test verifactu",
    secundarias: ["verifactu me aplica", "comprobar verifactu"],
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
  // Hijos del hub (Sprint C). Los sirve src/pages/es/integracion/[caso].astro
  // sobre src/data/integracion.ts; los slugs de ambos ficheros deben coincidir.
  {
    // SERP inspeccionada 10/ago/2026 (google.es): informativa de arriba abajo —
    // IBM, SAP, OpenText, AtroCore y blogs de agencias respondiendo "¿qué es la
    // integración ERP?", con "Más preguntas" en el primer bloque. La primaria se
    // mantiene porque es el término que describe el servicio y no hay variante
    // comercial con demanda, pero esta landing NO va a rankear por ella: la
    // entrada orgánica de este clúster tiene que venir de un post. Ver §12.
    path: "integracion/erp/",
    locales: ["es"],
    silo: "integracion",
    primaria: "integración erp",
    secundarias: ["conectar erp", "integrar erp con ecommerce", "erp para pymes"],
    faixa: "c",
    estimada: true,
  },
  {
    // CORREGIDA 10/ago/2026 tras inspeccionar la SERP. La primaria era
    // "crm para empresas", que el plan (§6.2) daba por comercial. No lo es: la
    // SERP la sirven comparativas de producto —"Los mejores 6 CRM", HubSpot,
    // Cyberclick, Salesforce, Zoho, Ringover—. Es una query de quien va a
    // COMPRAR un CRM, y nosotros no vendemos CRM: los integramos. Aunque
    // rankeáramos, el tráfico sería de la intención equivocada.
    path: "integracion/crm/",
    locales: ["es"],
    silo: "integracion",
    primaria: "integrar crm con erp",
    secundarias: ["automatizar crm", "integración de crm", "sincronizar crm y erp"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integracion/whatsapp-business-api/",
    locales: ["es"],
    silo: "integracion",
    primaria: "whatsapp business api",
    secundarias: ["api de whatsapp business", "automatizar whatsapp", "integrar whatsapp con crm"],
    faixa: "d",
  },
  {
    path: "integracion/api-y-webhooks/",
    locales: ["es"],
    silo: "integracion",
    primaria: "integración de api",
    secundarias: ["webhooks", "conectar aplicaciones por api", "integración por api"],
    faixa: "b",
    estimada: true,
  },
  {
    // El plan cita esta ruta dos veces con primarias distintas (§4 la lista como
    // "integración de sistemas", §6 como "software a medida"). Vale §6: repetir
    // la primaria del hub la canibalizaría, que es justo lo que el registro evita.
    path: "integracion/sistemas-legados/",
    locales: ["es"],
    silo: "integracion",
    primaria: "software a medida",
    secundarias: ["modernizar sistema legado", "integrar software antiguo", "desarrollo a medida"],
    faixa: "c",
    estimada: true,
  },

  // ----- Los cinco casos traducidos (fase 4, ago/2026) ---------------------
  //
  // El slug se localiza salvo cuando es sigla o nombre de producto: `erp`,
  // `crm` y `whatsapp-business-api` son idénticos en los tres idiomas porque
  // traducirlos inventaría una query que nadie escribe.
  //
  // `whatsapp business api` es primaria de la ruta española Y de la inglesa. No
  // es canibalización: son la misma intención en dos idiomas, resuelta por
  // hreflang recíproco. El gate `check:keywords` compara por idioma desde esta
  // fase precisamente por este caso — antes habría fallado el build.
  {
    path: "integration/erp/",
    locales: ["en"],
    silo: "integracion",
    primaria: "erp integration",
    secundarias: ["connect erp", "erp integration services", "integrate erp with ecommerce"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integration/crm/",
    locales: ["en"],
    silo: "integracion",
    primaria: "crm integration",
    secundarias: ["integrate crm with erp", "crm automation", "sync crm and erp"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integration/whatsapp-business-api/",
    locales: ["en"],
    silo: "integracion",
    primaria: "whatsapp business api",
    secundarias: ["whatsapp business api integration", "automate whatsapp", "whatsapp api pricing"],
    faixa: "d",
    estimada: true,
  },
  {
    path: "integration/api-and-webhooks/",
    locales: ["en"],
    silo: "integracion",
    primaria: "api integration",
    secundarias: ["webhooks", "custom api integration", "connect applications by api"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integration/legacy-systems/",
    locales: ["en"],
    silo: "integracion",
    primaria: "legacy system modernization",
    secundarias: ["legacy system integration", "modernize legacy software", "custom software development"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integracao/erp/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "integração de erp",
    secundarias: ["conectar erp", "integrar erp com ecommerce", "integração de sistemas erp"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integracao/crm/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "integrar crm com erp",
    secundarias: ["automatizar crm", "integração de crm", "sincronizar crm e erp"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integracao/whatsapp-business-api/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "api do whatsapp business",
    secundarias: ["whatsapp business api", "automatizar whatsapp", "integrar whatsapp com crm"],
    faixa: "d",
    estimada: true,
  },
  {
    path: "integracao/api-e-webhooks/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "integração de api",
    secundarias: ["webhooks", "integração via api", "conectar aplicações por api"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integracao/sistemas-legados/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "modernizar sistema legado",
    secundarias: ["integrar software antigo", "sistema legado", "desenvolvimento sob medida"],
    faixa: "c",
    estimada: true,
  },
  {
    // Hub del pilar (fase 2). Frontera declarada con sus tres hijas: aquí la
    // disciplina —cómo debe estar organizada la tecnología—, allí el servicio
    // concreto de cada paso. Si esta página empieza a competir por
    // "auditoría informática" habrá que reescribirla, no redirigirla.
    path: "arquitectura-tecnologica/",
    locales: ["es"],
    silo: "integracion",
    primaria: "arquitectura tecnológica",
    secundarias: [
      "arquitectura de sistemas empresariales",
      "arquitectura tecnológica empresarial",
      "arquitectura de integración",
    ],
    faixa: "b",
    estimada: true,
  },
  // Hubs traducidos (ago/2026). Slug localizado, no espejo del español: una URL
  // en castellano dentro de /en/ contradice la señal de idioma de la ruta.
  // Cada idioma necesita su propia entrada porque `path` es la ruta sin locale
  // y aquí NO coincide entre idiomas. Las primarias no chocan —lenguas
  // distintas, tokens distintos— y son a propósito el equivalente exacto: es la
  // misma intención servida tres veces, que es lo que resuelve el hreflang
  // recíproco y no la regla de canibalización.
  {
    path: "integration/",
    locales: ["en"],
    silo: "integracion",
    primaria: "systems integration",
    secundarias: [
      "enterprise systems integration",
      "erp integration services",
      "application integration",
    ],
    faixa: "c",
    estimada: true,
  },
  {
    path: "integracao/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "integração de sistemas",
    secundarias: ["integração e automação de sistemas", "integração de aplicações"],
    faixa: "c",
    estimada: true,
  },
  {
    path: "technology-architecture/",
    locales: ["en"],
    silo: "integracion",
    primaria: "technology architecture",
    secundarias: ["enterprise technology architecture", "systems architecture consulting"],
    faixa: "b",
    estimada: true,
  },
  {
    path: "arquitetura-tecnologica/",
    locales: ["pt"],
    silo: "integracion",
    primaria: "arquitetura tecnológica",
    secundarias: ["arquitetura de sistemas empresariais", "arquitetura tecnológica empresarial"],
    faixa: "b",
    estimada: true,
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
    // El plan (§6.2) asignaba "agentes de ia" a esta URL. La SERP de esa query
    // en google.es es informativa —Google Cloud, IBM, Salesforce, AWS y Xataka
    // respondiendo "¿qué son?"— y ya la cubre el post del blog. El hueco
    // comercial está en la variante con modificador, que es la que se registra.
    path: "servicios/agentes-de-ia/",
    locales: ["es"],
    silo: "servicios",
    primaria: "agentes de ia para empresas",
    secundarias: ["agentes de ia empresas", "desarrollo de agentes de ia", "implantar agentes de ia"],
    faixa: "c",
    estimada: true,
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
    // ↑ Ese aviso sigue vigente y se refiere al conflicto con /es/agencia-de-ia/,
    // que continúa abierto.
    //
    // Fase 2 (10/ago/2026): lo que sí quedó resuelto es la frontera con
    // `servicios/consultoria-ia/`. Esta página es la etapa de EJECUCIÓN —diseño
    // técnico, construcción, integración, producción y mantenimiento— y ya no
    // vende estrategia: "Estrategia y consultoría de IA" era su capacidad nº 1 y
    // se retiró. Las secundarias evitan el vocabulario de decisión.
    path: "servicios/agencia-ia/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "agencia de inteligencia artificial",
    secundarias: [
      "agencia inteligencia artificial",
      "desarrollo de soluciones de ia",
      "implantación de ia en empresas",
    ],
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
    //
    // Fase 2 (10/ago/2026): la separación con `servicios/agencia-ia/` deja de ser
    // solo nominal. Esta página cubre la etapa de DECISIÓN —dónde aplicar IA, qué
    // priorizar, comprar o construir, con qué retorno— y termina en el roadmap.
    // La construcción se fue entera a la otra URL. Las secundarias se eligen en
    // ese eje: ninguna habla de implementar.
    path: "servicios/consultoria-ia/",
    locales: ["es", "en", "pt"],
    silo: "servicios",
    primaria: "consultoría inteligencia artificial",
    secundarias: [
      "consultoria de ia",
      "estrategia de ia para empresas",
      "casos de uso de ia en empresas",
    ],
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
  "metodologia/",
  "estudio/segunda-factura-ia/encuesta/",
];
