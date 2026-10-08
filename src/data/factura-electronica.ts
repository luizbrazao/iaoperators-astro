/**
 * Factura electrónica obligatoria entre empresas (B2B) — datos verificados.
 *
 * Fuentes primarias consultadas el 09/oct/2026:
 * - Real Decreto 238/2026, de 25 de marzo (BOE-A-2026-7295):
 *   https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7295
 *   · art. 2.d: facturas producidas por sistemas adaptados al art. 29.2.j) LGT (base de VERI*FACTU).
 *   · art. 3.1: ámbito — destinatario empresario o profesional con sede, establecimiento
 *     permanente o domicilio en España.
 *   · art. 4.1: excluidas las facturas simplificadas, salvo las cualificadas.
 *   · art. 6.2: las plataformas privadas remiten a la solución pública una copia fiel
 *     de cada factura en UBL, simultánea a su emisión.
 *   · art. 7.1: modelo semántico EN 16931; sintaxis CII, UBL, EDIFACT o Facturae.
 *   · art. 10.3: estados de la factura en máx. 4 días naturales, sin sábados,
 *     domingos ni festivos nacionales.
 *   · art. 11.2 y 11.10: la solución pública usa UBL y es gratuita.
 *   · art. 12.1: comunicación obligatoria del pago efectivo completo o del rechazo;
 *     sin rechazo, la factura se presume aceptada.
 *   · DF 4ª: 12 meses (>8 M€ de volumen de operaciones) y 24 meses (resto) desde la
 *     entrada en vigor de la orden ministerial.
 * - Orden HAC/1028/2026, de 2 de octubre (BOE-A-2026-20587, BOE 05/10/2026), en vigor
 *   el 06/10/2026: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20587
 * - AEAT, noticia de 07/10/2026 — fechas 06/10/2027 y 06/10/2028:
 *   https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2026/octubre/7/solucion-publica-facturacion-electronica.html
 *
 * NO verificado y por tanto NO afirmado en la página: un régimen sancionador
 * específico para el incumplimiento B2B (no aparece ni en el RD ni en la orden).
 */

export const FE_NORMA = {
  ley: "Ley 18/2022, de creación y crecimiento de empresas («Crea y Crece»)",
  rd: "Real Decreto 238/2026, de 25 de marzo",
  rdBoeId: "BOE-A-2026-7295",
  rdUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7295",
  orden: "Orden HAC/1028/2026, de 2 de octubre",
  ordenBoeId: "BOE-A-2026-20587",
  ordenUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20587",
  ordenVigor: "2026-10-06",
  ordenVigorLegible: "6 de octubre de 2026",
  fechaGrandes: "2027-10-06",
  fechaGrandesLegible: "6 de octubre de 2027",
  fechaResto: "2028-10-06",
  fechaRestoLegible: "6 de octubre de 2028",
  umbral: "8 millones de euros de volumen de operaciones",
  aeatUrl:
    "https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2026/octubre/7/solucion-publica-facturacion-electronica.html",
};

export const FE_HITOS = [
  {
    fecha: FE_NORMA.ordenVigorLegible,
    iso: FE_NORMA.ordenVigor,
    quien: "Empieza la cuenta atrás",
    que: "Entra en vigor la orden ministerial que regula la solución pública de facturación electrónica. Desde este día cuentan los plazos del reglamento.",
    pasado: true,
  },
  {
    fecha: FE_NORMA.fechaGrandesLegible,
    iso: FE_NORMA.fechaGrandes,
    quien: "Volumen de operaciones superior a 8 M€",
    que: "Doce meses después de la orden. Todas las facturas a otras empresas y profesionales tienen que emitirse, transmitirse y recibirse en formato electrónico estructurado.",
    pasado: false,
  },
  {
    fecha: FE_NORMA.fechaRestoLegible,
    iso: FE_NORMA.fechaResto,
    quien: "Resto de empresas y autónomos",
    que: "Veinticuatro meses después de la orden. Es también la fecha a la que Hacienda ha anunciado que quiere llevar Verifactu, para que las dos obligaciones coincidan.",
    pasado: false,
  },
];

/** Cada exigencia traducida a lo que hay que construir en el sistema que ya existe. */
export const FE_REQUISITOS = [
  {
    norma:
      "La factura sigue el modelo semántico europeo EN 16931 en una de cuatro sintaxis: UBL, CII, EDIFACT o Facturae.",
    articulo: "art. 7.1",
    sistema:
      "Mapeo de los datos de tu ERP, TPV o e-commerce al modelo EN 16931 y validación de cada factura antes de emitirla.",
    trampa:
      "Los campos que el sistema nunca guardó —referencias de pedido, unidades, datos del destinatario— aparecen al final del proyecto si no se auditan al principio.",
  },
  {
    norma:
      "Se emite por la solución pública de la AEAT, gratuita y en UBL, o por una plataforma privada que envía a la AEAT una copia fiel en UBL en el momento de emitir.",
    articulo: "arts. 6 y 11",
    sistema:
      "Un conector entre tu sistema y el canal elegido, con cola, reintentos e idempotencia para que un corte no deje facturas sin enviar ni duplicadas.",
    trampa:
      "Elegir canal por precio sin mirar cómo se integra con tu sistema actual. El canal es lo fácil de cambiar; el flujo de emisión, no.",
  },
  {
    norma:
      "Quien recibe la factura comunica su aceptación o rechazo y el pago efectivo completo con su fecha, en un máximo de cuatro días naturales sin contar sábados, domingos ni festivos nacionales.",
    articulo: "arts. 10 y 12",
    sistema:
      "Recepción automática de facturas de proveedores en tu contabilidad y envío de los estados desde el dato real de pago, no desde una hoja de cálculo.",
    trampa:
      "El pago se registra en el banco o en tesorería, no en el módulo de compras. Si nadie conecta los dos, el estado no sale a tiempo.",
  },
  {
    norma:
      "Las facturas tienen que salir de sistemas adaptados al artículo 29.2.j) de la Ley General Tributaria, la misma base legal que Verifactu.",
    articulo: "art. 2.d",
    sistema:
      "Un único punto de emisión que genere la factura estructurada y cumpla los requisitos de Verifactu a la vez.",
    trampa:
      "Hacer dos proyectos, uno para Verifactu y otro para la factura electrónica, sobre el mismo código de emisión. Se paga dos veces y se rompe dos veces.",
  },
];

export const FE_FAQ = [
  {
    q: "¿Cuándo es obligatoria la factura electrónica entre empresas?",
    a: `El ${FE_NORMA.fechaGrandesLegible} para quienes superan ${FE_NORMA.umbral} y el ${FE_NORMA.fechaRestoLegible} para el resto. Los plazos cuentan desde la entrada en vigor de la ${FE_NORMA.orden}, el ${FE_NORMA.ordenVigorLegible}.`,
  },
  {
    q: "¿Los autónomos están obligados?",
    a: `Sí, en sus operaciones con otros empresarios y profesionales establecidos en España. Si no superan ${FE_NORMA.umbral}, su fecha es el ${FE_NORMA.fechaRestoLegible}.`,
  },
  {
    q: "¿Afecta a las facturas a particulares?",
    a: "No. La obligación cubre las facturas cuyo destinatario es un empresario o profesional. Las facturas simplificadas también quedan fuera, salvo las simplificadas cualificadas.",
  },
  {
    q: "¿Qué formato tiene que tener la factura?",
    a: "Debe ajustarse al modelo semántico europeo EN 16931 en una de estas sintaxis: UBL, CII, EDIFACT o Facturae. Si usas la solución pública de la AEAT, la sintaxis es UBL. Un PDF, aunque se envíe por email, no cumple.",
  },
  {
    q: "¿Estoy obligado a usar la solución de la AEAT?",
    a: "No. Puedes emitir y recibir por la solución pública, que es gratuita, o por una plataforma privada. Si usas una privada, esa plataforma envía a la AEAT una copia fiel de cada factura en UBL en el momento de emitirla. Si no has acordado una plataforma privada con tu cliente o proveedor, se entiende que usas la pública.",
  },
  {
    q: "¿Qué relación tiene con Verifactu?",
    a: "Son obligaciones distintas que tocan el mismo sistema. El reglamento de factura electrónica exige que las facturas salgan de sistemas adaptados a la misma norma que Verifactu, y Hacienda anunció el 5 de octubre de 2026 su intención de llevar Verifactu a octubre de 2028 para que coincida con la factura electrónica de quienes facturan hasta 8 millones. Ese aplazamiento aún no está en el BOE.",
  },
  {
    q: "¿Tengo que cambiar de ERP?",
    a: "Normalmente no. Si tu sistema guarda los datos que pide el modelo EN 16931, se le añade la capa de generación, envío, recepción y estados. Cuando no los guarda, primero se completa el dato y después se integra. Cambiar de ERP por esta obligación suele ser la opción más cara.",
  },
];
