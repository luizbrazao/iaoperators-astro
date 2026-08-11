// Los cinco casos del silo de integración, en español. Fuente original.
//
// Hasta ago/2026 este contenido vivía dentro de `src/data/integracion.ts`,
// cuando el silo era ES-only. Al traducirse a EN y PT, cada idioma pasa a su
// propio fichero y `integracion.ts` se queda con los tipos, los slugs y los
// helpers. El texto español NO se ha tocado en la mudanza.
//
// REGLA ANTI-DOORWAY (docs/plan-arquitectura-2026-08.md §7.4): la mayor parte
// del contenido de cada caso es propio —síntoma, por qué no se compra la
// solución, patrones concretos, entregables y FAQ—. Lo compartido entre casos
// se resume y se enlaza al hub en lugar de repetirse.
//
// FUENTES VERIFICADAS (2026-08-10):
// - WhatsApp Business Platform: el cobro es POR MENSAJE (el modelo por
//   conversación quedó obsoleto). Categorías de plantilla: marketing, utility y
//   authentication. Los mensajes libres dentro de la ventana de atención de 24 h
//   abierta por el usuario no se cobran, ni los recibidos del usuario, ni los
//   enviados dentro de la ventana de free entry point de 72 h.
//   https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing

import type { CasoIntegracion, CasoKey, SharedIntegracion } from "./types";

export const SHARED_ES: SharedIntegracion = {
  proceso: {
    title: "Cómo lo abordamos",
    subtitle: "El mismo equipo que diagnostica es el que construye, sin traspasos.",
    phases: [
      {
        code: "01",
        title: "Diagnóstico",
        plazo: "3–5 días",
        body: "Mapeamos sistemas, flujos de datos y dependencias reales, incluidas las que no están documentadas. Salida: alcance cerrado y la lista de lo que se rompe hoy.",
      },
      {
        code: "02",
        title: "Diseño de la integración",
        plazo: "1 semana",
        body: "Contratos de datos, dirección de la sincronización, política de reintentos y quién es dueño de cada campo. Se decide antes de escribir código porque es lo caro de cambiar después.",
      },
      {
        code: "03",
        title: "Implementación y pruebas",
        plazo: "2–6 semanas",
        body: "Construcción con la casuística real, no con el caso feliz. Pruebas contra los sistemas de verdad y despliegue por fases.",
      },
      {
        code: "04",
        title: "Producción y observabilidad",
        plazo: "continuo",
        body: "Panel de estado, alarmas cuando algo lleva demasiado tiempo sin confirmar y mantenimiento de las integraciones cuando las APIs de terceros cambian.",
      },
    ],
  },

  principios: [
    {
      title: "Idempotencia por defecto",
      body: "Toda operación se puede repetir sin duplicar nada. Es lo que permite reintentar sin miedo, y sin ello ninguna integración sobrevive al primer corte de red.",
    },
    {
      title: "Estado observable",
      body: "Cada mensaje tiene estado consultable: pendiente, enviado, confirmado, fallido. Una integración que solo se ve cuando falla ya falló antes.",
    },
    {
      title: "Un solo dueño por dato",
      body: "Para cada campo hay un sistema que manda y los demás obedecen. La sincronización bidireccional sin esa regla acaba en bucles y en datos que cambian solos.",
    },
    {
      title: "IA donde decide, no donde calcula",
      body: "Clasificar, extraer y redactar son tareas de modelo. Sumar, validar y encaminar son tareas de código. Mezclarlo al revés sale caro y es imposible de auditar.",
    },
  ],

  tech: [
    "Node / TypeScript",
    "Colas con reintento",
    "Supabase / PostgreSQL",
    "n8n",
    "Webhooks firmados",
    "LangChain",
    "Docker",
    "Vercel",
  ],
};

export const CASOS_ES: Record<CasoKey, CasoIntegracion> = {
  erp: {
    nombre: "Empresas con un ERP propio, a medida o muy adaptado",
    nombreCorto: "ERP",
    // El H1 puede ser largo; el <title> no, porque lleva el sufijo de marca y
    // Google lo trunca. Por eso aquí no coinciden. El title es el dueño de la
    // intención "integración ERP para empresas"; el H1 conserva el gancho.
    metaTitle: "Integración de ERP para empresas",
    metaDescription:
      "Conectamos tu ERP —propio, a medida o de mercado— con e-commerce, TPV, CRM y facturación. Sin migrar de sistema y sin tocar la base de datos de producción.",
    h1: "Integración de ERP: conectar tu ERP con el resto del negocio",
    schemaName: "Integración de ERP para empresas",
    serviceType: "Integración de ERP",
    heroCta: { label: "Cuéntanos qué ERP utilizas →", href: "/es/contact/" },
    labels: {
      back: "← Integración de sistemas",
      puentesTitle: "Relacionado con la integración de ERP",
      faqTitle: "Preguntas frecuentes sobre integración de ERP",
      otros: "Otras integraciones",
    },
    // TODO SEO/PROOF: añadir case real de integración ERP cuando exista un
    // proyecto publicable. Revisado 2026-08-11: ningún proyecto de
    // src/data/projects.ts implica ERP de forma directa (Menorca es auditoría,
    // ChatPlug es CRM/reservas sobre Altegio). No inventar prueba.
    intro:
      "El ERP suele ser el sistema con más verdad de la empresa y con menos conexiones. Todo el mundo lo consulta, casi nadie puede escribir en él, y por eso a su alrededor crece una capa de hojas de cálculo que hace de pegamento.",
    sintoma:
      "La señal es siempre la misma: alguien exporta un CSV del ERP cada mañana. A veces son dos personas y dos CSV distintos. Ese fichero es una integración —solo que la ejecuta un humano, no falla nunca de forma visible y nadie sabe qué pasa el día que esa persona está de baja.",
    porQue: {
      title: "Por qué cambiar de ERP no lo arregla",
      body: "La propuesta habitual del mercado es migrar a un ERP moderno que «ya viene integrado». El problema es que un ERP con años encima no es un programa: es la lógica real del negocio, con sus excepciones, sus descuentos raros y sus flujos que nadie documentó. Migrar significa redescubrir todo eso bajo presión y con la operación en marcha. Cuando el ERP funciona y lo único que falta es que hable con los demás sistemas, construir esa capa de conexión cuesta una fracción y no pone en riesgo la facturación del mes que viene.",
    },
    patrones: [
      {
        title: "Pedido entrante hacia el ERP",
        body: "El pedido nace fuera —tienda online, TPV, marketplace, comercial con el móvil— y tiene que llegar al ERP una sola vez, con sus líneas, sus impuestos y su cliente correctamente resuelto.",
        riesgo:
          "Sin una clave de idempotencia basada en la referencia externa, un reintento crea el pedido dos veces. Es el fallo más común y el más caro de deshacer.",
      },
      {
        title: "Stock del ERP hacia los canales de venta",
        body: "El dato de existencias vive en el ERP y lo necesitan la web, el marketplace y la tienda. La pregunta de diseño no es cómo copiarlo, es con cuánto retraso es aceptable y qué se hace con el stock reservado y no confirmado.",
        riesgo:
          "Publicar el stock real sin reserva provoca sobreventa en campañas. Publicar un stock conservador deja dinero encima de la mesa. Es una decisión de negocio disfrazada de decisión técnica.",
      },
      {
        title: "Facturación y cobro",
        body: "Del pedido a la factura y del cobro a la conciliación. Aquí es donde el ERP toca la pasarela de pago, el banco y, para las empresas y profesionales obligados por el RRSIF, los requisitos de los sistemas de facturación aplicables en 2027.",
        riesgo:
          "En los sistemas de facturación sujetos al RRSIF, esta parte de la integración además debe cumplir los requisitos regulatorios y su calendario de adaptación.",
      },
      {
        title: "Reporting sin tocar producción",
        body: "Los informes se construyen contra una réplica o un almacén analítico, no contra la base de datos que atiende la operación.",
        riesgo:
          "Una consulta pesada lanzada a la base de datos de producción a las once de la mañana bloquea la facturación. Ocurre más de lo que se cuenta.",
      },
    ],
    entregables: [
      "Mapa de flujos de datos entre el ERP y cada sistema conectado",
      "Conectores con cola, reintento e idempotencia por operación",
      "Contrato de datos por flujo: qué campos, quién manda, qué pasa en conflicto",
      "Panel de estado con alarma por antigüedad de pendientes",
      "Documentación de la integración y traspaso al equipo interno",
    ],
    puentes: [
      {
        href: "/es/cumplimiento/verifactu/erp-a-medida/",
        label: "Verifactu sobre un ERP propio",
        body: "Si tu sistema de facturación está sujeto al RRSIF, deberá adaptarse a los requisitos aplicables en 2027. Es una integración con calendario regulatorio.",
      },
      {
        href: "/es/auditoria-de-sistemas/",
        label: "Auditoría de sistemas",
        body: "Cuando no está claro cuántos sistemas hay ni cuáles se hablan, el diagnóstico va antes que el conector.",
      },
      {
        href: "/es/integracion/sistemas-legados/",
        label: "Sistemas legados",
        body: "Si el ERP no expone API y solo hay acceso a la base de datos, el patrón cambia.",
      },
      {
        href: "/es/blog/como-integrar-un-erp-metodos/",
        label: "Los cuatro métodos, explicados",
        body: "API, eventos, base de datos o ficheros: cuál te toca según lo que tu ERP expone, y qué se rompe en cada uno.",
      },
    ],
    faq: [
      {
        q: "¿Hay que tener API en el ERP para integrarlo?",
        a: "Ayuda mucho, pero no es imprescindible. Por orden de preferencia: API documentada, eventos o webhooks, acceso de solo lectura a la base de datos, y ficheros de intercambio. Cada escalón añade trabajo y fragilidad, y el último exige acordar una ventana de proceso. Lo que sí es imprescindible es que exista alguna vía de escritura controlada: si el ERP es una caja cerrada sin ningún punto de entrada, la integración se vuelve un proyecto con el proveedor, no con nosotros.",
      },
      {
        q: "¿Vais a tocar la base de datos del ERP?",
        a: "Solo lectura, y preferiblemente sobre una réplica. Escribir directamente en las tablas de un ERP salta sus validaciones internas y produce datos que la propia aplicación no sabe interpretar. Cuando no hay API de escritura, la conversación correcta es con el proveedor del ERP, no un INSERT a mano.",
      },
      {
        q: "¿Cuánto tarda una integración de ERP?",
        a: "Entre tres y ocho semanas contando el diagnóstico, según cuántos flujos entren en el alcance y cómo de accesible sea el ERP. Lo que alarga los proyectos casi nunca es el conector: son las excepciones de negocio que aparecen al mirar los datos reales —el cliente que factura a otra razón social, el descuento que se aplica a mano, el pedido que se parte en dos albaranes—.",
      },
      {
        q: "¿Y si el año que viene cambiamos de ERP?",
        a: "Entonces conviene diseñar la integración con esa hipótesis encima de la mesa. Una capa de conectores con contratos de datos explícitos sobrevive mucho mejor a un cambio de ERP que un montón de automatizaciones acopladas a los nombres de las tablas actuales. No es gratis, pero es la diferencia entre rehacer una pieza y rehacerlo todo.",
      },
    ],
  },

  crm: {
    nombre: "Equipos comerciales con CRM",
    nombreCorto: "CRM",
    // El título ya no dice "CRM para empresas": esa query la sirven comparativas
    // de producto ("los mejores CRM") y es de quien va a comprar un CRM, no de
    // quien quiere integrar el que ya tiene. Ver src/data/keywords-primarias.ts.
    // Tampoco dice "conectarlo con tu ERP": la página cubre captura multicanal,
    // deduplicación, clasificación y enrutado además de la sincronización con
    // ERP, y ese framing invadía el territorio de /es/integracion/erp/.
    metaTitle: "Integración y automatización de CRM",
    metaDescription:
      "Leads que entran sin duplicados, actividad registrada sin teclear y sincronización con ERP. Integramos y automatizamos el CRM que ya utilizas.",
    h1: "Integración y automatización de CRM",
    schemaName: "Integración y automatización de CRM",
    serviceType: "Integración y automatización de CRM",
    heroCta: { label: "Cuéntanos qué CRM utilizas →", href: "/es/contact/" },
    labels: {
      back: "← Integración de sistemas",
      puentesTitle: "Relacionado con la integración de CRM",
      faqTitle: "Preguntas frecuentes sobre integración de CRM",
      otros: "Otras integraciones",
    },
    queEs: {
      title: "Qué significa integrar y automatizar un CRM",
      p1: "Integrar un CRM significa conectarlo con los canales y sistemas donde nace y avanza la relación comercial —formularios, email, WhatsApp, llamadas, ERP u otras aplicaciones— para que los datos lleguen y se actualicen sin depender de copias manuales.",
      p2: "Automatizarlo añade reglas y modelos para clasificar, resumir, enriquecer y enrutar información, manteniendo las decisiones que afectan al negocio en lógica explícita y auditable.",
    },
    // TODO SEO/PROOF: añadir case real de integración/automatización CRM
    // cuando exista uno publicable. Revisado 2026-08-11: ChatPlug sincroniza
    // WhatsApp con Altegio (booking, no CRM comercial) y el chatbot de
    // reservas registra leads en una hoja de cálculo, no en un CRM. Ninguno
    // documenta deduplicación, clasificación/enrutado o sincronización CRM↔ERP.
    // No forzar el ajuste.
    intro:
      "Un CRM no falla por falta de funciones. Falla porque mantenerlo al día es trabajo manual, y el trabajo manual solo se hace cuando alguien mira. La integración consiste en que actualizar el CRM deje de depender de que alguien se acuerde de hacerlo.",
    sintoma:
      "El CRM está impecable el día antes de la reunión de ventas. Los dos meses anteriores, no. Cuando la calidad del dato depende del calendario de reuniones, lo que hay no es un CRM: es un informe que se rellena a posteriori.",
    porQue: {
      title: "Por qué cambiar de CRM tampoco lo arregla",
      body: "La migración de CRM se vende como la solución al problema de adopción, y a veces mejora la situación durante un tiempo. Después vuelve el mismo patrón, porque la causa no estaba en la herramienta: estaba en que introducir la información seguía siendo trabajo de la persona que menos gana introduciéndola. Un comercial no deja de actualizar el CRM por rebeldía; deja de hacerlo porque cada registro añade fricción entre él y su siguiente llamada. Lo que cambia el comportamiento es que el registro ocurra solo.",
    },
    patrones: [
      {
        title: "Captura de leads multicanal con deduplicación",
        body: "Formulario web, WhatsApp, teléfono, campaña de pago, feria. El mismo lead entra por dos o tres sitios con datos ligeramente distintos y hay que resolverlo a una sola ficha.",
        riesgo:
          "Sin una regla de identidad explícita —qué campo manda, qué tolerancia hay en el nombre, qué pasa con dos personas de la misma empresa—, el CRM se llena de duplicados y el equipo deja de fiarse de él.",
      },
      {
        title: "Calificación y enrutado con modelo",
        body: "Clasificar un lead por sector, intención y urgencia a partir de texto libre es exactamente lo que un modelo hace bien, y lo que un árbol de reglas hace mal. La decisión de a quién se asigna, en cambio, es una regla de negocio y debe seguir siendo código legible.",
        riesgo:
          "Poner el modelo a decidir asignaciones o descuentos convierte un error puntual en un error que nadie puede explicar al cliente.",
      },
      {
        title: "Actividad registrada sin teclear",
        body: "Llamadas, mensajes de WhatsApp y correos aparecen en la ficha con su resumen, sin que nadie copie nada. El comercial corrige, no transcribe.",
        riesgo:
          "Registrar automáticamente sin control de acceso ni política de retención mete conversaciones de clientes en un sistema que no estaba pensado para ellas. Es una decisión que conviene revisar antes, no después.",
      },
      {
        title: "Sincronización CRM ↔ ERP",
        body: "El cliente existe en los dos sistemas y en los dos se puede editar. La pregunta es quién manda en cada campo: el nombre comercial suele ser del CRM, los datos fiscales y el crédito son del ERP.",
        riesgo:
          "Una sincronización bidireccional sin dueño por campo produce bucles: A escribe, B detecta el cambio y reescribe, A vuelve a detectarlo. Se ve enseguida y cuesta mucho de limpiar.",
      },
    ],
    entregables: [
      "Regla de identidad de contactos y proceso de deduplicación",
      "Captura automatizada desde todos los canales activos",
      "Clasificación y enrutado con criterios auditables",
      "Sincronización con el ERP, con dueño declarado por campo",
      "Panel de calidad del dato: duplicados, fichas incompletas, leads sin tocar",
    ],
    puentes: [
      {
        href: "/es/integracion/whatsapp-business-api/",
        label: "WhatsApp Business API",
        body: "Si buena parte de la conversación comercial pasa por WhatsApp, el canal es parte del CRM.",
      },
      {
        href: "/es/servicios/automatizacion-ia/",
        label: "Automatización con IA",
        body: "La clasificación y el resumen de conversaciones son el trabajo del modelo dentro de este flujo.",
      },
      {
        href: "/es/integracion/erp/",
        label: "Integración de ERP",
        body: "El otro extremo de la ficha de cliente, y el que manda en los datos fiscales.",
      },
      {
        href: "/es/blog/por-que-tu-equipo-no-usa-el-crm/",
        label: "Por qué nadie lo usa",
        body: "La adopción no es un problema de formación: es que quien teclea el dato no es quien lo aprovecha.",
      },
    ],
    faq: [
      {
        q: "¿Funciona con cualquier CRM?",
        a: "Con la mayoría de CRM actuales que exponen API o webhooks. La diferencia real no está en la marca, sino en dos cosas: si permite crear campos personalizados para guardar el rastro de la integración, y si sus límites de llamadas por minuto aguantan tu volumen. Ambas se comprueban en el diagnóstico, antes de comprometer un alcance.",
      },
      {
        q: "¿La IA decide a qué comercial va cada lead?",
        a: "No, y es deliberado. El modelo clasifica —sector, intención, urgencia— porque eso exige entender texto libre. La asignación se resuelve con reglas explícitas sobre esa clasificación, porque tiene consecuencias sobre personas y comisiones, y tiene que poder explicarse y auditarse. Es la separación que aplicamos en todos los flujos: el modelo interpreta, el código decide.",
      },
      {
        q: "¿Qué pasa con los duplicados que ya tenemos?",
        a: "Se abordan por separado, y normalmente antes de conectar nada. Un CRM que ya arrastra duplicados y recibe además captura automática multiplica el problema. La limpieza inicial es un trabajo acotado: se define la regla de identidad, se agrupan candidatos, y las fusiones ambiguas se revisan a mano una sola vez.",
      },
      {
        q: "¿Esto sustituye al equipo comercial?",
        a: "Sustituye la parte de su día que consiste en copiar información de un sitio a otro. El objetivo no es reducir plantilla: es que el seguimiento deje de depender de la memoria de cada persona y que los leads no se enfríen por falta de seguimiento.",
      },
    ],
  },

  "whatsapp-business-api": {
    nombre: "Empresas que atienden y venden por WhatsApp",
    nombreCorto: "WhatsApp Business API",
    metaTitle: "WhatsApp Business API: integración y automatización",
    metaDescription:
      "Integramos WhatsApp Business API con tu CRM y tu ERP: plantillas, ventana de 24 horas, agentes con estado y trazabilidad. No es la app de WhatsApp Business.",
    h1: "WhatsApp Business API: integración y automatización",
    labels: {
      back: "← Integración de sistemas",
      puentesTitle: "Relacionado con WhatsApp Business API",
      faqTitle: "Preguntas frecuentes sobre WhatsApp Business API",
      otros: "Otras integraciones",
    },
    heroCta: { label: "Cuéntanos cómo utilizas WhatsApp hoy →", href: "/es/contact/" },
    serviceType: "Integración y automatización de WhatsApp Business API",
    queEs: {
      title: "Qué es WhatsApp Business API",
      p1: "WhatsApp Business API —parte de WhatsApp Business Platform— permite conectar el canal de WhatsApp con software empresarial para recibir y enviar mensajes de forma programática, distribuir conversaciones entre agentes y registrar lo que ocurre en otros sistemas.",
      p2: "Eso permite integrar WhatsApp con CRM, ERP, reservas o soporte y construir automatizaciones y agentes que consultan información real, mantienen contexto y escalan la conversación a una persona cuando hace falta.",
    },
    // Caso real: ChatPlug conecta WhatsApp Business API con Altegio (agenda de
    // salones/clínicas) en tiempo real. Único proyecto del portfolio con
    // integración WhatsApp↔plataforma de reservas documentada públicamente.
    // Datos tomados de src/i18n/locales/es/projects.json (chatplug: problem,
    // engineeringIntro, howItWorks, impact, metrics) — nada inventado.
    caseStudy: {
      title: "WhatsApp Business API en producción",
      context:
        "ChatPlug conecta WhatsApp Business API con Altegio, el sistema de agenda de salones y clínicas: los chatbots genéricos no se conectan con la agenda real, lo que generaba dobles reservas y clientes sin respuesta fuera de horario.",
      sistemas: [
        "WhatsApp Business API: recibe, entiende y responde cada mensaje, en varios idiomas",
        "Altegio: la integración consulta y confirma disponibilidad real, reserva, cancela y reprograma directamente",
      ],
      resultado:
        "Reservas confirmadas en segundos, operación continua 24/7 y menos conflictos de agenda, con salida a una persona cuando la conversación lo requiere.",
      href: "/es/portfolio/chatplug-whatsapp-altegio/",
      cta: "Ver el caso completo →",
    },
    intro:
      "WhatsApp es el canal donde ya están tus clientes y, casi siempre, el peor documentado de la empresa. La API cambia eso: convierte una conversación que vivía en el móvil de alguien en un flujo con estado, historial y reglas.",
    sintoma:
      "El número de la empresa está instalado en el teléfono de una persona. Si esa persona libra, nadie contesta; si se va, el historial se va con ella. Y no hay forma de responder a la pregunta «¿cuánto tardamos en contestar?» con un número.",
    porQue: {
      title: "La API no es la app, y la diferencia importa",
      body: "Hay productos de WhatsApp orientados a usos distintos. La WhatsApp Business Platform está diseñada para operar el canal de forma programática: conectarla con agentes o bots, integrarla con CRM y otros sistemas, trabajar con plantillas y mantener trazabilidad del flujo. La app WhatsApp Business, en cambio, está pensada para que una persona atienda manualmente desde el móvil. Meta permite hoy que ambas convivan sobre el mismo número en determinadas configuraciones, pero automatizar de verdad —varios agentes de software, envíos por API, integración con otros sistemas— sigue pasando por la Business Platform. La configuración empresarial, el registro del número y, cuando corresponde según las capacidades que necesites, la verificación del negocio forman parte de su alta, y las plantillas pasan por el proceso de aprobación de Meta antes de poder enviarse.",
    },
    patrones: [
      {
        title: "Plantillas y ventana de atención",
        body: "La estructura de precios de Meta distingue entre tipos de mensaje y el contexto en el que se envían, y cambia con el tiempo, así que la verificamos al dimensionar cada proyecto en lugar de darla por fija. Lo estable es el diseño: cuando el cliente escribe primero se abre una ventana de atención en la que se puede responder con mensajes libres, y las plantillas —de marketing, utility o authentication— sirven para retomar la conversación fuera de esa ventana o para notificaciones proactivas.",
        riesgo:
          "Resolver con plantilla de marketing lo que cabía dentro de la ventana de atención multiplica el coste sin mejorar nada. Y las plantillas requieren aprobación previa de Meta, así que no se improvisan un viernes.",
      },
      {
        title: "Agente con estado, no árbol de botones",
        body: "El menú numerado envejece mal: en cuanto el cliente escribe algo que no está en la lista, el flujo se rompe. Un agente con modelo mantiene el contexto de la conversación, entiende la reformulación y sabe cuándo no sabe.",
        riesgo:
          "Un agente sin estado persistente pierde el hilo entre mensajes y repite preguntas. Un agente sin salida a humano frustra exactamente en los casos que más importan.",
      },
      {
        title: "Escalado a persona con contexto",
        body: "Cuando la conversación pasa a un humano, tiene que llegar con el resumen y el histórico, no con un «hola, ¿en qué puedo ayudarle?» que obliga al cliente a repetirlo todo.",
        riesgo:
          "Es el punto donde se pierde la confianza ganada. Un traspaso mal hecho hace que el cliente prefiera el teléfono la próxima vez.",
      },
      {
        title: "Conexión con el sistema que tiene la respuesta",
        body: "Consultar un pedido, reservar una cita o comprobar disponibilidad exige llegar al ERP, al CRM o al motor de reservas en tiempo real. Sin eso, el agente solo puede hablar de generalidades.",
        riesgo:
          "Un agente que responde con información desactualizada porque consulta una copia nocturna genera más incidencias de las que resuelve.",
      },
    ],
    entregables: [
      "Alta y verificación del número en la plataforma, con el proveedor que corresponda",
      "Diseño, alta y gestión de plantillas para los casos de uso definidos, sujetas al proceso de aprobación de Meta",
      "Agente conversacional con estado persistente y salida a humano",
      "Conexión en tiempo real con el sistema que tiene el dato",
      "Métricas de canal: tiempo de primera respuesta, resolución y coste por conversación",
    ],
    puentes: [
      {
        href: "/es/cumplimiento/ley-atencion-al-cliente/",
        label: "Ley 10/2025 de atención a la clientela",
        body: "Si atiendes reclamaciones por WhatsApp, el canal entra en el ámbito de la norma y sus plazos.",
      },
      {
        href: "/es/servicios/chatbots/",
        label: "Chatbots para empresas",
        body: "El mismo agente, visto desde el servicio en lugar de desde el canal.",
      },
      {
        href: "/es/integracion/crm/",
        label: "Integración de CRM",
        body: "Para que la conversación acabe en la ficha del cliente y no en un móvil.",
      },
      {
        href: "/es/blog/cuanto-cuesta-whatsapp-business-api/",
        label: "Cuánto cuesta de verdad",
        body: "Cómo funciona el modelo de cobro de Meta y qué otros costes entran en una integración real.",
      },
    ],
    faq: [
      {
        q: "¿Cuánto cuesta WhatsApp Business API?",
        a: "Hay dos costes separados. El de Meta sigue una estructura por mensaje que distingue entre tipos de plantilla —marketing, utility y authentication— y el contexto en el que se envían: los mensajes que no son de plantilla, y algunas plantillas dentro de la ventana de atención abierta, no se cobran según las reglas vigentes. Esas reglas cambian con cierta frecuencia, así que las verificamos al dimensionar cada proyecto en lugar de citarlas de memoria. El segundo coste es el del proveedor a través del que se accede a la plataforma, y varía mucho según el modelo comercial.",
      },
      {
        q: "¿Puedo seguir usando mi número actual?",
        a: "En muchos casos sí. Meta ofrece dos caminos: una migración tradicional a la plataforma, en la que el número deja de operar desde la app, o coexistencia entre la app y la plataforma sobre el mismo número, cuando la configuración es compatible. La coexistencia tiene condiciones propias —versión de la app, alta a través de un proveedor y una ventana de tiempo para sincronizar el historial— y no aplica igual a todas las cuentas. Si el número es el móvil personal de alguien, conviene planificar el cambio antes de empezar, no durante. Lo comprobamos en el diagnóstico.",
      },
      {
        q: "¿Puedo enviar campañas masivas?",
        a: "Con plantillas previamente aprobadas de la categoría correspondiente y con consentimiento del destinatario. El envío sin opt-in no es solo un problema de normativa de protección de datos: es la vía rápida para que los usuarios marquen el número como spam y la plataforma degrade la calidad de la cuenta, lo que reduce el volumen que se te permite enviar.",
      },
      {
        q: "¿El agente puede resolver sin intervención humana?",
        a: "Una parte, y conviene medir cuál en lugar de prometerla. Las consultas de estado, disponibilidad y datos concretos se resuelven bien de punta a punta cuando el agente tiene acceso al sistema que guarda la respuesta. Las negociaciones, las reclamaciones y todo lo que tenga carga emocional se diseñan para escalar pronto. La métrica que seguimos no es «porcentaje automatizado», es cuántas conversaciones terminan resueltas sin que el cliente tenga que repetir lo que ya dijo.",
      },
    ],
  },

  "api-y-webhooks": {
    nombre: "Empresas que necesitan conectar aplicaciones y sistemas",
    nombreCorto: "APIs y webhooks",
    // El H1 se queda como está (gancho comercial); el title pasa a nombrar la
    // intención "integración de APIs y webhooks" tal cual se busca.
    metaTitle: "Integración de APIs y webhooks a medida",
    metaDescription:
      "Conectamos aplicaciones por API y webhooks con idempotencia, reintentos, firma y estado observable. Lo que no tiene API, se resuelve por otra vía.",
    h1: "Integraciones por API y webhooks a medida",
    schemaName: "Integración de APIs y webhooks a medida",
    serviceType: "Integración de APIs y webhooks",
    heroCta: { label: "Cuéntanos qué sistemas quieres conectar →", href: "/es/contact/" },
    labels: {
      back: "← Integración de sistemas",
      puentesTitle: "Relacionado con APIs y webhooks",
      faqTitle: "Preguntas frecuentes sobre APIs y webhooks",
      otros: "Otras integraciones",
    },
    queEs: {
      title: "Qué es una integración por API y webhooks",
      p1: "Una integración por API permite que dos aplicaciones intercambien datos y ejecuten acciones de forma controlada. Los webhooks añaden la parte reactiva: un sistema avisa al otro cuando ocurre un evento, sin necesidad de consultarlo constantemente.",
      p2: "En producción, conectar dos endpoints es solo el principio. La integración también tiene que gestionar duplicados, reintentos, errores, límites de llamadas, seguridad y trazabilidad para que un fallo de un tercero no termine afectando a la operación.",
    },
    // TODO SEO/PROOF: añadir case real de integración por API/webhooks cuando
    // exista uno publicable. Revisado 2026-08-11: ChatPlug (WhatsApp↔Altegio) y
    // el chatbot de reservas turísticas son agentes conversacionales, no casos
    // de ingeniería de API/webhooks (sin colas, idempotencia, DLQ o rate limit
    // documentados en su copy publicado). No forzar el ajuste.
    intro:
      "Casi cualquiera monta hoy una integración que funciona el primer día. Lo difícil es que siga funcionando el día que el otro extremo tarda diez segundos en responder, devuelve un error a mitad de un lote o reenvía el mismo evento tres veces.",
    sintoma:
      "La integración «va bien» pero cada dos semanas alguien pregunta por un pedido que no llegó. Nadie sabe responder sin abrir la base de datos, porque no hay un sitio donde mirar qué pasó con ese mensaje concreto.",
    porQue: {
      title: "Por qué una herramienta no-code no siempre basta",
      body: "Las plataformas de automatización visual resuelven muy bien una gran parte de las integraciones, y las usamos a diario. Dejan de bastar en tres situaciones concretas: cuando el volumen hace que el precio por ejecución deje de tener sentido, cuando hace falta una transacción real entre dos pasos, y cuando la lógica de error es más compleja que la lógica de negocio. Ese último caso es más frecuente de lo que parece —lo que se tarda en construir no es el camino feliz, es todo lo demás—. La decisión correcta rara vez es «todo a medida»: suele ser dejar en la herramienta lo que le corresponde y sacar a código las dos o tres piezas que la desbordan.",
    },
    patrones: [
      {
        title: "Entrega al menos una vez, procesamiento idempotente",
        body: "Prácticamente ningún emisor de webhooks garantiza entrega única. Lo que hay que construir en el receptor es la capacidad de reconocer el evento repetido y descartarlo, guardando la clave del evento con la operación en la misma transacción.",
        riesgo:
          "Sin eso, un reintento del emisor genera un cobro duplicado, un pedido duplicado o un correo enviado dos veces. Y el emisor reintenta más veces de las que uno espera.",
      },
      {
        title: "Recibir rápido, procesar después",
        body: "El endpoint que recibe el webhook valida la firma, persiste el evento y responde. El trabajo real ocurre en una cola aparte, con reintentos de espaciado creciente y una cola de fallidos donde acaba lo que no se puede procesar.",
        riesgo:
          "Procesar dentro de la petición hace que un tercero lento provoque timeouts, y muchos emisores desactivan un webhook que falla de forma repetida. Se pierde la integración por una lentitud puntual.",
      },
      {
        title: "Firma, no confianza",
        body: "Toda entrada verifica su firma con comparación en tiempo constante y rechaza marcas de tiempo antiguas. Toda salida se autentica con credenciales rotables y de alcance mínimo.",
        riesgo:
          "Un endpoint público sin verificación es un formulario de escritura abierto a internet contra tu sistema de gestión.",
      },
      {
        title: "Orden y límites de llamada",
        body: "Los eventos no llegan necesariamente en orden y el otro extremo tiene un límite de llamadas por minuto. Ambas cosas se resuelven en el diseño: número de versión por entidad para descartar lo viejo, y control de ritmo con espera respetando la cabecera de reintento.",
        riesgo:
          "Ignorar el orden hace que un estado antiguo pise al nuevo. Ignorar el límite provoca bloqueos que se manifiestan justo en los picos de volumen.",
      },
    ],
    entregables: [
      "Endpoints de entrada con verificación de firma y registro de eventos",
      "Cola con reintento exponencial y cola de fallidos revisable",
      "Clave de idempotencia por operación, persistida junto al efecto",
      "Panel de estado por mensaje: recibido, procesado, fallido, reintentando",
      "Alarma por antigüedad de pendientes y por crecimiento de la cola de fallidos",
    ],
    puentes: [
      {
        href: "/es/integracion/sistemas-legados/",
        label: "Sistemas legados",
        body: "Cuando el otro extremo no tiene API, el patrón deja de ser este y pasa a ser otro.",
      },
      {
        href: "/es/cumplimiento/verifactu/api/",
        label: "La capa de API de Verifactu",
        body: "El mismo diseño de cola, reintento e idempotencia, aplicado a un servicio de la Administración.",
      },
      {
        href: "/es/integracion/erp/",
        label: "Integración de ERP",
        body: "El destino más habitual de estos conectores.",
      },
      {
        href: "/es/blog/webhook-vs-api-diferencia/",
        label: "Webhook o API, y qué pasa después",
        body: "La diferencia en una frase y los cinco supuestos falsos que rompen integraciones en producción.",
      },
    ],
    faq: [
      {
        q: "¿Qué diferencia hay entre integrar por API y por webhook?",
        a: "La dirección de la iniciativa. Con API tú preguntas cuando quieres: es predecible y controlas el ritmo, pero llegas tarde y gastas llamadas preguntando por cosas que no han cambiado. Con webhook el otro sistema te avisa cuando pasa algo: es inmediato y eficiente, pero te obliga a estar disponible siempre y a tolerar repeticiones. La mayoría de integraciones serias usan las dos: webhook para enterarse y API para confirmar el detalle.",
      },
      {
        q: "¿Qué pasa si el otro sistema se cae?",
        a: "Los mensajes se acumulan en la cola y se reintentan con espaciado creciente hasta que el servicio vuelve. Lo que no se debe hacer nunca es dejar que la caída de un tercero pare tu operación: el flujo propio continúa y la sincronización se pone al día después. Ese es exactamente el motivo por el que la cola existe.",
      },
      {
        q: "¿Usáis n8n o construís todo a medida?",
        a: "Las dos cosas, y la elección se argumenta caso por caso. n8n cubre muy bien la orquestación y los flujos que cambian a menudo, con la ventaja de que tu equipo puede editarlos sin depender de nosotros. Lo que sacamos a código son las piezas con requisitos duros: alto volumen, transacciones, lógica de error compleja o algo que tenga que ser auditable. Mezclar los dos mundos suele salir más barato que elegir uno por dogma.",
      },
      {
        q: "¿Quién mantiene la integración cuando la API de un tercero cambia?",
        a: "Es parte del contrato de mantenimiento, y conviene que lo sea explícitamente. Las APIs de terceros cambian sin avisar a nadie en concreto: retiran versiones, endurecen límites, modifican campos. Una integración sin nadie vigilando esos cambios funciona hasta que un día deja de hacerlo, y normalmente se descubre por una queja de cliente.",
      },
    ],
  },

  "sistemas-legados": {
    nombre: "Empresas con software antiguo en producción",
    nombreCorto: "Sistemas legados",
    metaTitle: "Integración de sistemas legados",
    metaDescription:
      "Modernizamos sistemas legados con capa de traducción, captura de cambios y sustitución por fases. Sin asumir el riesgo de una reescritura completa.",
    h1: "Integrar sistemas legados sin reemplazarlos",
    serviceType: "Integración de sistemas legados",
    labels: {
      back: "← Integración de sistemas",
      puentesTitle: "Relacionado con sistemas legados",
      faqTitle: "Preguntas frecuentes sobre sistemas legados",
      otros: "Otras integraciones",
    },
    heroCta: { label: "Cuéntanos qué sistema necesitas modernizar →", href: "/es/contact/" },
    // TODO SEO/PROOF: añadir case real de modernización de sistemas legados
    // cuando exista uno publicable. Revisado 2026-08-11: ningún proyecto de
    // src/data/projects.ts implementa el patrón fachada/captura de
    // cambios/sustitución progresiva (Menorca es una auditoría, no una
    // modernización; ChatPlug y el chatbot de reservas son integraciones sobre
    // sistemas con API moderna, no legados sin API). No inventar prueba.
    intro:
      "«Legado» no significa malo. Significa que funciona, que lleva años acumulando reglas que nadie ha vuelto a escribir en ningún sitio, y que sustituirlo entero es un proyecto con más riesgo del que la empresa puede asumir de golpe.",
    sintoma:
      "Hay una persona que sabe cómo funciona. A veces ya no trabaja aquí y se le llama cuando algo falla. El sistema no tiene entorno de pruebas, la documentación es un manual de hace ocho años, y cada cambio se prueba directamente en producción a las siete de la mañana.",
    porQue: {
      title: "Por qué una reescritura completa concentra demasiado riesgo",
      body: "La propuesta de rehacerlo todo es atractiva porque promete terminar con el problema. En la práctica exige mantener dos sistemas en paralelo durante meses, redescubrir reglas de negocio que solo existen dentro del código viejo, y aguantar la presión de un proyecto largo sin entregas visibles. Una alternativa con menos riesgo es envolver el sistema antiguo, poner delante una capa que traduzca y extraer funciones de forma progresiva. Cada paso entrega valor y se diseña para poder validarse antes de retirar la función anterior, manteniendo una vía de retorno cuando sea viable. El sistema viejo se apaga cuando ya no hace nada, no en una fecha señalada en un plan.",
    },
    patrones: [
      {
        title: "Capa de traducción por delante",
        body: "Se construye una interfaz moderna que hace de fachada. Los sistemas nuevos hablan con ella y nunca con el legado, de forma que sus rarezas —códigos numéricos, campos con doble significado, fechas en formatos propios— quedan encapsuladas en un solo sitio.",
        riesgo:
          "Sin esa capa, cada nueva integración aprende las rarezas del legado y las hereda. Con varias integraciones acopladas directamente al legado, sustituirlo acaba implicando tocar múltiples dependencias.",
      },
      {
        title: "Captura de cambios en lugar de consultas periódicas",
        body: "Cuando el legado no emite eventos, se detectan los cambios en su base de datos —por marca de tiempo, por tabla de auditoría o leyendo el registro de transacciones— y se publican hacia fuera como eventos.",
        riesgo:
          "Consultar continuamente una base de datos de producción puede añadir carga innecesaria y detectar los cambios con retraso. Y con solo marca de tiempo se pierden los borrados, que es justo lo que nadie prueba.",
      },
      {
        title: "Sustitución por partes",
        body: "Las funciones salen del legado de una en una, empezando por las que tienen menos dependencias y más dolor. La fachada decide en cada momento si una petición va al sistema nuevo o al viejo.",
        riesgo:
          "Empezar por el módulo central porque «es el importante» es la forma más rápida de que el proyecto se pare a mitad. Se empieza por los bordes.",
      },
      {
        title: "Cuando no hay ninguna vía de datos",
        body: "Quedan sistemas que solo se dejan usar por pantalla. Ahí caben ficheros de intercambio en una carpeta acordada, o automatización de interfaz como último recurso.",
        riesgo:
          "La automatización de pantalla es especialmente sensible a cambios visuales y suele ofrecer menos garantías transaccionales que una integración a nivel de datos o API. Es una solución puente con fecha de caducidad, y hay que tratarla como tal desde el primer día.",
      },
    ],
    entregables: [
      "Documentación de las reglas de negocio recuperadas del sistema antiguo",
      "Capa de traducción con contrato de datos estable",
      "Publicación de cambios hacia el resto del ecosistema",
      "Plan de sustitución por fases, con orden justificado y puntos de retorno",
      "Documentación operativa y técnica que reduce la dependencia de conocimiento concentrado en personas concretas",
    ],
    puentes: [
      {
        href: "/es/auditoria-de-sistemas/",
        label: "Auditoría de sistemas",
        body: "El paso previo obligado: sin saber qué hace el legado, cualquier plan de sustitución es una apuesta.",
      },
      {
        href: "/es/integracion/api-y-webhooks/",
        label: "APIs y webhooks",
        body: "Lo que se construye por delante del legado, una vez existe la capa de traducción.",
      },
      {
        href: "/es/roadmap-tecnologico/",
        label: "Roadmap tecnológico",
        body: "Para ordenar qué sale primero del sistema antiguo y con qué criterio.",
      },
      {
        href: "/es/blog/modernizar-sistema-legado-sin-reescribir/",
        label: "Por dónde se empieza",
        body: "Las siete opciones clásicas, las tres que se usan, y cómo se recuperan las reglas que solo viven en el código viejo.",
      },
    ],
    faq: [
      {
        q: "¿Cuándo conviene integrar y cuándo reemplazar?",
        a: "Integrar cuando el sistema cumple su función y el problema es que está aislado, cuando contiene reglas de negocio que nadie ha documentado, o cuando la operación no puede permitirse un corte. Reemplazar cuando el proveedor ha desaparecido y no hay quien lo mantenga, cuando la tecnología impide cumplir una obligación legal que no se puede resolver por fuera, o cuando el coste de mantenerlo ya supera al de rehacerlo. La decisión se toma después de entender dependencias, coste de mantenimiento, restricciones operativas y riesgo de cambio.",
      },
      {
        q: "¿Se puede integrar un sistema sin API ni documentación?",
        a: "A menudo sí, pero depende de que exista alguna vía controlada para acceder a los datos o interactuar con el sistema, aunque normalmente implica más trabajo y vías menos elegantes: acceso de lectura a la base de datos, detección de cambios, ficheros de intercambio o —cuando no queda otra— automatización de pantalla. Lo que decide la viabilidad no es la edad del sistema, es si existe alguna vía controlada para leer los datos y, cuando el flujo lo requiera, escribir o ejecutar acciones. Eso se comprueba en el diagnóstico, y es la primera pregunta que hacemos.",
      },
      {
        q: "¿Cuánto se tarda?",
        a: "La capa de traducción y la primera integración suelen estar en producción en cuatro a ocho semanas. La sustitución completa, si se decide hacerla, se mide en trimestres y por diseño no tiene una fecha única de corte: cada función que sale es una entrega en sí misma. Esa es justamente la ventaja frente a la reescritura, no un efecto secundario.",
      },
      {
        q: "¿Y si la persona que conoce el sistema ya no está?",
        a: "Entonces la primera fase deja de ser técnica y pasa a ser arqueológica: se reconstruyen las reglas desde los datos y desde el comportamiento observado, no desde el código. Es más lento y conviene decirlo por adelantado. También es la razón por la que documentar lo que se descubre es un entregable del proyecto y no una cortesía.",
      },
    ],
  },
};

