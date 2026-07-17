// Datos de ciudades para las landing locales /es/agencia-de-ia/[ciudad]/
// Solo ES: la intención de búsqueda local es en español. Añadir una ciudad = añadir una entrada aquí.
// Cada ciudad aporta contenido único (hero, intro, sectores, ángulo local, FAQ local)
// sobre un marco compartido (servicios, proceso, tech). Regla anti-doorway: >=30% único por ciudad.

export const CIUDAD_SLUGS = ["madrid", "barcelona", "valencia"] as const;
export type CiudadSlug = (typeof CIUDAD_SLUGS)[number];

export const SHARED: any = {
  labels: {
    heroCta: "Hablar con un especialista ↗",
    servicesAnchor: "Qué hacemos",
    breadcrumbBase: "Agencia de IA",
  },
  services: {
    title: "Qué hacemos",
    subtitle: "Estrategia e implementación de IA de verdad. Lo que mueve la aguja, no lo que suena bien.",
    items: [
      { title: "Agentes de IA", body: "Agentes que atienden, cualifican y ejecutan procesos reales sobre tus herramientas — no demos bonitas." },
      { title: "Automatización de procesos", body: "El trabajo repetitivo (copiar datos, generar informes, mover información entre apps) pasa a correr solo." },
      { title: "Chatbots y asistentes", body: "Atención por WhatsApp y web, 24/7 y multiidioma, integrada con tu operación." },
      { title: "Integraciones API-first", body: "Conectamos la IA con tu stack (CRM, ERP, datos) para que actúe donde ya trabajas." },
    ],
  },
  process: {
    badge: "Cómo trabajamos",
    title: "Diagnóstico, estrategia y ejecución — sin hand-offs",
    phases: [
      { code: "01", title: "Diagnosticamos", body: "Mapeamos tus procesos y datos, y dónde la IA aporta valor real. Priorizamos por impacto vs. esfuerzo." },
      { code: "02", title: "Diseñamos", body: "Definimos el roadmap: qué construir, en qué orden y con qué retorno esperado." },
      { code: "03", title: "Construimos", body: "Implementamos agentes, automatizaciones e integraciones. Con ingeniería, tipado y validación." },
      { code: "04", title: "Operamos y escalamos", body: "Medimos, iteramos y ampliamos la IA a nuevos procesos sobre una base sólida." },
    ],
  },
  tech: {
    title: "La tecnología que usamos",
    items: ["OpenAI / Claude", "LangChain", "n8n", "Supabase", "Multi-agente", "WhatsApp Cloud API", "Webhooks & APIs", "Node / TypeScript"],
  },
  genericFaq: [
    { q: "¿Cuánto cuesta un proyecto de automatización con IA?", a: "Depende del alcance. Trabajamos por proyecto cerrado, retainer mensual o bolsa de horas. Lo que importa no es el precio por hora sino el retorno: cuántas horas de trabajo manual elimina el sistema. Un primer caso acotado suele empezar en semanas, no meses." },
    { q: "¿Cómo empezamos?", a: "Una llamada de 30 minutos para entender tu negocio. Si hay encaje, te proponemos un primer caso de IA con alcance y retorno claros — sin compromiso." },
  ],
  finalCta: {
    cta: "Hablar con un especialista",
  },
};

export const CIUDADES: Record<string, any> = {
  madrid: {
    name: "Madrid",
    meta: {
      title: "Agencia de IA en Madrid | Automatización con IA",
      description: "Agencia de IA en Madrid: automatizamos procesos, creamos agentes y chatbots para empresas. Estrategia e implementación, sin humo. Diagnóstico gratuito.",
    },
    heroTitle: "Agencia de IA en Madrid",
    heroSubtitle: "Automatización con IA para empresas de Madrid: agentes, chatbots e integraciones que quitan trabajo repetitivo y traen clientes. Con IA, pero sin humo.",
    intro: [
      "Madrid concentra sedes, servicios profesionales y una competencia feroz por el cliente. Aquí el tiempo de tu equipo es caro: cada hora que se va en tareas repetitivas es una hora que no dedicas a crecer.",
      "Ayudamos a empresas de Madrid a aplicar IA donde de verdad mueve la aguja — atención que responde al instante, procesos internos que dejan de hacerse a mano y datos que por fin se aprovechan. Con foco en producción, no en experimentos.",
    ],
    sectorsTitle: "Qué automatizamos para empresas de Madrid",
    sectors: [
      { title: "Servicios profesionales y consultoras", body: "Agentes que preparan documentación, resumen expedientes y responden a clientes sin robar horas a tu equipo." },
      { title: "Inmobiliaria", body: "Cualificación de leads 24/7, respuesta inmediata a portales y agenda de visitas automatizada." },
      { title: "Seguros y finanzas", body: "Automatización de procesos con datos sensibles, con permisos mínimos y opción de modelos privados." },
      { title: "Retail y ecommerce", body: "Atención por WhatsApp, seguimiento de pedidos y sincronización entre tus sistemas." },
      { title: "Startups y tecnología", body: "Automatizaciones que te dejan escalar sin ampliar plantilla en cada pico." },
    ],
    localAngle: {
      title: "Por qué IA Operators en Madrid",
      body: "Trabajamos en remoto con empresas de toda la Comunidad de Madrid, con reuniones presenciales cuando el proyecto lo pide. No vendemos horas: entregamos sistemas que funcionan en tu operación, quedan documentados y son tuyos.",
    },
    faqLocal: [
      { q: "¿Trabajáis con empresas de Madrid en remoto o presencial?", a: "Las dos cosas. La mayor parte del trabajo es remoto —así avanzamos más rápido—, pero hacemos reuniones presenciales en Madrid cuando el proyecto o la relación lo piden." },
      { q: "¿Qué tipo de empresas de Madrid pueden automatizar con IA?", a: "Desde despachos, consultoras e inmobiliarias hasta ecommerce, seguros y startups. Si tienes procesos repetitivos, atención que satura a tu equipo o datos sin aprovechar, hay un caso de IA para ti." },
    ],
  },

  barcelona: {
    name: "Barcelona",
    meta: {
      title: "Agencia de IA en Barcelona | Automatización con IA",
      description: "Agencia de IA en Barcelona: agentes, chatbots multiidioma y automatización de procesos para empresas. Estrategia e implementación, sin humo.",
    },
    heroTitle: "Agencia de IA en Barcelona",
    heroSubtitle: "Automatización con IA para empresas de Barcelona: atención multiidioma, agentes e integraciones que te dejan escalar sin ampliar plantilla. Con IA, pero sin humo.",
    intro: [
      "Barcelona es hub de startups, turismo y ecommerce, con clientes y equipos que hablan varios idiomas. Escalar la atención sin disparar la plantilla es el reto de casi todo negocio que crece aquí.",
      "Montamos IA para empresas de Barcelona que necesitan atender en varios idiomas, cualificar leads a cualquier hora y quitarse de encima el trabajo interno repetitivo — desde la startup que no quiere contratar soporte hasta la agencia que quiere recuperar horas.",
    ],
    sectorsTitle: "Qué automatizamos para empresas de Barcelona",
    sectors: [
      { title: "Startups y tecnología", body: "Automatizaciones y agentes que escalan con tu producto sin sumar cabezas en cada sprint." },
      { title: "Turismo y hostelería", body: "Atención y reservas por WhatsApp en varios idiomas, 24/7, sin recargar a recepción." },
      { title: "Ecommerce", body: "Cualificación de leads, soporte automático y sincronización entre tienda, CRM y logística." },
      { title: "Agencias y estudios creativos", body: "Agentes internos que se comen el trabajo repetitivo para que el equipo cree, no copie datos." },
      { title: "Industria y diseño", body: "Integraciones a medida entre sistemas que hoy no se hablan, con lógica de negocio propia." },
    ],
    localAngle: {
      title: "Por qué IA Operators en Barcelona",
      body: "El ADN multiidioma de Barcelona encaja con lo que mejor hacemos: atención y agentes que funcionan en español, catalán, inglés o el idioma que necesites. Trabajamos en remoto con toda el área de Barcelona y dejamos el sistema documentado y en tus manos.",
    },
    faqLocal: [
      { q: "¿Podéis montar atención al cliente en varios idiomas?", a: "Sí. Es uno de los casos más frecuentes en Barcelona: agentes y chatbots que atienden en español, catalán, inglés y más, detectando el idioma del cliente automáticamente." },
      { q: "¿Qué tipo de empresas de Barcelona pueden automatizar con IA?", a: "Startups, ecommerce, turismo y hostelería, agencias e industria. Si tu equipo se satura atendiendo o pierde horas en tareas repetibles, hay un caso claro." },
    ],
  },

  valencia: {
    name: "Valencia",
    meta: {
      title: "Agencia de IA en Valencia | Automatización con IA",
      description: "Agencia de IA en Valencia: automatización con IA, agentes y chatbots para pymes. Compite como los grandes sin montar un equipo enorme. Sin humo.",
    },
    heroTitle: "Agencia de IA en Valencia",
    heroSubtitle: "Automatización con IA para empresas de Valencia: agentes, chatbots e integraciones para que tu pyme rinda como una empresa el doble de grande. Con IA, pero sin humo.",
    intro: [
      "Valencia crece rápido: pymes exportadoras, agroalimentario, logística del puerto y un ecommerce en plena expansión. Muchas de estas empresas quieren competir como las grandes sin montar equipos enormes.",
      "Ahí entra la IA bien aplicada: automatizar pedidos, atención y reportes para que una pyme valenciana rinda como una empresa el doble de grande. Pragmático, medible y en producción — no un experimento caro.",
    ],
    sectorsTitle: "Qué automatizamos para empresas de Valencia",
    sectors: [
      { title: "Pymes exportadoras", body: "Atención multiidioma y automatización de pedidos y seguimiento para vender fuera sin más personal." },
      { title: "Agroalimentario", body: "Procesos de pedidos, trazabilidad y reportes que dejan de hacerse a mano en hojas de cálculo." },
      { title: "Logística y puerto", body: "Integraciones entre sistemas y agentes que responden consultas de estado sin saturar al equipo." },
      { title: "Turismo", body: "Reservas y atención por WhatsApp, 24/7 y en varios idiomas, sin recargar recepción." },
      { title: "Ecommerce", body: "Soporte automático, cualificación de leads y sincronización entre tienda, CRM y almacén." },
    ],
    localAngle: {
      title: "Por qué IA Operators en Valencia",
      body: "Entendemos la realidad de la pyme valenciana: equipos ajustados que quieren resultados sin proyectos eternos. Empezamos por un caso de alto impacto y bajo riesgo, lo dejamos en producción y escalamos desde ahí. Trabajamos en remoto con toda la provincia.",
    },
    faqLocal: [
      { q: "¿Esto sirve para una pyme o solo para grandes empresas?", a: "Sirve —y mucho— para pymes. La IA bien aplicada es justo lo que permite a una empresa pequeña rendir como una grande: automatizar lo repetitivo y atender mejor sin ampliar el equipo." },
      { q: "¿Qué tipo de empresas de Valencia pueden automatizar con IA?", a: "Pymes exportadoras, agroalimentario, logística, turismo y ecommerce. Si tienes procesos repetibles o atención que consume el tiempo de tu equipo, hay un caso para ti." },
    ],
  },
};
