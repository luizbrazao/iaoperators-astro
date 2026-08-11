// Copy del hub del silo de integración, en los tres idiomas.
//
// Hasta agosto de 2026 este texto vivía dentro de
// `src/pages/es/integracion/index.astro`, porque el silo era ES-only. Al pasar
// a tres idiomas, dejarlo en la página habría significado tres ficheros con la
// misma estructura divergiendo a la primera corrección. El markup vive ahora en
// `src/sections/silos/IntegracionHub.astro` y lee de aquí.
//
// El bloque `es` es literal respecto a la versión publicada: la traducción no es
// excusa para reescribir una página que ya está midiendo en Search Console.
//
// EN y PT no son traducción palabra a palabra. Dos diferencias deliberadas:
//   1. Ninguna referencia a normativa española (Verifactu, Ley 10/2025). La
//      obligación es española; el silo de cumplimiento sigue siendo ES-only.
//   2. "TPV" se traduce por su equivalente real de mercado —POS en inglés,
//      PDV en portugués—, no se deja en español.
//
// El H1 se parte en dos porque la segunda mitad va dentro de un <span> naranja.

import type { Loc } from "@/data/integracion";

export interface CapacidadHub {
  /** Identifica el destino; el componente decide el href por idioma. */
  key: "erp" | "api-y-webhooks" | "crm" | "whatsapp-business-api" | "automatizacion" | "sistemas-legados";
  title: string;
  body: string;
}

export interface HubIntegracionCopy {
  meta: { title: string; description: string };
  breadcrumbHome: string;
  breadcrumbSelf: string;
  serviceName: string;
  serviceType: string;
  h1: { lead: string; accent: string };
  heroBody: string;
  heroCta: string;
  queEs: { title: string; p1: string; p2: string };
  problema: { title: string; subtitle: string; items: { title: string; body: string }[] };
  metodo: { title: string; items: { step: string; title: string; body: string }[] };
  capacidades: { title: string; subtitle: string; cta: string; items: CapacidadHub[] };
  caso: { badge: string; pre: string; accent: string; post: string; body: string };
  radiografia: { title: string; body: string; cta: string };
  ctaFinal: { title: string; cta: string };
}

export const HUB_INTEGRACION: Record<Loc, HubIntegracionCopy> = {
  es: {
    meta: {
      title: "Integración de sistemas para empresas | IA Operators",
      description:
        "Integración de sistemas para empresas: ERP, TPV, e-commerce, CRM y WhatsApp. Conectamos tu stack actual y automatizamos procesos de punta a punta.",
    },
    breadcrumbHome: "Inicio",
    breadcrumbSelf: "Integración y automatización",
    serviceName: "Integración de sistemas para empresas",
    serviceType: "Integración de sistemas y automatización empresarial",
    h1: { lead: "Integración y automatización de sistemas ", accent: "para empresas" },
    heroBody:
      "Conectamos ERP, TPV, e-commerce, CRM y WhatsApp sobre los sistemas que ya usas, con IA donde aporta. De la estrategia a producción, con el mismo equipo.",
    heroCta: "Hablar con un especialista ↗",
    queEs: {
      title: "Qué es la integración de sistemas empresariales",
      p1: "La integración de sistemas conecta las aplicaciones que una empresa ya utiliza para que intercambien datos y ejecuten procesos sin intervención manual. ERP, CRM, TPV, e-commerce, facturación, WhatsApp o herramientas internas dejan de funcionar como islas y pasan a formar parte de un mismo flujo operativo.",
      p2: "El objetivo no es añadir más software, sino conseguir que el existente trabaje junto: menos datos duplicados, menos tareas manuales, menos errores y una operación más fácil de controlar.",
    },
    problema: {
      title: "Tu empresa tiene más tecnología de la que realmente controla",
      subtitle:
        "El problema casi nunca es que falte una herramienta. Es que las que hay no trabajan juntas.",
      items: [
        {
          title: "Sistemas que no se hablan",
          body: "El ERP en un sitio, el TPV en otro, el e-commerce por su cuenta y el CRM al margen. Cada isla obliga a copiar datos a mano y multiplica los errores.",
        },
        {
          title: "Trabajo manual que no escala",
          body: "Pedidos que se transcriben, facturas que se reconcilian a ojo, partes que se pasan por WhatsApp. Horas de trabajo cualificado gastadas en mover información.",
        },
        {
          title: "Más tecnología de la que se controla",
          body: "Licencias duplicadas, herramientas que nadie recuerda haber contratado, integraciones frágiles que dependen de una persona. El parque crece; el control, no.",
        },
      ],
    },
    metodo: {
      title: "Diagnóstico, prioridad e implementación — sin hand-offs",
      items: [
        {
          step: "01",
          title: "Diagnóstico",
          body: "Inventariamos sistemas, flujos de datos y dependencias reales. Qué existe, qué se usa, qué se rompe y por dónde se escapa el tiempo.",
        },
        {
          step: "02",
          title: "Prioridad",
          body: "Ordenamos por impacto y esfuerzo: qué integración elimina más trabajo manual con menos riesgo. Un plan corto, no un informe de cien páginas.",
        },
        {
          step: "03",
          title: "Implementación",
          body: "El mismo equipo que diagnostica construye: conectores, automatizaciones y paneles en producción, con pruebas y mantenimiento. Sin hand-offs.",
        },
      ],
    },
    capacidades: {
      title: "Qué integramos y automatizamos",
      subtitle:
        "Cada bloque tiene su propia página con los flujos concretos que hay que resolver y dónde se rompen habitualmente.",
      cta: "Ver cómo lo hacemos →",
      items: [
        {
          key: "erp",
          title: "ERP",
          body: "Conectamos tu ERP —propio o de mercado— con el resto del negocio: pedidos, stock, facturación y reporting.",
        },
        {
          key: "api-y-webhooks",
          title: "APIs y webhooks",
          body: "Integraciones a medida entre aplicaciones, con colas, reintentos e idempotencia. Lo que no tiene API, lo resolvemos igual.",
        },
        {
          key: "crm",
          title: "CRM y ventas",
          body: "Leads que entran solos, datos que no se pierden y seguimiento automatizado desde el primer contacto.",
        },
        {
          key: "whatsapp-business-api",
          title: "WhatsApp Business API",
          body: "Atención, notificaciones y flujos de venta sobre el canal donde ya están tus clientes.",
        },
        {
          key: "automatizacion",
          title: "Automatización con IA",
          body: "Agentes y flujos que clasifican, extraen y estructuran información donde antes había trabajo manual.",
        },
        {
          key: "sistemas-legados",
          title: "Sistemas legados",
          body: "Modernizamos sin reemplazar: el sistema que funciona se queda; lo que falta se construye alrededor.",
        },
      ],
    },
    caso: {
      badge: "Caso real",
      pre: "De 1–2 horas a ",
      accent: "~3 minutos",
      post: " por solicitud",
      body: "Para una empresa de sourcing de automóviles, automatizamos la clasificación y estructuración de las solicitudes entrantes: hasta ~80 solicitudes semanales procesadas en picos de demanda, sin ampliar el equipo.",
    },
    radiografia: {
      title: "¿No sabes por dónde empezar? Empieza por la Radiografía Digital",
      body: "Antes de integrar nada, hay que saber qué existe. La Radiografía Digital es nuestra auditoría de sistemas: inventario completo del parque tecnológico, flujos de datos, dependencias y un plan priorizado de qué conectar primero.",
      cta: "Conoce la Radiografía Digital →",
    },
    ctaFinal: {
      title: "Cuéntanos qué sistemas usas. Te decimos qué conectar primero.",
      cta: "Hablar con un especialista ↗",
    },
  },

  en: {
    meta: {
      title: "Systems integration for businesses | IA Operators",
      description:
        "Systems integration for businesses: ERP, POS, e-commerce, CRM and WhatsApp. We connect the stack you already run and automate processes end to end.",
    },
    breadcrumbHome: "Home",
    breadcrumbSelf: "Integration and automation",
    serviceName: "Systems integration for businesses",
    serviceType: "Enterprise systems integration and automation",
    h1: { lead: "Systems integration and automation ", accent: "for businesses" },
    heroBody:
      "We connect ERP, POS, e-commerce, CRM and WhatsApp on top of the systems you already run, with AI where it actually helps. From strategy to production, with the same team.",
    heroCta: "Talk to a specialist ↗",
    queEs: {
      title: "What enterprise systems integration is",
      p1: "Systems integration connects the applications a company already uses so they exchange data and run processes without manual intervention. ERP, CRM, POS, e-commerce, invoicing, WhatsApp or internal tools stop working as islands and become part of a single operational flow.",
      p2: "The goal is not to add more software, but to get the existing software working together: fewer duplicated records, fewer manual tasks, fewer errors, and an operation that is easier to control.",
    },
    problema: {
      title: "Your company runs more technology than it actually controls",
      subtitle:
        "The problem is almost never a missing tool. It is that the tools you have do not work together.",
      items: [
        {
          title: "Systems that do not talk",
          body: "The ERP in one place, the POS in another, e-commerce on its own and the CRM off to the side. Every island forces someone to copy data by hand and multiplies the errors.",
        },
        {
          title: "Manual work that does not scale",
          body: "Orders retyped, invoices reconciled by eye, job sheets passed around over WhatsApp. Hours of skilled work spent moving information from one screen to another.",
        },
        {
          title: "More technology than anyone controls",
          body: "Duplicate licences, tools nobody remembers signing up for, brittle integrations that depend on one person. The stack grows; the control over it does not.",
        },
      ],
    },
    metodo: {
      title: "Diagnosis, priorities and implementation — no hand-offs",
      items: [
        {
          step: "01",
          title: "Diagnosis",
          body: "We inventory systems, data flows and the dependencies that actually exist. What is there, what gets used, what breaks and where the time leaks out.",
        },
        {
          step: "02",
          title: "Priorities",
          body: "We rank by impact and effort: which integration removes the most manual work at the lowest risk. A short plan, not a hundred-page report.",
        },
        {
          step: "03",
          title: "Implementation",
          body: "The team that diagnoses is the team that builds: connectors, automations and dashboards in production, with tests and maintenance. No hand-offs.",
        },
      ],
    },
    capacidades: {
      title: "What we integrate and automate",
      subtitle:
        "Each block covers the concrete flows that have to be solved and the points where they usually break.",
      cta: "See how we do it →",
      items: [
        {
          key: "erp",
          title: "ERP",
          body: "We connect your ERP —in-house or off the shelf— to the rest of the business: orders, stock, invoicing and reporting.",
        },
        {
          key: "api-y-webhooks",
          title: "APIs and webhooks",
          body: "Custom integrations between applications, with queues, retries and idempotency. When there is no API, we solve it anyway.",
        },
        {
          key: "crm",
          title: "CRM and sales",
          body: "Leads that arrive on their own, data that does not get lost, and automated follow-up from the first contact.",
        },
        {
          key: "whatsapp-business-api",
          title: "WhatsApp Business API",
          body: "Support, notifications and sales flows on the channel where your customers already are.",
        },
        {
          key: "automatizacion",
          title: "AI automation",
          body: "Agents and flows that classify, extract and structure information where there used to be manual work.",
        },
        {
          key: "sistemas-legados",
          title: "Legacy systems",
          body: "We modernise without replacing: the system that works stays; what is missing gets built around it.",
        },
      ],
    },
    caso: {
      badge: "Real project",
      pre: "From 1–2 hours to ",
      accent: "~3 minutes",
      post: " per request",
      body: "For a vehicle sourcing company we automated the classification and structuring of incoming requests: up to ~80 requests a week processed at peak demand, without growing the team.",
    },
    radiografia: {
      title: "Not sure where to start? Start with the Digital X-Ray",
      body: "Before integrating anything, you need to know what is there. The Digital X-Ray is our systems audit: a full inventory of the technology stack, data flows, dependencies and a prioritised plan of what to connect first.",
      cta: "See the Digital X-Ray →",
    },
    ctaFinal: {
      title: "Tell us which systems you run. We will tell you what to connect first.",
      cta: "Talk to a specialist ↗",
    },
  },

  pt: {
    meta: {
      title: "Integração de sistemas para empresas | IA Operators",
      description:
        "Integração de sistemas para empresas: ERP, PDV, e-commerce, CRM e WhatsApp. Conectamos o stack que você já usa e automatizamos processos de ponta a ponta.",
    },
    breadcrumbHome: "Início",
    breadcrumbSelf: "Integração e automação",
    serviceName: "Integração de sistemas para empresas",
    serviceType: "Integração de sistemas e automação empresarial",
    h1: { lead: "Integração e automação de sistemas ", accent: "para empresas" },
    heroBody:
      "Conectamos ERP, PDV, e-commerce, CRM e WhatsApp sobre os sistemas que você já usa, com IA onde ela agrega. Da estratégia à produção, com a mesma equipe.",
    heroCta: "Falar com um especialista ↗",
    queEs: {
      title: "O que é integração de sistemas empresariais",
      p1: "A integração de sistemas conecta as aplicações que a empresa já utiliza para que troquem dados e executem processos sem intervenção manual. ERP, CRM, PDV, e-commerce, faturamento, WhatsApp ou ferramentas internas deixam de funcionar como ilhas e passam a fazer parte de um mesmo fluxo operacional.",
      p2: "O objetivo não é somar mais software, e sim fazer o que já existe trabalhar junto: menos dados duplicados, menos tarefas manuais, menos erros e uma operação mais fácil de controlar.",
    },
    problema: {
      title: "Sua empresa tem mais tecnologia do que realmente controla",
      subtitle:
        "O problema quase nunca é faltar uma ferramenta. É que as que existem não trabalham juntas.",
      items: [
        {
          title: "Sistemas que não se falam",
          body: "O ERP de um lado, o PDV de outro, o e-commerce por conta própria e o CRM à margem. Cada ilha obriga a copiar dados na mão e multiplica os erros.",
        },
        {
          title: "Trabalho manual que não escala",
          body: "Pedidos digitados de novo, faturas conciliadas no olho, ordens de serviço passadas por WhatsApp. Horas de trabalho qualificado gastas em mover informação.",
        },
        {
          title: "Mais tecnologia do que se controla",
          body: "Licenças duplicadas, ferramentas que ninguém lembra ter contratado, integrações frágeis que dependem de uma pessoa. O parque cresce; o controle, não.",
        },
      ],
    },
    metodo: {
      title: "Diagnóstico, prioridade e implementação — sem hand-offs",
      items: [
        {
          step: "01",
          title: "Diagnóstico",
          body: "Inventariamos sistemas, fluxos de dados e dependências reais. O que existe, o que é usado, o que quebra e por onde o tempo escapa.",
        },
        {
          step: "02",
          title: "Prioridade",
          body: "Ordenamos por impacto e esforço: qual integração elimina mais trabalho manual com menos risco. Um plano curto, não um relatório de cem páginas.",
        },
        {
          step: "03",
          title: "Implementação",
          body: "A mesma equipe que diagnostica constrói: conectores, automações e painéis em produção, com testes e manutenção. Sem hand-offs.",
        },
      ],
    },
    capacidades: {
      title: "O que integramos e automatizamos",
      subtitle:
        "Cada bloco cobre os fluxos concretos que precisam ser resolvidos e os pontos onde eles costumam quebrar.",
      cta: "Ver como fazemos →",
      items: [
        {
          key: "erp",
          title: "ERP",
          body: "Conectamos seu ERP —próprio ou de mercado— ao resto do negócio: pedidos, estoque, faturamento e reporting.",
        },
        {
          key: "api-y-webhooks",
          title: "APIs e webhooks",
          body: "Integrações sob medida entre aplicações, com filas, retentativas e idempotência. O que não tem API, resolvemos do mesmo jeito.",
        },
        {
          key: "crm",
          title: "CRM e vendas",
          body: "Leads que entram sozinhos, dados que não se perdem e follow-up automatizado desde o primeiro contato.",
        },
        {
          key: "whatsapp-business-api",
          title: "WhatsApp Business API",
          body: "Atendimento, notificações e fluxos de venda no canal onde seus clientes já estão.",
        },
        {
          key: "automatizacion",
          title: "Automação com IA",
          body: "Agentes e fluxos que classificam, extraem e estruturam informação onde antes havia trabalho manual.",
        },
        {
          key: "sistemas-legados",
          title: "Sistemas legados",
          body: "Modernizamos sem substituir: o sistema que funciona fica; o que falta é construído em volta.",
        },
      ],
    },
    caso: {
      badge: "Caso real",
      pre: "De 1–2 horas para ",
      accent: "~3 minutos",
      post: " por solicitação",
      body: "Para uma empresa de sourcing de automóveis, automatizamos a classificação e a estruturação das solicitações que chegam: até ~80 solicitações por semana processadas em picos de demanda, sem aumentar a equipe.",
    },
    radiografia: {
      title: "Não sabe por onde começar? Comece pela Radiografia Digital",
      body: "Antes de integrar qualquer coisa, é preciso saber o que existe. A Radiografia Digital é a nossa auditoria de sistemas: inventário completo do parque tecnológico, fluxos de dados, dependências e um plano priorizado do que conectar primeiro.",
      cta: "Conheça a Radiografia Digital →",
    },
    ctaFinal: {
      title: "Conte quais sistemas você usa. A gente diz o que conectar primeiro.",
      cta: "Falar com um especialista ↗",
    },
  },
};
