// Espacio de trabajo de RGPD Ops (zona del comprador).
//
// Recibe el snapshot inicial y el contenido guiado como props SOLO desde la
// página protegida (SSR, prerender = false). Este archivo no importa el
// contenido guiado: únicamente sus tipos, que desaparecen al compilar.
//
// Fuente de verdad: el servidor. Cada cambio se guarda con autosave (debounce)
// contra la API con la versión de la fila; si otra pestaña guardó antes, el
// servidor responde 409 y aquí se muestra el conflicto para decidir. No se usa
// localStorage para datos: solo para recordar el último módulo abierto.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ModuleGuide } from "@/data/rgpd-ops-content";
import {
  ENTITIES,
  PROFILE_FIELDS,
  REVIEW_KEYS,
  optionLabel,
  type EntitySlug,
  type FieldDef,
  type ValidationIssue,
} from "@/lib/rgpd-ops/schema";
import { buildDashboard, effectiveDue, type Dashboard, type ModuleId } from "@/lib/rgpd-ops/dashboard";
import { ratRows } from "@/lib/rgpd-ops/export";
import { daysBetween, formatDateEs, formatDateTimeEs, hoursSince, quarterOf, todayMadrid } from "@/lib/rgpd-ops/dates";
import { pushRgpdOpsEvent } from "@/lib/rgpd-ops/analytics";
import type { ClientSnapshot, IncidentRow, ReviewRow, RightsRequestRow } from "@/lib/rgpd-ops/types";

type AnyRow = Record<string, unknown> & { id: string; version: number };

interface QuickTemplate {
  name: string;
  [k: string]: unknown;
}

interface Props {
  initial: ClientSnapshot;
  guides: ModuleGuide[];
  reviewChecklist: { key: string; texto: string }[];
  quickAdd: Record<"tratamientos" | "proveedores" | "captacion", readonly QuickTemplate[]>;
  aepdTools: readonly { nombre: string; uso: string; url: string }[];
  productName: string;
  productVersion: string;
  normativeVerifiedAt: string;
  accessUntil: string;
  disclaimer: string;
  borrador: string;
  revisionHref: string;
  changelog: { version: string; date: string; changes: string[] }[];
}

type View = "panel" | ModuleId | "exportaciones";
type SaveState = "idle" | "saving" | "saved" | "error";

const VIEWS: { id: View; label: string }[] = [
  { id: "panel", label: "Panel" },
  { id: "perfil", label: "Perfil y alcance" },
  { id: "tratamientos", label: "Mapa de tratamientos" },
  { id: "proveedores", label: "Proveedores y encargados" },
  { id: "captacion", label: "Puntos de captación" },
  { id: "solicitudes", label: "Solicitudes de derechos" },
  { id: "incidentes", label: "Incidentes y brechas" },
  { id: "plan", label: "Plan de acción y evidencias" },
  { id: "exportaciones", label: "Exportaciones" },
];

const VIEW_KEY = "rgo:view";

const MATURITY_LABEL = { inicial: "Inicial", en_proceso: "En proceso", operativo: "Operativo" } as const;

const AUDIT_LABEL: Record<string, string> = {
  workspace_created: "Espacio creado",
  profile_updated: "Perfil actualizado",
  entity_created: "Alta",
  entity_updated: "Cambio",
  entity_deleted: "Borrado",
  review_completed: "Revisión completada",
  export: "Exportación",
  access: "Acceso",
};

// ---------------------------------------------------------------- API

interface ApiResult {
  status: number;
  data: Record<string, unknown> | null;
}

async function api(method: string, path: string, body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(path, {
      method,
      headers: body === undefined ? {} : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  }
}

function issuesToMap(data: Record<string, unknown> | null): Record<string, string> {
  const out: Record<string, string> = {};
  const issues = (data?.issues as ValidationIssue[] | undefined) ?? [];
  for (const i of issues) out[i.field] = i.message;
  if (!issues.length && typeof data?.error === "string") out._ = data.error;
  return out;
}

function isoToLocalInput(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function localInputToIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ---------------------------------------------------------------- componente principal

export default function RgpdWorkspace(props: Props) {
  const [snap, setSnap] = useState<ClientSnapshot>(props.initial);
  const [view, setView] = useState<View>("panel");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMsg, setSaveMsg] = useState<string>("");
  const [expired, setExpired] = useState(false);
  const [printing, setPrinting] = useState(false);
  const pending = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const dashboard = useMemo(() => buildDashboard(snap), [snap]);

  // Vista recordada (comodidad por navegador; nunca datos).
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(VIEW_KEY) as View | null;
      if (v && VIEWS.some((x) => x.id === v)) setView(v);
    } catch {
      /* sin almacenamiento */
    }
    try {
      if (window.sessionStorage.getItem("rgo:accessed") !== "1") {
        window.sessionStorage.setItem("rgo:accessed", "1");
        pushRgpdOpsEvent("rgpd_ops_accessed");
      }
    } catch {
      pushRgpdOpsEvent("rgpd_ops_accessed");
    }
  }, []);

  // Evento de módulo completado: solo en la transición, no al cargar.
  const completedRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const now = new Set(dashboard.modules.filter((m) => m.complete).map((m) => m.id));
    if (completedRef.current) {
      for (const id of now) if (!completedRef.current.has(id)) pushRgpdOpsEvent("rgpd_ops_module_completed", { module_id: id });
    }
    completedRef.current = now;
  }, [dashboard]);

  const go = useCallback((v: View) => {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* noop */
    }
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  // Al volver a la pestaña, se refresca desde el servidor si no hay guardados en curso.
  const refresh = useCallback(async () => {
    if (pending.current > 0) return;
    const r = await api("GET", "/api/rgpd-ops/workspace");
    if (r.status === 401) setExpired(true);
    else if (r.status === 200 && r.data?.snapshot) setSnap(r.data.snapshot as ClientSnapshot);
  }, []);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  // Seguimiento del estado de guardado (varios editores a la vez).
  const track = useCallback(async <T,>(fn: () => Promise<T>, onResult: (r: T) => "ok" | "error" | "conflict" | "expired") => {
    pending.current++;
    setSaveState("saving");
    setSaveMsg("");
    const r = await fn();
    pending.current--;
    const outcome = onResult(r);
    if (outcome === "expired") {
      setExpired(true);
      setSaveState("error");
      setSaveMsg("Tu sesión ha caducado.");
    } else if (outcome === "ok") {
      if (pending.current === 0) setSaveState("saved");
    } else {
      setSaveState("error");
      setSaveMsg(outcome === "conflict" ? "Conflicto de versión: revisa el registro marcado." : "No se pudo guardar. Revisa la conexión o los campos marcados.");
    }
    return r;
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const upsertRow = useCallback((slug: EntitySlug, row: AnyRow) => {
    setSnap((s) => {
      const list = (s[slug] as unknown as AnyRow[]).slice();
      const i = list.findIndex((r) => r.id === row.id);
      if (i >= 0) list[i] = row;
      else list.push(row);
      return { ...s, [slug]: list } as ClientSnapshot;
    });
  }, []);
  const removeRow = useCallback((slug: EntitySlug, id: string) => {
    setSnap((s) => ({ ...s, [slug]: (s[slug] as unknown as AnyRow[]).filter((r) => r.id !== id) }) as ClientSnapshot);
  }, []);

  const ctx: Ctx = { snap, setSnap, upsertRow, removeRow, track, expired, dashboard, props, go };

  if (printing) {
    return <RatPrint snap={snap} props={props} onClose={() => setPrinting(false)} />;
  }

  const current = VIEWS.find((v) => v.id === view)!;
  return (
    <div className="ro-area">
      <aside className="ro-index" aria-label="Módulos del espacio de trabajo">
        <p className="ed-eyebrow">Tu espacio</p>
        <nav>
          <ol>
            {VIEWS.map((v, i) => {
              const mod = dashboard.modules.find((m) => m.id === v.id);
              return (
                <li key={v.id}>
                  <button type="button" aria-current={view === v.id ? "page" : undefined} onClick={() => go(v.id)}>
                    <span className="ed-eyebrow">{String(i).padStart(2, "0")}</span>
                    <span>{v.label}</span>
                    {mod ? <span className={`ro-chip ro-chip-${mod.maturity}`}>{Math.round(mod.completion * 100)}%</span> : <span />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <dl className="ro-meta">
          <dt>Versión</dt>
          <dd>{props.productName} v{props.productVersion}</dd>
          <dt>Base normativa revisada</dt>
          <dd>{props.normativeVerifiedAt}</dd>
          <dt>Acceso hasta</dt>
          <dd>{props.accessUntil}</dd>
        </dl>
        <form method="post" action="/api/rgpd-ops/logout">
          <button type="submit" className="ro-link-button">Cerrar sesión en este navegador</button>
        </form>
      </aside>

      <section className="ro-main" aria-labelledby="ro-view-title">
        <div className="ro-statusbar">
          <h2 id="ro-view-title" ref={headingRef} tabIndex={-1}>
            {current.label}
          </h2>
          <p className={`ro-save ro-save-${saveState}`} role="status" aria-live="polite">
            {saveState === "saving" ? "Guardando…" : saveState === "saved" ? "Guardado" : saveState === "error" ? `Error · ${saveMsg}` : "Los cambios se guardan solos"}
          </p>
        </div>

        {expired && (
          <div className="ro-banner ro-banner-alto" role="alert">
            <p>
              Tu sesión ha caducado o el acceso ya no está activo. Lo que se guardó sigue en el servidor.{" "}
              <a href="/es/cumplimiento/rgpd/ops/acceso/">Pide un enlace nuevo</a> para seguir.
            </p>
          </div>
        )}

        {view === "panel" && <PanelView ctx={ctx} />}
        {view === "perfil" && <ProfileView ctx={ctx} />}
        {view === "tratamientos" && <EntityModule ctx={ctx} slug="tratamientos" guideId="tratamientos" quick={props.quickAdd.tratamientos} />}
        {view === "proveedores" && <EntityModule ctx={ctx} slug="proveedores" guideId="proveedores" quick={props.quickAdd.proveedores} />}
        {view === "captacion" && <EntityModule ctx={ctx} slug="captacion" guideId="captacion" quick={props.quickAdd.captacion} />}
        {view === "solicitudes" && <EntityModule ctx={ctx} slug="solicitudes" guideId="solicitudes" />}
        {view === "incidentes" && <EntityModule ctx={ctx} slug="incidentes" guideId="incidentes" />}
        {view === "plan" && <PlanView ctx={ctx} />}
        {view === "exportaciones" && <ExportView ctx={ctx} onPrint={() => setPrinting(true)} />}

        <p className="ro-disclaimer">{props.disclaimer}</p>
      </section>
    </div>
  );
}

interface Ctx {
  snap: ClientSnapshot;
  setSnap: (fn: (s: ClientSnapshot) => ClientSnapshot) => void;
  upsertRow: (slug: EntitySlug, row: AnyRow) => void;
  removeRow: (slug: EntitySlug, id: string) => void;
  track: <T>(fn: () => Promise<T>, onResult: (r: T) => "ok" | "error" | "conflict" | "expired") => Promise<T>;
  expired: boolean;
  dashboard: Dashboard;
  props: Props;
  go: (v: View) => void;
}

function outcomeOf(r: ApiResult): "ok" | "error" | "conflict" | "expired" {
  if (r.status === 401) return "expired";
  if (r.status === 409) return "conflict";
  return r.status >= 200 && r.status < 300 ? "ok" : "error";
}

// ---------------------------------------------------------------- guía

function Guide({ ctx, id }: { ctx: Ctx; id: string }) {
  const g = ctx.props.guides.find((x) => x.id === id);
  if (!g) return null;
  return (
    <div className="ro-guide">
      <p className="ro-objetivo">{g.objetivo}</p>
      <details>
        <summary>Cómo trabajar este módulo</summary>
        <ol>
          {g.pasos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        {g.avisos.map((a) => (
          <p key={a} className="ro-aviso">
            {a}
          </p>
        ))}
        {g.fuentes.length > 0 && (
          <p className="ro-sources">
            Fuentes:{" "}
            {g.fuentes.map((f, i) => (
              <span key={f.url}>
                {i > 0 && " · "}
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  {f.titulo}
                </a>
              </span>
            ))}
          </p>
        )}
      </details>
    </div>
  );
}

// ---------------------------------------------------------------- panel

function PanelView({ ctx }: { ctx: Ctx }) {
  const d = ctx.dashboard;
  return (
    <div className="ro-panel">
      <div className="ro-progress">
        <div className="ro-progress-head">
          <span className="ed-eyebrow">Progreso general</span>
          <strong className="pg-tabular">{d.progress}%</strong>
        </div>
        <div className="ro-bar" role="img" aria-label={`Progreso general: ${d.progress} %`}>
          <span style={{ width: `${Math.max(2, d.progress)}%` }} />
        </div>
        <p className="ro-note">Mide lo documentado y al día en tu espacio. No es una medida de cumplimiento.</p>
      </div>

      {d.alerts.length > 0 && (
        <section className="ro-block" aria-labelledby="ro-alerts">
          <h3 id="ro-alerts">Alertas</h3>
          <ul className="ro-alerts">
            {d.alerts.map((a, i) => (
              <li key={`${a.module}-${i}`} className={`ro-alert ro-alert-${a.level}`}>
                <span className="ed-eyebrow">{a.level === "alto" ? "Prioridad alta" : "Revisar"}</span>
                <span>{a.text}</span>
                <button type="button" className="ro-link-button" onClick={() => ctx.go(a.module)}>
                  Ir al módulo
                </button>
              </li>
            ))}
          </ul>
          {d.professionalReview.recommended && (
            <div className="ro-review">
              <p>
                <strong>Revisión profesional recomendada.</strong> {d.professionalReview.motivos.join(" ")}
              </p>
              <a className="ed-underlined" href={ctx.props.revisionHref} onClick={() => pushRgpdOpsEvent("review_cta_clicked", { module_id: "panel" })}>
                Solicitar revisión especializada <span className="ed-arrow" aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </section>
      )}

      <section className="ro-block" aria-labelledby="ro-areas">
        <h3 id="ro-areas">Madurez por área</h3>
        <ul className="ro-modules">
          {d.modules.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => ctx.go(m.id)}>
                <span className="ro-module-name">{m.label}</span>
                <span className={`ro-chip ro-chip-${m.maturity}`}>{MATURITY_LABEL[m.maturity]}</span>
                <span className="ro-module-sum">{m.resumen}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="ro-grid-2">
        <section className="ro-block" aria-labelledby="ro-overdue">
          <h3 id="ro-overdue">Tareas vencidas ({d.tasks.overdue.length})</h3>
          <TaskMiniList tasks={d.tasks.overdue} empty="Ninguna tarea vencida." />
        </section>
        <section className="ro-block" aria-labelledby="ro-upcoming">
          <h3 id="ro-upcoming">Próximos 14 días ({d.tasks.upcoming.length})</h3>
          <TaskMiniList tasks={d.tasks.upcoming} empty="Nada vence en los próximos 14 días." />
        </section>
      </div>

      <section className="ro-block" aria-labelledby="ro-rev">
        <h3 id="ro-rev">Revisión trimestral</h3>
        <p>
          Última revisión: <strong>{d.lastReviewAt ? formatDateEs(d.lastReviewAt) : "ninguna"}</strong>
          {d.nextReviewOn && (
            <>
              {" "}· próxima antes del <strong>{formatDateEs(d.nextReviewOn)}</strong>
            </>
          )}
          . Tareas hechas: {d.tasks.done}; abiertas: {d.tasks.open}.
        </p>
        <div className="ro-actions">
          <button type="button" className="ro-tool" onClick={() => ctx.go("plan")}>
            Ir a la revisión
          </button>
          <button type="button" className="ro-tool" onClick={() => ctx.go("exportaciones")}>
            Exportaciones
          </button>
        </div>
      </section>

      <details className="ro-block">
        <summary>Herramientas gratuitas de la AEPD</summary>
        <p className="ro-note">Son el punto de partida oficial. Este espacio organiza la ejecución continua: responsables, plazos, proveedores, revisiones y evidencias.</p>
        <ul className="ro-plain">
          {ctx.props.aepdTools.map((t) => (
            <li key={t.nombre}>
              <a href={t.url} target="_blank" rel="noopener noreferrer">
                {t.nombre}
              </a>
              : {t.uso}
            </li>
          ))}
        </ul>
      </details>

      <details className="ro-block">
        <summary>Novedades del producto</summary>
        <ul className="ro-plain">
          {ctx.props.changelog.map((c) => (
            <li key={c.version}>
              <strong>v{c.version}</strong> ({c.date}): {c.changes.join(" ")}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function TaskMiniList({ tasks, empty }: { tasks: { id: string; title: string; due_on: string | null; owner_role: string }[]; empty: string }) {
  if (!tasks.length) return <p className="ro-note">{empty}</p>;
  return (
    <ul className="ro-mini">
      {tasks.slice(0, 8).map((t) => (
        <li key={t.id}>
          <span>{t.title}</span>
          <span className="ro-note">
            {formatDateEs(t.due_on)}
            {t.owner_role ? ` · ${t.owner_role}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- campos

function FieldInput({
  id,
  def,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string;
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown, immediate?: boolean) => void;
  error?: string;
  disabled?: boolean;
}) {
  const help = "help" in def && def.help ? def.help : null;
  const describedBy = [help ? `${id}-help` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, disabled };
  let control: ReactNode = null;
  switch (def.type) {
    case "text":
      control = def.multiline ? (
        <textarea {...common} maxLength={def.max} value={String(value ?? "")} placeholder={def.placeholder} onChange={(e) => onChange(e.currentTarget.value)} />
      ) : (
        <input {...common} type="text" maxLength={def.max} value={String(value ?? "")} placeholder={def.placeholder} onChange={(e) => onChange(e.currentTarget.value)} />
      );
      break;
    case "enum":
      control = (
        <select {...common} value={String(value ?? def.options[0].value)} onChange={(e) => onChange(e.currentTarget.value, true)}>
          {def.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "date":
      control = <input {...common} type="date" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.currentTarget.value || null, true)} />;
      break;
    case "datetime":
      control = <input {...common} type="datetime-local" value={isoToLocalInput(value)} onChange={(e) => onChange(localInputToIso(e.currentTarget.value), true)} />;
      break;
    case "boolean":
      return (
        <div className="ro-field ro-field-wide">
          <label className="ro-check">
            <input {...common} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.currentTarget.checked, true)} />
            <span>{def.label}</span>
          </label>
          {help && <small id={`${id}-help`}>{help}</small>}
          {error && (
            <small id={`${id}-err`} className="ro-field-error" role="alert">
              {error}
            </small>
          )}
        </div>
      );
    case "enumArray": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset className="ro-field ro-field-wide" aria-describedby={describedBy}>
          <legend>{def.label}</legend>
          <div className="ro-checks">
            {def.options.map((o) => (
              <label key={o.value} className="ro-check">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={arr.includes(o.value)}
                  onChange={(e) => {
                    const on = e.currentTarget.checked;
                    let next = on ? [...arr, o.value] : arr.filter((x) => x !== o.value);
                    if (def.key === "senales") next = on && o.value === "ninguna" ? ["ninguna"] : next.filter((x) => (o.value === "ninguna" ? true : x !== "ninguna"));
                    onChange(next, true);
                  }}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          {help && <small id={`${id}-help`}>{help}</small>}
          {error && (
            <small id={`${id}-err`} className="ro-field-error" role="alert">
              {error}
            </small>
          )}
        </fieldset>
      );
    }
    case "checklist":
      return null;
  }
  const wide = def.type === "text" && def.multiline;
  return (
    <div className={`ro-field ${wide ? "ro-field-wide" : ""}`}>
      <label htmlFor={id}>{def.label}</label>
      {control}
      {help && <small id={`${id}-help`}>{help}</small>}
      {error && (
        <small id={`${id}-err`} className="ro-field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- editor de un registro (autosave)

function useAutosave(opts: {
  ctx: Ctx;
  row: AnyRow;
  together?: string[][];
  save: (version: number, values: Record<string, unknown>) => Promise<ApiResult>;
  onSaved: (row: AnyRow) => void;
  /** Convierte la respuesta del servidor en la forma del borrador (perfil). */
  toRow?: (raw: AnyRow) => AnyRow;
}) {
  const { row } = opts;
  const [draft, setDraft] = useState<AnyRow>(row);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState<AnyRow | null>(null);
  const draftRef = useRef(draft);
  const dirty = useRef(new Set<string>());
  const timer = useRef<number | undefined>(undefined);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const conflictRaw = useRef<AnyRow | null>(null);

  // Si la fila cambia desde fuera (refresco) y no hay cambios locales, se adopta.
  useEffect(() => {
    if (dirty.current.size === 0) {
      setDraft(row);
      draftRef.current = row;
    }
  }, [row.version, row.id]);

  const flush = useCallback(async (versionOverride?: number): Promise<AnyRow | null> => {
    window.clearTimeout(timer.current);
    const keys = [...dirty.current];
    if (!keys.length) return null;
    let result: AnyRow | null = null;
    const values = Object.fromEntries(keys.map((k) => [k, draftRef.current[k]]));
    dirty.current.clear();
    const o = optsRef.current;
    const version = versionOverride ?? o.row.version;
    await o.ctx.track(
      () => o.save(version, values),
      (r) => {
        const out = outcomeOf(r);
        if (out === "ok") {
          const raw = (r.data?.row ?? r.data?.workspace) as AnyRow;
          const saved = o.toRow ? o.toRow(raw) : raw;
          result = saved;
          setErrors({});
          setConflict(null);
          o.onSaved(raw);
          // Cambios hechos mientras se guardaba: se conservan sobre la fila nueva.
          const merged = { ...saved } as AnyRow;
          for (const k of dirty.current) merged[k] = draftRef.current[k];
          draftRef.current = merged;
          setDraft(merged);
        } else {
          for (const k of keys) dirty.current.add(k);
          if (out === "conflict") {
            const cur = (r.data?.current as AnyRow) ?? null;
            conflictRaw.current = cur;
            setConflict(cur && o.toRow ? o.toRow(cur) : cur);
          }
          else if (out === "error") setErrors(r.status === 0 ? { _: "Sin conexión. Se reintentará con tu próximo cambio." } : issuesToMap(r.data));
        }
        return out;
      },
    );
    return result;
  }, []);

  const change = useCallback(
    (key: string, value: unknown, immediate = false) => {
      const next = { ...draftRef.current, [key]: value } as AnyRow;
      draftRef.current = next;
      setDraft(next);
      dirty.current.add(key);
      for (const group of optsRef.current.together ?? []) if (group.includes(key)) group.forEach((k) => dirty.current.add(k));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), immediate ? 250 : 900);
    },
    [flush],
  );

  const keepMine = useCallback(() => {
    if (!conflict) return;
    void flush(conflict.version);
  }, [conflict, flush]);

  const takeTheirs = useCallback(() => {
    if (!conflict) return;
    dirty.current.clear();
    optsRef.current.onSaved(conflictRaw.current ?? conflict);
    draftRef.current = conflict;
    setDraft(conflict);
    setConflict(null);
    setErrors({});
  }, [conflict]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { draft, errors, conflict, change, keepMine, takeTheirs, flush };
}

function ConflictBox({ onKeep, onTake }: { onKeep: () => void; onTake: () => void }) {
  return (
    <div className="ro-banner ro-banner-medio" role="alert">
      <p>Otro cambio se guardó antes que el tuyo (quizá en otra pestaña). ¿Qué versión quieres conservar?</p>
      <div className="ro-actions">
        <button type="button" className="ro-tool" onClick={onTake}>
          Usar la versión guardada
        </button>
        <button type="button" className="ro-tool" onClick={onKeep}>
          Sobrescribir con mis cambios
        </button>
      </div>
    </div>
  );
}

function RecordEditor({ ctx, slug, row, extra }: { ctx: Ctx; slug: EntitySlug; row: AnyRow; extra?: ReactNode }) {
  const def = ENTITIES[slug];
  const { draft, errors, conflict, change, keepMine, takeTheirs } = useAutosave({
    ctx,
    row,
    together: def.together,
    save: (version, values) => api("PATCH", `/api/rgpd-ops/entities/${slug}/${row.id}`, { version, values }),
    onSaved: (saved) => ctx.upsertRow(slug, saved),
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function remove() {
    setDeleteError(null);
    const r = await ctx.track(
      () => api("DELETE", `/api/rgpd-ops/entities/${slug}/${row.id}`, { version: row.version }),
      outcomeOf,
    );
    if (r.status === 200) ctx.removeRow(slug, row.id);
    else if (r.status === 409) setDeleteError("Este registro cambió en otra pestaña. Recarga la página antes de borrarlo.");
    else if (r.status === 404) ctx.removeRow(slug, row.id);
    else setDeleteError("No se pudo borrar.");
  }

  const fields = def.fields.filter((f) => f.type !== "checklist");
  return (
    <div className="ro-record">
      {conflict && <ConflictBox onKeep={keepMine} onTake={takeTheirs} />}
      {errors._ && (
        <p className="ro-field-error" role="alert">
          {errors._}
        </p>
      )}
      {extra}
      <div className="ro-fields">
        {fields.map((f) => (
          <FieldInput
            key={f.key}
            id={`${slug}-${row.id}-${f.key}`}
            def={f}
            value={draft[f.key]}
            error={errors[f.key]}
            disabled={ctx.expired}
            onChange={(v, immediate) => change(f.key, v, immediate)}
          />
        ))}
      </div>
      <div className="ro-record-foot">
        <span className="ro-note">
          Versión {row.version} · modificado el {formatDateTimeEs(row.updated_at as string)}
        </span>
        {confirmDelete ? (
          <span className="ro-actions">
            <button type="button" className="ro-tool ro-tool-danger" onClick={remove} disabled={ctx.expired}>
              Confirmar borrado
            </button>
            <button type="button" className="ro-tool" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" className="ro-tool" onClick={() => setConfirmDelete(true)} disabled={ctx.expired}>
            Borrar
          </button>
        )}
      </div>
      {deleteError && (
        <p className="ro-field-error" role="alert">
          {deleteError}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- perfil

function ProfileView({ ctx }: { ctx: Ctx }) {
  const ws = ctx.snap.workspace;
  const row = useMemo(() => ({ ...(ws.profile as Record<string, unknown>), id: ws.id, version: ws.version }) as AnyRow, [ws]);
  const { draft, errors, conflict, change, keepMine, takeTheirs } = useAutosave({
    ctx,
    row,
    // El perfil se reemplaza entero: se envía siempre el objeto completo.
    save: (version) => {
      const profile: Record<string, unknown> = {};
      for (const f of PROFILE_FIELDS) if (f.key in draftAll.current) profile[f.key] = draftAll.current[f.key];
      return api("PATCH", "/api/rgpd-ops/workspace", { version, profile });
    },
    onSaved: (saved) => {
      const w = saved as unknown as ClientSnapshot["workspace"];
      ctx.setSnap((s) => ({ ...s, workspace: { ...s.workspace, ...w } }));
    },
    toRow: (raw) => ({ ...((raw.profile as Record<string, unknown>) ?? {}), id: String(raw.id), version: Number(raw.version) }) as AnyRow,
  });
  const draftAll = useRef<Record<string, unknown>>(draft);
  draftAll.current = draft;

  return (
    <div>
      <Guide ctx={ctx} id="perfil" />
      {conflict && (
        <ConflictBox
          onKeep={keepMine}
          onTake={() => {
            takeTheirs();
          }}
        />
      )}
      {errors._ && (
        <p className="ro-field-error" role="alert">
          {errors._}
        </p>
      )}
      <div className="ro-fields">
        {PROFILE_FIELDS.map((f) => (
          <FieldInput
            key={f.key}
            id={`perfil-${f.key}`}
            def={f}
            value={draft[f.key]}
            error={errors[f.key]}
            disabled={ctx.expired}
            onChange={(v, immediate) => change(f.key, v, immediate)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- módulos de registros

function rowTitle(slug: EntitySlug, row: AnyRow): string {
  const v = row[ENTITIES[slug].titleKey];
  return typeof v === "string" && v ? v : "(sin título)";
}

function RowBadges({ slug, row }: { slug: EntitySlug; row: AnyRow }) {
  const today = todayMadrid();
  const f = (k: string) => ENTITIES[slug].fields.find((x) => x.key === k);
  const chips: { text: string; tone: string }[] = [];
  if (slug === "solicitudes") {
    const r = row as unknown as RightsRequestRow;
    const due = effectiveDue(r);
    const open = r.status === "recibida" || r.status === "en_curso";
    const left = daysBetween(today, due);
    chips.push({ text: optionLabel((f("status") as { options: { value: string; label: string }[] }).options, r.status), tone: open ? "medio" : "ok" });
    if (open) chips.push({ text: left < 0 ? `Fuera de plazo desde el ${formatDateEs(due)}` : `Plazo orientativo: ${formatDateEs(due)} (${left} d)`, tone: left < 0 ? "alto" : left <= 7 ? "medio" : "ok" });
  } else if (slug === "incidentes") {
    const i = row as unknown as IncidentRow;
    const h = hoursSince(i.detected_at);
    chips.push({ text: i.status === "abierto" ? "Abierto" : "Cerrado", tone: i.status === "abierto" ? "medio" : "ok" });
    if (i.status === "abierto" && i.escalation_decision === "pendiente") {
      chips.push({ text: h < 72 ? `Reloj orientativo: quedan ${Math.max(0, Math.floor(72 - h))} h` : "Más de 72 h sin decisión", tone: "alto" });
    }
  } else if (slug === "proveedores") {
    chips.push({ text: `DPA: ${optionLabel((f("dpa_status") as { options: { value: string; label: string }[] }).options, row.dpa_status)}`, tone: row.dpa_status === "pendiente" ? "medio" : "ok" });
    if (typeof row.next_review_on === "string" && row.next_review_on < today) chips.push({ text: "Revisión vencida", tone: "medio" });
  } else if (slug === "captacion") {
    chips.push({ text: `Aviso: ${optionLabel((f("notice_status") as { options: { value: string; label: string }[] }).options, row.notice_status)}`, tone: row.notice_status === "completo" || row.notice_status === "no_aplica" ? "ok" : "medio" });
  } else if (slug === "tratamientos") {
    chips.push({ text: optionLabel((f("status") as { options: { value: string; label: string }[] }).options, row.status), tone: row.status === "revisado" ? "ok" : "medio" });
  } else if (slug === "tareas") {
    const open = row.status === "pendiente" || row.status === "en_curso";
    chips.push({ text: optionLabel((f("status") as { options: { value: string; label: string }[] }).options, row.status), tone: open ? "medio" : "ok" });
    if (open && typeof row.due_on === "string") chips.push({ text: `Vence el ${formatDateEs(row.due_on)}`, tone: row.due_on < today ? "alto" : "ok" });
  } else if (slug === "evidencias") {
    if (typeof row.review_due_on === "string") chips.push({ text: `Revisar antes del ${formatDateEs(row.review_due_on)}`, tone: row.review_due_on < today ? "medio" : "ok" });
  }
  return (
    <span className="ro-badges">
      {chips.map((c) => (
        <span key={c.text} className={`ro-badge ro-badge-${c.tone}`}>
          {c.text}
        </span>
      ))}
    </span>
  );
}

const NEW_FORM_FIELDS: Record<EntitySlug, string[]> = {
  tratamientos: ["name"],
  proveedores: ["name", "service_category"],
  captacion: ["name", "kind"],
  solicitudes: ["reference", "request_type", "received_on"],
  incidentes: ["reference", "detected_at"],
  tareas: ["title", "area", "due_on"],
  evidencias: ["title", "area", "location_ref"],
  revisiones: ["period"],
};

function defaultsFor(slug: EntitySlug): Record<string, unknown> {
  const today = todayMadrid();
  const n = Date.now().toString(36).slice(-4).toUpperCase();
  switch (slug) {
    case "solicitudes":
      return { reference: `SOL-${today.slice(0, 4)}-${n}`, request_type: "acceso", received_on: today };
    case "incidentes":
      return { reference: `INC-${today.slice(0, 4)}-${n}`, detected_at: new Date().toISOString() };
    case "tareas":
      return { title: "", area: "general", due_on: null };
    case "evidencias":
      return { title: "", area: "general", location_ref: "" };
    case "proveedores":
      return { name: "", service_category: "otro" };
    case "captacion":
      return { name: "", kind: "otro" };
    default:
      return { name: "" };
  }
}

function NewRecordForm({ ctx, slug, onCreated }: { ctx: Ctx; slug: EntitySlug; onCreated: (id: string) => void }) {
  const def = ENTITIES[slug];
  const [values, setValues] = useState<Record<string, unknown>>(() => defaultsFor(slug));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fields = NEW_FORM_FIELDS[slug].map((k) => def.fields.find((f) => f.key === k)!).filter(Boolean);

  async function create() {
    setBusy(true);
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== null && v !== ""));
    const r = await ctx.track(() => api("POST", `/api/rgpd-ops/entities/${slug}`, { values: clean }), outcomeOf);
    setBusy(false);
    if (r.status === 201 && r.data?.row) {
      const row = r.data.row as AnyRow;
      ctx.upsertRow(slug, row);
      setValues(defaultsFor(slug));
      setErrors({});
      onCreated(row.id);
    } else setErrors(r.status === 0 ? { _: "Sin conexión." } : issuesToMap(r.data));
  }

  return (
    <div className="ro-new">
      <p className="ed-eyebrow">Nuevo {def.singular}</p>
      <div className="ro-fields">
        {fields.map((f) => (
          <FieldInput key={f.key} id={`new-${slug}-${f.key}`} def={f} value={values[f.key]} error={errors[f.key]} disabled={ctx.expired} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
        ))}
      </div>
      {errors._ && (
        <p className="ro-field-error" role="alert">
          {errors._}
        </p>
      )}
      <button type="button" className="ed-button" onClick={create} disabled={busy || ctx.expired} aria-busy={busy}>
        {busy ? "Creando…" : `Añadir ${def.singular}`}
        <span className="ed-arrow" aria-hidden="true">+</span>
      </button>
    </div>
  );
}

function RecordList({ ctx, slug, rows, extra }: { ctx: Ctx; slug: EntitySlug; rows: AnyRow[]; extra?: (row: AnyRow) => ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!rows.length) return <p className="ro-empty">Todavía no hay registros. Empieza con el formulario de arriba.</p>;
  return (
    <ul className="ro-records">
      {rows.map((row) => (
        <li key={row.id}>
          <details open={open === row.id} onToggle={(e) => (e.currentTarget.open ? setOpen(row.id) : open === row.id && setOpen(null))}>
            <summary>
              <span className="ro-record-title">{rowTitle(slug, row)}</span>
              <RowBadges slug={slug} row={row} />
            </summary>
            {open === row.id && <RecordEditor ctx={ctx} slug={slug} row={row} extra={extra?.(row)} />}
          </details>
        </li>
      ))}
    </ul>
  );
}

function EntityModule({ ctx, slug, guideId, quick }: { ctx: Ctx; slug: EntitySlug; guideId: string; quick?: readonly QuickTemplate[] }) {
  const rows = ctx.snap[slug] as unknown as AnyRow[];
  const [creatingQuick, setCreatingQuick] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);

  async function addQuick(t: QuickTemplate) {
    setCreatingQuick(t.name);
    setQuickError(null);
    const r = await ctx.track(() => api("POST", `/api/rgpd-ops/entities/${slug}`, { values: t }), outcomeOf);
    setCreatingQuick(null);
    if (r.status === 201 && r.data?.row) ctx.upsertRow(slug, r.data.row as AnyRow);
    else setQuickError(typeof r.data?.error === "string" ? r.data.error : "No se pudo añadir.");
  }

  const existing = new Set(rows.map((r) => rowTitle(slug, r)));
  return (
    <div>
      <Guide ctx={ctx} id={guideId} />
      {slug === "solicitudes" && (
        <p className="ro-aviso">
          Solo referencias internas y fechas. La petición, la verificación de identidad y la respuesta se conservan en
          vuestro sistema seguro, no aquí.
        </p>
      )}
      {slug === "incidentes" && (
        <p className="ro-aviso">
          El reloj de 72 horas es orientativo y cuenta desde la constancia. La decisión de notificar es de la empresa: esta
          herramienta no la toma ni envía nada a la AEPD.
        </p>
      )}
      {quick && quick.length > 0 && (
        <div className="ro-quick">
          <p className="ed-eyebrow">Alta rápida</p>
          <div className="ro-actions">
            {quick
              .filter((t) => !existing.has(t.name))
              .map((t) => (
                <button key={t.name} type="button" className="ro-tool" onClick={() => addQuick(t)} disabled={Boolean(creatingQuick) || ctx.expired}>
                  + {t.name}
                </button>
              ))}
          </div>
          {quickError && (
            <p className="ro-field-error" role="alert">
              {quickError}
            </p>
          )}
        </div>
      )}
      <NewRecordForm ctx={ctx} slug={slug} onCreated={() => undefined} />
      <h3 className="ro-h3">
        {ENTITIES[slug].label} ({rows.length})
      </h3>
      <RecordList ctx={ctx} slug={slug} rows={rows} />
    </div>
  );
}

// ---------------------------------------------------------------- plan, evidencias, revisiones

function PlanView({ ctx }: { ctx: Ctx }) {
  const [filter, setFilter] = useState<"abiertas" | "todas">("abiertas");
  const tasks = (ctx.snap.tareas as unknown as AnyRow[]).filter((t) => filter === "todas" || t.status === "pendiente" || t.status === "en_curso");
  const sorted = [...tasks].sort((a, b) => String(a.due_on ?? "9999").localeCompare(String(b.due_on ?? "9999")));
  return (
    <div>
      <Guide ctx={ctx} id="plan" />
      <section aria-labelledby="ro-tasks">
        <h3 id="ro-tasks" className="ro-h3">
          Tareas
        </h3>
        <div className="ro-actions" role="group" aria-label="Filtro de tareas">
          <button type="button" className={`ro-tool ${filter === "abiertas" ? "is-on" : ""}`} aria-pressed={filter === "abiertas"} onClick={() => setFilter("abiertas")}>
            Abiertas
          </button>
          <button type="button" className={`ro-tool ${filter === "todas" ? "is-on" : ""}`} aria-pressed={filter === "todas"} onClick={() => setFilter("todas")}>
            Todas
          </button>
        </div>
        <NewRecordForm ctx={ctx} slug="tareas" onCreated={() => undefined} />
        <RecordList ctx={ctx} slug="tareas" rows={sorted} />
      </section>

      <section aria-labelledby="ro-evid">
        <h3 id="ro-evid" className="ro-h3">
          Evidencias ({ctx.snap.evidencias.length})
        </h3>
        <p className="ro-note">Solo la referencia de dónde está cada documento. No se suben archivos.</p>
        <NewRecordForm ctx={ctx} slug="evidencias" onCreated={() => undefined} />
        <RecordList ctx={ctx} slug="evidencias" rows={ctx.snap.evidencias as unknown as AnyRow[]} />
      </section>

      <ReviewSection ctx={ctx} />

      <section aria-labelledby="ro-audit">
        <h3 id="ro-audit" className="ro-h3">
          Historial de cambios
        </h3>
        <p className="ro-note">Registro de solo inserción: qué se hizo, cuándo y en qué módulo. Nunca guarda los valores.</p>
        <ul className="ro-mini">
          {ctx.snap.auditoria.slice(0, 30).map((a) => (
            <li key={a.id}>
              <span>
                {AUDIT_LABEL[a.action] ?? a.action}
                {a.entity ? ` · ${ENTITIES[a.entity as EntitySlug]?.label ?? a.entity}` : ""}
                {a.fields.length ? ` · ${a.fields.length} campo(s)` : ""}
                {a.detail ? ` · ${a.detail}` : ""}
              </span>
              <span className="ro-note">{formatDateTimeEs(a.occurred_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReviewSection({ ctx }: { ctx: Ctx }) {
  const reviews = ctx.snap.revisiones as ReviewRow[];
  const period = quarterOf(todayMadrid());
  const currentOpen = reviews.find((r) => r.status === "en_curso");
  const thisQuarter = reviews.find((r) => r.period === period);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    const r = await ctx.track(() => api("POST", "/api/rgpd-ops/entities/revisiones", { values: { period } }), outcomeOf);
    if (r.status === 201 && r.data?.row) ctx.upsertRow("revisiones", r.data.row as AnyRow);
    else setError(typeof r.data?.error === "string" ? r.data.error : "No se pudo iniciar la revisión.");
  }

  return (
    <section aria-labelledby="ro-reviews">
      <h3 id="ro-reviews" className="ro-h3">
        Revisión trimestral
      </h3>
      {currentOpen ? (
        <ReviewEditor key={currentOpen.id} ctx={ctx} review={currentOpen} />
      ) : thisQuarter ? (
        <p className="ro-note">La revisión de {period} está completada. La próxima, el trimestre que viene.</p>
      ) : (
        <div className="ro-actions">
          <button type="button" className="ed-button" onClick={start} disabled={ctx.expired}>
            Iniciar la revisión de {period}
            <span className="ed-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      )}
      {error && (
        <p className="ro-field-error" role="alert">
          {error}
        </p>
      )}
      {reviews.filter((r) => r.status === "completada").length > 0 && (
        <ul className="ro-mini">
          {reviews
            .filter((r) => r.status === "completada")
            .map((r) => (
              <li key={r.id}>
                <span>
                  {r.period} · {Object.values(r.checklist ?? {}).filter(Boolean).length} de {REVIEW_KEYS.length} comprobaciones
                </span>
                <span className="ro-note">Completada el {formatDateEs(r.completed_at)}</span>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

function ReviewEditor({ ctx, review }: { ctx: Ctx; review: ReviewRow }) {
  const row = review as unknown as AnyRow;
  const { draft, errors, conflict, change, keepMine, takeTheirs, flush } = useAutosave({
    ctx,
    row,
    save: (version, values) => api("PATCH", `/api/rgpd-ops/entities/revisiones/${review.id}`, { version, values }),
    onSaved: (saved) => ctx.upsertRow("revisiones", saved),
  });
  const checklist = (draft.checklist as Record<string, boolean>) ?? {};
  const [completing, setCompleting] = useState(false);

  async function complete() {
    setCompleting(true);
    const saved = await flush();
    const version = saved?.version ?? review.version;
    const r = await ctx.track(
      () => api("PATCH", `/api/rgpd-ops/entities/revisiones/${review.id}`, { version, values: { status: "completada", checklist } }),
      outcomeOf,
    );
    setCompleting(false);
    if (r.status === 200 && r.data?.row) {
      ctx.upsertRow("revisiones", r.data.row as AnyRow);
      pushRgpdOpsEvent("rgpd_ops_review_completed");
    }
  }

  return (
    <div className="ro-record">
      {conflict && <ConflictBox onKeep={keepMine} onTake={takeTheirs} />}
      <p className="ro-note">Trimestre {review.period}. Marca lo que hayas comprobado y anota las conclusiones.</p>
      <ul className="ro-checklist">
        {ctx.props.reviewChecklist.map((item) => (
          <li key={item.key}>
            <label className="ro-check">
              <input
                type="checkbox"
                checked={Boolean(checklist[item.key])}
                disabled={ctx.expired}
                onChange={(e) => change("checklist", { ...checklist, [item.key]: e.currentTarget.checked }, true)}
              />
              <span>{item.texto}</span>
            </label>
          </li>
        ))}
      </ul>
      <FieldInput
        id={`rev-${review.id}-summary`}
        def={ENTITIES.revisiones.fields.find((f) => f.key === "summary")!}
        value={draft.summary}
        error={errors.summary}
        disabled={ctx.expired}
        onChange={(v) => change("summary", v)}
      />
      <div className="ro-actions" style={{ marginTop: 16 }}>
        <button type="button" className="ed-button" onClick={complete} disabled={completing || ctx.expired}>
          {completing ? "Guardando…" : "Completar la revisión"}
          <span className="ed-arrow" aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- exportaciones e impresión

const CSV_LINKS: { tipo: string; label: string }[] = [
  { tipo: "rat", label: "Borrador de RAT" },
  { tipo: "tratamientos", label: "Mapa de tratamientos" },
  { tipo: "proveedores", label: "Proveedores" },
  { tipo: "captacion", label: "Puntos de captación" },
  { tipo: "solicitudes", label: "Solicitudes de derechos" },
  { tipo: "incidentes", label: "Incidentes" },
  { tipo: "tareas", label: "Tareas" },
  { tipo: "evidencias", label: "Evidencias" },
  { tipo: "auditoria", label: "Historial" },
];

function ExportView({ ctx, onPrint }: { ctx: Ctx; onPrint: () => void }) {
  return (
    <div>
      <Guide ctx={ctx} id="exportaciones" />
      <section className="ro-block" aria-labelledby="ro-json">
        <h3 id="ro-json">Copia de seguridad completa</h3>
        <p className="ro-note">JSON versionado con todo tu espacio. Guárdalo junto a tu documentación.</p>
        <a className="ed-button" href="/api/rgpd-ops/export?formato=json" onClick={() => pushRgpdOpsEvent("rgpd_ops_exported", { export_format: "json", export_type: "backup" })}>
          Descargar copia JSON<span className="ed-arrow" aria-hidden="true">↓</span>
        </a>
      </section>
      <section className="ro-block" aria-labelledby="ro-csv">
        <h3 id="ro-csv">CSV por módulo</h3>
        <ul className="ro-downloads">
          {CSV_LINKS.map((l) => (
            <li key={l.tipo}>
              <a href={`/api/rgpd-ops/export?formato=csv&tipo=${l.tipo}`} onClick={() => pushRgpdOpsEvent("rgpd_ops_exported", { export_format: "csv", export_type: l.tipo })}>
                {l.label} (CSV)
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="ro-block" aria-labelledby="ro-print">
        <h3 id="ro-print">Borrador de RAT imprimible</h3>
        <p className="ro-note">Se abre una vista limpia para imprimir o guardar en PDF desde el navegador.</p>
        <button
          type="button"
          className="ro-tool"
          onClick={() => {
            pushRgpdOpsEvent("rgpd_ops_exported", { export_format: "pdf", export_type: "rat" });
            onPrint();
          }}
        >
          Abrir vista imprimible
        </button>
      </section>
    </div>
  );
}

function RatPrint({ snap, props, onClose }: { snap: ClientSnapshot; props: Props; onClose: () => void }) {
  const rows = ratRows(snap);
  useEffect(() => {
    document.body.setAttribute("data-ro-print", "");
    return () => document.body.removeAttribute("data-ro-print");
  }, []);
  const labels: [string, string][] = [
    ["responsable", "Responsable"],
    ["purpose", "Fines"],
    ["data_subjects", "Interesados"],
    ["data_categories", "Categorías de datos"],
    ["recipients", "Destinatarios"],
    ["transfers", "Transferencias internacionales"],
    ["retention", "Plazos de supresión"],
    ["security_measures", "Medidas de seguridad"],
    ["legal_basis", "Base jurídica (campo de trabajo, a validar)"],
    ["status", "Estado"],
  ];
  return (
    <div className="ro-print">
      <div className="ro-actions ro-no-print">
        <button type="button" className="ed-button" onClick={() => window.print()}>
          Imprimir o guardar en PDF<span className="ed-arrow" aria-hidden="true">↓</span>
        </button>
        <button type="button" className="ro-tool" onClick={onClose}>
          Volver al espacio
        </button>
      </div>
      <p className="ro-print-flag">BORRADOR</p>
      <h2>Registro de actividades de tratamiento</h2>
      <p className="ro-note">
        {props.productName} v{props.productVersion} · generado el {formatDateEs(new Date().toISOString())} · base normativa revisada el{" "}
        {props.normativeVerifiedAt}
      </p>
      <p className="ro-aviso">{props.borrador}</p>
      {rows.length === 0 && <p>No hay tratamientos registrados.</p>}
      {rows.map((r, i) => (
        <section key={i} className="ro-print-item">
          <h3>
            {String(i + 1).padStart(2, "0")}. {String(r.name)}
          </h3>
          <dl>
            {labels.map(([k, label]) => (
              <div key={k}>
                <dt>{label}</dt>
                <dd>{String(r[k] ?? "")}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
