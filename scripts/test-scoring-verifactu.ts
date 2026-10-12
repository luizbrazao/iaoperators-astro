// Regresión del motor del test de Verifactu (RRSIF) y de su informe por email.
// Uso: npm run assessment:test-scoring:verifactu
//
// Script plano, sin runner (mismo patrón que test-scoring-sac.ts): imprime cada
// caso y sale con código 1 si algo cambia. Ejecútalo siempre que toques
// questions.ts, scoring.ts, validation.ts, brand.ts o src/data/verifactu.ts.

import { scoreAssessment, ENGINE_VERSION } from "../src/lib/assessment/verifactu/scoring";
import { sanitizeAnswers } from "../src/lib/assessment/verifactu/validation";
import { buildProspectEmail } from "../src/lib/assessment/email";
import { VERIFACTU_BRAND } from "../src/lib/assessment/verifactu/brand";
import { SAC_BRAND } from "../src/lib/assessment/sac/brand";
import { scoreAssessment as scoreSac } from "../src/lib/assessment/sac/scoring";
import { kitOfferFor, type KitOfferMode } from "../src/lib/verifactu-kit/segment";
import { NORMA, ANUNCIO } from "../src/data/verifactu";
import { KIT_PRODUCT } from "../src/data/verifactu-kit";
import type { AssessmentAnswers, AssessmentResult, ObligadoVerdict, RiskLevel } from "../src/lib/assessment/types";

// Fecha fija: el resultado no puede depender de cuándo se ejecuta el test.
const NOW = new Date("2026-10-12T12:00:00+02:00").getTime();

let fallos = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallos++;
  console.log(`${ok ? "PASS" : "FALLO"} · ${nombre}${!ok && detalle ? `\n       ${detalle}` : ""}`);
}

const BASE: AssessmentAnswers = {
  exclusion: "ninguno",
  tributacion: "sociedades",
  sistema: "estandar",
  puntos_emision: "uno",
  series: "una",
  integracion: "api",
  conectividad: "estable",
  estado: ["nada"],
};

type Caso = {
  nombre: string;
  answers: AssessmentAnswers;
  espera: {
    obligado: ObligadoVerdict;
    riskLevel?: RiskLevel;
    oferta: KitOfferMode;
    gap?: Record<string, string>;
    motivoIncluye?: string[];
  };
};

const CASOS: Caso[] = [
  {
    nombre: "Excluido por SII",
    answers: { ...BASE, exclusion: "sii", sistema: "erp-propio" },
    espera: { obligado: "no", riskLevel: "bajo", oferta: "none", gap: { ambito: "ok" } },
  },
  {
    nombre: "Excluido por territorio foral",
    answers: { ...BASE, exclusion: "foral", sistema: "tpv" },
    espera: { obligado: "no", riskLevel: "bajo", oferta: "none", motivoIncluye: ["TicketBAI"] },
  },
  {
    nombre: "Operaciones sin obligación de expedir factura",
    answers: { ...BASE, exclusion: "sin-factura", sistema: "manual" },
    espera: { obligado: "no", riskLevel: "bajo", oferta: "none", motivoIncluye: ["asesoría"] },
  },
  {
    nombre: "Facturas solo en papel, sin programa → fuera del ámbito hoy",
    answers: { ...BASE, tributacion: "irpf", sistema: "papel" },
    espera: { obligado: "no", riskLevel: "bajo", oferta: "none", motivoIncluye: ["hoja de cálculo"] },
  },
  {
    nombre: "Autónomo con hoja de cálculo, nada montado",
    answers: {
      ...BASE,
      tributacion: "irpf",
      sistema: "manual",
      integracion: "no-lo-se",
      estado: ["nada"],
    },
    espera: {
      obligado: "si",
      oferta: "kit-primary",
      gap: { registro: "gap", declaracion: "gap" },
      motivoIncluye: [NORMA.fechaRestoLegible, ANUNCIO.texto],
    },
  },
  {
    nombre: "S.L. con software estándar sin adaptar",
    answers: { ...BASE, tributacion: "sociedades", sistema: "estandar", estado: ["nada"] },
    espera: {
      obligado: "si",
      oferta: "kit-primary",
      gap: { declaracion: "ok" },
      motivoIncluye: [NORMA.fechaSociedadesLegible],
    },
  },
  {
    nombre: "ERP propio sin ningún requisito",
    answers: {
      ...BASE,
      sistema: "erp-propio",
      puntos_emision: "dos-cinco",
      series: "varias-documentadas",
      integracion: "bbdd",
      estado: ["nada"],
    },
    espera: {
      obligado: "si",
      riskLevel: "critico",
      oferta: "audit-primary",
      gap: { registro: "gap", encadenamiento: "gap", remision: "gap", declaracion: "gap" },
    },
  },
  {
    nombre: "TPV multi-tienda con puntos offline",
    answers: {
      ...BASE,
      sistema: "tpv",
      puntos_emision: "mas-cinco",
      series: "varias-opacas",
      integracion: "eventos",
      conectividad: "offline",
      estado: ["registro"],
    },
    espera: { obligado: "si", oferta: "audit-primary", gap: { registro: "ok", encadenamiento: "gap", qr: "gap" } },
  },
  {
    nombre: "Sistema próximo de cumplir",
    answers: {
      ...BASE,
      sistema: "estandar",
      estado: ["registro", "encadenamiento", "remision", "qr", "inalterable"],
    },
    espera: { obligado: "si", riskLevel: "bajo", oferta: "kit-primary" },
  },
  {
    nombre: "«No lo sé» en exclusión → probable, nunca sí/no",
    answers: { ...BASE, exclusion: "no-lo-se" },
    espera: { obligado: "probable", oferta: "kit-primary", motivoIncluye: ["asesoría"] },
  },
  {
    nombre: "«No lo sé» en tributación → probable",
    answers: { ...BASE, tributacion: "no-lo-se", sistema: "vertical" },
    espera: { obligado: "probable", oferta: "audit-primary", motivoIncluye: ["asesoría"] },
  },
  {
    nombre: "«No lo sé» en series y conectividad → obligaciones sin datos",
    answers: {
      ...BASE,
      sistema: "ecommerce",
      series: "no-lo-se",
      puntos_emision: "no-lo-se",
      conectividad: "no-lo-se",
      integracion: "no-lo-se",
    },
    espera: {
      obligado: "si",
      oferta: "audit-primary",
      gap: { encadenamiento: "desconocido", remision: "desconocido" },
    },
  },
];

const resultados = new Map<string, AssessmentResult>();

for (const caso of CASOS) {
  const r = scoreAssessment(caso.answers, NOW);
  resultados.set(caso.nombre, r);
  const problemas: string[] = [];
  if (r.obligado !== caso.espera.obligado) problemas.push(`obligado=${r.obligado} (esperado ${caso.espera.obligado})`);
  if (caso.espera.riskLevel && r.riskLevel !== caso.espera.riskLevel)
    problemas.push(`riesgo=${r.riskLevel} (esperado ${caso.espera.riskLevel})`);
  const oferta = kitOfferFor(r);
  if (oferta !== caso.espera.oferta) problemas.push(`oferta=${oferta} (esperada ${caso.espera.oferta})`);
  for (const [id, estado] of Object.entries(caso.espera.gap ?? {})) {
    const g = r.gaps.find((x) => x.id === id);
    if (!g || g.estado !== estado) problemas.push(`gap ${id}=${g?.estado ?? "∅"} (esperado ${estado})`);
  }
  for (const frag of caso.espera.motivoIncluye ?? []) {
    if (!r.motivo.includes(frag)) problemas.push(`motivo sin «${frag}»`);
  }
  if (r.obligado === "no" && (r.gaps.length !== 1 || r.gaps[0].id !== "ambito"))
    problemas.push("excluido con brechas listadas");
  if (Number.isNaN(r.riskScore)) problemas.push("riskScore NaN");
  if (r.engineVersion !== ENGINE_VERSION) problemas.push("engineVersion");
  check(caso.nombre, problemas.length === 0, problemas.join(" · "));
}

// Formulación prudente de la declaración responsable: nunca categórica.
for (const [nombre, r] of resultados) {
  const textos = [r.motivo, r.titular, ...r.prioridades, ...r.gaps.map((g) => g.detalle)].join(" ");
  if (/eres tú|la firma tu empresa|es tuya/i.test(textos)) {
    check(`declaración prudente · ${nombre}`, false, "texto categórico sobre el productor");
  }
}
const erp = resultados.get("ERP propio sin ningún requisito")!;
check(
  "declaración responsable con la formulación prudente",
  /con frecuencia la empresa puede asumir la condición de productora/.test(
    erp.gaps.find((g) => g.id === "declaracion")?.detalle ?? "",
  ),
);

// Perfiles sin desarrollo propio: lenguaje de proveedor, no de ingeniería.
for (const nombre of ["Autónomo con hoja de cálculo, nada montado", "S.L. con software estándar sin adaptar"]) {
  const r = resultados.get(nombre)!;
  const texto = [...r.prioridades, ...r.gaps.map((g) => g.detalle)].join(" ");
  check(
    `sin jerga de integración para quien no desarrolla · ${nombre}`,
    !/\bAPI\b|append-only|encolar|vía de integración|base de datos/i.test(texto),
    texto.match(/\bAPI\b|append-only|encolar|vía de integración|base de datos/i)?.[0] ?? "",
  );
}

// Determinismo: misma entrada, mismo resultado.
for (const caso of CASOS) {
  const a = JSON.stringify(scoreAssessment(caso.answers, NOW));
  const b = JSON.stringify(scoreAssessment(caso.answers, NOW));
  if (a !== b) check(`determinismo · ${caso.nombre}`, false);
}
check("determinismo (todos los casos)", true);

// Opción «nada» exclusiva.
{
  const contradictoria = { ...BASE, estado: ["nada", "registro"] };
  const { errors } = sanitizeAnswers(contradictoria);
  check("validación rechaza «nada» combinada con otras", errors.includes("estado"), JSON.stringify(errors));

  const sola = sanitizeAnswers({ ...BASE, estado: ["nada"] });
  check("validación acepta «nada» sola", sola.errors.length === 0, JSON.stringify(sola.errors));

  const varias = sanitizeAnswers({ ...BASE, estado: ["registro", "qr"] });
  check("validación acepta varias opciones no exclusivas", varias.errors.length === 0);

  // Defensa en profundidad: si llegara al motor, se lee como «nada montado».
  const rc = scoreAssessment(contradictoria, NOW);
  const rn = scoreAssessment({ ...BASE, estado: ["nada"] }, NOW);
  check(
    "motor trata la respuesta contradictoria como «nada»",
    rc.riskScore === rn.riskScore && rc.gaps.find((g) => g.id === "registro")?.estado === "gap",
  );

  const exclusionNueva = sanitizeAnswers({ ...BASE, exclusion: "sin-factura" });
  check("validación acepta la exclusión «sin-factura»", exclusionNueva.errors.length === 0);
  const papel = sanitizeAnswers({ ...BASE, sistema: "papel" });
  check("validación acepta el sistema «papel»", papel.errors.length === 0);
}

// Entrada vacía no rompe.
try {
  const r = scoreAssessment({}, NOW);
  check("entrada vacía no rompe", !Number.isNaN(r.riskScore));
} catch (error) {
  check("entrada vacía no rompe", false, (error as Error).message);
}

// Emails del informe: nada de la Ley 10/2025 en Verifactu.
const PROHIBIDO_EN_VERIFACTU = [
  "Ley 10/2025",
  "BOE-A-2025-26698",
  "auditoría acreditada",
  "ley-atencion-al-cliente",
  "28 de diciembre de 2026",
  "atención a la clientela",
];
for (const [nombre, r] of resultados) {
  const { html, subject } = buildProspectEmail(r, VERIFACTU_BRAND);
  const todo = `${subject}\n${html}`;
  const encontrados = PROHIBIDO_EN_VERIFACTU.filter((t) => todo.includes(t));
  check(`email Verifactu sin textos de la Ley 10/2025 · ${nombre}`, encontrados.length === 0, encontrados.join(", "));
  if (!todo.includes(NORMA.boeId)) check(`email Verifactu cita ${NORMA.boeId} · ${nombre}`, false);
  if (r.obligado === "no" && todo.includes(KIT_PRODUCT.price.display)) {
    check(`email a excluido sin venta del Kit · ${nombre}`, false, "aparece el precio del Kit");
  }
}
{
  const r = resultados.get("Autónomo con hoja de cálculo, nada montado")!;
  const { html } = buildProspectEmail(r, VERIFACTU_BRAND);
  check("email Verifactu incluye evidencias específicas del RRSIF", html.includes("Qué pedir o conservar:") && html.includes("VERI*FACTU"));
  check("email Verifactu (kit-primary) enlaza el Kit", html.includes(KIT_PRODUCT.paths.landing));
  const erpHtml = buildProspectEmail(erp, VERIFACTU_BRAND).html;
  check("email Verifactu (audit-primary) prioriza la auditoría", erpHtml.indexOf("Solicitar la auditoría") > -1 && erpHtml.indexOf("Solicitar la auditoría") < erpHtml.indexOf(KIT_PRODUCT.paths.landing));
}

// El email de la Ley 10/2025 conserva sus textos.
{
  const sac = scoreSac(
    {
      sector: "agua-gas-electricidad",
      plantilla: "menos-50",
      umbrales: "ninguno",
      canales: ["telefono"],
      medicion: "no",
      clave: "no",
      plazos: "no",
      registro: "no",
    },
    NOW,
  );
  const { html } = buildProspectEmail(sac, SAC_BRAND);
  check(
    "email Ley 10/2025 mantiene BOE, plazo y dossier",
    html.includes("BOE-A-2025-26698") && html.includes("28 de diciembre de 2026") && html.includes("Evidencia para la auditoría:"),
  );
  check("email Ley 10/2025 sin textos de Verifactu", !html.includes("VERI*FACTU") && !html.includes(KIT_PRODUCT.shortName));
}

console.log(fallos ? `\n${fallos} fallo(s)` : "\nTodos los casos OK");
process.exit(fallos ? 1 : 0);
