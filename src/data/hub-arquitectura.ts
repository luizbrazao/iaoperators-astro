// Copy del hub del pilar de arquitectura tecnológica, en los tres idiomas.
//
// El bloque `es` es literal respecto a la versión publicada el 10/ago/2026
// (commit 0fafd9a): la página lleva semanas midiendo y traducirla no es motivo
// para reescribirla.
//
// Diferencia estructural entre idiomas, y es la única: la sección final de
// "relación con los otros pilares" enlaza en ES a integración y a cumplimiento;
// en EN y PT el silo de cumplimiento no existe —la obligación es española— y su
// tarjeta se sustituye por la de automatización con IA, que sí existe en los
// tres idiomas. No se traduce una tarjeta que llevaría a una página en español.

import type { Loc } from "@/data/integracion";

export type RelacionTarget = "integracion" | "cumplimiento" | "automatizacion";

export interface HubArquitecturaCopy {
  meta: { title: string; description: string };
  breadcrumbHome: string;
  serviceType: string;
  areaServed: string[];
  h1: { lead: string; accent: string };
  heroBody: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  problema: { title: string; subtitle: string; sintomas: string[] };
  capas: { title: string; subtitle: string; items: { num: string; title: string; body: string }[] };
  decisiones: { title: string; subtitle: string; items: string[] };
  relaciones: { target: RelacionTarget; title: string; body: string; cta: string }[];
  ctaFinal: { title: string; body: string; cta: string };
}

export const HUB_ARQUITECTURA: Record<Loc, HubArquitecturaCopy> = {
  es: {
    meta: {
      title: "Arquitectura tecnológica para empresas | IA Operators",
      description:
        "Diseñamos cómo deben conectarse sistemas, datos, integraciones y automatización en tu empresa: diagnóstico, roadmap de arquitectura e implementación.",
    },
    breadcrumbHome: "Inicio",
    serviceType: "Enterprise technology architecture",
    areaServed: ["ES"],
    h1: { lead: "Arquitectura tecnológica ", accent: "para empresas" },
    heroBody:
      "Diseñamos cómo deben conectarse sistemas, datos, automatizaciones y procesos para que la tecnología deje de crecer por piezas sueltas y empiece a funcionar como una arquitectura.",
    heroCtaPrimary: "Analizar nuestra arquitectura ↗",
    heroCtaSecondary: "Ver cómo trabajamos",
    problema: {
      title: "Casi nunca falta software. Lo que falta es arquitectura",
      subtitle:
        "Ninguna empresa decide un día tener un parque tecnológico desordenado. Se llega ahí herramienta a herramienta, cada una resolviendo bien su problema y ninguna pensada junto a las demás. Estas son las señales.",
      sintomas: [
        "El ERP y el CRM no se hablan, y alguien reconcilia los dos a mano.",
        "Procesos críticos que pasan por una hoja de cálculo que hace de middleware.",
        "Integraciones punto a punto: cada nueva herramienta añade conexiones, no capacidades.",
        "Herramientas duplicadas que resuelven lo mismo en dos departamentos.",
        "Datos repartidos en varios sistemas, sin acuerdo sobre cuál manda.",
        "Software legado que nadie toca porque nadie sabe qué se rompe si lo tocan.",
        "Automatizaciones creadas una a una, sin criterio común ni mantenimiento.",
        "Cada herramienta nueva entra, pero ninguna sale.",
        "Procesos que dependen de que una persona concreta esté disponible.",
        "Ganas de meter IA, y ningún sitio seguro por donde empezar.",
      ],
    },
    capas: {
      title: "Qué entendemos por arquitectura tecnológica",
      subtitle:
        "No es un diagrama bonito ni un documento de cien páginas. Son cuatro capas que tienen que sostenerse entre sí, y las decisiones que las mantienen coherentes cuando el negocio cambia.",
      items: [
        {
          num: "01",
          title: "Sistemas",
          body: "ERP, CRM, TPV, e-commerce, software vertical y las aplicaciones internas que nadie documentó. Qué hace cada uno de verdad, cuál sobra y cuál sostiene la operación aunque no lo parezca.",
        },
        {
          num: "02",
          title: "Integraciones",
          body: "APIs, webhooks, eventos y middleware. Dónde hace falta una conexión en tiempo real, dónde basta una sincronización periódica y dónde una integración solo añadiría una pieza más que mantener.",
        },
        {
          num: "03",
          title: "Datos",
          body: "Dónde vive cada dato, qué sistema es la fuente de la verdad para cada entidad —cliente, pedido, factura— y cómo circula entre aplicaciones sin que aparezcan tres versiones del mismo número.",
        },
        {
          num: "04",
          title: "Automatización e IA",
          body: "Qué procesos merecen automatizarse y cuáles conviene arreglar antes, y en qué puntos un modelo aporta algo que una regla no puede. La IA se apoya en las tres capas anteriores; sin ellas amplifica el desorden.",
        },
      ],
    },
    decisiones: {
      title: "Las preguntas que una arquitectura tiene que dejar respondidas",
      subtitle: "Si alguna de estas lleva meses sin respuesta clara, el problema no es de herramientas.",
      items: [
        "¿Cambiamos el ERP o lo integramos con lo demás?",
        "¿Qué sistema debe ser la fuente de la verdad para cada dato?",
        "¿Qué aplicaciones podemos retirar sin romper nada?",
        "¿Dónde necesitamos una API y dónde es sobreingeniería?",
        "¿Qué procesos merece la pena automatizar, y en qué orden?",
        "¿Qué sistema legado hay que modernizar primero?",
        "¿Dónde tiene sentido introducir IA y dónde todavía no?",
        "¿Qué construimos a medida y qué compramos hecho?",
      ],
    },
    relaciones: [
      {
        target: "integracion",
        title: "Arquitectura e integración",
        body: "La arquitectura decide cómo debería funcionar el ecosistema: qué manda sobre qué, qué se conecta y qué se retira. La integración es el trabajo de construir esas conexiones —ERP, CRM, TPV, e-commerce, WhatsApp— y ponerlas en producción. Una sin la otra produce o un plan que nadie ejecuta, o conexiones que nadie sabe por qué existen.",
        cta: "Ver integración de sistemas →",
      },
      {
        target: "cumplimiento",
        title: "Arquitectura y cumplimiento",
        body: "Una obligación normativa nueva rara vez se resuelve con una casilla de configuración: Verifactu toca cómo se emiten y se encadenan los registros de facturación, y la Ley 10/2025 toca cómo se enruta y se registra la atención al cliente. Las dos acaban siendo decisiones de arquitectura sobre sistemas que ya estaban en marcha.",
        cta: "Ver cumplimiento normativo →",
      },
    ],
    ctaFinal: {
      title: "Si tu stack ha crecido herramienta a herramienta, hay una conversación que ahorra años",
      body: "En 30 minutos podemos situar dónde está el desorden que más cuesta y qué se puede ordenar primero: qué mantener, qué conectar y qué cambiar.",
      cta: "Analizar nuestra arquitectura ↗",
    },
  },

  en: {
    meta: {
      title: "Technology architecture for businesses | IA Operators",
      description:
        "We design how systems, data, integrations and automation should connect in your company: diagnosis, architecture roadmap and implementation.",
    },
    breadcrumbHome: "Home",
    serviceType: "Enterprise technology architecture",
    areaServed: ["ES", "EU"],
    h1: { lead: "Technology architecture ", accent: "for businesses" },
    heroBody:
      "We design how systems, data, automations and processes should connect, so technology stops growing as loose parts and starts behaving like an architecture.",
    heroCtaPrimary: "Review our architecture ↗",
    heroCtaSecondary: "See how we work",
    problema: {
      title: "Software is rarely what is missing. Architecture is",
      subtitle:
        "No company decides one morning to have a messy technology stack. You get there one tool at a time, each solving its own problem well and none designed alongside the others. These are the signs.",
      sintomas: [
        "The ERP and the CRM do not talk, and someone reconciles the two by hand.",
        "Critical processes running through a spreadsheet that acts as middleware.",
        "Point-to-point integrations: every new tool adds connections, not capabilities.",
        "Duplicate tools solving the same thing in two departments.",
        "Data spread across several systems, with no agreement on which one wins.",
        "Legacy software nobody touches because nobody knows what breaks if they do.",
        "Automations built one at a time, with no shared criteria and no maintenance.",
        "Every new tool comes in, and none ever leaves.",
        "Processes that depend on one specific person being available.",
        "An appetite for AI, and no safe place to start.",
      ],
    },
    capas: {
      title: "What we mean by technology architecture",
      subtitle:
        "Not a pretty diagram, and not a hundred-page document. Four layers that have to hold each other up, plus the decisions that keep them coherent when the business changes.",
      items: [
        {
          num: "01",
          title: "Systems",
          body: "ERP, CRM, POS, e-commerce, vertical software and the internal applications nobody documented. What each one actually does, which is redundant, and which quietly holds up the operation.",
        },
        {
          num: "02",
          title: "Integrations",
          body: "APIs, webhooks, events and middleware. Where a real-time connection is needed, where a periodic sync is enough, and where an integration would only add one more piece to maintain.",
        },
        {
          num: "03",
          title: "Data",
          body: "Where each piece of data lives, which system is the source of truth for each entity —customer, order, invoice— and how it moves between applications without three versions of the same number appearing.",
        },
        {
          num: "04",
          title: "Automation and AI",
          body: "Which processes deserve automating and which should be fixed first, and where a model contributes something a rule cannot. AI rests on the three layers above; without them it amplifies the mess.",
        },
      ],
    },
    decisiones: {
      title: "The questions an architecture has to leave answered",
      subtitle: "If any of these has gone months without a clear answer, the problem is not the tools.",
      items: [
        "Do we replace the ERP or integrate it with everything else?",
        "Which system should be the source of truth for each piece of data?",
        "Which applications can we retire without breaking anything?",
        "Where do we need an API, and where is that over-engineering?",
        "Which processes are worth automating, and in what order?",
        "Which legacy system has to be modernised first?",
        "Where does AI make sense, and where does it not yet?",
        "What do we build custom and what do we buy off the shelf?",
      ],
    },
    relaciones: [
      {
        target: "integracion",
        title: "Architecture and integration",
        body: "Architecture decides how the ecosystem should work: what governs what, what gets connected and what gets retired. Integration is the work of building those connections —ERP, CRM, POS, e-commerce, WhatsApp— and running them in production. One without the other produces either a plan nobody executes, or connections nobody can explain.",
        cta: "See systems integration →",
      },
      {
        target: "automatizacion",
        title: "Architecture and automation",
        body: "An automation built on an undefined architecture inherits every ambiguity underneath it: two systems claiming the same field, a process nobody owns, a rule that only one person understands. Deciding the architecture first is what makes the automation cheap to build and safe to change later.",
        cta: "See AI automation →",
      },
    ],
    ctaFinal: {
      title: "If your stack grew one tool at a time, there is a conversation that saves years",
      body: "In 30 minutes we can locate where the most expensive disorder sits and what can be tidied first: what to keep, what to connect and what to change.",
      cta: "Review our architecture ↗",
    },
  },

  pt: {
    meta: {
      title: "Arquitetura tecnológica para empresas | IA Operators",
      description:
        "Desenhamos como sistemas, dados, integrações e automação devem se conectar na sua empresa: diagnóstico, roadmap de arquitetura e implementação.",
    },
    breadcrumbHome: "Início",
    serviceType: "Enterprise technology architecture",
    areaServed: ["PT", "BR"],
    h1: { lead: "Arquitetura tecnológica ", accent: "para empresas" },
    heroBody:
      "Desenhamos como sistemas, dados, automações e processos devem se conectar para que a tecnologia pare de crescer em peças soltas e passe a funcionar como uma arquitetura.",
    heroCtaPrimary: "Analisar nossa arquitetura ↗",
    heroCtaSecondary: "Ver como trabalhamos",
    problema: {
      title: "Quase nunca falta software. O que falta é arquitetura",
      subtitle:
        "Nenhuma empresa decide um dia ter um parque tecnológico desorganizado. Chega-se lá ferramenta a ferramenta, cada uma resolvendo bem o seu problema e nenhuma pensada junto com as outras. Estes são os sinais.",
      sintomas: [
        "O ERP e o CRM não se falam, e alguém concilia os dois na mão.",
        "Processos críticos que passam por uma planilha fazendo papel de middleware.",
        "Integrações ponto a ponto: cada ferramenta nova acrescenta conexões, não capacidades.",
        "Ferramentas duplicadas resolvendo a mesma coisa em dois departamentos.",
        "Dados espalhados por vários sistemas, sem acordo sobre qual manda.",
        "Software legado em que ninguém mexe porque ninguém sabe o que quebra se mexer.",
        "Automações criadas uma a uma, sem critério comum nem manutenção.",
        "Toda ferramenta nova entra, e nenhuma sai.",
        "Processos que dependem de uma pessoa específica estar disponível.",
        "Vontade de colocar IA, e nenhum lugar seguro por onde começar.",
      ],
    },
    capas: {
      title: "O que entendemos por arquitetura tecnológica",
      subtitle:
        "Não é um diagrama bonito nem um documento de cem páginas. São quatro camadas que precisam se sustentar entre si, e as decisões que as mantêm coerentes quando o negócio muda.",
      items: [
        {
          num: "01",
          title: "Sistemas",
          body: "ERP, CRM, PDV, e-commerce, software vertical e as aplicações internas que ninguém documentou. O que cada um faz de verdade, qual sobra e qual sustenta a operação mesmo sem parecer.",
        },
        {
          num: "02",
          title: "Integrações",
          body: "APIs, webhooks, eventos e middleware. Onde é preciso conexão em tempo real, onde basta uma sincronização periódica e onde uma integração só acrescentaria mais uma peça para manter.",
        },
        {
          num: "03",
          title: "Dados",
          body: "Onde cada dado vive, qual sistema é a fonte da verdade para cada entidade —cliente, pedido, fatura— e como ele circula entre aplicações sem que apareçam três versões do mesmo número.",
        },
        {
          num: "04",
          title: "Automação e IA",
          body: "Quais processos merecem ser automatizados e quais convém consertar antes, e em que pontos um modelo entrega algo que uma regra não entrega. A IA se apoia nas três camadas anteriores; sem elas, amplifica a desordem.",
        },
      ],
    },
    decisiones: {
      title: "As perguntas que uma arquitetura precisa deixar respondidas",
      subtitle: "Se alguma delas passa meses sem resposta clara, o problema não é de ferramentas.",
      items: [
        "Trocamos o ERP ou integramos ele com o resto?",
        "Qual sistema deve ser a fonte da verdade para cada dado?",
        "Quais aplicações dá para aposentar sem quebrar nada?",
        "Onde precisamos de uma API e onde isso é overengineering?",
        "Quais processos vale a pena automatizar, e em que ordem?",
        "Qual sistema legado precisa ser modernizado primeiro?",
        "Onde faz sentido colocar IA e onde ainda não?",
        "O que construímos sob medida e o que compramos pronto?",
      ],
    },
    relaciones: [
      {
        target: "integracion",
        title: "Arquitetura e integração",
        body: "A arquitetura decide como o ecossistema deveria funcionar: o que manda sobre o quê, o que se conecta e o que sai de cena. A integração é o trabalho de construir essas conexões —ERP, CRM, PDV, e-commerce, WhatsApp— e colocá-las em produção. Uma sem a outra produz ou um plano que ninguém executa, ou conexões que ninguém sabe explicar.",
        cta: "Ver integração de sistemas →",
      },
      {
        target: "automatizacion",
        title: "Arquitetura e automação",
        body: "Uma automação construída sobre arquitetura indefinida herda toda a ambiguidade que está embaixo dela: dois sistemas reivindicando o mesmo campo, um processo sem dono, uma regra que só uma pessoa entende. Decidir a arquitetura antes é o que torna a automação barata de construir e segura de mudar depois.",
        cta: "Ver automação com IA →",
      },
    ],
    ctaFinal: {
      title: "Se o seu stack cresceu ferramenta a ferramenta, existe uma conversa que economiza anos",
      body: "Em 30 minutos dá para situar onde está a desordem que mais custa e o que pode ser organizado primeiro: o que manter, o que conectar e o que mudar.",
      cta: "Analisar nossa arquitetura ↗",
    },
  },
};
