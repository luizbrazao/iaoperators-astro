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
    href: string;
    external?: boolean;
};

export type Project = {
    id: number;
    slug: string;

    category: string;
    heroImage: string;
    gallery?: { src: string; altKey?: string }[];

    titleKey: string;
    taglineKey: string;

    problemKey: string;
    engineeringIntroKey: string;
    impactKey: string;

    whatItDoesKeys: string[];
    howItWorksKeys: string[];
    pillars: ProjectPillar[];
    securityKeys: string[];
    metrics?: ProjectMetric[];

    pricing?: {
        monthly?: { price: string; detailsKeys?: string[] };
        annual?: { price: string; detailsKeys?: string[] };
        trialKey?: string;
    };

    links: ProjectLink[];
};

export const projects: Project[] = [
    // =========================
    // ChatPlug
    // =========================
    {
        id: 1,
        slug: "chatplug-whatsapp-altegio",

        category: "SaaS / CRM Integration",
        heroImage:
            "https://ia-operators.s3.eu-north-1.amazonaws.com/ChatGPT-Image-28-de-ago.-de-2025_-09_52_35-min.webp",

        gallery: [
            {
                src: "https://ia-operators.s3.eu-north-1.amazonaws.com/ChatGPT-Image-28-de-ago.-de-2025_-09_52_35-min.webp",
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
                value: "Ilimitadas",
                noteKey: "projects:chatplug.metrics.2.note",
            },
        ],

        links: [
            {
                label: "Acessar produto (Live)",
                href: "https://chatplug.iaoperators.com",
                external: true,
            },
            { label: "Voltar ao portfolio", href: "/portfolio" },
        ],
    },

    // =========================
    // Chatbot Reservas Turísticas
    // =========================
    {
        id: 2,
        slug: "chatbot-reservas-turisticas-whatsapp",

        category: "Automação de Reservas / WhatsApp",
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
                href: "https://wa.me/34665403456",
                external: true
            },
            {
                label: "Assistir vídeo (YouTube)",
                href: "https://www.youtube.com/watch?v=tLRpDAQc7i4",
                external: true,
            },
            {
                label: "Ver comunidade",
                href: "https://www.skool.com/ia-operators-hub-9023/about",
                external: true,
            },
            { label: "Voltar ao portfolio", href: "/portfolio" },
        ],
    },
];
