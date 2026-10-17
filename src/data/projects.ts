// src/data/projects.ts

export type ProjectPillar = {
    titleKey: string;
    descriptionKey: string;
    bulletsKeys?: string[];
};

export type ProjectMetric = {
    labelKey: string;
    value: string;
    noteKey?: string;
};

export type ProjectLink = {
    label: string;
    labelKey?: string;
    href: string;
    external?: boolean;
};

export type ProjectTestimonial = {
    quoteKey: string;
    authorKey: string;
    roleKey: string;
};

export type ProjectFaqItem = {
    qKey: string;
    aKey: string;
};

export type ProjectForWho = {
    yesKeys: string[];
    noKeys: string[];
};

export type Project = {
    id: number;
    slugs: { es: string; en: string; pt: string };
    publishedAt: string;
    updatedAt?: string;

    category: string;
    categoryKey?: string;
    heroImage: string;
    ogImage?: string;
    gallery?: { src: string; altKey?: string }[];

    seoTitleKey?: string;
    titleKey: string;
    h1Key?: string;
    subtitleKey?: string;
    taglineKey: string;
    signalKey?: string;
    ctaTitleKey?: string;
    ctaSubtitleKey?: string;
    relatedServiceKey?: string;
    relatedServiceHref?: string;
    /**
     * Destino por idioma cuando el servicio de `relatedServiceHref` no existe en
     * ese locale (p. ej. `/hoteles/` es ES-only). Sin esto, EN/PT enlazaban a
     * `/en/hoteles/` y `/pt/hoteles/`, que dan 404. Leer siempre con
     * `getRelatedServiceHref()`. `null` = sin enlace en ese idioma (productos
     * ES-only sin equivalente).
     */
    relatedServiceHrefByLocale?: Partial<Record<"es" | "en" | "pt", string | null>>;
    serviceAudienceKey?: string;
    /** Tipo de servicio para el JSON-LD `Service` de la ficha (antes era "Auditoría tecnológica" para todos). */
    serviceTypeKey?: string;
    serviceAreas?: string[];

    /**
     * Clave dentro de `src/data/web-vitals.json`. Si está presente, la ficha
     * renderiza el bloque de rendimiento medido (`WebVitalsCard.astro`).
     *
     * El dato lo produce `scripts/measure-psi.mjs` contra la API de PageSpeed
     * Insights de Google: no se escribe a mano y no es una captura de pantalla,
     * así que se puede refrescar con un comando y auditar por fecha.
     */
    webVitalsKey?: string;

    /**
     * Páginas para las que este caso funciona como prueba. Rutas sin locale ni
     * barra inicial, p. ej. "servicios/agencia-seo/".
     *
     * Es el lado inverso de `relatedServiceHref`: el caso apunta a su servicio,
     * y el servicio recupera sus casos leyendo esta lista desde
     * `RelatedCases.astro`. Una sola fuente de verdad para el enlace en ambas
     * direcciones, en vez de listas duplicadas en cada landing.
     */
    provesFor?: string[];

    problemKey: string;
    contextKey?: string;
    engineeringIntroKey: string;
    impactKey: string;
    iaReadinessKey?: string;
    deliverablesKeys?: string[];

    whatItDoesKeys: string[];
    howItWorksKeys: string[];
    pillars: ProjectPillar[];
    securityKeys: string[];
    /**
     * Chips técnicos que acompañan al bloque de seguridad. Por defecto la ficha
     * añade "AES-GCM / RLS", que es cierto en los proyectos de SaaS pero no en
     * los de web: pasar `[]` lo desactiva en vez de afirmar algo que no se hizo.
     */
    securityStack?: string[];
    metrics?: ProjectMetric[];
    testimonial?: ProjectTestimonial;
    forWho?: ProjectForWho;
    faq?: ProjectFaqItem[];

    pricing?: {
        monthly?: { price: string; detailsKeys?: string[] };
        annual?: { price: string; detailsKeys?: string[] };
        trialKey?: string;
    };

    links: ProjectLink[];
};

/** Enlace caso → servicio ya con prefijo de locale, o `undefined` si no hay. */
export function getRelatedServiceHref(project: Project, locale: string): string | undefined {
    const byLocale = project.relatedServiceHrefByLocale?.[locale as "es" | "en" | "pt"];
    if (byLocale === null) return undefined;
    const href = byLocale ?? project.relatedServiceHref;
    return href ? `/${locale}${href}` : undefined;
}

export const projects: Project[] = [
    // =========================
    // Cadena hotelera Menorca — Radiografía Digital
    // =========================
    {
        id: 3,
        slugs: {
            es: "radiografia-cadena-hotelera-menorca",
            en: "hotel-chain-digital-audit-menorca",
            pt: "radiografia-rede-hoteleira-menorca",
        },

        provesFor: [
            "auditoria-de-sistemas/",
            "integracion/",
            "arquitectura-tecnologica/",
        ],
        publishedAt: "2025-04-10",

        category: "Auditoría tecnológica / Hotelería",
        categoryKey: "projects:menorcaHotelChain.category",
        heroImage:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
        ogImage: "/og/portfolio-radiografia-cadena-hotelera-menorca.png",

        gallery: [
            {
                src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
                altKey: "projects:menorcaHotelChain.gallery.heroAlt",
            },
        ],

        seoTitleKey: "projects:menorcaHotelChain.seoTitle",
        titleKey: "projects:menorcaHotelChain.title",
        serviceTypeKey: "projects:menorcaHotelChain.serviceType",
        h1Key: "projects:menorcaHotelChain.h1",
        subtitleKey: "projects:menorcaHotelChain.subtitle",
        taglineKey: "projects:menorcaHotelChain.tagline",
        signalKey: "projects:menorcaHotelChain.signal",
        ctaTitleKey: "projects:menorcaHotelChain.ctaTitle",
        ctaSubtitleKey: "projects:menorcaHotelChain.ctaSubtitle",
        relatedServiceKey: "projects:menorcaHotelChain.relatedService",
        relatedServiceHref: "/hoteles/",
        relatedServiceHrefByLocale: { en: "/auditoria-de-sistemas/", pt: "/auditoria-de-sistemas/" },
        serviceAudienceKey: "projects:menorcaHotelChain.serviceAudience",
        serviceAreas: ["Menorca", "España"],

        problemKey: "projects:menorcaHotelChain.problem",
        contextKey: "projects:menorcaHotelChain.context",
        engineeringIntroKey: "projects:menorcaHotelChain.engineeringIntro",
        impactKey: "projects:menorcaHotelChain.impact",
        iaReadinessKey: "projects:menorcaHotelChain.iaReadiness",
        deliverablesKeys: [
            "projects:menorcaHotelChain.deliverables.0",
            "projects:menorcaHotelChain.deliverables.1",
            "projects:menorcaHotelChain.deliverables.2",
            "projects:menorcaHotelChain.deliverables.3",
            "projects:menorcaHotelChain.deliverables.4",
        ],

        whatItDoesKeys: [
            "projects:menorcaHotelChain.whatItDoes.0",
            "projects:menorcaHotelChain.whatItDoes.1",
            "projects:menorcaHotelChain.whatItDoes.2",
            "projects:menorcaHotelChain.whatItDoes.3",
            "projects:menorcaHotelChain.whatItDoes.4",
            "projects:menorcaHotelChain.whatItDoes.5",
        ],

        howItWorksKeys: [
            "projects:menorcaHotelChain.howItWorks.0",
            "projects:menorcaHotelChain.howItWorks.1",
            "projects:menorcaHotelChain.howItWorks.2",
            "projects:menorcaHotelChain.howItWorks.3",
            "projects:menorcaHotelChain.howItWorks.4",
            "projects:menorcaHotelChain.howItWorks.5",
        ],

        pillars: [
            {
                titleKey: "projects:menorcaHotelChain.pillars.0.title",
                descriptionKey: "projects:menorcaHotelChain.pillars.0.description",
                bulletsKeys: [
                    "projects:menorcaHotelChain.pillars.0.bullets.0",
                    "projects:menorcaHotelChain.pillars.0.bullets.1",
                    "projects:menorcaHotelChain.pillars.0.bullets.2",
                ],
            },
            {
                titleKey: "projects:menorcaHotelChain.pillars.1.title",
                descriptionKey: "projects:menorcaHotelChain.pillars.1.description",
                bulletsKeys: [
                    "projects:menorcaHotelChain.pillars.1.bullets.0",
                    "projects:menorcaHotelChain.pillars.1.bullets.1",
                    "projects:menorcaHotelChain.pillars.1.bullets.2",
                ],
            },
            {
                titleKey: "projects:menorcaHotelChain.pillars.2.title",
                descriptionKey: "projects:menorcaHotelChain.pillars.2.description",
                bulletsKeys: [
                    "projects:menorcaHotelChain.pillars.2.bullets.0",
                    "projects:menorcaHotelChain.pillars.2.bullets.1",
                    "projects:menorcaHotelChain.pillars.2.bullets.2",
                ],
            },
        ],

        securityKeys: [
            "projects:menorcaHotelChain.security.0",
            "projects:menorcaHotelChain.security.1",
            "projects:menorcaHotelChain.security.2",
        ],

        testimonial: {
            quoteKey: "projects:menorcaHotelChain.testimonial.quote",
            authorKey: "projects:menorcaHotelChain.testimonial.author",
            roleKey: "projects:menorcaHotelChain.testimonial.role",
        },

        forWho: {
            yesKeys: [
                "projects:menorcaHotelChain.forWho.yes.0",
                "projects:menorcaHotelChain.forWho.yes.1",
                "projects:menorcaHotelChain.forWho.yes.2",
                "projects:menorcaHotelChain.forWho.yes.3",
                "projects:menorcaHotelChain.forWho.yes.4",
            ],
            noKeys: [
                "projects:menorcaHotelChain.forWho.no.0",
                "projects:menorcaHotelChain.forWho.no.1",
                "projects:menorcaHotelChain.forWho.no.2",
            ],
        },

        faq: [
            { qKey: "projects:menorcaHotelChain.faq.0.q", aKey: "projects:menorcaHotelChain.faq.0.a" },
            { qKey: "projects:menorcaHotelChain.faq.1.q", aKey: "projects:menorcaHotelChain.faq.1.a" },
            { qKey: "projects:menorcaHotelChain.faq.2.q", aKey: "projects:menorcaHotelChain.faq.2.a" },
            { qKey: "projects:menorcaHotelChain.faq.3.q", aKey: "projects:menorcaHotelChain.faq.3.a" },
            { qKey: "projects:menorcaHotelChain.faq.4.q", aKey: "projects:menorcaHotelChain.faq.4.a" },
        ],

        metrics: [
            {
                labelKey: "projects:menorcaHotelChain.metrics.0.label",
                value: "47",
                noteKey: "projects:menorcaHotelChain.metrics.0.note",
            },
            {
                labelKey: "projects:menorcaHotelChain.metrics.1.label",
                value: "12",
                noteKey: "projects:menorcaHotelChain.metrics.1.note",
            },
            {
                labelKey: "projects:menorcaHotelChain.metrics.2.label",
                value: "23%",
                noteKey: "projects:menorcaHotelChain.metrics.2.note",
            },
            {
                labelKey: "projects:menorcaHotelChain.metrics.3.label",
                value: "3",
                noteKey: "projects:menorcaHotelChain.metrics.3.note",
            },
        ],

        links: [
            {
                label: "Solicitar propuesta",
                labelKey: "projects:menorcaHotelChain.links.0.label",
                href: "/contact/",
            },
            {
                label: "Ver Radiografía Digital",
                labelKey: "projects:menorcaHotelChain.links.1.label",
                href: "/auditoria-de-sistemas/",
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:menorcaHotelChain.links.2.label",
                href: "/portfolio/",
            },
        ],
    },

    // =========================
    // ChatPlug
    // =========================
    {
        id: 1,
        slugs: {
            es: "chatplug-whatsapp-altegio",
            en: "chatplug-whatsapp-altegio",
            pt: "chatplug-whatsapp-altegio",
        },

        provesFor: [
            "servicios/chatbots/",
            "servicios/automatizacion-ia/",
            "integracion/",
            "integracion/whatsapp-business-api/",
            "arquitectura-tecnologica/",
        ],
        publishedAt: "2025-03-01",

        category: "SaaS / CRM Integration",
        categoryKey: "projects:chatplug.category",
        heroImage:
            "https://s3.eu-north-1.amazonaws.com/ia-operators/IA+Operators+Website/common-whatsapp-mistakes-beauty-salon.webp",

        gallery: [
            {
                src: "https://s3.eu-north-1.amazonaws.com/ia-operators/IA+Operators+Website/common-whatsapp-mistakes-beauty-salon.webp",
                altKey: "projects:chatplug.gallery.heroAlt",
            },
        ],

        titleKey: "projects:chatplug.title",
        serviceTypeKey: "projects:chatplug.serviceType",
        taglineKey: "projects:chatplug.tagline",

        problemKey: "projects:chatplug.problem",
        engineeringIntroKey: "projects:chatplug.engineeringIntro",
        impactKey: "projects:chatplug.impact",

        whatItDoesKeys: [
            "projects:chatplug.whatItDoes.0",
            "projects:chatplug.whatItDoes.1",
            "projects:chatplug.whatItDoes.2",
            "projects:chatplug.whatItDoes.3",
            "projects:chatplug.whatItDoes.4",
            "projects:chatplug.whatItDoes.5",
            "projects:chatplug.whatItDoes.6",
        ],

        howItWorksKeys: [
            "projects:chatplug.howItWorks.0",
            "projects:chatplug.howItWorks.1",
            "projects:chatplug.howItWorks.2",
            "projects:chatplug.howItWorks.3",
            "projects:chatplug.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:chatplug.pillars.integration.title",
                descriptionKey: "projects:chatplug.pillars.integration.description",
                bulletsKeys: [
                    "projects:chatplug.pillars.integration.bullets.0",
                    "projects:chatplug.pillars.integration.bullets.1",
                    "projects:chatplug.pillars.integration.bullets.2",
                ],
            },
            {
                titleKey: "projects:chatplug.pillars.multilingual.title",
                descriptionKey: "projects:chatplug.pillars.multilingual.description",
                bulletsKeys: [
                    "projects:chatplug.pillars.multilingual.bullets.0",
                    "projects:chatplug.pillars.multilingual.bullets.1",
                ],
            },
            {
                titleKey: "projects:chatplug.pillars.security.title",
                descriptionKey: "projects:chatplug.pillars.security.description",
                bulletsKeys: [
                    "projects:chatplug.pillars.security.bullets.0",
                    "projects:chatplug.pillars.security.bullets.1",
                    "projects:chatplug.pillars.security.bullets.2",
                ],
            },
        ],

        securityKeys: [
            "projects:chatplug.security.0",
            "projects:chatplug.security.1",
            "projects:chatplug.security.2",
            "projects:chatplug.security.3",
        ],

        pricing: {
            monthly: {
                price: "€19/mês",
                detailsKeys: [
                    "projects:chatplug.pricing.monthly.details.0",
                    "projects:chatplug.pricing.monthly.details.1",
                    "projects:chatplug.pricing.monthly.details.2",
                    "projects:chatplug.pricing.monthly.details.3",
                ],
            },
            annual: {
                price: "€169/ano",
                detailsKeys: [
                    "projects:chatplug.pricing.annual.details.0",
                    "projects:chatplug.pricing.annual.details.1",
                    "projects:chatplug.pricing.annual.details.2",
                    "projects:chatplug.pricing.annual.details.3",
                ],
            },
            trialKey: "projects:chatplug.pricing.trial",
        },

        metrics: [
            {
                labelKey: "projects:chatplug.metrics.0.label",
                value: "24/7",
                noteKey: "projects:chatplug.metrics.0.note",
            },
            {
                labelKey: "projects:chatplug.metrics.1.label",
                // Idiomas listados en el caso: PT/EN/ES/FR/RU.
                value: "5",
                noteKey: "projects:chatplug.metrics.1.note",
            },
            {
                labelKey: "projects:chatplug.metrics.2.label",
                value: "∞",
                noteKey: "projects:chatplug.metrics.2.note",
            },
        ],

        links: [
            {
                label: "Acessar produto (Live)",
                labelKey: "projects:chatplug.links.0.label",
                href: "https://chatplug.iaoperators.com",
                external: true,
            },
            {
                label: "Voltar ao portfolio",
                labelKey: "projects:chatplug.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Chatbot Reservas Turísticas
    // =========================
    {
        id: 2,
        slugs: {
            es: "chatbot-reservas-turisticas-whatsapp",
            en: "tourism-booking-chatbot-whatsapp",
            pt: "chatbot-reservas-turisticas-whatsapp",
        },

        provesFor: [
            "servicios/chatbots/",
            "servicios/automatizacion-ia/",
            "integracion/",
        ],
        publishedAt: "2025-02-15",

        category: "Automação de Reservas / WhatsApp",
        categoryKey: "projects:tourBooking.category",
        heroImage:
            "https://i.ytimg.com/vi/tLRpDAQc7i4/maxresdefault.jpg",

        gallery: [
            {
                src: "https://i.ytimg.com/vi/tLRpDAQc7i4/maxresdefault.jpg",
                altKey: "projects:tourBooking.gallery.heroAlt"
            }
        ],


        titleKey: "projects:tourBooking.title",
        serviceTypeKey: "projects:tourBooking.serviceType",
        taglineKey: "projects:tourBooking.tagline",

        problemKey: "projects:tourBooking.problem",
        engineeringIntroKey: "projects:tourBooking.engineeringIntro",
        impactKey: "projects:tourBooking.impact",

        whatItDoesKeys: [
            "projects:tourBooking.whatItDoes.0",
            "projects:tourBooking.whatItDoes.1",
            "projects:tourBooking.whatItDoes.2",
            "projects:tourBooking.whatItDoes.3",
            "projects:tourBooking.whatItDoes.4",
            "projects:tourBooking.whatItDoes.5",
        ],

        howItWorksKeys: [
            "projects:tourBooking.howItWorks.0",
            "projects:tourBooking.howItWorks.1",
            "projects:tourBooking.howItWorks.2",
            "projects:tourBooking.howItWorks.3",
            "projects:tourBooking.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:tourBooking.pillars.0.title",
                descriptionKey: "projects:tourBooking.pillars.0.description",
                bulletsKeys: [
                    "projects:tourBooking.pillars.0.bullets.0",
                    "projects:tourBooking.pillars.0.bullets.1",
                    "projects:tourBooking.pillars.0.bullets.2",
                ],
            },
            {
                titleKey: "projects:tourBooking.pillars.1.title",
                descriptionKey: "projects:tourBooking.pillars.1.description",
                bulletsKeys: [
                    "projects:tourBooking.pillars.1.bullets.0",
                    "projects:tourBooking.pillars.1.bullets.1",
                    "projects:tourBooking.pillars.1.bullets.2",
                ],
            },
            {
                titleKey: "projects:tourBooking.pillars.2.title",
                descriptionKey: "projects:tourBooking.pillars.2.description",
                bulletsKeys: [
                    "projects:tourBooking.pillars.2.bullets.0",
                    "projects:tourBooking.pillars.2.bullets.1",
                    "projects:tourBooking.pillars.2.bullets.2",
                ],
            },
        ],

        securityKeys: [
            "projects:tourBooking.security.0",
            "projects:tourBooking.security.1",
            "projects:tourBooking.security.2",
        ],

        metrics: [
            {
                labelKey: "projects:tourBooking.metrics.0.label",
                value: "100%",
                noteKey: "projects:tourBooking.metrics.0.note",
            },
            {
                labelKey: "projects:tourBooking.metrics.1.label",
                value: "15s",
                noteKey: "projects:tourBooking.metrics.1.note",
            },
            {
                labelKey: "projects:tourBooking.metrics.2.label",
                value: "4",
                noteKey: "projects:tourBooking.metrics.2.note",
            },
        ],

        links: [
            {
                label: "Acessar produto (WhatsApp)",
                labelKey: "projects:tourBooking.links.0.label",
                href: "https://wa.me/34665403456",
                external: true
            },
            {
                label: "Assistir vídeo (YouTube)",
                labelKey: "projects:tourBooking.links.1.label",
                href: "https://www.youtube.com/watch?v=tLRpDAQc7i4",
                external: true,
            },
            {
                label: "Ver comunidade",
                labelKey: "projects:tourBooking.links.2.label",
                href: "https://www.skool.com/ia-operators-hub-9023/about",
                external: true,
            },
            {
                label: "Voltar ao portfolio",
                labelKey: "projects:tourBooking.links.3.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Propiziare Immigra — web trilingüe + SEO técnico
    // =========================
    // Las cifras de rendimiento NO están aquí: viven en web-vitals.json, medidas
    // con la API de PageSpeed Insights. `webVitalsKey` es el único vínculo.
    {
        id: 4,
        slugs: {
            es: "propiziare-immigra-web-seo",
            en: "propiziare-immigra-web-seo",
            pt: "propiziare-immigra-web-seo",
        },

        provesFor: [
            "servicios/agencia-seo/",
            "servicios/diseno-web/",
        ],
        publishedAt: "2026-08-10",

        category: "Web + SEO técnico / Asesoría de inmigración",
        categoryKey: "projects:propiziare.category",

        // TODO(Luiz): sustituir por una captura propia subida a S3. Ahora mismo
        // apunta a la og:image del cliente, que puede cambiar sin avisarnos.
        heroImage: "https://propiziareimmigra.com/img/og.jpg",

        gallery: [
            {
                src: "https://propiziareimmigra.com/img/og.jpg",
                altKey: "projects:propiziare.gallery.heroAlt",
            },
        ],

        seoTitleKey: "projects:propiziare.seoTitle",
        titleKey: "projects:propiziare.title",
        serviceTypeKey: "projects:propiziare.serviceType",
        h1Key: "projects:propiziare.h1",
        subtitleKey: "projects:propiziare.subtitle",
        taglineKey: "projects:propiziare.tagline",
        signalKey: "projects:propiziare.signal",

        relatedServiceKey: "projects:propiziare.relatedService",
        relatedServiceHref: "/servicios/agencia-seo/",

        problemKey: "projects:propiziare.problem",
        contextKey: "projects:propiziare.context",
        engineeringIntroKey: "projects:propiziare.engineeringIntro",
        impactKey: "projects:propiziare.impact",

        webVitalsKey: "propiziaReimmigra",

        whatItDoesKeys: [
            "projects:propiziare.whatItDoes.0",
            "projects:propiziare.whatItDoes.1",
            "projects:propiziare.whatItDoes.2",
            "projects:propiziare.whatItDoes.3",
            "projects:propiziare.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:propiziare.howItWorks.0",
            "projects:propiziare.howItWorks.1",
            "projects:propiziare.howItWorks.2",
            "projects:propiziare.howItWorks.3",
            "projects:propiziare.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:propiziare.pillars.trilingual.title",
                descriptionKey: "projects:propiziare.pillars.trilingual.description",
                bulletsKeys: [
                    "projects:propiziare.pillars.trilingual.bullets.0",
                    "projects:propiziare.pillars.trilingual.bullets.1",
                    "projects:propiziare.pillars.trilingual.bullets.2",
                ],
            },
            {
                titleKey: "projects:propiziare.pillars.noThirdParty.title",
                descriptionKey: "projects:propiziare.pillars.noThirdParty.description",
                bulletsKeys: [
                    "projects:propiziare.pillars.noThirdParty.bullets.0",
                    "projects:propiziare.pillars.noThirdParty.bullets.1",
                    "projects:propiziare.pillars.noThirdParty.bullets.2",
                ],
            },
            {
                titleKey: "projects:propiziare.pillars.entity.title",
                descriptionKey: "projects:propiziare.pillars.entity.description",
                bulletsKeys: [
                    "projects:propiziare.pillars.entity.bullets.0",
                    "projects:propiziare.pillars.entity.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:propiziare.security.0",
            "projects:propiziare.security.1",
            "projects:propiziare.security.2",
        ],

        // Aquí no hubo cifrado ni RLS: no se firma lo que no se hizo.
        securityStack: [],

        metrics: [
            {
                labelKey: "projects:propiziare.metrics.0.label",
                value: "100",
                noteKey: "projects:propiziare.metrics.0.note",
            },
            {
                labelKey: "projects:propiziare.metrics.1.label",
                value: "0",
                noteKey: "projects:propiziare.metrics.1.note",
            },
            {
                labelKey: "projects:propiziare.metrics.2.label",
                value: "3",
                noteKey: "projects:propiziare.metrics.2.note",
            },
        ],

        faq: [
            { qKey: "projects:propiziare.faq.0.q", aKey: "projects:propiziare.faq.0.a" },
            { qKey: "projects:propiziare.faq.1.q", aKey: "projects:propiziare.faq.1.a" },
            { qKey: "projects:propiziare.faq.2.q", aKey: "projects:propiziare.faq.2.a" },
        ],

        links: [
            {
                label: "Ver sitio en producción",
                labelKey: "projects:propiziare.links.0.label",
                href: "https://propiziareimmigra.com/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:propiziare.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Hotel Revenue Operator — Fase 1 (validación, sin SaaS todavía)
    // =========================
    // Fase 1 = landing + calculadora + captación. No hay asistente construido: la ficha no lo afirma.
    {
        id: 5,
        slugs: {
            es: "hotel-revenue-operator-reservas-directas",
            en: "hotel-revenue-operator-direct-bookings",
            pt: "hotel-revenue-operator-reservas-diretas",
        },
        publishedAt: "2026-10-14",

        category: "Producto propio / Hotelería",
        categoryKey: "projects:hotelRevenue.category",
        heroImage: "/og/es/hotel-revenue-operator.png",
        ogImage: "/og/es/hotel-revenue-operator.png",

        seoTitleKey: "projects:hotelRevenue.seoTitle",
        titleKey: "projects:hotelRevenue.title",
        serviceTypeKey: "projects:hotelRevenue.serviceType",
        h1Key: "projects:hotelRevenue.h1",
        subtitleKey: "projects:hotelRevenue.subtitle",
        taglineKey: "projects:hotelRevenue.tagline",
        signalKey: "projects:hotelRevenue.signal",
        relatedServiceKey: "projects:hotelRevenue.relatedService",
        relatedServiceHref: "/hoteles/reservas-directas-ia/",
        // Página ES-only: en EN/PT no hay destino equivalente.
        relatedServiceHrefByLocale: { en: null, pt: null },
        serviceAreas: ["España"],

        problemKey: "projects:hotelRevenue.problem",
        contextKey: "projects:hotelRevenue.context",
        engineeringIntroKey: "projects:hotelRevenue.engineeringIntro",
        impactKey: "projects:hotelRevenue.impact",

        whatItDoesKeys: [
            "projects:hotelRevenue.whatItDoes.0",
            "projects:hotelRevenue.whatItDoes.1",
            "projects:hotelRevenue.whatItDoes.2",
            "projects:hotelRevenue.whatItDoes.3",
            "projects:hotelRevenue.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:hotelRevenue.howItWorks.0",
            "projects:hotelRevenue.howItWorks.1",
            "projects:hotelRevenue.howItWorks.2",
            "projects:hotelRevenue.howItWorks.3",
            "projects:hotelRevenue.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:hotelRevenue.pillars.validation.title",
                descriptionKey: "projects:hotelRevenue.pillars.validation.description",
                bulletsKeys: [
                    "projects:hotelRevenue.pillars.validation.bullets.0",
                    "projects:hotelRevenue.pillars.validation.bullets.1",
                    "projects:hotelRevenue.pillars.validation.bullets.2",
                ],
            },
            {
                titleKey: "projects:hotelRevenue.pillars.versioned.title",
                descriptionKey: "projects:hotelRevenue.pillars.versioned.description",
                bulletsKeys: [
                    "projects:hotelRevenue.pillars.versioned.bullets.0",
                    "projects:hotelRevenue.pillars.versioned.bullets.1",
                    "projects:hotelRevenue.pillars.versioned.bullets.2",
                ],
            },
            {
                titleKey: "projects:hotelRevenue.pillars.honest.title",
                descriptionKey: "projects:hotelRevenue.pillars.honest.description",
                bulletsKeys: [
                    "projects:hotelRevenue.pillars.honest.bullets.0",
                    "projects:hotelRevenue.pillars.honest.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:hotelRevenue.security.0",
            "projects:hotelRevenue.security.1",
            "projects:hotelRevenue.security.2",
        ],
        securityStack: ["Supabase (service role)", "Analítica sin PII"],

        metrics: [
            { labelKey: "projects:hotelRevenue.metrics.0.label", value: "3", noteKey: "projects:hotelRevenue.metrics.0.note" },
            { labelKey: "projects:hotelRevenue.metrics.1.label", value: "7", noteKey: "projects:hotelRevenue.metrics.1.note" },
            { labelKey: "projects:hotelRevenue.metrics.2.label", value: "1.0.0", noteKey: "projects:hotelRevenue.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:hotelRevenue.faq.0.q", aKey: "projects:hotelRevenue.faq.0.a" },
            { qKey: "projects:hotelRevenue.faq.1.q", aKey: "projects:hotelRevenue.faq.1.a" },
            { qKey: "projects:hotelRevenue.faq.2.q", aKey: "projects:hotelRevenue.faq.2.a" },
        ],

        links: [
            {
                label: "Ver Hotel Revenue Operator",
                labelKey: "projects:hotelRevenue.links.0.label",
                href: "https://iaoperators.com/es/hoteles/reservas-directas-ia/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:hotelRevenue.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // RGPD Ops Starter — producto de pago (ES-only)
    // =========================
    // Precio sin IVA, igual que src/data/rgpd-ops.ts. Si cambia allí, cambiar aquí.
    {
        id: 6,
        slugs: {
            es: "rgpd-ops-starter",
            en: "rgpd-ops-starter",
            pt: "rgpd-ops-starter",
        },
        publishedAt: "2026-10-13",

        category: "Producto propio / Cumplimiento",
        categoryKey: "projects:rgpdOps.category",
        heroImage: "/og/es/rgpd-ops.png",
        ogImage: "/og/es/rgpd-ops.png",

        seoTitleKey: "projects:rgpdOps.seoTitle",
        titleKey: "projects:rgpdOps.title",
        serviceTypeKey: "projects:rgpdOps.serviceType",
        h1Key: "projects:rgpdOps.h1",
        subtitleKey: "projects:rgpdOps.subtitle",
        taglineKey: "projects:rgpdOps.tagline",
        signalKey: "projects:rgpdOps.signal",
        relatedServiceKey: "projects:rgpdOps.relatedService",
        relatedServiceHref: "/cumplimiento/rgpd/",
        // Página ES-only: en EN/PT no hay destino equivalente.
        relatedServiceHrefByLocale: { en: null, pt: null },
        serviceAreas: ["España"],

        problemKey: "projects:rgpdOps.problem",
        contextKey: "projects:rgpdOps.context",
        engineeringIntroKey: "projects:rgpdOps.engineeringIntro",
        impactKey: "projects:rgpdOps.impact",

        whatItDoesKeys: [
            "projects:rgpdOps.whatItDoes.0",
            "projects:rgpdOps.whatItDoes.1",
            "projects:rgpdOps.whatItDoes.2",
            "projects:rgpdOps.whatItDoes.3",
            "projects:rgpdOps.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:rgpdOps.howItWorks.0",
            "projects:rgpdOps.howItWorks.1",
            "projects:rgpdOps.howItWorks.2",
            "projects:rgpdOps.howItWorks.3",
            "projects:rgpdOps.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:rgpdOps.pillars.operation.title",
                descriptionKey: "projects:rgpdOps.pillars.operation.description",
                bulletsKeys: [
                    "projects:rgpdOps.pillars.operation.bullets.0",
                    "projects:rgpdOps.pillars.operation.bullets.1",
                    "projects:rgpdOps.pillars.operation.bullets.2",
                ],
            },
            {
                titleKey: "projects:rgpdOps.pillars.minimization.title",
                descriptionKey: "projects:rgpdOps.pillars.minimization.description",
                bulletsKeys: [
                    "projects:rgpdOps.pillars.minimization.bullets.0",
                    "projects:rgpdOps.pillars.minimization.bullets.1",
                    "projects:rgpdOps.pillars.minimization.bullets.2",
                ],
            },
            {
                titleKey: "projects:rgpdOps.pillars.limits.title",
                descriptionKey: "projects:rgpdOps.pillars.limits.description",
                bulletsKeys: [
                    "projects:rgpdOps.pillars.limits.bullets.0",
                    "projects:rgpdOps.pillars.limits.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:rgpdOps.security.0",
            "projects:rgpdOps.security.1",
            "projects:rgpdOps.security.2",
        ],
        securityStack: ["Funciones SQL con lista blanca", "HMAC-SHA256"],

        metrics: [
            { labelKey: "projects:rgpdOps.metrics.0.label", value: "8", noteKey: "projects:rgpdOps.metrics.0.note" },
            { labelKey: "projects:rgpdOps.metrics.1.label", value: "149 €", noteKey: "projects:rgpdOps.metrics.1.note" },
            { labelKey: "projects:rgpdOps.metrics.2.label", value: "0", noteKey: "projects:rgpdOps.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:rgpdOps.faq.0.q", aKey: "projects:rgpdOps.faq.0.a" },
            { qKey: "projects:rgpdOps.faq.1.q", aKey: "projects:rgpdOps.faq.1.a" },
            { qKey: "projects:rgpdOps.faq.2.q", aKey: "projects:rgpdOps.faq.2.a" },
        ],

        links: [
            {
                label: "Ver RGPD Ops Starter",
                labelKey: "projects:rgpdOps.links.0.label",
                href: "https://iaoperators.com/es/cumplimiento/rgpd/ops/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:rgpdOps.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Ruta Nacionalidad — área privada (por Propiziare Immigra)
    // =========================
    // Sin repo local en esta sesión: todo lo afirmado sale de las páginas públicas (app, condiciones y calculadora).
    {
        id: 7,
        slugs: {
            es: "ruta-nacionalidad",
            en: "ruta-nacionalidad",
            pt: "ruta-nacionalidad",
        },
        publishedAt: "2026-10-16",

        category: "Producto propio / Extranjería",
        categoryKey: "projects:rutaNacionalidad.category",
        heroImage: "/og/portfolio/ruta-nacionalidad.png",
        ogImage: "/og/portfolio/ruta-nacionalidad.png",

        seoTitleKey: "projects:rutaNacionalidad.seoTitle",
        titleKey: "projects:rutaNacionalidad.title",
        serviceTypeKey: "projects:rutaNacionalidad.serviceType",
        h1Key: "projects:rutaNacionalidad.h1",
        subtitleKey: "projects:rutaNacionalidad.subtitle",
        taglineKey: "projects:rutaNacionalidad.tagline",
        signalKey: "projects:rutaNacionalidad.signal",
        serviceAreas: ["España"],

        problemKey: "projects:rutaNacionalidad.problem",
        contextKey: "projects:rutaNacionalidad.context",
        engineeringIntroKey: "projects:rutaNacionalidad.engineeringIntro",
        impactKey: "projects:rutaNacionalidad.impact",

        whatItDoesKeys: [
            "projects:rutaNacionalidad.whatItDoes.0",
            "projects:rutaNacionalidad.whatItDoes.1",
            "projects:rutaNacionalidad.whatItDoes.2",
            "projects:rutaNacionalidad.whatItDoes.3",
            "projects:rutaNacionalidad.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:rutaNacionalidad.howItWorks.0",
            "projects:rutaNacionalidad.howItWorks.1",
            "projects:rutaNacionalidad.howItWorks.2",
            "projects:rutaNacionalidad.howItWorks.3",
            "projects:rutaNacionalidad.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:rutaNacionalidad.pillars.continuity.title",
                descriptionKey: "projects:rutaNacionalidad.pillars.continuity.description",
                bulletsKeys: [
                    "projects:rutaNacionalidad.pillars.continuity.bullets.0",
                    "projects:rutaNacionalidad.pillars.continuity.bullets.1",
                    "projects:rutaNacionalidad.pillars.continuity.bullets.2",
                ],
            },
            {
                titleKey: "projects:rutaNacionalidad.pillars.privacy.title",
                descriptionKey: "projects:rutaNacionalidad.pillars.privacy.description",
                bulletsKeys: [
                    "projects:rutaNacionalidad.pillars.privacy.bullets.0",
                    "projects:rutaNacionalidad.pillars.privacy.bullets.1",
                ],
            },
            {
                titleKey: "projects:rutaNacionalidad.pillars.honest.title",
                descriptionKey: "projects:rutaNacionalidad.pillars.honest.description",
                bulletsKeys: [
                    "projects:rutaNacionalidad.pillars.honest.bullets.0",
                    "projects:rutaNacionalidad.pillars.honest.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:rutaNacionalidad.security.0",
            "projects:rutaNacionalidad.security.1",
            "projects:rutaNacionalidad.security.2",
        ],
        securityStack: [],

        metrics: [
            { labelKey: "projects:rutaNacionalidad.metrics.0.label", value: "5", noteKey: "projects:rutaNacionalidad.metrics.0.note" },
            { labelKey: "projects:rutaNacionalidad.metrics.1.label", value: "365", noteKey: "projects:rutaNacionalidad.metrics.1.note" },
            { labelKey: "projects:rutaNacionalidad.metrics.2.label", value: "2", noteKey: "projects:rutaNacionalidad.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:rutaNacionalidad.faq.0.q", aKey: "projects:rutaNacionalidad.faq.0.a" },
            { qKey: "projects:rutaNacionalidad.faq.1.q", aKey: "projects:rutaNacionalidad.faq.1.a" },
        ],

        links: [
            {
                label: "Ver Ruta Nacionalidad",
                labelKey: "projects:rutaNacionalidad.links.0.label",
                href: "https://app.propiziareimmigra.com/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:rutaNacionalidad.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Un Rato — WhatsApp + IA con revisión humana (validación)
    // =========================
    // Asignación al profesional (W5) aún no implementada: la ficha lo dice. Sin métricas de uso todavía.
    {
        id: 8,
        slugs: {
            es: "un-rato-fontaneria-whatsapp-malaga",
            en: "un-rato-whatsapp-plumbing-malaga",
            pt: "un-rato-encanador-whatsapp-malaga",
        },

        provesFor: ["servicios/chatbots/", "servicios/automatizacion-ia/"],
        publishedAt: "2026-09-28",

        category: "Producto propio / WhatsApp + IA",
        categoryKey: "projects:unRato.category",
        heroImage: "/og/portfolio/un-rato-fontaneria-whatsapp-malaga.png",
        ogImage: "/og/portfolio/un-rato-fontaneria-whatsapp-malaga.png",

        seoTitleKey: "projects:unRato.seoTitle",
        titleKey: "projects:unRato.title",
        serviceTypeKey: "projects:unRato.serviceType",
        h1Key: "projects:unRato.h1",
        subtitleKey: "projects:unRato.subtitle",
        taglineKey: "projects:unRato.tagline",
        signalKey: "projects:unRato.signal",
        relatedServiceKey: "projects:unRato.relatedService",
        relatedServiceHref: "/servicios/chatbots/",
        serviceAreas: ["Málaga"],

        problemKey: "projects:unRato.problem",
        engineeringIntroKey: "projects:unRato.engineeringIntro",
        impactKey: "projects:unRato.impact",

        whatItDoesKeys: [
            "projects:unRato.whatItDoes.0",
            "projects:unRato.whatItDoes.1",
            "projects:unRato.whatItDoes.2",
            "projects:unRato.whatItDoes.3",
            "projects:unRato.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:unRato.howItWorks.0",
            "projects:unRato.howItWorks.1",
            "projects:unRato.howItWorks.2",
            "projects:unRato.howItWorks.3",
            "projects:unRato.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:unRato.pillars.bounded.title",
                descriptionKey: "projects:unRato.pillars.bounded.description",
                bulletsKeys: [
                    "projects:unRato.pillars.bounded.bullets.0",
                    "projects:unRato.pillars.bounded.bullets.1",
                    "projects:unRato.pillars.bounded.bullets.2",
                ],
            },
            {
                titleKey: "projects:unRato.pillars.human.title",
                descriptionKey: "projects:unRato.pillars.human.description",
                bulletsKeys: [
                    "projects:unRato.pillars.human.bullets.0",
                    "projects:unRato.pillars.human.bullets.1",
                ],
            },
            {
                titleKey: "projects:unRato.pillars.trust.title",
                descriptionKey: "projects:unRato.pillars.trust.description",
                bulletsKeys: [
                    "projects:unRato.pillars.trust.bullets.0",
                    "projects:unRato.pillars.trust.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:unRato.security.0",
            "projects:unRato.security.1",
            "projects:unRato.security.2",
        ],
        securityStack: ["HMAC-SHA256 (webhook)", "RLS"],

        metrics: [
            { labelKey: "projects:unRato.metrics.0.label", value: "8", noteKey: "projects:unRato.metrics.0.note" },
            { labelKey: "projects:unRato.metrics.1.label", value: "21", noteKey: "projects:unRato.metrics.1.note" },
            { labelKey: "projects:unRato.metrics.2.label", value: "4", noteKey: "projects:unRato.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:unRato.faq.0.q", aKey: "projects:unRato.faq.0.a" },
            { qKey: "projects:unRato.faq.1.q", aKey: "projects:unRato.faq.1.a" },
        ],

        links: [
            {
                label: "Ver Un Rato",
                labelKey: "projects:unRato.links.0.label",
                href: "https://unrato.es/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:unRato.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // PsicoSprint — psicotécnicos con motor adaptativo determinista
    // =========================
    // El banco de preguntas se redactó con IA fuera de línea y se revisó; el motor es determinista. No decir que la IA genera preguntas en tiempo real.
    {
        id: 9,
        slugs: {
            es: "psicosprint-test-psicotecnicos-oposiciones",
            en: "psicosprint-psychometric-tests",
            pt: "psicosprint-testes-psicotecnicos",
        },
        publishedAt: "2026-10-15",

        category: "Producto propio / Formación",
        categoryKey: "projects:psicoSprint.category",
        heroImage: "/og/portfolio/psicosprint-test-psicotecnicos-oposiciones.png",
        ogImage: "/og/portfolio/psicosprint-test-psicotecnicos-oposiciones.png",

        seoTitleKey: "projects:psicoSprint.seoTitle",
        titleKey: "projects:psicoSprint.title",
        serviceTypeKey: "projects:psicoSprint.serviceType",
        h1Key: "projects:psicoSprint.h1",
        subtitleKey: "projects:psicoSprint.subtitle",
        taglineKey: "projects:psicoSprint.tagline",
        signalKey: "projects:psicoSprint.signal",
        serviceAreas: ["España"],

        problemKey: "projects:psicoSprint.problem",
        engineeringIntroKey: "projects:psicoSprint.engineeringIntro",
        impactKey: "projects:psicoSprint.impact",

        whatItDoesKeys: [
            "projects:psicoSprint.whatItDoes.0",
            "projects:psicoSprint.whatItDoes.1",
            "projects:psicoSprint.whatItDoes.2",
            "projects:psicoSprint.whatItDoes.3",
            "projects:psicoSprint.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:psicoSprint.howItWorks.0",
            "projects:psicoSprint.howItWorks.1",
            "projects:psicoSprint.howItWorks.2",
            "projects:psicoSprint.howItWorks.3",
            "projects:psicoSprint.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:psicoSprint.pillars.deterministic.title",
                descriptionKey: "projects:psicoSprint.pillars.deterministic.description",
                bulletsKeys: [
                    "projects:psicoSprint.pillars.deterministic.bullets.0",
                    "projects:psicoSprint.pillars.deterministic.bullets.1",
                ],
            },
            {
                titleKey: "projects:psicoSprint.pillars.content.title",
                descriptionKey: "projects:psicoSprint.pillars.content.description",
                bulletsKeys: [
                    "projects:psicoSprint.pillars.content.bullets.0",
                    "projects:psicoSprint.pillars.content.bullets.1",
                    "projects:psicoSprint.pillars.content.bullets.2",
                ],
            },
            {
                titleKey: "projects:psicoSprint.pillars.trust.title",
                descriptionKey: "projects:psicoSprint.pillars.trust.description",
                bulletsKeys: [
                    "projects:psicoSprint.pillars.trust.bullets.0",
                    "projects:psicoSprint.pillars.trust.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:psicoSprint.security.0",
            "projects:psicoSprint.security.1",
            "projects:psicoSprint.security.2",
        ],
        securityStack: ["RLS", "CSP"],

        metrics: [
            { labelKey: "projects:psicoSprint.metrics.0.label", value: "6", noteKey: "projects:psicoSprint.metrics.0.note" },
            { labelKey: "projects:psicoSprint.metrics.1.label", value: "315", noteKey: "projects:psicoSprint.metrics.1.note" },
            { labelKey: "projects:psicoSprint.metrics.2.label", value: "15", noteKey: "projects:psicoSprint.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:psicoSprint.faq.0.q", aKey: "projects:psicoSprint.faq.0.a" },
            { qKey: "projects:psicoSprint.faq.1.q", aKey: "projects:psicoSprint.faq.1.a" },
        ],

        links: [
            {
                label: "Ver PsicoSprint",
                labelKey: "projects:psicoSprint.links.0.label",
                href: "https://psicosprint.iaoperators.com/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:psicoSprint.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Sunday Campers — web, reservas y rendimiento
    // =========================
    // Sin webVitalsKey a propósito: web-vitals.json tiene la medición de ANTES (10/ago). Re-medir con
    // `node scripts/measure-psi.mjs --only sundayCampers` y entonces añadir webVitalsKey + visual "web-vitals".
    {
        id: 10,
        slugs: {
            es: "sunday-campers-web-alquiler-campers",
            en: "sunday-campers-camper-rental-website",
            pt: "sunday-campers-site-aluguel-campers",
        },

        provesFor: ["servicios/diseno-web/", "servicios/agencia-seo/"],
        publishedAt: "2026-10-17",

        category: "Web + reservas / Turismo",
        categoryKey: "projects:sundayCampers.category",
        heroImage: "/og/portfolio/sunday-campers-web-alquiler-campers.png",
        ogImage: "/og/portfolio/sunday-campers-web-alquiler-campers.png",

        seoTitleKey: "projects:sundayCampers.seoTitle",
        titleKey: "projects:sundayCampers.title",
        serviceTypeKey: "projects:sundayCampers.serviceType",
        h1Key: "projects:sundayCampers.h1",
        subtitleKey: "projects:sundayCampers.subtitle",
        taglineKey: "projects:sundayCampers.tagline",
        signalKey: "projects:sundayCampers.signal",
        relatedServiceKey: "projects:sundayCampers.relatedService",
        relatedServiceHref: "/servicios/diseno-web/",
        serviceAreas: ["Málaga", "Andalucía"],

        problemKey: "projects:sundayCampers.problem",
        contextKey: "projects:sundayCampers.context",
        engineeringIntroKey: "projects:sundayCampers.engineeringIntro",
        impactKey: "projects:sundayCampers.impact",

        whatItDoesKeys: [
            "projects:sundayCampers.whatItDoes.0",
            "projects:sundayCampers.whatItDoes.1",
            "projects:sundayCampers.whatItDoes.2",
            "projects:sundayCampers.whatItDoes.3",
            "projects:sundayCampers.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:sundayCampers.howItWorks.0",
            "projects:sundayCampers.howItWorks.1",
            "projects:sundayCampers.howItWorks.2",
            "projects:sundayCampers.howItWorks.3",
            "projects:sundayCampers.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:sundayCampers.pillars.booking.title",
                descriptionKey: "projects:sundayCampers.pillars.booking.description",
                bulletsKeys: [
                    "projects:sundayCampers.pillars.booking.bullets.0",
                    "projects:sundayCampers.pillars.booking.bullets.1",
                    "projects:sundayCampers.pillars.booking.bullets.2",
                ],
            },
            {
                titleKey: "projects:sundayCampers.pillars.performance.title",
                descriptionKey: "projects:sundayCampers.pillars.performance.description",
                bulletsKeys: [
                    "projects:sundayCampers.pillars.performance.bullets.0",
                    "projects:sundayCampers.pillars.performance.bullets.1",
                    "projects:sundayCampers.pillars.performance.bullets.2",
                ],
            },
            {
                titleKey: "projects:sundayCampers.pillars.international.title",
                descriptionKey: "projects:sundayCampers.pillars.international.description",
                bulletsKeys: [
                    "projects:sundayCampers.pillars.international.bullets.0",
                    "projects:sundayCampers.pillars.international.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:sundayCampers.security.0",
            "projects:sundayCampers.security.1",
            "projects:sundayCampers.security.2",
        ],
        securityStack: [],

        metrics: [
            { labelKey: "projects:sundayCampers.metrics.0.label", value: "9", noteKey: "projects:sundayCampers.metrics.0.note" },
            { labelKey: "projects:sundayCampers.metrics.1.label", value: "48", noteKey: "projects:sundayCampers.metrics.1.note" },
            { labelKey: "projects:sundayCampers.metrics.2.label", value: "1", noteKey: "projects:sundayCampers.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:sundayCampers.faq.0.q", aKey: "projects:sundayCampers.faq.0.a" },
            { qKey: "projects:sundayCampers.faq.1.q", aKey: "projects:sundayCampers.faq.1.a" },
        ],

        links: [
            {
                label: "Ver el sitio en producción",
                labelKey: "projects:sundayCampers.links.0.label",
                href: "https://sundaycampers.es/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:sundayCampers.links.1.label",
                href: "/portfolio",
            },
        ],
    },

    // =========================
    // Renuva — renovaciones de la regularización extraordinaria (piloto)
    // =========================
    // Piloto: sin despachos reales todavía, checklists pendientes de revisión de abogado.
    {
        id: 11,
        slugs: {
            es: "renuva-renovaciones-regularizacion-extraordinaria",
            en: "renuva-regularisation-renewals",
            pt: "renuva-renovacoes-regularizacao",
        },
        publishedAt: "2026-10-17",

        category: "Producto propio / Extranjería",
        categoryKey: "projects:renuva.category",
        heroImage: "/og/portfolio/renuva-renovaciones-regularizacion-extraordinaria.png",
        ogImage: "/og/portfolio/renuva-renovaciones-regularizacion-extraordinaria.png",

        seoTitleKey: "projects:renuva.seoTitle",
        titleKey: "projects:renuva.title",
        serviceTypeKey: "projects:renuva.serviceType",
        h1Key: "projects:renuva.h1",
        subtitleKey: "projects:renuva.subtitle",
        taglineKey: "projects:renuva.tagline",
        signalKey: "projects:renuva.signal",
        serviceAreas: ["España"],

        problemKey: "projects:renuva.problem",
        engineeringIntroKey: "projects:renuva.engineeringIntro",
        impactKey: "projects:renuva.impact",

        whatItDoesKeys: [
            "projects:renuva.whatItDoes.0",
            "projects:renuva.whatItDoes.1",
            "projects:renuva.whatItDoes.2",
            "projects:renuva.whatItDoes.3",
            "projects:renuva.whatItDoes.4",
        ],

        howItWorksKeys: [
            "projects:renuva.howItWorks.0",
            "projects:renuva.howItWorks.1",
            "projects:renuva.howItWorks.2",
            "projects:renuva.howItWorks.3",
            "projects:renuva.howItWorks.4",
        ],

        pillars: [
            {
                titleKey: "projects:renuva.pillars.tenancy.title",
                descriptionKey: "projects:renuva.pillars.tenancy.description",
                bulletsKeys: [
                    "projects:renuva.pillars.tenancy.bullets.0",
                    "projects:renuva.pillars.tenancy.bullets.1",
                    "projects:renuva.pillars.tenancy.bullets.2",
                ],
            },
            {
                titleKey: "projects:renuva.pillars.sensitive.title",
                descriptionKey: "projects:renuva.pillars.sensitive.description",
                bulletsKeys: [
                    "projects:renuva.pillars.sensitive.bullets.0",
                    "projects:renuva.pillars.sensitive.bullets.1",
                    "projects:renuva.pillars.sensitive.bullets.2",
                ],
            },
            {
                titleKey: "projects:renuva.pillars.whatsapp.title",
                descriptionKey: "projects:renuva.pillars.whatsapp.description",
                bulletsKeys: [
                    "projects:renuva.pillars.whatsapp.bullets.0",
                    "projects:renuva.pillars.whatsapp.bullets.1",
                ],
            },
        ],

        securityKeys: [
            "projects:renuva.security.0",
            "projects:renuva.security.1",
            "projects:renuva.security.2",
        ],

        metrics: [
            { labelKey: "projects:renuva.metrics.0.label", value: "17", noteKey: "projects:renuva.metrics.0.note" },
            { labelKey: "projects:renuva.metrics.1.label", value: "48", noteKey: "projects:renuva.metrics.1.note" },
            { labelKey: "projects:renuva.metrics.2.label", value: "3", noteKey: "projects:renuva.metrics.2.note" },
        ],

        faq: [
            { qKey: "projects:renuva.faq.0.q", aKey: "projects:renuva.faq.0.a" },
            { qKey: "projects:renuva.faq.1.q", aKey: "projects:renuva.faq.1.a" },
        ],

        links: [
            {
                label: "Ver Renuva",
                labelKey: "projects:renuva.links.0.label",
                href: "https://renuva.iaoperators.com/",
                external: true,
            },
            {
                label: "Volver al portfolio",
                labelKey: "projects:renuva.links.1.label",
                href: "/portfolio",
            },
        ],
    },

];
