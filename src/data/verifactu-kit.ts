// Kit de Preparación VERI*FACTU — configuración PÚBLICA del producto.
//
// Fuente única de nombre, precio mostrado, versión y periodo de actualizaciones.
// Ningún componente, email o endpoint debe escribir estos valores a mano.
//
// Este módulo SÍ puede importarse desde páginas estáticas e islands: no contiene
// contenido de pago ni secretos. El contenido protegido vive en
// ./verifactu-kit-content.ts y solo se importa desde código server-side.
//
// El precio que se COBRA lo fija el Stripe Price (VERIFACTU_KIT_STRIPE_PRICE_ID).
// `price` es el precio que se MUESTRA. El endpoint de checkout compara ambos y
// se niega a crear la sesión si no coinciden (ver src/lib/verifactu-kit/stripe.ts).

import { CALENDARIO } from "./verifactu";

export const KIT_PRODUCT = {
  /** Identificador estable: metadatos de Stripe, analítica (product_id) y BD. */
  key: "verifactu-kit",
  name: "Kit de Preparación VERI*FACTU para Autónomos y Pymes",
  shortName: "Kit de Preparación VERI*FACTU",
  /** Versión del contenido del Kit. Subirla al publicar cambios (ver KIT_CHANGELOG). */
  version: "1.0.0",
  releasedAt: "2026-10-12",
  price: {
    /** En euros, sin IVA. Debe coincidir con unit_amount/100 del Stripe Price. */
    amount: 59,
    currency: "EUR",
    display: "59 €",
    taxNote: "+ IVA",
    displayFull: "59 € + IVA",
  },
  /** Acceso al área del Kit y a sus actualizaciones, en meses desde el pago. */
  updatesMonths: 12,
  tagline:
    "Descubre qué te aplica, qué debes pedir a tu proveedor y qué documentos necesitas conservar antes de cambiar de programa o contratar una integración.",
  /** Base normativa sobre la que está escrito el contenido. */
  normativeBase: {
    verifiedAt: CALENDARIO.lastVerifiedAt,
    verifiedAtLegible: CALENDARIO.lastVerifiedAtLegible,
  },
  paths: {
    landing: "/es/cumplimiento/verifactu/kit/",
    gracias: "/es/cumplimiento/verifactu/kit/gracias/",
    acceso: "/es/cumplimiento/verifactu/kit/acceso/",
    condiciones: "/es/cumplimiento/verifactu/kit/condiciones/",
    test: "/es/cumplimiento/verifactu/test/",
    auditoria: "/es/contact/?origen=verifactu",
  },
} as const;

export type KitProduct = typeof KIT_PRODUCT;

/** Texto de acceso, en un solo sitio para landing, condiciones y emails. */
export const KIT_EXPORT_TEXT =
  "Puedes imprimir cada módulo en PDF y exportar tus tablas en CSV para conservarlas.";
export const KIT_ACCESS_TEXT = `Acceso al Kit y a sus actualizaciones durante ${KIT_PRODUCT.updatesMonths} meses desde la compra. ${KIT_EXPORT_TEXT}`;

/** Historial público de versiones del Kit. El más reciente primero. */
export const KIT_CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: "1.0.0",
    date: "2026-10-12",
    changes: [
      "Primera versión: nueve módulos, plan de 30 días y plantillas.",
      "Base normativa verificada el 12/10/2026: fechas vigentes del RD-ley 15/2025 (1/1/2027 y 1/7/2027) y aplazamiento a octubre de 2028 anunciado por Hacienda, pendiente de publicación en el BOE.",
      "Factura electrónica B2B: Orden HAC/1028/2026 en vigor el 06/10/2026; exigible el 06/10/2027 (más de 8 M€) y el 06/10/2028 (resto).",
    ],
  },
];

/**
 * Índice PÚBLICO de módulos para la landing: título y una línea. Los títulos
 * deben coincidir con los del contenido de pago (lo comprueba
 * scripts/test-verifactu-kit.ts). Aquí no va contenido de los módulos.
 */
export const KIT_PUBLIC_MODULES: { titulo: string; resumen: string }[] = [
  { titulo: "¿Me aplica?", resumen: "Árbol de decisión orientativo con las exclusiones y la fecha vigente que te corresponde." },
  { titulo: "Qué preguntar a tu proveedor", resumen: "Quince preguntas para marcar con sí, no, pendiente o no aplica, exportables en CSV." },
  { titulo: "Inventario de facturación", resumen: "Programas, puntos de emisión, series, anulaciones, rectificativas, devoluciones, conectividad y responsables." },
  { titulo: "Matriz de proveedores", resumen: "Comparativa con los mismos criterios para decidir si te quedas, actualizas o cambias. Exportable en CSV." },
  { titulo: "Email al proveedor", resumen: "Plantilla para copiar y un recordatorio, con las preguntas que importan y un plazo de respuesta." },
  { titulo: "Email a la gestoría", resumen: "La consulta que resuelve por escrito si te aplica, desde cuándo y qué modalidad tiene sentido." },
  { titulo: "Dossier de evidencias", resumen: "Qué documentación pedir o conservar, con un índice para encontrarla en un minuto." },
  { titulo: "Plan de 30 días", resumen: "Cuatro semanas de tareas ordenadas para pasar de la duda a la decisión." },
  { titulo: "Cuándo necesitas una integración", resumen: "Criterios para reconocer cuándo un ERP, un TPV, un e-commerce o un software vertical piden trabajo técnico." },
];
