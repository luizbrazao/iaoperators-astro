// Zona del comprador del Kit. Recibe el contenido como props SOLO desde la
// página protegida (SSR, prerender = false). Este archivo no importa el módulo
// de contenido: únicamente sus tipos, que desaparecen al compilar.
//
// Lo que escribe el comprador (respuestas, campos, tablas, progreso) vive solo
// en su navegador (localStorage). No se envía a ningún sitio salvo cuando pide
// una exportación CSV, que el servidor genera y no guarda.
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  KitAnswer,
  KitModule,
  KitTable,
  KitTemplate,
  KitTreeResult,
} from "@/data/verifactu-kit-content";
import { pushKitEvent } from "@/lib/verifactu-kit/analytics";

interface Props {
  modules: KitModule[];
  answerLabels: Record<KitAnswer, string>;
  changelog: { version: string; date: string; changes: string[] }[];
  productVersion: string;
  normativeVerifiedAt: string;
  accessUntil: string;
  disclaimer: string;
  auditHref: string;
}

interface ModuleState {
  done?: boolean;
  checks?: Record<string, boolean>;
  answers?: Record<string, KitAnswer>;
  fields?: Record<string, string>;
  rows?: Record<string, string>[];
  tree?: string[];
}

const STORE_PREFIX = "vfk:v1:";

function load(id: string): ModuleState {
  try {
    const raw = window.localStorage.getItem(STORE_PREFIX + id);
    return raw ? (JSON.parse(raw) as ModuleState) : {};
  } catch {
    return {};
  }
}

function save(id: string, state: ModuleState) {
  try {
    window.localStorage.setItem(STORE_PREFIX + id, JSON.stringify(state));
  } catch {
    /* sin almacenamiento: el progreso dura lo que la pestaña */
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

async function downloadCsv(tipo: string, rows: Record<string, string>[]): Promise<string | null> {
  try {
    const res = await fetch("/api/verifactu-kit/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ tipo, rows }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return data?.error ?? "No se pudo generar el CSV.";
    }
    const blob = await res.blob();
    const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? `${tipo}.csv`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return null;
  } catch {
    return "Fallo de conexión al generar el CSV.";
  }
}

export default function KitWorkspace(props: Props) {
  const { modules } = props;
  const [current, setCurrent] = useState(modules[0]?.id ?? "");
  const [states, setStates] = useState<Record<string, ModuleState>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial: Record<string, ModuleState> = {};
    for (const m of modules) initial[m.id] = load(m.id);
    setStates(initial);
    const fromHash = window.location.hash.replace("#", "");
    if (modules.some((m) => m.id === fromHash)) setCurrent(fromHash);
    setHydrated(true);
    pushKitEvent("kit_accessed");
  }, [modules]);

  const update = useCallback((id: string, patch: (s: ModuleState) => ModuleState) => {
    setStates((prev) => {
      const next = patch(prev[id] ?? {});
      save(id, next);
      return { ...prev, [id]: next };
    });
  }, []);

  const go = (id: string) => {
    setCurrent(id);
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* noop */
    }
    document.getElementById("vk-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const doneCount = modules.filter((m) => states[m.id]?.done).length;
  const progress = Math.round((doneCount / Math.max(1, modules.length)) * 100);
  const mod = modules.find((m) => m.id === current) ?? modules[0];
  const idx = modules.findIndex((m) => m.id === mod.id);

  return (
    <div className="vk-area" id="vk-top">
      <aside className="vk-index" aria-label="Módulos del Kit">
        <p className="ed-eyebrow">Tu progreso</p>
        <div className="as-meter-head ed-eyebrow" style={{ marginTop: 10 }}>
          <span>
            {doneCount} de {modules.length} módulos
          </span>
          <span className="pg-tabular">{hydrated ? `${progress}%` : "—"}</span>
        </div>
        <div className="as-meter-bar as-meter-thin">
          <span style={{ width: `${Math.max(3, progress)}%` }} />
        </div>
        <ol>
          {modules.map((m) => (
            <li key={m.id} className={states[m.id]?.done ? "is-done" : ""}>
              <a
                href={`#${m.id}`}
                aria-current={m.id === mod.id ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(m.id);
                }}
              >
                <span className="ed-eyebrow">{String(m.numero).padStart(2, "0")}</span>
                <span>{m.titulo}</span>
                <span className="vk-done-mark" aria-label={states[m.id]?.done ? "Completado" : "Pendiente"} />
              </a>
            </li>
          ))}
        </ol>
        <dl className="vk-meta">
          <dt>Versión del Kit</dt>
          <dd>{props.productVersion}</dd>
          <dt>Base normativa revisada</dt>
          <dd>{props.normativeVerifiedAt}</dd>
          <dt>Acceso y actualizaciones hasta</dt>
          <dd>{props.accessUntil}</dd>
        </dl>
        <details className="vk-meta">
          <summary>Historial de versiones</summary>
          <ul className="vk-changelog">
            {props.changelog.map((c) => (
              <li key={c.version}>
                <strong>
                  v{c.version} · {c.date}
                </strong>
                <ul>
                  {c.changes.map((ch) => (
                    <li key={ch}>{ch}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
        <form method="post" action="/api/verifactu-kit/logout">
          <button type="submit" className="vk-logout">
            Cerrar sesión en este navegador
          </button>
        </form>
      </aside>

      <ModuleView
        key={mod.id}
        module={mod}
        state={states[mod.id] ?? {}}
        answerLabels={props.answerLabels}
        auditHref={props.auditHref}
        onChange={(patch) => update(mod.id, patch)}
        onToggleDone={() => {
          const willBeDone = !states[mod.id]?.done;
          update(mod.id, (s) => ({ ...s, done: willBeDone }));
          if (willBeDone) pushKitEvent("kit_module_completed", { module_id: mod.id });
        }}
        prev={idx > 0 ? modules[idx - 1] : null}
        next={idx < modules.length - 1 ? modules[idx + 1] : null}
        go={go}
        disclaimer={props.disclaimer}
      />
    </div>
  );
}

interface ModuleViewProps {
  module: KitModule;
  state: ModuleState;
  answerLabels: Record<KitAnswer, string>;
  auditHref: string;
  onChange: (patch: (s: ModuleState) => ModuleState) => void;
  onToggleDone: () => void;
  prev: KitModule | null;
  next: KitModule | null;
  go: (id: string) => void;
  disclaimer: string;
}

function ModuleView({ module: m, state, answerLabels, auditHref, onChange, onToggleDone, prev, next, go, disclaimer }: ModuleViewProps) {
  const [csvError, setCsvError] = useState<string | null>(null);

  const print = () => {
    document.body.setAttribute("data-vk-print", m.id);
    const clear = () => {
      document.body.removeAttribute("data-vk-print");
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
  };

  const exportAnswers = async () => {
    setCsvError(null);
    const rows = m.checklist.map((item) => ({
      pregunta: item.texto,
      respuesta: state.answers?.[item.id] ?? "",
      nota: "",
    }));
    setCsvError(await downloadCsv("preguntas-proveedor", rows));
  };

  return (
    <article className="vk-module vk-printing" aria-labelledby={`vk-h-${m.id}`}>
      <div className="vk-module-head">
        <p className="ed-eyebrow">
          Módulo {String(m.numero).padStart(2, "0")} · v{m.version} · revisado {m.lastVerifiedAt}
        </p>
        <div className="vk-tools">
          <button type="button" className="vk-tool" onClick={print}>
            Imprimir / PDF
          </button>
          <button type="button" className={`vk-tool ${state.done ? "is-on" : ""}`} aria-pressed={Boolean(state.done)} onClick={onToggleDone}>
            {state.done ? "Completado ✓" : "Marcar como completado"}
          </button>
        </div>
      </div>
      <h2 id={`vk-h-${m.id}`}>{m.titulo}</h2>
      <p className="vk-objetivo">{m.objetivo}</p>

      {m.contenido.map((b, i) => (
        <div className="vk-block" key={i}>
          {b.h && <h3>{b.h}</h3>}
          {b.p && <p>{b.p}</p>}
          {b.list && (
            <ul>
              {b.list.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          )}
          {b.aviso && <p className="vk-aviso">{b.aviso}</p>}
        </div>
      ))}

      {m.arbol && <Tree module={m} path={state.tree ?? []} onPath={(tree) => onChange((s) => ({ ...s, tree }))} />}

      {m.campos && (
        <>
          <h3 className="vk-h3">Tus datos</h3>
          <div className="vk-fields">
            {m.campos.map((f) => {
              const value = state.fields?.[f.id] ?? "";
              const set = (v: string) => onChange((s) => ({ ...s, fields: { ...(s.fields ?? {}), [f.id]: v.slice(0, 4000) } }));
              return (
                <label key={f.id} className={`vk-field ${f.type === "textarea" ? "vk-field-wide" : ""}`}>
                  <span>{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea value={value} placeholder={f.placeholder} onChange={(e) => set(e.currentTarget.value)} />
                  ) : f.type === "select" ? (
                    <select value={value} onChange={(e) => set(e.currentTarget.value)}>
                      <option value="">Elige…</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={value} placeholder={f.placeholder} onChange={(e) => set(e.currentTarget.value)} />
                  )}
                  {f.ayuda && <small>{f.ayuda}</small>}
                </label>
              );
            })}
          </div>
        </>
      )}

      {m.tabla && <EditableTable table={m.tabla} rows={state.rows ?? []} onRows={(rows) => onChange((s) => ({ ...s, rows }))} />}

      {m.plantillas?.map((t) => <Template key={t.id} template={t} />)}

      {m.semanas && (
        <div className="vk-weeks">
          {m.semanas.map((w) => (
            <section key={w.semana} className="vk-week">
              <p className="ed-eyebrow">Semana {w.semana}</p>
              <h3>{w.titulo}</h3>
              <ul className="vk-checklist">
                {w.acciones.map((a) => (
                  <li key={a.id}>
                    <label className="vk-check">
                      <input
                        type="checkbox"
                        checked={Boolean(state.checks?.[a.id])}
                        onChange={(e) => {
                          const checked = e.currentTarget.checked;
                          onChange((s) => ({ ...s, checks: { ...(s.checks ?? {}), [a.id]: checked } }));
                        }}
                      />
                      <span>{a.texto}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {m.checklist.length > 0 && (
        <>
          <h3 className="vk-h3">{m.checklistMode === "respuesta" ? "Respuestas" : "Checklist"}</h3>
          <ul className="vk-checklist">
            {m.checklist.map((item) =>
              m.checklistMode === "respuesta" ? (
                <li key={item.id}>
                  <p className="vk-q">{item.texto}</p>
                  {item.ayuda && <p className="vk-q-help">{item.ayuda}</p>}
                  <div className="vk-answers" role="group" aria-label={item.texto}>
                    {(Object.keys(answerLabels) as KitAnswer[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={`vk-a-${a}`}
                        aria-pressed={state.answers?.[item.id] === a}
                        onClick={() =>
                          onChange((s) => {
                            const answers = { ...(s.answers ?? {}) };
                            if (answers[item.id] === a) delete answers[item.id];
                            else answers[item.id] = a;
                            return { ...s, answers };
                          })
                        }
                      >
                        {answerLabels[a]}
                      </button>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={item.id}>
                  <label className="vk-check">
                    <input
                      type="checkbox"
                      checked={Boolean(state.checks?.[item.id])}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        onChange((s) => ({ ...s, checks: { ...(s.checks ?? {}), [item.id]: checked } }));
                      }}
                    />
                    <span>
                      {item.texto}
                      {item.ayuda && <span className="vk-q-help"> {item.ayuda}</span>}
                    </span>
                  </label>
                </li>
              ),
            )}
          </ul>
          {m.id === "proveedor" && (
            <div className="vk-table-actions">
              <button type="button" className="vk-tool" onClick={exportAnswers}>
                Descargar respuestas (CSV)
              </button>
              <a className="vk-tool" href="/api/verifactu-kit/export?tipo=preguntas-proveedor">
                Plantilla en CSV
              </a>
            </div>
          )}
          {csvError && <p className="vk-error">{csvError}</p>}
        </>
      )}

      {m.id === "integracion" && (
        <div className="vk-offer-free vk-no-print">
          <p className="ed-eyebrow">Si has marcado «Sí» en dos o más</p>
          <p className="vk-offer-title">Tu caso pide una auditoría técnica del sistema</p>
          <p>Tres a cinco días. Sale con el alcance cerrado y la modalidad recomendada desde el punto de vista técnico.</p>
          <div className="vk-offer-actions">
            <a className="ed-button" href={auditHref} onClick={() => pushKitEvent("audit_cta_clicked", { module_id: m.id })}>
              Solicitar auditoría<span className="ed-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      )}

      <div className="vk-sources">
        <p className="ed-eyebrow">Fuentes oficiales</p>
        <ul>
          {m.fuentes.map((f) => (
            <li key={f.url}>
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {f.titulo}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="vk-disclaimer">{disclaimer}</p>

      <nav className="vk-module-foot" aria-label="Navegación entre módulos">
        {prev ? (
          <button type="button" className="vk-tool" onClick={() => go(prev.id)}>
            ← {prev.titulo}
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button type="button" className="vk-tool" onClick={() => go(next.id)}>
            {next.titulo} →
          </button>
        )}
      </nav>
    </article>
  );
}

function Tree({ module: m, path, onPath }: { module: KitModule; path: string[]; onPath: (p: string[]) => void }) {
  const arbol = m.arbol!;
  // El camino guarda ids de nodo y, al final, "r:<resultado>".
  const last = path[path.length - 1];
  const result: KitTreeResult | undefined = last?.startsWith("r:")
    ? arbol.resultados.find((r) => r.id === last.slice(2))
    : undefined;
  const nodeId = result ? null : last ?? arbol.inicio;
  const node = nodeId ? arbol.nodos.find((n) => n.id === nodeId) : undefined;

  return (
    <div className="vk-tree" aria-live="polite">
      {node && (
        <>
          <p className="ed-eyebrow">Árbol de decisión · paso {path.length + 1}</p>
          <p className="vk-tree-q" style={{ marginTop: 10 }}>
            {node.pregunta}
          </p>
          {node.ayuda && <p className="vk-tree-help">{node.ayuda}</p>}
          <div className="vk-tree-options">
            {node.opciones.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => onPath([...path, o.next ?? `r:${o.result}`])}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
      {result && (
        <div className={`vk-tree-result vk-tone-${result.tono}`}>
          <p className="ed-eyebrow">
            {result.tono === "dentro" ? "Te aplica" : result.tono === "fuera" ? "Fuera del ámbito, con matices" : "Por confirmar"}
          </p>
          <h4>{result.titulo}</h4>
          <p>{result.texto}</p>
          <ul>
            {result.siguiente.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {path.length > 0 && (
        <p className="vk-tree-path">
          <button type="button" className="vk-tool vk-no-print" onClick={() => onPath(path.slice(0, -1))}>
            ← Paso anterior
          </button>{" "}
          <button type="button" className="vk-tool vk-no-print" onClick={() => onPath([])}>
            Empezar de nuevo
          </button>
        </p>
      )}
    </div>
  );
}

function EditableTable({ table, rows, onRows }: { table: KitTable; rows: Record<string, string>[]; onRows: (r: Record<string, string>[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const shown = useMemo(() => (rows.length ? rows : [{}]), [rows]);
  const setCell = (i: number, key: string, value: string) => {
    const next = shown.map((r, j) => (j === i ? { ...r, [key]: value.slice(0, 2000) } : r));
    onRows(next);
  };
  return (
    <>
      <h3 className="vk-h3">{table.titulo}</h3>
      <p className="vk-q-help">{table.ayuda}</p>
      <div className="vk-table-wrap">
        <table className="vk-table">
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
              <th className="vk-row-actions" aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i}>
                {table.columns.map((c) => (
                  <td key={c.key}>
                    {c.type === "select" ? (
                      <select aria-label={`${c.label}, fila ${i + 1}`} value={row[c.key] ?? ""} onChange={(e) => setCell(i, c.key, e.currentTarget.value)}>
                        <option value="">—</option>
                        {(c.options ?? []).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        aria-label={`${c.label}, fila ${i + 1}`}
                        type="text"
                        value={row[c.key] ?? ""}
                        placeholder={i === 0 ? table.ejemplo[c.key] : undefined}
                        onChange={(e) => setCell(i, c.key, e.currentTarget.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="vk-row-actions">
                  <button type="button" className="vk-row-del" aria-label={`Borrar fila ${i + 1}`} onClick={() => onRows(shown.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="vk-table-actions">
        <button type="button" className="vk-tool" disabled={shown.length >= table.maxRows} onClick={() => onRows([...shown, {}])}>
          + Añadir fila
        </button>
        <button
          type="button"
          className="vk-tool"
          onClick={async () => {
            setError(null);
            setError(await downloadCsv(table.exportType, shown.filter((r) => Object.values(r).some((v) => v && v.trim()))));
          }}
        >
          Descargar CSV
        </button>
        <a className="vk-tool" href={`/api/verifactu-kit/export?tipo=${table.exportType}`}>
          Plantilla vacía (CSV)
        </a>
      </div>
      {error && <p className="vk-error">{error}</p>}
    </>
  );
}

function Template({ template: t }: { template: KitTemplate }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="vk-template">
      <div className="vk-template-head">
        <h3>{t.titulo}</h3>
        <button
          type="button"
          className={`vk-tool ${copied ? "is-on" : ""}`}
          onClick={async () => {
            const ok = await copyText(`Asunto: ${t.asunto}\n\n${t.cuerpo}`);
            setCopied(ok);
            if (ok) {
              pushKitEvent("kit_template_copied", { template_id: t.id });
              window.setTimeout(() => setCopied(false), 2500);
            }
          }}
        >
          {copied ? "Copiado ✓" : "Copiar plantilla"}
        </button>
      </div>
      <p className="vk-template-subject">
        <strong>Asunto:</strong> {t.asunto}
      </p>
      <pre>{t.cuerpo}</pre>
    </section>
  );
}
