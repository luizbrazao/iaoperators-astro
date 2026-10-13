// Panel de RGPD Ops. Función pura: mismo snapshot y misma fecha → mismo
// panel. La usan la island (en el navegador) y las pruebas.
//
// El panel describe el estado de la OPERACIÓN (qué está documentado, qué vence,
// qué está pendiente). No dictamina cumplimiento ni decide nada jurídico: las
// alertas de mayor riesgo recomiendan revisión profesional.

import { addMonths, hoursSince, todayMadrid, daysBetween, formatDateEs } from "./dates";
import { optionLabel, PERFIL_SENALES } from "./schema";
import type { ClientSnapshot, RightsRequestRow, TaskRow } from "./types";

export type ModuleId = "perfil" | "tratamientos" | "proveedores" | "captacion" | "solicitudes" | "incidentes" | "plan";
export type AreaMaturity = "inicial" | "en_proceso" | "operativo";

export const MODULE_LABELS: Record<ModuleId, string> = {
  perfil: "Perfil y alcance",
  tratamientos: "Mapa de tratamientos",
  proveedores: "Proveedores y encargados",
  captacion: "Puntos de captación",
  solicitudes: "Solicitudes de derechos",
  incidentes: "Incidentes y brechas",
  plan: "Plan de acción y evidencias",
};

export interface ModuleStatus {
  id: ModuleId;
  label: string;
  /** 0–1 */
  completion: number;
  maturity: AreaMaturity;
  complete: boolean;
  /** Línea de estado legible. */
  resumen: string;
}

export interface Alert {
  level: "alto" | "medio";
  module: ModuleId;
  text: string;
}

export interface Dashboard {
  today: string;
  progress: number;
  modules: ModuleStatus[];
  tasks: { overdue: TaskRow[]; upcoming: TaskRow[]; done: number; open: number };
  lastReviewAt: string | null;
  nextReviewOn: string | null;
  reviewOverdue: boolean;
  alerts: Alert[];
  professionalReview: { recommended: boolean; motivos: string[] };
}

const OPEN_REQUEST = new Set(["recibida", "en_curso"]);
const OPEN_TASK = new Set(["pendiente", "en_curso"]);

function maturityOf(c: number): AreaMaturity {
  return c >= 0.8 ? "operativo" : c >= 0.34 ? "en_proceso" : "inicial";
}

export function effectiveDue(r: Pick<RightsRequestRow, "extended" | "extended_due_on" | "due_on">): string {
  return r.extended && r.extended_due_on ? r.extended_due_on : r.due_on;
}

function ratio(n: number, d: number) {
  return d ? n / d : 0;
}

function areaTaskDone(tasks: TaskRow[], area: string): boolean {
  return tasks.some((t) => t.area === area && t.status === "hecha");
}

export function buildDashboard(s: ClientSnapshot, now: Date = new Date()): Dashboard {
  const today = todayMadrid(now);
  const p = s.workspace.profile ?? {};
  const alerts: Alert[] = [];

  // ---------------------------------------------------------- perfil
  const arr = (k: string) => (Array.isArray(p[k]) ? (p[k] as string[]) : []);
  const perfilChecks = [
    typeof p.rol === "string" && p.rol !== "por_determinar",
    typeof p.actividad === "string",
    typeof p.plantilla === "string",
    arr("canales").length > 0,
    arr("interesados").length > 0,
    arr("categorias").length > 0,
    arr("senales").length > 0,
    typeof p.dpd === "string",
  ];
  const perfil = ratio(perfilChecks.filter(Boolean).length, perfilChecks.length);

  // ---------------------------------------------------------- tratamientos
  const actsOk = s.tratamientos.filter(
    (a) => a.purpose.trim() && a.data_subjects.length && a.data_categories.length && a.retention.trim() && a.security_measures.trim() && a.transfers !== "por_determinar",
  ).length;
  const tratamientos = ratio(actsOk, s.tratamientos.length);

  // ---------------------------------------------------------- proveedores
  const provOk = s.proveedores.filter(
    (x) =>
      x.role_estimate !== "por_determinar" &&
      x.location !== "desconocida" &&
      x.dpa_status !== "pendiente" &&
      Boolean(x.next_review_on) &&
      (x.location === "ue_eee" || x.transfer_mechanism !== "por_determinar"),
  ).length;
  const proveedores = ratio(provOk, s.proveedores.length);

  // ---------------------------------------------------------- captación
  const capOk = s.captacion.filter(
    (x) => (x.notice_status === "completo" || x.notice_status === "no_aplica") && x.consent_status !== "pendiente" && x.consent_status !== "por_determinar",
  ).length;
  const captacion = ratio(capOk, s.captacion.length);

  // ---------------------------------------------------------- solicitudes
  const openReq = s.solicitudes.filter((r) => OPEN_REQUEST.has(r.status));
  const overdueReq = openReq.filter((r) => effectiveDue(r) < today);
  const solicitudes = (areaTaskDone(s.tareas, "solicitudes") ? 0.5 : 0) + (overdueReq.length === 0 ? 0.5 : 0);
  for (const r of overdueReq) {
    alerts.push({ level: "alto", module: "solicitudes", text: `La solicitud ${r.reference} superó su plazo orientativo el ${formatDateEs(effectiveDue(r))}.` });
  }
  for (const r of openReq) {
    const due = effectiveDue(r);
    const left = daysBetween(today, due);
    if (left >= 0 && left <= 7) {
      alerts.push({ level: "medio", module: "solicitudes", text: `La solicitud ${r.reference} vence el ${formatDateEs(due)} (${left === 0 ? "hoy" : `en ${left} día${left === 1 ? "" : "s"}`}).` });
    }
    if (r.extended && !r.extension_notified_on && today > r.due_on) {
      alerts.push({
        level: "alto",
        module: "solicitudes",
        text: `La solicitud ${r.reference} tiene prórroga, pero no consta el aviso a la persona dentro del primer mes.`,
      });
    }
  }

  // ---------------------------------------------------------- incidentes
  const openInc = s.incidentes.filter((i) => i.status === "abierto");
  let incidentsLate = 0;
  for (const i of openInc) {
    if (i.escalation_decision === "pendiente") {
      const h = hoursSince(i.detected_at, now);
      if (h < 72) {
        alerts.push({
          level: "alto",
          module: "incidentes",
          text: `Incidente ${i.reference}: quedan unas ${Math.max(0, Math.floor(72 - h))} h del plazo orientativo de 72 horas por si la brecha debe notificarse. Registra vuestra decisión.`,
        });
      } else {
        incidentsLate++;
        alerts.push({
          level: "alto",
          module: "incidentes",
          text: `Incidente ${i.reference}: han pasado más de 72 horas desde la constancia sin decisión registrada.`,
        });
      }
    }
    if (i.internal_assessment === "alto_riesgo" && i.escalation_decision !== "notificar_aepd_y_afectados") {
      alerts.push({
        level: "medio",
        module: "incidentes",
        text: `Incidente ${i.reference}: lo valoráis como alto riesgo. El RGPD prevé comunicarlo a los afectados cuando el riesgo es alto; revisadlo con un profesional.`,
      });
    }
  }
  const incidentes = (areaTaskDone(s.tareas, "incidentes") ? 0.5 : 0) + (incidentsLate === 0 ? 0.5 : 0);

  // ---------------------------------------------------------- plan y evidencias
  const live = s.tareas.filter((t) => t.status !== "descartada");
  const done = live.filter((t) => t.status === "hecha").length;
  const open = live.filter((t) => OPEN_TASK.has(t.status));
  const overdue = open.filter((t) => t.due_on && t.due_on < today).sort((a, b) => (a.due_on! < b.due_on! ? -1 : 1));
  const upcoming = open
    .filter((t) => t.due_on && t.due_on >= today && daysBetween(today, t.due_on) <= 14)
    .sort((a, b) => (a.due_on! < b.due_on! ? -1 : 1));

  const completed = s.revisiones.filter((r) => r.status === "completada" && r.completed_at).sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1));
  const lastReviewAt = completed[0]?.completed_at ?? null;
  const nextReviewOn = lastReviewAt ? addMonths(lastReviewAt.slice(0, 10), 3) : null;
  const reviewOverdue = !nextReviewOn || today > nextReviewOn;
  const recentReview = Boolean(lastReviewAt && daysBetween(lastReviewAt.slice(0, 10), today) <= 100);
  const plan = ratio(done, live.length) * 0.6 + (s.evidencias.length > 0 ? 0.2 : 0) + (recentReview ? 0.2 : 0);

  // ---------------------------------------------------------- alertas de operación
  const senales = arr("senales").filter((x) => x !== "ninguna");
  const motivos: string[] = [];
  if (senales.length) {
    motivos.push(`Tu perfil incluye señales de mayor riesgo: ${senales.map((x) => optionLabel(PERFIL_SENALES, x).toLowerCase()).join(", ")}.`);
  }
  if (p.plantilla === "250+") motivos.push("Con 250 personas o más, una herramienta estándar no basta como único soporte.");
  if (p.actividad === "agencia" && arr("canales").includes("pixeles")) {
    motivos.push("Hacéis publicidad con píxeles: confirma si os afecta la obligación de delegado de la LOPDGDD (art. 34.1.k).");
  }
  if (motivos.length) {
    alerts.push({
      level: "alto",
      module: "perfil",
      text: "Recomendamos una revisión profesional de vuestro caso. La herramienta no determina si necesitáis evaluación de impacto o delegado de protección de datos.",
    });
  }
  const sinGarantia = s.proveedores.filter((x) => (x.location === "fuera_eee" || x.location === "mixta") && x.transfer_mechanism === "por_determinar");
  if (sinGarantia.length)
    alerts.push({ level: "medio", module: "proveedores", text: `${sinGarantia.length} proveedor(es) fuera del EEE sin garantía de transferencia identificada.` });
  const dpaPend = s.proveedores.filter((x) => x.dpa_status === "pendiente");
  if (dpaPend.length) alerts.push({ level: "medio", module: "proveedores", text: `${dpaPend.length} proveedor(es) con el contrato de encargo pendiente.` });
  const provVencidos = s.proveedores.filter((x) => x.next_review_on && x.next_review_on < today);
  if (provVencidos.length) alerts.push({ level: "medio", module: "proveedores", text: `${provVencidos.length} proveedor(es) con la revisión vencida.` });
  if (overdue.length) alerts.push({ level: "medio", module: "plan", text: `${overdue.length} tarea(s) vencida(s).` });
  if (reviewOverdue)
    alerts.push({
      level: "medio",
      module: "plan",
      text: lastReviewAt ? `La revisión trimestral venció el ${formatDateEs(nextReviewOn)}.` : "Todavía no habéis completado ninguna revisión trimestral.",
    });
  const evVencidas = s.evidencias.filter((e) => e.review_due_on && e.review_due_on < today);
  if (evVencidas.length) alerts.push({ level: "medio", module: "plan", text: `${evVencidas.length} evidencia(s) con la revisión vencida.` });

  const raw: [ModuleId, number, string][] = [
    ["perfil", perfil, `${perfilChecks.filter(Boolean).length} de ${perfilChecks.length} apartados completos`],
    ["tratamientos", tratamientos, s.tratamientos.length ? `${actsOk} de ${s.tratamientos.length} tratamientos completos` : "Sin tratamientos"],
    ["proveedores", proveedores, s.proveedores.length ? `${provOk} de ${s.proveedores.length} proveedores revisados` : "Sin proveedores"],
    ["captacion", captacion, s.captacion.length ? `${capOk} de ${s.captacion.length} puntos al día` : "Sin puntos de captación"],
    ["solicitudes", solicitudes, `${openReq.length} abierta(s), ${overdueReq.length} fuera de plazo`],
    ["incidentes", incidentes, `${openInc.length} abierto(s)`],
    ["plan", plan, `${done} de ${live.length} tareas hechas · ${s.evidencias.length} evidencia(s)`],
  ];
  const modules: ModuleStatus[] = raw.map(([id, c, resumen]) => {
    const completion = Math.round(Math.min(1, Math.max(0, c)) * 100) / 100;
    return { id, label: MODULE_LABELS[id], completion, maturity: maturityOf(completion), complete: completion >= 0.999, resumen };
  });
  const progress = Math.round((modules.reduce((acc, m) => acc + m.completion, 0) / modules.length) * 100);

  alerts.sort((a, b) => (a.level === b.level ? 0 : a.level === "alto" ? -1 : 1));

  return {
    today,
    progress,
    modules,
    tasks: { overdue, upcoming, done, open: open.length },
    lastReviewAt,
    nextReviewOn,
    reviewOverdue,
    alerts,
    professionalReview: { recommended: motivos.length > 0, motivos },
  };
}
