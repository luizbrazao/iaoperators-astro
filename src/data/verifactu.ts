// Datos de la Frente B — integración Verifactu (RRSIF) para sistemas propios y legados.
// Solo ES: obligación española.
//
// FUENTES VERIFICADAS (2026-07-26, ampliadas 2026-08-11). No re-investigar sin motivo:
// - RD 1007/2023 (RRSIF) + RD-ley 15/2025, de 2 de diciembre (BOE 3/12/2025), que
//   aplaza la obligatoriedad: 1/1/2027 contribuyentes del Impuesto sobre Sociedades,
//   1/7/2027 el resto (IRPF/autónomos y demás obligados).
// - AEAT, "¿Quiénes están obligados?": EXCLUIDOS los adscritos al SII, los residentes
//   en País Vasco y Navarra (fuera del régimen común, con normativa foral propia como
//   TicketBAI) y las operaciones que no deban documentarse en factura.
// - AEAT, FAQ sistemas VERI*FACTU: registros de alta y anulación, encadenamiento por
//   huella/hash, remisión inmediata, QR y mención "VERI*FACTU"/"Factura verificable";
//   los sistemas NO VERI*FACTU exigen firma electrónica, registro de eventos,
//   exportación, verificación de integridad y gestión de alarmas.
// - AEAT, FAQ sobre incidencias: el término oficial para fallos de conectividad o de
//   remisión es "incidencia". La facturación no se detiene; el sistema reintenta la
//   remisión de forma periódica, sin plazo máximo fijo, marcando el registro con el
//   indicador de incidencia correspondiente.
// - AEAT, FAQ sobre encadenamiento con varios puntos de emisión: si los sistemas están
//   interconectados, la cadena debe ser única; si son sistemas independientes (SIF no
//   interconectados), cada uno puede llevar su propia cadena.
// - Orden HAC/1177/2024, art. 21.1: el QR debe medir entre 30x30 y 40x40 mm, con nivel
//   de corrección de errores M, conforme a ISO/IEC 18004.
// - Declaración responsable: la emite el productor del sistema informático de
//   facturación para la versión concreta instalada. En desarrollo propio o a medida
//   para uso interno, la empresa suele ser también la productora; si el sistema lo
//   desarrolló o adaptó un tercero, hay que identificar quién ostenta esa condición
//   para esa versión.
// - Régimen sancionador del art. 201 bis LGT: apartado 1 (fabricación, producción o
//   comercialización de sistemas no conformes) 150.000 € por cada ejercicio en que se
//   hayan producido ventas; apartado 2 (tenencia de sistemas no conformes) 50.000 € por
//   ejercicio. Su aplicación al caso concreto corresponde a la asesoría del cliente.

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
  // La especificación técnica (formato de los registros, servicio de remisión)
  // no vive en el RD sino en la orden de desarrollo, citada por la propia sede
  // electrónica de la AEAT. Los detalles de campos y endpoints se toman de ahí:
  // no los reproducimos de memoria en ninguna landing.
  ordenTecnica: "Orden HAC/1177/2024",
  // Obligación de los fabricantes/productores de software, anterior a la de los
  // usuarios: desde el 29 de julio de 2025 los sistemas comercializados deben
  // ofrecerse ya conformes.
  fechaFabricantes: "2025-07-29",
  fechaFabricantesLegible: "29 de julio de 2025",
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
    trampa:
      "Se elige por criterio operativo, no por preferencia. La conectividad forma parte del diseño: una incidencia de red no obliga a detener la facturación, el sistema debe gestionar el estado y reintentar la remisión conforme a las reglas de incidencia de la AEAT. VERI*FACTU simplifica determinadas obligaciones locales frente a NO VERI*FACTU, pero la elección debe hacerse según la operación y la arquitectura del sistema.",
  },
  {
    norma: "QR en la factura y, en modalidad VERI*FACTU, mención «VERI*FACTU» o «Factura verificable».",
    sistema:
      "Generación del QR con los datos exigidos e integración en todas las plantillas: PDF, impresión térmica de TPV, email y portal de cliente.",
    trampa: "El ticket de 58 mm de una impresora térmica es donde más veces se rompe la implementación del QR.",
  },
  {
    norma: "Integridad, conservación, trazabilidad e inalterabilidad de los registros.",
    sistema:
      "Una arquitectura posible: almacenamiento append-only, retención y exportación en formato legible por la Administración, con separación entre el sistema de trabajo y el registro de evidencia.",
    trampa: "Un registro que vive en la misma tabla que el ERP edita a diario no es inalterable.",
  },
  {
    norma: "Declaración responsable del productor del sistema informático.",
    sistema:
      "Documentación del sistema, identificación de versión y declaración responsable del productor. Si el desarrollo es propio, la empresa es también productora y asume la declaración; si lo desarrolló o adaptó un tercero, hay que identificar quién asume esa condición para la versión concreta del sistema.",
    trampa: "Es el punto que casi nadie ve venir: si mantienes tu ERP propio, sueles ser también tú el productor a efectos de esta declaración, no un proveedor.",
  },
];

export const SANCIONES = [
  {
    quien: "Tenencia de sistemas en los supuestos del artículo 201 bis.2 LGT",
    importe: "50.000 €/ejercicio",
  },
  {
    quien: "Fabricación, producción o comercialización en los supuestos del artículo 201 bis.1 LGT",
    importe: "150.000 €/ejercicio en el que se hayan producido ventas",
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
        modalidad: "Común RRSIF",
        body: "Alta y anulación generados en el acto de emisión, con los campos del reglamento y validación previa a la persistencia y, en modalidad VERI*FACTU, a la remisión.",
      },
      {
        title: "Cadena de huellas",
        modalidad: "Común RRSIF",
        body: "Encadenamiento por hash con estrategia de series definida para multi-punto de emisión, y detección de huecos.",
      },
      {
        title: "Cola de remisión",
        modalidad: "VERI*FACTU",
        body: "Envío a la AEAT con reintento periódico, idempotencia por registro y estado consultable. Una incidencia de conectividad no para tu facturación: se gestiona conforme a las reglas de incidencia de la AEAT.",
      },
      {
        title: "QR y plantillas",
        modalidad: "Común RRSIF",
        body: "Generación del QR e integración en PDF, ticket térmico, email y portal. En modalidad VERI*FACTU incorpora además la mención «VERI*FACTU» o «Factura verificable».",
      },
      {
        title: "Registro inalterable",
        modalidad: "Común RRSIF",
        body: "Una arquitectura posible para la exigencia de integridad y trazabilidad: almacenamiento append-only separado del sistema operativo, con exportación en el formato que pide la Administración.",
      },
      {
        title: "Panel de estado",
        modalidad: "Común RRSIF",
        body: "Qué se envió, qué falló y qué está pendiente, con alarma cuando algo lleva demasiado tiempo sin confirmar.",
      },
    ],
  },

  proceso: {
    badge: "Cómo trabajamos",
    title: "De la auditoría del sistema al conector en producción",
    subtitle:
      "Trabajamos sobre tu ERP, TPV o e-commerce actual. El objetivo no es cambiar tu operación, es que tu sistema de facturación cumpla el reglamento vigente.",
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
        body: "Modelo de registro, estrategia de encadenamiento, política de reintentos y punto de integración con tu sistema. Te recomendamos técnicamente VERI*FACTU o NO VERI*FACTU según tu operación; la determinación fiscal última corresponde a tu asesoría.",
      },
      {
        code: "03",
        title: "Implementación y pruebas",
        plazo: "3–6 semanas",
        body: "Construcción y validación con tu casuística real, incluidas las rectificativas que siempre aparecen tarde. En modalidad VERI*FACTU, además, pruebas contra el entorno de pruebas de la AEAT.",
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
        q: "¿Cuándo es obligatorio adaptar el sistema de facturación al RRSIF?",
        a: "Tras el aplazamiento aprobado por el Real Decreto-ley 15/2025, de 2 de diciembre, el 1 de enero de 2027 para los contribuyentes del Impuesto sobre Sociedades y el 1 de julio de 2027 para el resto de obligados tributarios, autónomos incluidos. Conviene planificar sobre estas fechas vigentes, que pueden actualizarse por norma posterior.",
      },
      {
        q: "¿Tengo que cambiar de programa de facturación?",
        a: "No necesariamente, y ese es justo el trabajo que hacemos. Si tu ERP, tu TPV o tu e-commerce son propios o están muy adaptados, añadir el módulo de cumplimiento sobre lo que ya tienes suele ser una alternativa viable a migrar a un software estándar, con menos riesgo operativo. El coste concreto de cada opción depende de tu caso.",
      },
      {
        q: "¿Quién firma la declaración responsable si mi software es propio?",
        a: "Depende de quién sea el productor del sistema para tu versión concreta. Si el desarrollo es propio o a medida para uso interno, la empresa suele ser también la productora y asume la declaración responsable. Si el sistema lo desarrolló o lo adaptó un tercero, hay que identificar quién tiene esa condición para esa versión exacta del sistema. Nosotros documentamos el sistema y su conformidad, y ayudamos a identificar quién firma en cada caso.",
      },
      {
        q: "¿VERI*FACTU o NO VERI*FACTU?",
        a: "Depende de tu operación, no de una preferencia. La modalidad VERI*FACTU remite los registros a la AEAT de forma continuada y a cambio te ahorra las exigencias locales de firma electrónica, registro de eventos y gestión de alarmas que exige NO VERI*FACTU. La conectividad no descarta VERI*FACTU: una incidencia de red se gestiona con reintento conforme a las reglas de la AEAT, sin detener la facturación. Lo evaluamos en la auditoría, según tu operación y tu arquitectura.",
      },
      {
        q: "¿Qué pasa si se cae la conexión o la AEAT no responde?",
        a: "La facturación no puede pararse por eso. Es lo que la AEAT denomina una incidencia: el sistema encola los registros, reintenta de forma periódica y los envía cuando el servicio se restablece, manteniendo el estado de cada uno. Un envío síncrono sin cola convierte una incidencia de conectividad en una incidencia de tu negocio.",
      },
      {
        q: "¿Esto es lo mismo que la factura electrónica obligatoria?",
        a: "No. Verifactu nace de la Ley Antifraude y regula cómo tu sistema registra y comunica las facturas. La factura electrónica B2B obligatoria viene de la Ley 18/2022 Crea y Crece y persigue la morosidad. Su reglamento ya está publicado —el Real Decreto 238/2026—, pero la aplicación efectiva queda diferida: 12 meses para quien facture más de 8 M€ y 24 meses para el resto, contados desde la entrada en vigor de una orden ministerial de desarrollo que todavía no se ha publicado. Es decir: la obligación está regulada, la fecha concreta aún no. Son dos proyectos distintos con calendarios distintos, aunque conviene diseñar pensando en los dos.",
      },
      {
        q: "¿Cuánto se tarda en tener el conector en producción?",
        a: "Entre cuatro y siete semanas contando la auditoría, según el número de puntos de emisión y la complejidad de las series y rectificativas. La casuística que retrasa los proyectos casi nunca es el envío: son las anulaciones, las rectificativas y los flujos de venta que nadie documentó.",
      },
      {
        q: "¿Y si estoy en el SII?",
        a: "Entonces no te aplica el RRSIF: quienes llevan los libros registro de IVA por la sede electrónica de la AEAT quedan excluidos. Los obligados domiciliados en territorio foral de régimen especial (País Vasco y Navarra) se rigen por su propia normativa de facturación electrónica, como TicketBAI; conviene confirmarlo caso por caso porque depende del régimen fiscal exacto de cada empresa. Te lo decimos en la primera llamada si es tu caso.",
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
    metaTitle: "Verifactu ERP: integrarlo en tu ERP a medida sin migrar",
    metaDescription:
      "Adaptamos tu ERP propio o customizado a Verifactu: registros encadenados, remisión a la AEAT, QR y declaración responsable. Sin migrar de sistema.",
    h1: "Verifactu para un ERP propio o muy adaptado",
    intro:
      "Cuando el ERP lleva años absorbiendo la lógica real del negocio, migrar a un software estándar no es solo un cambio técnico: implica rehacer buena parte de la operación. La alternativa es acoplarle el módulo de cumplimiento.",
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
    metaTitle: "Verifactu TPV: cadena, QR y funcionamiento offline",
    metaDescription:
      "Verifactu para TPV con varias cajas o tiendas: estrategia de series, cadena de huellas, QR en ticket térmico y funcionamiento sin conexión.",
    h1: "Verifactu en TPV multi-tienda",
    intro:
      "En retail y hostelería el problema no es enviar registros: es que hay muchos puntos emitiendo a la vez, a veces sin conexión, y cada uno necesita una estrategia de encadenamiento que no colisione con los demás.",
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
    metaTitle: "Verifactu e-commerce: facturación conforme en tienda propia",
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
