// Datos de la Frente B — integración Verifactu (RRSIF) para sistemas propios y legados.
// Solo ES: obligación española.
//
// FUENTES VERIFICADAS (2026-07-26). No re-investigar sin motivo:
// - RD 1007/2023 (RRSIF) + RD-ley 15/2025, de 2 de diciembre (BOE 3/12/2025), que
//   aplaza la obligatoriedad: 1/1/2027 contribuyentes del Impuesto sobre Sociedades,
//   1/7/2027 el resto (IRPF/autónomos).
// - AEAT, "¿Quiénes están obligados?": EXCLUIDOS los adscritos al SII, los residentes
//   en País Vasco y Navarra (fuera del régimen común) y las operaciones que no deban
//   documentarse en factura.
// - AEAT, FAQ sistemas VERI*FACTU: registros de alta y anulación, encadenamiento por
//   huella/hash, remisión inmediata, QR y mención "VERI*FACTU"/"Factura verificable";
//   los sistemas NO VERI*FACTU exigen firma electrónica, registro de eventos,
//   exportación, verificación de integridad y gestión de alarmas.
// - Declaración responsable: la emite el productor del software; en desarrollo propio
//   o a medida para uso interno, la asume la propia empresa.
// - Régimen sancionador del art. 201 bis LGT: 50.000 € por ejercicio para quien usa
//   sistemas no conformes, 150.000 € por ejercicio para quien los produce o comercializa.
//   Importes citados de forma consistente por las fuentes; su aplicación al caso
//   concreto corresponde a la asesoría del cliente.

export const NORMA = {
  nombre: "Real Decreto 1007/2023 (Reglamento de sistemas informáticos de facturación)",
  nombreCorto: "Verifactu",
  aplazamiento: "Real Decreto-ley 15/2025, de 2 de diciembre",
  boeUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840",
  aeatUrl:
    "https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html",
  fechaSociedades: "2027-01-01",
  fechaSociedadesLegible: "1 de enero de 2027",
  fechaResto: "2027-07-01",
  fechaRestoLegible: "1 de julio de 2027",
};

export const DISCLAIMER =
  "Información técnica sobre implementación de sistemas. No constituye asesoramiento fiscal ni jurídico. La calificación de tu caso concreto y la interpretación del régimen sancionador corresponden a tu asesoría.";

/** Filtro de cualificación: decir a quién NO le hace falta genera más confianza que vender a todos. */
export const EXCLUSIONES = [
  {
    title: "Ya estás en el SII",
    body: "Quienes llevan los libros registro de IVA a través de la sede electrónica de la AEAT quedan excluidos del reglamento. Si tu empresa está en el SII, esto no te aplica.",
  },
  {
    title: "Tributas en territorio foral",
    body: "El reglamento alcanza a quienes están domiciliados en territorio español de régimen común. País Vasco y Navarra quedan fuera, con su propia normativa (TicketBAI y equivalentes).",
  },
  {
    title: "Operaciones sin obligación de factura",
    body: "Lo que no debe documentarse en factura queda fuera del ámbito. La obligación se mide por la operación, no solo por la empresa.",
  },
];

/**
 * El núcleo técnico: cada exigencia del reglamento traducida a lo que hay que
 * construir en un sistema que ya existe. Este es el activo diferencial frente a
 * los vendors de software, que responden a todo con "migra a mi programa".
 */
export const REQUISITOS = [
  {
    norma: "Registro de facturación de alta por cada factura emitida, y de anulación cuando se anula.",
    sistema:
      "Generación del registro en el mismo acto de emisión, con los campos exigidos y sin posibilidad de emitir factura sin registro asociado.",
    trampa: "Emitir primero y registrar después en un proceso nocturno rompe la correspondencia uno a uno.",
  },
  {
    norma: "Encadenamiento de los registros mediante huella o hash.",
    sistema:
      "Cadena por huella con el registro anterior, cálculo determinista y almacenamiento del eslabón. Un hueco en la cadena es detectable y no se puede rellenar a posteriori.",
    trampa: "Con varios puntos de emisión en paralelo (cajas, tiendas, TPV), la cadena necesita una estrategia de series definida antes de escribir código.",
  },
  {
    norma: "Remisión de los registros a la AEAT de forma inmediata (modalidad VERI*FACTU).",
    sistema:
      "Cola con reintento, idempotencia y control de estado por registro. Si la AEAT o la conexión caen, la facturación continúa y los registros se envían al restablecerse.",
    trampa: "Un envío síncrono sin cola convierte una caída de la AEAT en una caída de tu facturación.",
  },
  {
    norma: "Alternativa NO VERI*FACTU: sin remisión inmediata, con más exigencias locales.",
    sistema:
      "Firma electrónica de los registros, registro de eventos, exportación, verificación de integridad y gestión de alarmas. Más control, notablemente más trabajo.",
    trampa: "Se elige por criterio operativo, no por preferencia: sin conectividad fiable, VERI*FACTU es inviable; con ella, suele ser el camino más barato.",
  },
  {
    norma: "QR verificable en la factura y mención «VERI*FACTU» o «Factura verificable».",
    sistema:
      "Generación del QR con los datos exigidos e integración en todas las plantillas: PDF, impresión térmica de TPV, email y portal de cliente.",
    trampa: "El ticket de 58 mm de una impresora térmica es donde más veces se rompe la implementación del QR.",
  },
  {
    norma: "Integridad, conservación, trazabilidad e inalterabilidad de los registros.",
    sistema:
      "Almacenamiento append-only, retención y exportación en formato legible por la Administración, con separación entre el sistema de trabajo y el registro de evidencia.",
    trampa: "Un registro que vive en la misma tabla que el ERP edita a diario no es inalterable.",
  },
  {
    norma: "Declaración responsable del productor del sistema informático.",
    sistema:
      "Documentación del sistema, identificación de versión y certificación de conformidad. En desarrollo propio o a medida para uso interno, la firma la asume la propia empresa usuaria.",
    trampa: "Es el punto que casi nadie ve venir: si mantienes tu ERP propio, el responsable de la declaración eres tú, no un proveedor.",
  },
];

export const SANCIONES = [
  {
    quien: "Quien usa sistemas no conformes",
    importe: "50.000 € por ejercicio",
  },
  {
    quien: "Quien produce o comercializa sistemas no conformes",
    importe: "150.000 € por ejercicio",
  },
];

export const SHARED = {
  arquitectura: {
    title: "Qué construimos",
    subtitle:
      "Un módulo de cumplimiento que se acopla a tu sistema de facturación actual. No lo sustituye: lo hace conforme.",
    items: [
      {
        title: "Motor de registros",
        body: "Alta y anulación generados en el acto de emisión, con los campos del reglamento y validación previa al envío.",
      },
      {
        title: "Cadena de huellas",
        body: "Encadenamiento por hash con estrategia de series definida para multi-punto de emisión, y detección de huecos.",
      },
      {
        title: "Cola de remisión",
        body: "Envío a la AEAT con reintento exponencial, idempotencia por registro y estado consultable. Una caída no para tu facturación.",
      },
      {
        title: "QR y plantillas",
        body: "Generación del QR e integración en PDF, ticket térmico, email y portal, con la mención exigida en la factura.",
      },
      {
        title: "Registro inalterable",
        body: "Almacenamiento append-only separado del sistema operativo, con exportación en el formato que pide la Administración.",
      },
      {
        title: "Panel de estado",
        body: "Qué se envió, qué falló y qué está pendiente, con alarma cuando algo lleva demasiado tiempo sin confirmar.",
      },
    ],
  },

  proceso: {
    badge: "Cómo trabajamos",
    title: "De la auditoría del sistema al conector en producción",
    subtitle:
      "Trabajamos sobre tu ERP, TPV o e-commerce actual. El objetivo no es cambiar tu operación, es que siga siendo legal.",
    phases: [
      {
        code: "01",
        title: "Auditoría del sistema de facturación",
        plazo: "3–5 días",
        body: "Mapeamos puntos de emisión, series, casuística de rectificativas y anulaciones, y dónde se guarda hoy cada dato. Salida: alcance cerrado y modalidad recomendada.",
      },
      {
        code: "02",
        title: "Diseño del conector",
        plazo: "1 semana",
        body: "Modelo de registro, estrategia de encadenamiento, política de reintentos y punto de integración con tu sistema. Decidimos VERI*FACTU o no según tu operación.",
      },
      {
        code: "03",
        title: "Implementación y pruebas",
        plazo: "3–6 semanas",
        body: "Construcción, pruebas contra el entorno de la AEAT y validación con tu casuística real, incluidas las rectificativas que siempre aparecen tarde.",
      },
      {
        code: "04",
        title: "Puesta en producción y mantenimiento normativo",
        plazo: "continuo",
        body: "Despliegue, panel de estado y seguimiento de los cambios de la norma y de las especificaciones técnicas de la AEAT.",
      },
    ],
  },

  tech: {
    title: "La tecnología que usamos",
    subtitle: "API-first, idempotente y con estado observable.",
    items: [
      "Node / TypeScript",
      "Colas con reintento",
      "Firma electrónica",
      "APIs SOAP/REST AEAT",
      "Supabase / PostgreSQL",
      "n8n",
      "Webhooks",
      "Docker",
    ],
  },

  precio: {
    title: "Alcance y precio",
    subtitle: "Proyecto cerrado por integración, más mantenimiento normativo.",
    items: [
      {
        title: "Auditoría del sistema",
        precio: "Desde 900 €",
        body: "Tres a cinco días. Informe de brecha, modalidad recomendada y alcance cerrado. Se descuenta de la integración.",
      },
      {
        title: "Integración",
        precio: "Desde 1.500 €",
        body: "Conector completo sobre tu ERP, TPV o e-commerce. El rango depende de puntos de emisión, series y casuística.",
      },
      {
        title: "Mantenimiento normativo",
        precio: "Cuota mensual",
        body: "Seguimiento de cambios en la norma y en las especificaciones de la AEAT, monitorización de la cola y soporte.",
      },
    ],
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Cuándo es obligatorio Verifactu?",
        a: "Tras el aplazamiento aprobado por el Real Decreto-ley 15/2025, de 2 de diciembre, el 1 de enero de 2027 para los contribuyentes del Impuesto sobre Sociedades y el 1 de julio de 2027 para el resto de obligados tributarios, autónomos incluidos. Han sido dos aplazamientos ya, así que conviene planificar sobre las fechas vigentes y no sobre la expectativa de un tercero.",
      },
      {
        q: "¿Tengo que cambiar de programa de facturación?",
        a: "No necesariamente, y ese es justo el trabajo que hacemos. Si tu ERP, tu TPV o tu e-commerce son propios o están muy adaptados, migrar a un software estándar suele costar más —en dinero y en riesgo operativo— que añadir el módulo de cumplimiento sobre lo que ya tienes.",
      },
      {
        q: "¿Quién firma la declaración responsable si mi software es propio?",
        a: "La propia empresa. La declaración responsable la emite el productor del sistema informático de facturación, y en un desarrollo propio o a medida para uso interno ese productor eres tú. Es el punto que más veces se descubre tarde: mantener el sistema propio traslada la responsabilidad de certificarlo a tu lado de la mesa. Nosotros construimos el sistema y documentamos la conformidad; la firma es tuya.",
      },
      {
        q: "¿VERI*FACTU o sistema no verificable?",
        a: "Depende de tu operación, no de una preferencia. La modalidad VERI*FACTU remite los registros a la AEAT en el momento y a cambio te ahorra las exigencias locales de firma, registro de eventos y gestión de alarmas. Si tienes puntos de venta con conectividad poco fiable, esa decisión cambia. Lo evaluamos en la auditoría.",
      },
      {
        q: "¿Qué pasa si se cae la conexión o la AEAT no responde?",
        a: "La facturación no puede pararse por eso. El diseño correcto encola los registros, reintenta con espaciado creciente y los envía cuando el servicio se restablece, manteniendo el estado de cada uno. Un envío síncrono sin cola convierte una incidencia de la AEAT en una incidencia de tu negocio.",
      },
      {
        q: "¿Esto es lo mismo que la factura electrónica obligatoria?",
        a: "No. Verifactu nace de la Ley Antifraude y regula cómo tu sistema registra y comunica las facturas. La factura electrónica B2B obligatoria viene de la Ley 18/2022 Crea y Crece, persigue la morosidad y su reglamento aún no está publicado de forma definitiva. Son dos proyectos distintos con calendarios distintos, aunque conviene diseñar pensando en los dos.",
      },
      {
        q: "¿Cuánto se tarda en tener el conector en producción?",
        a: "Entre cuatro y siete semanas contando la auditoría, según el número de puntos de emisión y la complejidad de las series y rectificativas. La casuística que retrasa los proyectos casi nunca es el envío: son las anulaciones, las rectificativas y los flujos de venta que nadie documentó.",
      },
      {
        q: "¿Y si estoy en el SII?",
        a: "Entonces no te aplica. Quienes llevan los libros registro de IVA por la sede electrónica de la AEAT quedan excluidos del reglamento. También quedan fuera quienes tributan en País Vasco o Navarra, con normativa foral propia. Te lo decimos en la primera llamada si es tu caso.",
      },
    ],
  },
};

export const CASO_SLUGS = [
  "erp-a-medida",
  "tpv-multitienda",
  "ecommerce-propio",
  "software-vertical",
] as const;

export type CasoSlug = (typeof CASO_SLUGS)[number];

export const CASOS: Record<
  CasoSlug,
  {
    nombre: string;
    nombreCorto: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    intro: string;
    escenario: string;
    porQueNoMigras: string;
    especificos: { title: string; body: string }[];
    faq: { q: string; a: string }[];
  }
> = {
  "erp-a-medida": {
    nombre: "ERP propio o muy adaptado",
    nombreCorto: "ERP a medida",
    metaTitle: "Verifactu para ERP a medida: integración sin migrar",
    metaDescription:
      "Adaptamos tu ERP propio o customizado a Verifactu: registros encadenados, remisión a la AEAT, QR y declaración responsable. Sin migrar de sistema.",
    h1: "Verifactu para un ERP propio o muy adaptado",
    intro:
      "Cuando el ERP lleva años absorbiendo la lógica real del negocio, migrar a un software estándar no es una decisión técnica: es rehacer la operación. La alternativa es acoplarle el módulo de cumplimiento.",
    escenario:
      "El ERP factura desde tres módulos distintos —ventas, servicios y renovaciones— y cada uno con su serie. Nadie recuerda por qué la serie de renovaciones salta números. Ese detalle, invisible durante diez años, es exactamente lo que rompe una cadena de huellas.",
    porQueNoMigras:
      "El coste de migrar no es la licencia del software nuevo: son los procesos, las integraciones y los años de reglas de negocio que solo existen dentro del ERP. Añadir el cumplimiento sobre lo que ya funciona conserva ese activo.",
    especificos: [
      {
        title: "Auditoría de series y puntos de emisión",
        body: "Antes de escribir una línea, hay que saber cuántos sitios del ERP emiten factura y con qué series. Es donde aparecen las sorpresas.",
      },
      {
        title: "Punto de integración único",
        body: "El módulo se acopla en el punto donde la factura queda confirmada, no en cada pantalla. Un solo lugar donde se genera el registro reduce a la mitad la superficie de fallo.",
      },
      {
        title: "La declaración responsable es tuya",
        body: "Con desarrollo propio, la certificación de conformidad la firma tu empresa. Documentamos el sistema y la versión para que esa firma esté respaldada.",
      },
    ],
    faq: [
      {
        q: "¿Podéis trabajar sobre un ERP del que no tenemos el código fuente?",
        a: "Depende de si expone una vía de integración: API, base de datos, webhooks o eventos. Si el ERP es una caja negra sin ningún punto de enganche, la conversación cambia y hay que valorar otras opciones. Eso se resuelve en la auditoría, antes de comprometer alcance.",
      },
    ],
  },

  "tpv-multitienda": {
    nombre: "TPV multi-tienda o con varios puntos de cobro",
    nombreCorto: "TPV multi-tienda",
    metaTitle: "Verifactu en TPV multi-tienda: cadena, QR y offline",
    metaDescription:
      "Verifactu para TPV con varias cajas o tiendas: estrategia de series, cadena de huellas, QR en ticket térmico y funcionamiento sin conexión.",
    h1: "Verifactu en TPV multi-tienda",
    intro:
      "En retail y hostelería el problema no es enviar registros: es que hay muchos puntos emitiendo a la vez, a veces sin conexión, y todos tienen que encadenar sin colisionar.",
    escenario:
      "Viernes por la noche, seis cajas cobrando en paralelo y el router de la tienda con la fibra caída. Si el TPV depende de una confirmación de la AEAT para imprimir el ticket, la cola de clientes no se mueve.",
    porQueNoMigras:
      "Cambiar de TPV en una cadena implica reformar hardware, formación del personal y una ventana de parada por tienda. Casi siempre sale más caro y más arriesgado que adaptar el que ya está desplegado.",
    especificos: [
      {
        title: "Estrategia de series por punto de emisión",
        body: "Cada caja necesita su propia cadena o un mecanismo de coordinación. Definirlo mal obliga a rehacer el histórico, que es justo lo que no se puede rehacer.",
      },
      {
        title: "Funcionamiento con conexión intermitente",
        body: "El ticket se emite y se registra en local; el envío se encola y sale cuando hay red. La caja nunca se detiene por una incidencia de red.",
      },
      {
        title: "QR en impresora térmica",
        body: "Un QR con datos suficientes tiene que seguir siendo legible en 58 mm y con papel de baja calidad. Es un problema real de densidad y de pruebas con hardware, no de teoría.",
      },
    ],
    faq: [
      {
        q: "¿Podemos seguir cobrando si no hay internet?",
        a: "Sí, y es un requisito de diseño, no una concesión. El registro se genera y se encadena en local; la remisión a la AEAT se encola y se envía al restablecerse la conexión. Lo que no puede ocurrir es emitir sin registro.",
      },
    ],
  },

  "ecommerce-propio": {
    nombre: "E-commerce propio o headless",
    nombreCorto: "E-commerce propio",
    metaTitle: "Verifactu para e-commerce propio: facturación conforme",
    metaDescription:
      "Verifactu en tiendas online propias o headless: registro en el momento de la factura, anulaciones por devolución, QR en el PDF y cola de envío.",
    h1: "Verifactu para un e-commerce propio",
    intro:
      "Una tienda montada a medida factura de forma automática y a cualquier hora. Eso simplifica el flujo y complica dos cosas: las devoluciones y el volumen en campaña.",
    escenario:
      "Campaña de rebajas: pedidos entrando cada pocos segundos y un porcentaje de devoluciones que dispara anulaciones y rectificativas. Cada una necesita su registro correcto, y no es el mismo tipo de registro que un alta.",
    porQueNoMigras:
      "El checkout propio suele ser el activo con más trabajo de conversión encima. Sustituirlo por un módulo de facturación estándar significa tocar justo la pieza que genera ingresos.",
    especificos: [
      {
        title: "Anulaciones y rectificativas por devolución",
        body: "La devolución de un pedido no siempre es una anulación: puede ser una rectificativa. Distinguirlo en el modelo evita registros que la AEAT rechaza.",
      },
      {
        title: "Volumen en campaña",
        body: "La cola tiene que absorber picos sin perder orden ni duplicar registros. Idempotencia por identificador de factura, no por reintento.",
      },
      {
        title: "QR en el PDF y en el portal del cliente",
        body: "La factura descargable y la del email tienen que llevar el mismo QR y la mención exigida, con el enlace verificable operativo.",
      },
    ],
    faq: [
      {
        q: "Usamos un marketplace además de la tienda propia, ¿cómo encaja?",
        a: "Depende de quién emita la factura en cada canal, que es una cuestión previa y de índole fiscal. Cuando la emites tú, el registro es tuyo y entra en el mismo flujo. Cuando la emite el marketplace, el análisis lo tiene que hacer tu asesoría antes de que definamos el alcance técnico.",
      },
    ],
  },

  "software-vertical": {
    nombre: "Software vertical con facturación integrada",
    nombreCorto: "Software vertical",
    metaTitle: "Verifactu para software vertical: conector para tu producto",
    metaDescription:
      "Si tu software factura para tus clientes, Verifactu te alcanza como productor. Conector, declaración responsable y multi-tenant sin rehacer el producto.",
    h1: "Verifactu para software vertical con facturación",
    intro:
      "Si desarrollas software para un sector concreto —clínicas, talleres, gestorías, gimnasios— y tu producto emite facturas, la norma no te alcanza solo como empresa: te alcanza como productor de un sistema informático de facturación.",
    escenario:
      "Trescientos clientes usando tu producto, cada uno con su NIF y sus series. Si el módulo de cumplimiento no es multi-tenant desde el diseño, acabas con trescientas cadenas que mantener y ninguna forma de auditarlas juntas.",
    porQueNoMigras:
      "Tu facturación es una funcionalidad de tu producto, no una herramienta que se cambia. Sacarla fuera significa degradar la experiencia que vendes y perder el control del ciclo.",
    especificos: [
      {
        title: "Doble responsabilidad",
        body: "Respondes por tu propia facturación y por la conformidad del sistema que entregas a tus clientes. La declaración responsable como productor es tuya, con identificación de sistema y versión.",
      },
      {
        title: "Multi-tenant desde el diseño",
        body: "Cadenas de huella aisladas por cliente, con un plano de control común para monitorizar el conjunto y desplegar cambios normativos a todos a la vez.",
      },
      {
        title: "Versionado y despliegue",
        body: "Cuando la AEAT actualiza especificaciones, tienes que poder actualizar toda la base instalada y documentar qué versión estaba vigente en cada momento.",
      },
    ],
    faq: [
      {
        q: "¿Qué sanción asume el productor de software?",
        a: "El régimen del artículo 201 bis de la Ley General Tributaria contempla 150.000 € por ejercicio para quien produce o comercializa sistemas no conformes, frente a los 50.000 € por ejercicio de quien los usa. La aplicación concreta a tu caso corresponde a tu asesoría, pero el orden de magnitud explica por qué esto no es un proyecto que convenga improvisar.",
      },
    ],
  },
};
