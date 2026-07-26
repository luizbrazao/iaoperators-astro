// Datos de la Frente A — cumplimiento de la Ley 10/2025 de servicios de atención a la clientela.
// Solo ES: la obligación es española y el comprador busca en español.
//
// Fuente normativa: Ley 10/2025, de 26 de diciembre (BOE-A-2025-26698).
// - Art. 2.1: sectores de servicios básicos de interés general (obligados sin umbral).
// - Art. 2.2: resto de empresas y grupos de sociedades, umbrales ALTERNATIVOS
//   (≥250 personas trabajadoras O >50 M€ volumen de negocios O >43 M€ balance).
// - Art. 10: 95 % de las llamadas atendidas, de media, en menos de 3 minutos.
// - Art. 17: quejas y reclamaciones resueltas en un plazo máximo de 15 días hábiles.
// - Disposición transitoria única: 12 meses desde la entrada en vigor (28/12/2025) → 28/12/2026.
//
// REGLA DE MANTENIMIENTO: no citar número de artículo que no se haya verificado en el BOE.
// Los requisitos sin `articulo` se describen sin atribución de artículo a propósito.

export const LEY = {
  nombre: "Ley 10/2025, de 26 de diciembre, de servicios de atención a la clientela",
  nombreCorto: "Ley 10/2025",
  boeId: "BOE-A-2025-26698",
  boeUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698",
  entradaEnVigor: "2025-12-28",
  /** Fin del plazo de adaptación (12 meses desde la entrada en vigor). */
  plazoAdaptacion: "2026-12-28",
  plazoAdaptacionLegible: "28 de diciembre de 2026",
};

export const DISCLAIMER =
  "Información técnica sobre la implementación de sistemas. No constituye asesoramiento jurídico. La interpretación legal del alcance de la norma corresponde a tu asesoría o despacho.";

/** Sectores del art. 2.1 — obligados con independencia de su tamaño. */
export const SECTOR_SLUGS = [
  "energia-agua-gas",
  "transporte-viajeros",
  "servicios-postales",
  "telecomunicaciones",
  "servicios-financieros",
] as const;

export type SectorSlug = (typeof SECTOR_SLUGS)[number];

/** Umbrales del art. 2.2 — alternativos, basta cumplir uno. */
export const UMBRALES = [
  { valor: "≥ 250", unidad: "personas trabajadoras" },
  { valor: "> 50 M€", unidad: "de volumen de negocios anual" },
  { valor: "> 43 M€", unidad: "de balance anual" },
];

/**
 * El núcleo de la propuesta: cada obligación legal traducida a lo que hay que
 * construir. Esta tabla es el activo diferencial de la landing — la SERP está
 * llena de despachos explicando la norma y vacía de quien explica el sistema.
 */
export const OBLIGACIONES = [
  {
    articulo: "Art. 10",
    ley: "95 % de las llamadas atendidas, de media, en menos de 3 minutos.",
    sistema:
      "Enrutado omnicanal con cola priorizada, medición de SLA en tiempo real y desbordamiento automático a refuerzo cuando la cola se acerca al umbral.",
    riesgo: "Sin medición continua no puedes demostrar la media ante una auditoría.",
  },
  {
    articulo: null,
    ley: "Atención personalizada bajo demanda. Prohibido el uso exclusivo de contestadores automáticos.",
    sistema:
      "Salida explícita del bot a persona en cualquier punto de la conversación, con traspaso del contexto completo y sin bucles de menú.",
    riesgo: "Un bot sin escape claro es el incumplimiento más fácil de detectar desde fuera.",
  },
  {
    articulo: "Art. 17",
    ley: "Quejas y reclamaciones resueltas en un máximo de 15 días hábiles.",
    sistema:
      "Workflow de ticket con reloj de plazo sobre calendario laboral, avisos escalonados y escalado automático antes del vencimiento.",
    riesgo: "El plazo corre en días hábiles: contarlo a mano es donde se pierde el cumplimiento.",
  },
  {
    articulo: null,
    ley: "2 horas para incidencias de continuidad en servicios básicos · 5 días en facturación y cobros indebidos.",
    sistema:
      "Clasificación de la incidencia en la entrada por tipología y SLA diferenciado por clase, con rutas de guardia propias.",
    riesgo: "Un único SLA para todo garantiza incumplir el más corto.",
  },
  {
    articulo: null,
    ley: "Clave identificativa única por interacción, para que la clientela pueda seguir su gestión.",
    sistema:
      "Generación y persistencia de la clave, entrega en el canal de origen y consulta del estado desde cualquier otro canal.",
    riesgo: "Si cada canal genera su propio identificador, la trazabilidad se rompe en el traspaso.",
  },
  {
    articulo: null,
    ley: "Registro y trazabilidad de todas las gestiones.",
    sistema:
      "Log inmutable append-only con sellado temporal, política de retención y exportación en formato auditable.",
    riesgo: "Un CRM editable no es evidencia: hay que poder demostrar que el registro no se ha alterado.",
  },
  {
    articulo: null,
    ley: "Disponibilidad 24 h / 365 días para comunicar incidencias en servicios básicos.",
    sistema:
      "Canal de entrada siempre activo con acuse inmediato, cola nocturna y activación de guardia según criticidad.",
    riesgo: "Recoger fuera de horario sin acusar recibo no cuenta como atención.",
  },
  {
    articulo: null,
    ley: "Auditoría anual de calidad por entidad acreditada por ENAC.",
    sistema:
      "Cuadro de mando de KPIs exportable y dossier de evidencias por obligación, preparado para entregarse tal cual al auditor.",
    riesgo: "Reconstruir un año de evidencias la semana antes de la auditoría no es viable.",
  },
];

export const SHARED = {
  arquitectura: {
    title: "Qué construimos",
    subtitle:
      "Una capa de atención que cumple los SLA por diseño y deja evidencia de que los cumple. Sobre tus sistemas actuales, no sustituyéndolos.",
    items: [
      {
        title: "Entrada omnicanal",
        body: "WhatsApp Cloud API, voz, email y web bajo un único flujo. La clave identificativa se emite en el primer contacto, sea cual sea el canal.",
      },
      {
        title: "Clasificación y enrutado con IA",
        body: "Un agente clasifica tipología, criticidad y SLA aplicable en la entrada, y enruta a la cola correcta. Sin árboles de menú rígidos.",
      },
      {
        title: "Relevo a persona sin fricción",
        body: "Escape hatch explícito y traspaso del contexto completo al agente humano, con el reloj del SLA corriendo y visible.",
      },
      {
        title: "Motor de plazos",
        body: "Reloj sobre calendario laboral por tipología (15 días hábiles, 5 días, 2 horas), con escalado automático antes del vencimiento.",
      },
      {
        title: "Capa de evidencias",
        body: "Registro inmutable de cada interacción y cada cambio de estado, con retención configurable y exportación para el auditor.",
      },
      {
        title: "Integración con tu stack",
        body: "CRM, ticketing, ERP y telefonía por API. Idempotencia, reintentos y colas: si un sistema cae, la evidencia no se pierde.",
      },
    ],
  },

  proceso: {
    badge: "Cómo trabajamos",
    title: "Del diagnóstico al paquete auditoría-ready",
    subtitle:
      "El mismo equipo que interpreta el requisito construye el sistema. Sin hand-offs entre consultora y proveedor técnico.",
    phases: [
      {
        code: "01",
        title: "Diagnóstico de brecha",
        plazo: "1 semana",
        body: "Mapeamos canales, tiempos reales, sistemas implicados y qué se registra hoy. Salida: brecha obligación por obligación, con esfuerzo estimado.",
      },
      {
        code: "02",
        title: "Diseño del flujo y de la evidencia",
        plazo: "1 semana",
        body: "Definimos SLAs por tipología, rutas de escalado, modelo de datos de la clave identificativa y qué se registra en cada paso.",
      },
      {
        code: "03",
        title: "Implementación",
        plazo: "4–8 semanas",
        body: "Construimos la capa omnicanal, el motor de plazos y el registro. Con tipado, validación, idempotencia y despliegue versionado.",
      },
      {
        code: "04",
        title: "Paquete auditoría-ready",
        plazo: "continuo",
        body: "Cuadro de mando de KPIs, dossier de evidencias por obligación y mantenimiento normativo mientras la norma se desarrolle.",
      },
    ],
  },

  tech: {
    title: "La tecnología que usamos",
    subtitle: "API-first, con estado persistente y observabilidad desde el primer día.",
    items: [
      "WhatsApp Cloud API",
      "n8n",
      "LangChain",
      "Multi-agente",
      "Supabase",
      "Node / TypeScript",
      "Webhooks & APIs",
      "Telefonía SIP / CPaaS",
    ],
  },

  precio: {
    title: "Alcance y precio",
    subtitle: "Proyecto cerrado más mantenimiento normativo. Sin licencia propietaria que te ate.",
    items: [
      {
        title: "Diagnóstico de brecha",
        precio: "Desde 1.500 €",
        body: "Una semana. Informe de brecha por obligación, con esfuerzo y prioridad. Se descuenta si sigues con la implementación.",
      },
      {
        title: "Implementación",
        precio: "Desde 5.000 €",
        body: "Capa omnicanal, motor de plazos, clave identificativa y registro auditable, integrados con tu CRM o ticketing.",
      },
      {
        title: "Mantenimiento normativo",
        precio: "Retainer mensual",
        body: "Monitorización de SLAs, evolución del sistema y actualización del dossier de evidencias para la auditoría anual.",
      },
    ],
  },

  porQue: {
    title: "Por qué nosotros y no una consultora de CX",
    items: [
      {
        title: "Traducimos norma a arquitectura",
        body: "El mercado está lleno de quien te explica lo que dice la ley. Nosotros construimos el sistema que la cumple y que lo demuestra.",
      },
      {
        title: "Venimos de la auditoría de sistemas",
        body: "Nuestro trabajo base es inventariar ecosistemas digitales, mapear integraciones y encontrar puntos de fallo. Esta capa es una extensión natural de eso.",
      },
      {
        title: "Integramos, no sustituimos",
        body: "Trabajamos sobre el CRM, el ticketing y la telefonía que ya tienes. Cambiar de plataforma a nueve meses del plazo es el camino más caro.",
      },
      {
        title: "La evidencia es parte del entregable",
        body: "Un sistema que cumple pero no puede demostrarlo no sirve para una auditoría acreditada por ENAC. Diseñamos las dos cosas a la vez.",
      },
    ],
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Mi empresa está obligada a cumplir la Ley 10/2025?",
        a: "Si prestas servicios de suministro de agua, gas o electricidad, transporte de viajeros, servicios postales, comunicaciones electrónicas o servicios financieros, sí — con independencia de tu tamaño. Si operas en otro sector, quedas obligada si superas alguno de estos umbrales, que son alternativos: 250 personas trabajadoras, 50 millones de euros de volumen de negocios anual o 43 millones de balance anual. Se computa también a nivel de grupo de sociedades.",
      },
      {
        q: "¿Cuál es el plazo real para adaptarse?",
        a: "La ley entró en vigor el 28 de diciembre de 2025 y concede doce meses de adaptación: el 28 de diciembre de 2026 el servicio de atención tiene que cumplir. Un proyecto de implementación con integración a CRM y telefonía lleva entre seis y diez semanas contando el diagnóstico, así que el margen real para empezar es menor que el del calendario.",
      },
      {
        q: "¿Puedo cumplir con un chatbot?",
        a: "No por sí solo, y un chatbot mal diseñado te acerca al incumplimiento. La norma prohíbe atender exclusivamente con contestadores automáticos y obliga a dar atención personalizada cuando la clientela lo pide. La IA sirve para clasificar, enrutar y resolver lo repetitivo dentro del SLA — pero necesita una salida a persona explícita y sin bucles, y un registro de que esa salida existió.",
      },
      {
        q: "¿Hay que cambiar de CRM o de centralita?",
        a: "En la mayoría de los casos no. Trabajamos por API sobre lo que ya tienes y añadimos la capa que falta: medición de SLA, motor de plazos, clave identificativa y registro auditable. Migrar de plataforma a pocos meses del plazo suele ser el camino más caro y más arriesgado.",
      },
      {
        q: "¿Qué pasa con la auditoría anual de ENAC?",
        a: "La ley exige una auditoría anual de calidad por una entidad acreditada por ENAC. Nosotros no auditamos — preparamos el sistema para ser auditado: cuadro de mando de KPIs exportable y dossier de evidencias organizado por obligación. Reconstruir un año de registros la semana antes de la auditoría no es viable, por eso la evidencia se diseña desde el principio.",
      },
      {
        q: "¿Cuánto cuesta y en cuánto tiempo está en producción?",
        a: "El diagnóstico de brecha empieza en 1.500 € y dura una semana. La implementación empieza en 5.000 € y suele estar en producción en cuatro a ocho semanas según el número de canales y la complejidad de las integraciones. Después, un retainer mensual de mantenimiento normativo.",
      },
      {
        q: "¿Dais asesoramiento jurídico?",
        a: "No. Somos ingeniería: traducimos el requisito en sistema y en evidencia. La interpretación legal del alcance corresponde a tu asesoría. De hecho trabajamos bien como parte técnica de despachos y consultoras que ya llevan la parte legal de sus clientes.",
      },
      {
        q: "¿Cómo empezamos?",
        a: "Una llamada de 30 minutos para ver tus canales y tus tiempos actuales. Si hay encaje, proponemos el diagnóstico de brecha con alcance y precio cerrados, y de ahí sale el plan de implementación priorizado.",
      },
    ],
  },
};

/**
 * Contenido específico por sector para /es/cumplimiento/ley-atencion-al-cliente/[sector]/.
 * Regla anti-doorway: cada entrada aporta ≥40 % de contenido único sobre SHARED.
 * Las obligaciones cambian de verdad por sector, así que hay materia real.
 */
export const SECTORES: Record<
  SectorSlug,
  {
    nombre: string;
    nombreCorto: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    intro: string;
    alcance: string;
    especificos: { title: string; body: string }[];
    faq: { q: string; a: string }[];
  }
> = {
  "energia-agua-gas": {
    nombre: "Suministro y distribución de agua, gas y electricidad",
    nombreCorto: "Energía, agua y gas",
    metaTitle: "Ley 10/2025 para comercializadoras de energía, agua y gas",
    metaDescription:
      "Cómo cumplir la Ley 10/2025 en suministro de agua, gas y electricidad: SLA de 2 horas en continuidad, 5 días en facturación, atención 24/7 y evidencia auditable.",
    h1: "Ley 10/2025 en suministro de agua, gas y electricidad",
    intro:
      "El suministro es el sector donde la norma aprieta más: obligación con independencia del tamaño, atención 24 horas los 365 días para comunicar incidencias y un plazo de 2 horas para las que afectan a la continuidad del servicio.",
    alcance:
      "Obligadas todas las empresas de suministro y distribución, sin umbral de tamaño (art. 2.1.a).",
    especificos: [
      {
        title: "2 horas en continuidad del suministro",
        body: "Requiere clasificar la incidencia en la entrada y activar guardia automáticamente. Un buzón que se revisa por la mañana no cumple.",
      },
      {
        title: "5 días en facturación y cobros indebidos",
        body: "Es la tipología con más volumen. Conviene un flujo propio con acceso al sistema de facturación para resolver dentro del plazo sin rebotes.",
      },
      {
        title: "24 h / 365 días para comunicar incidencias",
        body: "Canal siempre activo con acuse inmediato y clave identificativa emitida en el momento, aunque la resolución se retome en horario.",
      },
    ],
    faq: [
      {
        q: "¿La obligación aplica también a comercializadoras pequeñas?",
        a: "Sí. En los servicios básicos de interés general la obligación no depende del número de personas trabajadoras ni de la facturación: aplica por la actividad.",
      },
    ],
  },

  "transporte-viajeros": {
    nombre: "Transporte de viajeros (aéreo, ferroviario, marítimo y por carretera)",
    nombreCorto: "Transporte de viajeros",
    metaTitle: "Ley 10/2025 para empresas de transporte de viajeros",
    metaDescription:
      "Cumplimiento de la Ley 10/2025 en transporte aéreo, ferroviario, marítimo y en autobús: picos de incidencia, SLA de 15 días y trazabilidad de reclamaciones.",
    h1: "Ley 10/2025 en transporte de viajeros",
    intro:
      "En transporte la dificultad no es el volumen medio, son los picos: una incidencia operativa concentra miles de contactos en horas, justo cuando el SLA del 95 % en menos de 3 minutos se mide igual que un día normal.",
    alcance:
      "Obligadas las empresas de transporte aéreo de pasajeros, ferroviario, marítimo o por vías navegables y de viajeros en autobús o autocar, sin umbral de tamaño (art. 2.1.b).",
    especificos: [
      {
        title: "Elasticidad ante picos",
        body: "El sistema tiene que absorber una cancelación masiva sin romper la media de 3 minutos: desbordamiento automático, respuesta asistida por IA en lo repetitivo y refuerzo bajo demanda.",
      },
      {
        title: "Reclamaciones con documentación",
        body: "Equipajes, retrasos y reembolsos llegan con adjuntos. La clave identificativa tiene que arrastrar los documentos entre canales sin que el cliente los reenvíe.",
      },
      {
        title: "Concurrencia con la normativa sectorial",
        body: "Los derechos del pasajero conviven con esta ley. El registro debe servir a las dos exigencias sin duplicar sistemas.",
      },
    ],
    faq: [
      {
        q: "¿Se solapa con los derechos del pasajero de la normativa europea?",
        a: "Conviven. La Ley 10/2025 fija cómo se atiende y en qué plazos se responde; la normativa sectorial fija qué compensación corresponde. El sistema de registro debe cubrir ambas.",
      },
    ],
  },

  "servicios-postales": {
    nombre: "Servicios postales",
    nombreCorto: "Servicios postales",
    metaTitle: "Ley 10/2025 para operadores de servicios postales",
    metaDescription:
      "Cómo adaptar la atención a la clientela a la Ley 10/2025 en servicios postales: trazabilidad de envíos, plazo de 15 días hábiles y evidencia para la auditoría.",
    h1: "Ley 10/2025 en servicios postales",
    intro:
      "El sector postal ya trabaja con trazabilidad de envíos, pero la norma exige trazabilidad de la gestión de atención — que es otra cosa y casi nunca está construida.",
    alcance: "Obligados todos los operadores de servicios postales, sin umbral de tamaño (art. 2.1.c).",
    especificos: [
      {
        title: "Dos trazabilidades distintas",
        body: "El número de seguimiento del envío no es la clave identificativa de la gestión. Hay que emitir y persistir la segunda, y relacionarla con la primera.",
      },
      {
        title: "Red de distribución fragmentada",
        body: "Cuando la incidencia se resuelve en delegación o en franquicia, el registro central tiene que recoger ese paso o la evidencia queda incompleta.",
      },
      {
        title: "Estacionalidad",
        body: "Las campañas concentran incidencias. El SLA se mide en media anual, pero un pico prolongado la arrastra.",
      },
    ],
    faq: [
      {
        q: "¿El número de seguimiento sirve como clave identificativa?",
        a: "No. Identifica el envío, no la gestión de atención. La norma pide una clave de la interacción, que puede referenciar al envío pero no confundirse con él.",
      },
    ],
  },

  telecomunicaciones: {
    nombre: "Servicios de comunicaciones electrónicas",
    nombreCorto: "Telecomunicaciones",
    metaTitle: "Ley 10/2025 para operadores de telecomunicaciones",
    metaDescription:
      "Cumplimiento de la Ley 10/2025 en telecomunicaciones: convivencia con la Ley 11/2022, SLA de atención, clave identificativa y evidencia para auditoría ENAC.",
    h1: "Ley 10/2025 en servicios de comunicaciones electrónicas",
    intro:
      "Telecomunicaciones es el sector con más historia de regulación de atención al cliente, y también donde más se nota la deuda técnica: capas de CRM, centralita y portales de autoservicio que nunca compartieron un identificador común.",
    alcance:
      "Obligados los servicios de comunicaciones electrónicas, incluidos los telefónicos, que se rigen además por su normativa sectorial y en particular por la Ley 11/2022, General de Telecomunicaciones (art. 2.1.d).",
    especificos: [
      {
        title: "Convivencia con la Ley 11/2022",
        body: "La norma sectorial sigue aplicando. El diseño tiene que satisfacer las dos sin duplicar registros ni contradecir plazos.",
      },
      {
        title: "Identificador único sobre sistemas fragmentados",
        body: "Es el punto de dolor real: la clave identificativa tiene que sobrevivir al salto entre canal comercial, soporte técnico y facturación.",
      },
      {
        title: "Volumen alto y externalización",
        body: "Con contact center externalizado, el SLA y la evidencia dependen de un tercero. Hay que instrumentar la medición del lado del operador, no del proveedor.",
      },
    ],
    faq: [
      {
        q: "Si el contact center está externalizado, ¿quién responde?",
        a: "La obligación es de la empresa que presta el servicio. Por eso conviene medir el SLA y guardar la evidencia en sistemas propios, no depender del reporte del proveedor.",
      },
    ],
  },

  "servicios-financieros": {
    nombre: "Servicios financieros",
    nombreCorto: "Servicios financieros",
    metaTitle: "Ley 10/2025 para entidades de servicios financieros",
    metaDescription:
      "Cómo cumplir la Ley 10/2025 en servicios financieros: convivencia con el SAC regulado, plazos de respuesta, trazabilidad y dossier para la auditoría anual.",
    h1: "Ley 10/2025 en servicios financieros",
    intro:
      "El sector financiero ya tiene servicio de atención al cliente regulado y departamento de reclamaciones. Lo que cambia es el estándar operativo: tiempos medibles, clave identificativa por interacción y evidencia exportable para una auditoría acreditada.",
    alcance:
      "Obligados los servicios financieros, que se rigen además por su normativa sectorial y en particular por la Ley 44/2002 de Medidas de Reforma del Sistema Financiero (art. 2.1.e).",
    especificos: [
      {
        title: "Dos capas de reclamación",
        body: "La atención ordinaria y el SAC regulado tienen plazos y formalidades distintos. El sistema tiene que distinguirlos en la entrada y no mezclar relojes.",
      },
      {
        title: "Trazabilidad con requisitos de conservación",
        body: "El registro convive con obligaciones de conservación y de protección de datos. Retención, cifrado y control de acceso forman parte del diseño, no son un añadido.",
      },
      {
        title: "Identificación del cliente",
        body: "La clave identificativa debe permitir seguimiento sin exponer datos en canales no autenticados. Se resuelve con referencia opaca y verificación en el canal.",
      },
    ],
    faq: [
      {
        q: "¿Sustituye al servicio de atención al cliente regulado?",
        a: "No, se suma. La normativa sectorial sigue vigente; la Ley 10/2025 añade estándares medibles de atención, trazabilidad y auditoría anual que hay que cumplir además.",
      },
    ],
  },
};
