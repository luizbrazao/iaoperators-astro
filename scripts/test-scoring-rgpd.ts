// Pruebas del diagnóstico RGPD (sin red, sin Supabase).
// Uso: npm run assessment:test-scoring:rgpd
//
// Cubre: determinismo y explicabilidad del motor en una barrida de ~160.000
// combinaciones, validación de respuestas, recomendación de revisión
// profesional, lenguaje prudente, email del informe y compatibilidad con los
// tests de la Ley 10/2025 y de Verifactu (que no deben cambiar de vista).

import { QUESTIONS, SENSIBLES_REVISION } from "../src/lib/assessment/rgpd/questions";
import { scoreAssessment, ENGINE_VERSION, WEIGHTS } from "../src/lib/assessment/rgpd/scoring";
import { sanitizeAnswers } from "../src/lib/assessment/rgpd/validation";
import { RGPD_BRAND } from "../src/lib/assessment/rgpd/brand";
import { buildInternalEmail, buildProspectEmail } from "../src/lib/assessment/email";
import { rgpdOfferFor, rgpdSegment } from "../src/lib/rgpd-ops/segment";
import { AFIRMACIONES, FUENTES } from "../src/data/rgpd";
import { scoreAssessment as scoreSac } from "../src/lib/assessment/sac/scoring";
import { QUESTIONS as SAC_QUESTIONS } from "../src/lib/assessment/sac/questions";
import { SAC_BRAND } from "../src/lib/assessment/sac/brand";
import { scoreAssessment as scoreVf } from "../src/lib/assessment/verifactu/scoring";
import { QUESTIONS as VF_QUESTIONS } from "../src/lib/assessment/verifactu/questions";
import { VERIFACTU_BRAND } from "../src/lib/assessment/verifactu/brand";
import type { AssessmentAnswers, AssessmentQuestion } from "../src/lib/assessment/types";

let fallos = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallos++;
  console.log(`${ok ? "PASS" : "FALLO"} · ${nombre}${!ok && detalle ? `\n       ${detalle}` : ""}`);
}

const Q = (id: string) => QUESTIONS.find((q) => q.id === id)!;
const values = (id: string) => Q(id).options.map((o) => o.value);
const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

// Frases que el producto no puede decir (promesas o conclusiones jurídicas).
const PROHIBIDAS =
  /garantiza(mos)? el cumplimiento|certificado rgpd|certifica(mos)? que|100\s?% conforme|cumples (con )?el rgpd|est[aá]s obligad[oa] a (designar|realizar|notificar)|debes notificar|(?<!si )necesitas una (eipd|evaluaci[oó]n de impacto)|no necesitas (una )?(eipd|evaluaci[oó]n de impacto|delegado)/i;

// ------------------------------------------------------------------ cuestionario
{
  check("cuestionario: entre 9 y 11 preguntas", QUESTIONS.length >= 9 && QUESTIONS.length <= 11, String(QUESTIONS.length));
  const ids = QUESTIONS.map((q) => q.id);
  check("cuestionario: ids únicos", new Set(ids).size === ids.length);
  const cubre = ["actividad", "tamano", "datos", "canales", "proveedores", "contratos", "rat", "transparencia", "derechos", "incidentes", "medidas"];
  check("cuestionario: cubre todos los temas pedidos", cubre.every((id) => ids.includes(id)));
  check(
    "cuestionario: opciones de revisión existen en la pregunta de datos",
    SENSIBLES_REVISION.every((v) => values("datos").includes(v)),
  );
}

// ------------------------------------------------------------------ barrida
const DATOS_VARIANTES: string[][] = [
  ["clientes"],
  ["clientes", "contactos-b2b", "empleados"],
  ["clientes", "salud"],
  ["clientes", "menores", "perfiles"],
  ["contactos-b2b", "gran-escala"],
  ["clientes", "decisiones"],
];
const CANALES_VARIANTES: string[][] = [["web"], ["web", "whatsapp", "crm", "pixeles"], ["ia", "email-marketing"], ["ninguno"]];
const MEDIDAS_VARIANTES: string[][] = [
  ["ninguna"],
  ["accesos"],
  ["accesos", "doble-factor", "copias", "revision"],
  ["accesos", "doble-factor", "copias", "formacion", "revision"],
  ["accesos", "doble-factor", "copias"],
];

let combos = 0;
const problemas: string[] = [];
const niveles = { inicial: 0, en_proceso: 0, operativo: 0 } as Record<string, number>;
const actividades = values("actividad");
const tamanos = values("tamano");

for (const proveedores of values("proveedores"))
  for (const contratos of values("contratos"))
    for (const rat of values("rat"))
      for (const transparencia of values("transparencia"))
        for (const derechos of values("derechos"))
          for (const incidentes of values("incidentes"))
            for (let i = 0; i < MEDIDAS_VARIANTES.length; i++)
              for (let j = 0; j < DATOS_VARIANTES.length; j++) {
                combos++;
                const answers: AssessmentAnswers = {
                  actividad: actividades[combos % actividades.length],
                  tamano: tamanos[(combos >> 2) % tamanos.length],
                  datos: DATOS_VARIANTES[j],
                  canales: CANALES_VARIANTES[(combos + j) % CANALES_VARIANTES.length],
                  proveedores,
                  contratos,
                  rat,
                  transparencia,
                  derechos,
                  incidentes,
                  medidas: MEDIDAS_VARIANTES[i],
                };
                const r = scoreAssessment(answers);
                const r2 = scoreAssessment(JSON.parse(JSON.stringify(answers)));
                const tag = JSON.stringify(answers);
                if (JSON.stringify(r) !== JSON.stringify(r2)) problemas.push(`no determinista: ${tag}`);
                if (!r.maturity || !["inicial", "en_proceso", "operativo"].includes(r.maturity.level)) problemas.push(`nivel inválido: ${tag}`);
                if (!["critico", "alto", "medio", "bajo"].includes(r.riskLevel)) problemas.push(`riesgo inválido: ${tag}`);
                if (r.obligado !== "si") problemas.push(`obligado fuera del CHECK de la BD: ${tag}`);
                if (!Number.isFinite(r.riskScore) || !Number.isFinite(r.maturity!.score) || r.riskScore < 0 || r.riskScore > r.riskScoreMax)
                  problemas.push(`puntuación inválida: ${tag}`);
                if (r.gaps.length !== 8) problemas.push(`número de áreas: ${tag}`);
                for (const g of r.gaps) {
                  if (!g.derivadoDe.length || g.derivadoDe.some((d) => !QUESTION_IDS.has(d))) problemas.push(`derivadoDe inválido en ${g.id}: ${tag}`);
                  if (!g.detalle || !g.obligacion) problemas.push(`área sin texto ${g.id}`);
                }
                if (!r.prioridades.length || r.prioridades.length > 6) problemas.push(`prioridades vacías o excesivas: ${tag}`);
                const datos = answers.datos as string[];
                const debeRevisar =
                  SENSIBLES_REVISION.some((f) => datos.includes(f)) ||
                  answers.tamano === "250+" ||
                  (answers.actividad === "agencia" && (answers.canales as string[]).includes("pixeles"));
                if (Boolean(r.review?.recommended) !== debeRevisar) problemas.push(`revisión profesional incoherente: ${tag}`);
                if (r.review?.recommended) {
                  if (r.riskLevel === "bajo") problemas.push(`revisión recomendada con riesgo bajo: ${tag}`);
                  if (!/revisión profesional/.test(r.prioridades[0])) problemas.push(`revisión no es la primera prioridad: ${tag}`);
                  if (rgpdOfferFor(r) !== "review-primary") problemas.push(`oferta incoherente: ${tag}`);
                } else if (rgpdOfferFor(r) !== "ops-primary") problemas.push(`oferta incoherente: ${tag}`);
                const madurez = r.gaps.filter((g) => g.id in WEIGHTS);
                if (r.maturity!.level === "operativo" && madurez.some((g) => g.estado === "gap")) problemas.push(`operativo con brechas: ${tag}`);
                if (PROHIBIDAS.test(JSON.stringify(r))) problemas.push(`frase prohibida: ${tag}`);
                niveles[r.maturity!.level]++;
                if (problemas.length > 20) break;
              }

check(`motor: ${combos} combinaciones sin problemas`, problemas.length === 0, problemas.slice(0, 5).join("\n       "));
check(
  "motor: los tres niveles aparecen en la barrida",
  niveles.inicial > 0 && niveles.en_proceso > 0 && niveles.operativo > 0,
  JSON.stringify(niveles),
);
check("motor: versión declarada", ENGINE_VERSION.startsWith("rgpd-"));

// ------------------------------------------------------------------ casos concretos
{
  const todoBien: AssessmentAnswers = {
    actividad: "consultoria",
    tamano: "10-49",
    datos: ["clientes", "empleados"],
    canales: ["web", "crm"],
    proveedores: "lista-ue",
    contratos: "todos",
    rat: "actualizado",
    transparencia: "completos",
    derechos: "procedimiento",
    incidentes: "protocolo",
    medidas: ["accesos", "doble-factor", "copias", "formacion", "revision"],
  };
  const r = scoreAssessment(todoBien);
  check("caso operativo: nivel operativo y riesgo bajo", r.maturity?.level === "operativo" && r.riskLevel === "bajo");
  check("caso operativo: prioridades de mantenimiento (nunca vacío)", r.prioridades.length >= 3 && /revisión trimestral/.test(r.prioridades[0]));
  const nada: AssessmentAnswers = {
    ...todoBien,
    proveedores: "sin-lista",
    contratos: "ninguno",
    rat: "no",
    transparencia: "no",
    derechos: "nada",
    incidentes: "nada",
    medidas: ["ninguna"],
  };
  const r2 = scoreAssessment(nada);
  check("caso sin nada: nivel inicial y riesgo alto", r2.maturity?.level === "inicial" && r2.riskLevel === "alto");
  const salud = scoreAssessment({ ...nada, actividad: "salud-bienestar", datos: ["clientes", "salud"] });
  check("salud + inicial: crítico y revisión profesional", salud.riskLevel === "critico" && salud.review?.recommended === true);
  check(
    "revisión: cita la respuesta de la que sale",
    salud.review!.derivadoDe.includes("datos") && salud.gaps.find((g) => g.id === "riesgo")!.derivadoDe.includes("datos"),
  );
  check(
    "revisión: nunca concluye EIPD ni DPD",
    /no determina si necesitas una evaluación de impacto o un delegado/.test(salud.gaps.find((g) => g.id === "riesgo")!.detalle),
  );
  const noSe = scoreAssessment({ ...todoBien, rat: "no-lo-se", proveedores: "no-lo-se", contratos: "no-lo-se" });
  check(
    "«no lo sé» no cuenta como operativo",
    noSe.gaps.find((g) => g.id === "inventario")!.estado === "desconocido" && noSe.maturity!.score < r.maturity!.score,
  );
  const agencia = scoreAssessment({ ...todoBien, actividad: "agencia", canales: ["web", "pixeles"] });
  check("agencia con píxeles: revisión por LOPDGDD 34.1.k", agencia.review?.recommended === true && /34\.1\.k/.test(agencia.review!.motivos.join(" ")));
  check("segmento analítico sin datos personales", /^[a-z-]+:(ops|revision)$/.test(rgpdSegment(agencia)));
  const ratNo = scoreAssessment({ ...todoBien, rat: "no", tamano: "1-9" });
  check("RAT ausente en pyme: menciona la excepción con sus límites", /no se aplica si el tratamiento puede entrañar un riesgo/.test(ratNo.gaps[0].detalle));
}

// ------------------------------------------------------------------ validación
{
  const ok = sanitizeAnswers({
    actividad: "agencia",
    tamano: "1-9",
    datos: ["clientes"],
    canales: ["web"],
    proveedores: "lista-ue",
    contratos: "todos",
    rat: "no",
    transparencia: "parcial",
    derechos: "informal",
    incidentes: "nada",
    medidas: ["copias"],
    extra: "x",
  });
  check("validación: respuestas válidas y campos ajenos descartados", ok.errors.length === 0 && !("extra" in ok.answers));
  const bad = sanitizeAnswers({ actividad: "hackeo", canales: ["ninguno", "web"], medidas: ["ninguna", "copias"], datos: [] });
  check(
    "validación: rechaza valores desconocidos, exclusivas combinadas y multi vacías",
    ["actividad", "canales", "medidas", "datos"].every((id) => bad.errors.includes(id)),
    JSON.stringify(bad.errors),
  );
}

// ------------------------------------------------------------------ email
{
  const answers: AssessmentAnswers = {
    actividad: "salud-bienestar",
    tamano: "1-9",
    datos: ["clientes", "salud"],
    canales: ["web", "whatsapp"],
    proveedores: "fuera-sin-revisar",
    contratos: "algunos",
    rat: "no",
    transparencia: "plantilla",
    derechos: "informal",
    incidentes: "informal",
    medidas: ["copias"],
  };
  const r = scoreAssessment(answers);
  const e = buildProspectEmail(r, RGPD_BRAND);
  check("email RGPD: título por áreas y estados propios", e.html.includes("Área por área") && e.html.includes("En proceso") && !e.html.includes("Obligación por obligación"));
  check("email RGPD: bloque de revisión profesional", e.html.includes("Por qué recomendamos una revisión profesional"));
  check("email RGPD: CTA a revisión cuando hay señales", e.html.includes("/es/contact/?origen=rgpd"));
  check("email RGPD: aviso legal prudente", /no certifica el cumplimiento/i.test(e.html) && /no constituye asesoramiento jurídico/i.test(e.html));
  check("email RGPD: sin textos de otras normas", !/Verifactu|Ley 10\/2025|BOE-A-2023-24840/.test(e.html));
  check("email RGPD: sin frases prohibidas", !PROHIBIDAS.test(e.html));
  const internal = buildInternalEmail({ email: "a@b.es", result: r, answers, responseId: "x", brand: RGPD_BRAND });
  check("email interno RGPD: nivel de madurez en el asunto", internal.subject.includes("INICIAL") || internal.subject.includes("EN_PROCESO"));
  const okCase = scoreAssessment({ ...answers, actividad: "consultoria", datos: ["clientes"] });
  check("email RGPD: CTA al producto sin señales", buildProspectEmail(okCase, RGPD_BRAND).html.includes("/es/cumplimiento/rgpd/ops/"));
}

// ------------------------------------------------------------------ compatibilidad
function firstAnswers(qs: AssessmentQuestion[]): AssessmentAnswers {
  const a: AssessmentAnswers = {};
  for (const q of qs) {
    const plain = q.options.filter((o) => !o.exclusive);
    a[q.id] = q.type === "multi" ? [plain[0].value] : q.options[0].value;
  }
  return a;
}
{
  const sac = scoreSac(firstAnswers(SAC_QUESTIONS));
  const vf = scoreVf(firstAnswers(VF_QUESTIONS));
  check("compatibilidad: SAC sin campos de madurez (mantiene su vista)", !("maturity" in sac) && !("review" in sac));
  check("compatibilidad: Verifactu sin campos de madurez (mantiene su vista)", !("maturity" in vf) && !("review" in vf));
  const es = buildProspectEmail(sac, SAC_BRAND).html;
  const ev = buildProspectEmail(vf, VERIFACTU_BRAND).html;
  check(
    "compatibilidad: emails SAC y Verifactu con rótulos de siempre",
    es.includes("Obligación por obligación") && ev.includes("Obligación por obligación") && !es.includes("Área por área") && !/>\s*(Operativo|Pendiente|Sin confirmar)\s*</.test(es + ev),
  );
  const internalSac = buildInternalEmail({ email: "a@b.es", result: sac, answers: {}, responseId: "x", brand: SAC_BRAND });
  check("compatibilidad: asunto interno SAC con veredicto de obligación", internalSac.subject.startsWith(`[Test ${SAC_BRAND.norma}] ${sac.obligado.toUpperCase()}`));
}

// ------------------------------------------------------------------ fuentes
{
  const verificadas = new Set(FUENTES.filter((f) => f.verificada).map((f) => f.id));
  const sinFuente = Object.values(AFIRMACIONES).filter((a) => !a.fuentes.some((id) => verificadas.has(id)));
  check("afirmaciones: todas con al menos una fuente oficial verificada", sinFuente.length === 0, sinFuente.map((a) => a.id).join(", "));
  check(
    "fuentes: solo dominios oficiales",
    FUENTES.every((f) => /^https:\/\/(www\.boe\.es|eur-lex\.europa\.eu|www\.aepd\.es)\//.test(f.url)),
  );
  check("afirmaciones: sin frases prohibidas", !PROHIBIDAS.test(JSON.stringify(AFIRMACIONES)));
}

console.log(fallos ? `\n${fallos} fallo(s)` : "\nTodos los casos OK");
process.exit(fallos ? 1 : 0);
