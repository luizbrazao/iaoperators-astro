// Datos de la Frente A — cumplimiento de la Ley 10/2025 de servicios de atención a la clientela.
// Solo ES: la obligación es española y el comprador busca en español.
//
// Fuente normativa: Ley 10/2025, de 26 de diciembre (BOE-A-2025-26698).
// - Art. 2.1: sectores de servicios básicos de interés general (obligados sin umbral):
//   agua/gas/electricidad, transporte de viajeros, postales, comunicaciones electrónicas
//   (+Ley 11/2022) y financieros (+Ley 44/2002).
// - Art. 2.2: resto de empresas y grupos de sociedades, umbrales ALTERNATIVOS: al menos
//   250 personas trabajadoras, o volumen de negocios que haya excedido 50 M€, o balance
//   que haya excedido 43 M€. "Al menos" para personas trabajadoras, no "más de"/"superar".
// - Art. 2.5: los servicios financieros se rigen por su normativa sectorial; la Ley 10/2025
//   es de aplicación SUPLETORIA y NO se aplican el art. 13.8 ni los arts. 18, 19, 21, 22 y 23
//   — es decir, ni el sistema de evaluación de calidad ni la auditoría externa/ENAC alcanzan
//   al sector financiero. Verificado 2026-08-11 (antes la landing de servicios financieros
//   presentaba la auditoría anual como aplicable "además" — dato pendiente de corregir ahí).
// - Art. 8.2: 95 % de las solicitudes de atención personalizada atendidas, de media, en
//   menos de 3 minutos (vía menú de bot/contestador). Art. 8.1: prohibido el uso exclusivo
//   de contestadores automáticos.
// - Art. 10.3: 95 % de las llamadas recibidas atendidas, de media, en menos de 3 minutos.
//   Son dos objetivos del 95 %/3 min distintos: uno para llamadas en general (art. 10),
//   otro para las solicitudes de atención personalizada desde un menú automático (art. 8).
// - Art. 11.1: clave identificativa de toda consulta, queja, reclamación o incidencia. Para
//   consultas, solo es preceptiva si requieren acciones posteriores (no si se resuelven en
//   el momento).
// - Art. 12: justificante (contenido, fecha, hora) de la consulta/queja/reclamación/incidencia,
//   a petición del cliente; conservación de grabaciones al menos hasta la notificación de
//   la resolución.
// - Art. 17.1: plazo general de 15 días hábiles para consultas/quejas/reclamaciones/incidencias.
//   Art. 17.2: 2 horas para las relativas a la continuidad de servicios básicos. Art. 17.3:
//   5 días (sin calificar "hábiles" en el texto) para facturación y cobros indebidos.
// - Art. 14.2: disponibilidad 24 h/365 días, solo para los servicios básicos del art. 2 que
//   se presten de forma continuada, y solo para comunicar incidencias de continuidad.
// - Art. 21: sistema anual de evaluación de la calidad; periodicidad BIENAL admitida para
//   empresas de menos de 250 personas y volumen de negocios ≤50 M€.
// - Art. 22: auditoría externa anual sobre ese sistema (misma excepción bienal), por entidad
//   acreditada por la Entidad Nacional de Acreditación (ENAC).
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
    articulo: "Arts. 8 y 10",
    ley: "El 95 % de las llamadas recibidas debe atenderse, de media, en menos de tres minutos. La ley establece además un objetivo equivalente para las solicitudes de atención personalizada.",
    sistema:
      "Enrutado omnicanal con cola priorizada, medición de SLA en tiempo real y refuerzo cuando la cola se acerca al umbral.",
    riesgo: "Sin medición continua no puedes demostrar la media ante una auditoría.",
  },
  {
    articulo: "Art. 8",
    ley: "Atención personalizada bajo demanda. Prohibido el uso exclusivo de contestadores automáticos.",
    sistema:
      "Salida explícita del bot a persona en cualquier punto de la conversación, con traspaso del contexto completo y sin bucles de menú.",
    riesgo:
      "El acceso a atención personalizada debe estar disponible conforme a los requisitos de la ley; la automatización no puede convertirse en una barrera para llegar a una persona.",
  },
  {
    articulo: "Art. 17",
    ley: "Consultas, quejas, reclamaciones e incidencias: máximo general de 15 días hábiles, salvo que la normativa sectorial establezca otro plazo.",
    sistema:
      "Workflow de ticket con reloj de plazo sobre calendario laboral, avisos escalonados y escalado automático antes del vencimiento.",
    riesgo: "Automatizar el cómputo reduce el riesgo de errores en la gestión de plazos.",
  },
  {
    articulo: "Art. 17",
    ley: "Plazos específicos: hasta 2 horas para consultas o incidencias sobre la continuidad de servicios básicos de prestación continuada, y hasta 5 días en las relacionadas con facturación o cobros indebidos.",
    sistema:
      "Clasificación de la incidencia en la entrada por tipología y SLA diferenciado por clase, con rutas de guardia propias.",
    riesgo: "Un único SLA para todas las tipologías puede hacer que los casos con plazos especiales se gestionen incorrectamente.",
  },
  {
    articulo: "Art. 11",
    ley: "Clave identificativa o mecanismo equivalente de identificación cuando resulte exigible, de forma que la gestión pueda localizarse y seguirse.",
    sistema:
      "Generación y persistencia de identificadores cuando resultan exigibles, con continuidad entre canales y consulta del estado de la gestión.",
    riesgo: "Si cada canal genera su propio identificador, la trazabilidad se rompe en el traspaso.",
  },
  {
    articulo: "Art. 12",
    ley: "Constancia de cada consulta, queja, reclamación o incidencia —contenido, fecha y hora— y conservación de la documentación asociada.",
    sistema:
      "Registro técnico con controles de integridad, trazabilidad, conservación y exportación. Cuando la arquitectura lo requiere, utilizamos almacenamiento append-only y sellado temporal.",
    riesgo:
      "Un CRM editable por sí solo puede no ser suficiente para demostrar la integridad de las evidencias que deban conservarse.",
  },
  {
    articulo: "Art. 14",
    ley: "Disponibilidad 24 h / 365 días para comunicar incidencias de continuidad en los servicios básicos que se prestan de forma continuada.",
    sistema:
      "Canal de entrada siempre activo con acuse inmediato, cola nocturna y activación de guardia según criticidad.",
    riesgo: "El canal debe dejar constancia operativa de la recepción y permitir gestionar la incidencia conforme al plazo aplicable.",
  },
  {
    articulo: "Arts. 21-22",
    ley: "Sistema de evaluación de calidad y auditoría externa: anuales con carácter general, con posibilidad de periodicidad bienal para empresas de menos de 250 personas y hasta 50 M€ de volumen de negocio, y auditados por una entidad acreditada por ENAC. No aplica al sector financiero.",
    sistema:
      "Cuadro de mando y documentación del sistema de evaluación, con evidencias exportables para facilitar la auditoría de las mediciones de calidad cuando resulte aplicable.",
    riesgo: "Reconstruir un año de evidencias la semana antes de la auditoría no es viable.",
  },
];

export const SHARED = {
  arquitectura: {
    title: "Qué construimos",
    subtitle:
      "Una capa de atención diseñada para medir y gestionar los SLA aplicables y generar la evidencia técnica necesaria. Sobre tus sistemas actuales, no sustituyéndolos.",
    items: [
      {
        title: "Entrada omnicanal",
        body: "WhatsApp Cloud API, voz, email y web bajo un único flujo. Generación y persistencia de identificadores cuando resultan exigibles, con continuidad entre canales y consulta del estado de la gestión.",
      },
      {
        title: "Clasificación y enrutado con IA",
        body: "Un agente de IA clasifica tipología y extrae los datos relevantes en la entrada. La asignación del SLA aplicable y el enrutado a la cola correcta los resuelve un motor de reglas determinista y auditable, no la IA de forma implícita.",
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
        body: "Monitorización de SLA, evolución del sistema y actualización de las evidencias y métricas necesarias para el régimen de evaluación y auditoría que resulte aplicable.",
      },
    ],
  },

  porQue: {
    title: "De la norma a la operación",
    items: [
      {
        title: "Traducimos norma a arquitectura",
        body: "Traducimos los requisitos técnicos aplicables a arquitectura, integraciones, medición y evidencia para que puedan operarse sobre sistemas reales.",
      },
      {
        title: "Venimos de la auditoría de sistemas",
        body: "Nuestro trabajo base es inventariar ecosistemas digitales, mapear integraciones y encontrar puntos de fallo. Esta capa es una extensión natural de eso.",
      },
      {
        title: "Integramos, no sustituimos",
        body: "Cambiar de plataforma cerca del plazo puede añadir coste y riesgo operativo. Por eso primero evaluamos si es posible adaptar el CRM, ticketing y telefonía existentes.",
      },
      {
        title: "La evidencia es parte del entregable",
        body: "La medición y la evidencia se diseñan desde el principio, para que las obligaciones técnicas y los indicadores de calidad puedan revisarse cuando resulte necesario.",
      },
    ],
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Mi empresa está obligada a cumplir la Ley 10/2025?",
        a: "Si prestas servicios de suministro de agua, gas o electricidad, transporte de viajeros, servicios postales, comunicaciones electrónicas o servicios financieros, sí — con independencia de tu tamaño, aunque en servicios financieros la ley opera con carácter supletorio respecto de la normativa sectorial y determinados artículos no resultan aplicables. Si operas en otro sector, quedas obligada si alcanzas alguno de estos umbrales, que son alternativos: al menos 250 personas trabajadoras, más de 50 millones de euros de volumen de negocios anual o más de 43 millones de balance anual. Se computa también a nivel de grupo de sociedades. La aplicación concreta a tu empresa debe confirmarse con tu asesoría jurídica.",
      },
      {
        q: "¿Cuál es el plazo real para adaptarse?",
        a: "La ley entró en vigor el 28 de diciembre de 2025 y concede doce meses de adaptación: el 28 de diciembre de 2026 el servicio de atención tiene que cumplir. Un proyecto de implementación con integración a CRM y telefonía suele estar en producción en cuatro a ocho semanas contando el diagnóstico, así que el margen real para empezar es menor que el del calendario.",
      },
      {
        q: "¿Puedo cumplir con un chatbot?",
        a: "No por sí solo. Un chatbot puede formar parte del sistema, pero no sustituye las obligaciones de atención personalizada cuando la ley la exige: la norma prohíbe atender exclusivamente con contestadores automáticos y obliga a ofrecer esa vía a quien la pida. La IA sirve para clasificar, enrutar y resolver lo repetitivo dentro del SLA — pero necesita una salida a persona explícita y sin bucles, con registro de que esa salida existió.",
      },
      {
        q: "¿Hay que cambiar de CRM o de centralita?",
        a: "No necesariamente. Primero analizamos si los sistemas actuales permiten añadir la medición de SLA, gestión de plazos, identificación y trazabilidad necesarias. Cuando es viable, adaptar el stack existente puede reducir el coste y el riesgo operativo frente a una migración cerca del plazo.",
      },
      {
        q: "¿Qué exige la ley sobre evaluación de calidad y auditoría externa?",
        a: "La ley establece un sistema anual de evaluación de la calidad del servicio y una auditoría externa anual sobre ese sistema (arts. 21 y 22), con la posibilidad de periodicidad bienal para empresas de menos de 250 personas trabajadoras y hasta 50 millones de euros de volumen de negocio. Cuando resulta aplicable, la auditoría debe realizarla una entidad acreditada por ENAC. El sector financiero queda excluido de estos dos artículos, al regirse por su normativa sectorial. IA Operators no realiza esa auditoría: preparamos la capa técnica de medición y las evidencias necesarias para que el sistema pueda ser revisado.",
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
    /** Escena operativa concreta donde el SLA se rompe en este sector. */
    escenario: string;
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
    escenario:
      "Un corte de suministro en un barrio a las 22:40. En diez minutos entran trescientas llamadas y ochenta mensajes por canales digitales, todos sobre la misma incidencia. La norma no hace descuentos por volumen: el reloj de las 2 horas corre desde el primer aviso y cada persona que contacta tiene derecho a su clave de seguimiento.",
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
      {
        q: "¿El aviso de una incidencia cuenta como reclamación?",
        a: "Son cosas distintas y con relojes distintos: una interrupción de suministro entra por el plazo de 2 horas, mientras que una queja formal se resuelve en el plazo general de 15 días hábiles. Por eso la clasificación tiene que ocurrir en la entrada y no cuando alguien revisa la bandeja: si el sistema mete todo en la misma cola, el plazo corto se incumple sin que nadie se entere.",
      },
      {
        q: "¿Cómo se demuestra el plazo de 2 horas ante el auditor?",
        a: "Con sello temporal de entrada y de resolución sobre el mismo identificador, más el registro de la activación de guardia. Sin esos tres datos enlazados, lo que hay es una afirmación, no una evidencia.",
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
    escenario:
      "Una cancelación por meteorología a las 6:30 de la mañana. El pico de contactos se concentra en noventa minutos y multiplica por veinte el volumen de un día normal. La media del 95 % en menos de tres minutos se sigue midiendo igual ese día que cualquier otro.",
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
      {
        q: "¿La media del 95 % se calcula por día, por mes o por año?",
        a: "La norma habla de media sin fijar el periodo de cálculo, así que lo prudente es conservar la serie con granularidad suficiente para poder reconstruir cualquier ventana que pida el auditor. Guardar solo el agregado mensual deja sin defensa ante una pregunta por trimestre o por campaña.",
      },
      {
        q: "¿Podemos absorber el pico con un bot?",
        a: "Para lo repetitivo e informativo, sí, y es justo lo que hace sostenible la media en un día de incidencia masiva. Pero la norma prohíbe atender exclusivamente con sistemas automáticos y obliga a dar atención personalizada a quien la pida: el bot necesita una salida a persona explícita y registrada, no un menú del que no se sale.",
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
    escenario:
      "Un envío marcado como entregado que el destinatario dice no haber recibido. La gestión pasa por la delegación de reparto, vuelve a atención central y acaba en reclamación formal. Si cada salto genera su propio identificador, la trazabilidad que pide la ley sencillamente no existe.",
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
      {
        q: "¿Aplica a delegaciones y franquiciados?",
        a: "La obligación es del operador que presta el servicio, con independencia de quién resuelva materialmente la incidencia. Si parte de la gestión ocurre en una oficina franquiciada y ese paso no llega al registro central, la evidencia queda incompleta justo en el tramo que el auditor va a mirar.",
      },
      {
        q: "¿Y las empresas de paquetería que no prestan servicio postal universal?",
        a: "El art. 2.1.c habla de servicios postales sin más matices, así que el encaje de una actividad concreta de mensajería o paquetería conviene confirmarlo con tu asesoría antes de decidir. Nosotros implementamos; la calificación jurídica de la actividad no nos corresponde.",
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
    escenario:
      "Un cliente reclama una factura, le atienden en el canal comercial, le derivan a soporte técnico y termina en el portal de autoservicio. Tres sistemas, tres identificadores y un plazo de quince días hábiles que nadie está contando de punta a punta.",
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
      {
        q: "¿La Ley 11/2022 no cubría ya esto?",
        a: "La normativa sectorial sigue vigente y la Ley 10/2025 se suma a ella: el art. 2.1.d lo dice expresamente. En la práctica hay que satisfacer las dos sin duplicar registros ni dejar que dos plazos distintos convivan sobre el mismo expediente sin que nadie sepa cuál manda.",
      },
      {
        q: "¿Hay que unificar el CRM comercial con el de soporte?",
        a: "No necesariamente. Lo que hay que unificar es el identificador y el reloj: la clave identificativa debe sobrevivir al salto entre sistemas y el plazo debe contarse sobre el expediente completo. Eso se resuelve con una capa de correlación por API, que es mucho más barato y menos arriesgado que una migración de plataforma a pocos meses del plazo.",
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
    escenario:
      "Una reclamación por un cargo indebido entra por el chat de la app. Puede resolverse como incidencia ordinaria dentro del plazo de cinco días o escalar al servicio de atención al cliente regulado, con su procedimiento y su plazo propios. Clasificarla mal en la entrada estropea los dos relojes a la vez.",
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
      {
        q: "¿Podemos dar clave de seguimiento sin exponer datos del cliente?",
        a: "Sí, y es la forma correcta de hacerlo: la clave debe ser una referencia opaca, que no revele nada por sí misma, y la consulta del estado debe exigir verificación en el canal. Así se cumple el derecho de seguimiento sin convertir el identificador en un vector de acceso a información de la cuenta.",
      },
      {
        q: "¿Cuánto tiempo hay que conservar la evidencia?",
        a: "Aquí conviven la trazabilidad que pide esta ley, las obligaciones sectoriales de conservación y el principio de limitación del plazo del RGPD. La política de retención se define caso por caso con tu asesoría; nosotros la implementamos en el sistema, con borrado y exportación automatizados según lo que se acuerde.",
      },
    ],
  },
};
