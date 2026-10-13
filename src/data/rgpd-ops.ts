// RGPD Ops Starter — configuración PÚBLICA del producto.
//
// Fuente única de nombre, precio mostrado, versión, periodo de acceso y rutas.
// Ningún componente, email o endpoint debe escribir estos valores a mano.
//
// Este módulo SÍ puede importarse desde páginas estáticas e islands: no
// contiene secretos ni contenido del espacio de trabajo. El precio que se
// COBRA lo fija el Stripe Price (RGPD_OPS_STRIPE_PRICE_ID); el checkout lo
// compara con `price` y se niega a vender si no coinciden
// (src/lib/rgpd-ops/stripe.ts).

import { RGPD_VERIFICACION } from "./rgpd";

export const RGPD_OPS_PRODUCT = {
  /** Identificador estable: metadatos de Stripe, analítica (product_id) y BD. */
  key: "rgpd-ops-starter",
  name: "RGPD Ops Starter",
  shortName: "RGPD Ops",
  /** Versión del producto. Subirla al publicar cambios (ver RGPD_OPS_CHANGELOG). */
  version: "1.0.0",
  releasedAt: "2026-10-13",
  price: {
    /** En euros, sin IVA. Debe coincidir con unit_amount/100 del Stripe Price. */
    amount: 149,
    currency: "EUR",
    display: "149 €",
    taxNote: "+ IVA",
    displayFull: "149 € + IVA",
  },
  /** Acceso al espacio de trabajo y a sus actualizaciones, en meses desde el pago. */
  accessMonths: 12,
  /** Días tras el fin del acceso durante los que se conserva el espacio para exportarlo. */
  retentionGraceDays: 90,
  promise:
    "Convierte el RGPD en un sistema operativo: tratamientos, proveedores, solicitudes, incidentes, tareas y evidencias en un solo lugar.",
  tagline: "RGPD para empresas que usan WhatsApp, CRM, formularios, automatizaciones e IA.",
  normativeBase: {
    verifiedAt: RGPD_VERIFICACION.lastVerifiedAt,
    verifiedAtLegible: RGPD_VERIFICACION.lastVerifiedAtLegible,
  },
  paths: {
    pilar: "/es/cumplimiento/rgpd/",
    test: "/es/cumplimiento/rgpd/test/",
    landing: "/es/cumplimiento/rgpd/ops/",
    gracias: "/es/cumplimiento/rgpd/ops/gracias/",
    acceso: "/es/cumplimiento/rgpd/ops/acceso/",
    condiciones: "/es/cumplimiento/rgpd/ops/condiciones/",
    revision: "/es/contact/?origen=rgpd",
  },
} as const;

export type RgpdOpsProduct = typeof RGPD_OPS_PRODUCT;

export const RGPD_OPS_ACCESS_TEXT = `Acceso al espacio de trabajo y a sus actualizaciones durante ${RGPD_OPS_PRODUCT.accessMonths} meses desde la compra. Puedes exportarlo todo en JSON y CSV cuando quieras.`;

/** Historial público de versiones. El más reciente primero. */
export const RGPD_OPS_CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: "1.0.0",
    date: "2026-10-13",
    changes: [
      "Primera versión: perfil y alcance, mapa de tratamientos con borrador de RAT, proveedores, puntos de captación, solicitudes de derechos, incidentes, plan de acción con evidencias y revisión trimestral.",
      "Base normativa revisada el 13/10/2026 (RGPD, LOPDGDD consolidada a 27/12/2025 y páginas de la AEPD).",
    ],
  },
];

/** Índice PÚBLICO de módulos para la landing (sin contenido de ayuda). */
export const RGPD_OPS_PUBLIC_MODULES: { id: string; titulo: string; resumen: string }[] = [
  { id: "panel", titulo: "Panel", resumen: "Progreso, madurez por área, tareas vencidas y próximas, última revisión y alertas que piden revisión profesional." },
  { id: "perfil", titulo: "Perfil y alcance", resumen: "Tu papel (responsable, encargado o ambos), canales, personas y categorías de datos, y señales de mayor riesgo." },
  { id: "tratamientos", titulo: "Mapa de tratamientos", resumen: "Inventario de actividades con finalidad, datos, destinatarios, transferencias, conservación y medidas. Exporta un borrador de RAT." },
  { id: "proveedores", titulo: "Proveedores y encargados", resumen: "CRM, WhatsApp, email, analítica, anuncios, hosting, automatizaciones e IA: papel, ubicación, contrato y próxima revisión." },
  { id: "captacion", titulo: "Puntos de captación", resumen: "Formularios, landings, WhatsApp, cookies, newsletter y píxeles: estado del aviso, información por capas y consentimiento." },
  { id: "solicitudes", titulo: "Solicitudes de derechos", resumen: "Registro por referencia interna con plazo orientativo de un mes, prórroga y fecha de respuesta. Sin datos de la persona." },
  { id: "incidentes", titulo: "Incidentes y brechas", resumen: "Registro con reloj orientativo de 72 horas, valoración interna, medidas y decisión de escalar, que es siempre tuya." },
  { id: "plan", titulo: "Plan de acción y evidencias", resumen: "Tareas con responsable por rol, prioridad y vencimiento; catálogo de evidencias por referencia; historial y revisión trimestral." },
  { id: "exportaciones", titulo: "Exportaciones", resumen: "CSV por módulo, copia de seguridad JSON versionada y vista imprimible del borrador de RAT." },
];
