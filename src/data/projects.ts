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
    serviceAudienceKey?: string;
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
        h1Key: "projects:menorcaHotelChain.h1",
        subtitleKey: "projects:menorcaHotelChain.subtitle",
        taglineKey: "projects:menorcaHotelChain.tagline",
        signalKey: "projects:menorcaHotelChain.signal",
        ctaTitleKey: "projects:menorcaHotelChain.ctaTitle",
        ctaSubtitleKey: "projects:menorcaHotelChain.ctaSubtitle",
        relatedServiceKey: "projects:menorcaHotelChain.relatedService",
        relatedServiceHref: "/auditoria-de-sistemas/",
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
                value: "6+",
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
];
