// Island genérica de assessment. Antes era AssessmentSAC y tenía el cuestionario
// y los endpoints de la Ley 10/2025 incrustados; al llegar el test de Verifactu
// se parametrizó por props en vez de duplicar 400 líneas de UI, estados de envío
// y captación de lead. Los defaults son los del test de la Ley 10/2025, así que
// <Assessment /> sin props se comporta exactamente como antes.
import { useMemo, useRef, useState, type FormEvent } from "react";
import { QUESTIONS as SAC_QUESTIONS } from "@/lib/assessment/sac/questions";
import type { AssessmentQuestion, AssessmentResult, GapState } from "@/lib/assessment/types";
import VerifactuKitOffer from "./VerifactuKitOffer";
import RgpdOpsOffer from "./RgpdOpsOffer";

const SAC_DEFAULTS = {
  submitEndpoint: "/api/assessment/ley-atencion-cliente/submit",
  leadEndpoint: "/api/assessment/ley-atencion-cliente/lead",
  legalNote:
    "Resultado orientativo generado por reglas deterministas sobre el texto de la Ley 10/2025",
  analyticsKey: "ley-10-2025",
  leadSource: "Test_Ley_10_2025",
} as const;

export interface AssessmentProps {
  questions?: AssessmentQuestion[];
  submitEndpoint?: string;
  leadEndpoint?: string;
  /** Frase que precede a "(motor X). Información técnica: no constituye…". */
  legalNote?: string;
  /** Valor de `assessment` en el evento `assessment_completed` del dataLayer. */
  analyticsKey?: string;
  /** Valor de `lead_source` en el evento `generate_lead` del dataLayer. */
  leadSource?: string;
  /** Texto bajo "Recibe el informe completo". Por defecto, el de la Ley 10/2025. */
  leadPitch?: string;
  /**
   * Oferta de siguiente paso bajo el resultado. "verifactu-kit" muestra el Kit
   * o la auditoría según el segmento (src/lib/verifactu-kit/segment.ts) y
   * sustituye la CTA genérica. "rgpd-ops" muestra RGPD Ops o la revisión
   * profesional según src/lib/rgpd-ops/segment.ts. Sin valor, se mantiene la
   * CTA de contacto.
   */
  offer?: "verifactu-kit" | "rgpd-ops";
  /**
   * Evento de dataLayer al responder la primera pregunta (p. ej.
   * "rgpd_assessment_started"). Sin valor no se emite nada: los tests
   * anteriores conservan exactamente sus eventos.
   */
  startEvent?: string;
  /** Pie del cuestionario. Por defecto, el de los tests de 2 minutos. */
  footNote?: string;
  /** Texto tras enviar el email. Por defecto, el de los tests de obligación. */
  leadDoneText?: string;
}

type Answers = Record<string, string | string[]>;

// Estilos editoriales (oct/2026): la island solo se usa en los dos tests ES,
// que viven en el shell editorial. Clases en src/styles/editorial-forms.css.
const GAP_STYLES: Record<GapState, { label: string }> = {
  ok: { label: "Cubierto" },
  parcial: { label: "Parcial" },
  gap: { label: "Brecha" },
  desconocido: { label: "Sin datos" },
};

const RISK_LABEL: Record<string, string> = {
  critico: "Riesgo crítico",
  alto: "Riesgo alto",
  medio: "Riesgo medio",
  bajo: "Riesgo bajo",
};

// Vista de madurez (test RGPD): el resultado no es "cumple / no cumple".
const MATURITY_GAP_LABEL: Record<GapState, string> = {
  ok: "Operativo",
  parcial: "En proceso",
  gap: "Pendiente",
  desconocido: "Sin confirmar",
};

const OBLIGADO_LABEL: Record<string, string> = {
  si: "Obligados",
  probable: "Probablemente obligados",
  no: "Fuera del ámbito, con matices",
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** UTMs de la URL de la página. El endpoint no las ve: su URL es la de la API. */
function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(payload);
}

export default function Assessment({
  questions = SAC_QUESTIONS,
  submitEndpoint = SAC_DEFAULTS.submitEndpoint,
  leadEndpoint = SAC_DEFAULTS.leadEndpoint,
  legalNote = SAC_DEFAULTS.legalNote,
  analyticsKey = SAC_DEFAULTS.analyticsKey,
  leadSource = SAC_DEFAULTS.leadSource,
  leadPitch = "El detalle por obligación, el checklist de evidencias para la auditoría y una estimación de esfuerzo por cada brecha.",
  offer,
  startEvent,
  footNote = "Menos de 2 minutos. No pedimos email para ver el resultado.",
  leadDoneText = "Te escribimos con el detalle por obligación y el orden de ejecución recomendado.",
}: AssessmentProps = {}) {
  const QUESTIONS = questions;
  const TOTAL_STEPS = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [contactOptIn, setContactOptIn] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSending, setLeadSending] = useState(false);

  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const startSent = useRef(false);

  function markStarted() {
    if (!startEvent || startSent.current) return;
    startSent.current = true;
    pushDataLayer({ event: startEvent, assessment: analyticsKey });
  }

  const question = QUESTIONS[step];
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const canAdvance = useMemo(() => {
    if (!question) return false;
    const value = answers[question.id];
    if (question.type === "multi") {
      return Array.isArray(value) && value.length >= (question.min ?? 1);
    }
    return typeof value === "string" && value.length > 0;
  }, [answers, question]);

  function selectSingle(id: string, value: string) {
    markStarted();
    const next = { ...answers, [id]: value };
    setAnswers(next);
    // Avance automático en preguntas de opción única: menos clics, más finalización.
    window.setTimeout(() => advance(next), 180);
  }

  function toggleMulti(id: string, value: string) {
    markStarted();
    const current = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    const options = QUESTIONS.find((q) => q.id === id)?.options ?? [];
    const exclusive = new Set(options.filter((o) => o.exclusive).map((o) => o.value));
    let next: string[];
    if (current.includes(value)) {
      next = current.filter((v) => v !== value);
    } else if (exclusive.has(value)) {
      // "Nada de lo anterior" limpia todo lo demás.
      next = [value];
    } else {
      // Marcar algo concreto quita cualquier opción exclusiva.
      next = [...current.filter((v) => !exclusive.has(v)), value];
    }
    setAnswers({ ...answers, [id]: next });
  }

  async function advance(currentAnswers: Answers = answers) {
    setError(null);
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    await submit(currentAnswers);
  }

  async function submit(finalAnswers: Answers) {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(submitEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          durationMs: Date.now() - startedAt.current,
          landingPath: window.location.pathname,
          referrer: document.referrer,
          utm: readUtm(),
          hp_confirm: honeypot.current?.value ?? "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.result) {
        setError(data?.error ?? "No se pudo calcular el resultado. Inténtalo de nuevo.");
        return;
      }
      setResult(data.result as AssessmentResult);
      setResponseId(data.responseId ?? null);
      const r = data.result as AssessmentResult;
      if (r.maturity) {
        // Test de madurez: nivel y segmento, sin respuestas ni datos personales.
        pushDataLayer({
          event: "assessment_completed",
          assessment: analyticsKey,
          maturity_level: r.maturity.level,
          risk_level: r.riskLevel,
          segment: `${r.sector}:${r.review?.recommended ? "revision" : "ops"}`,
        });
      } else {
        pushDataLayer({
          event: "assessment_completed",
          assessment: analyticsKey,
          obligado: r.obligado,
          sector: r.sector,
          risk_level: r.riskLevel,
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Fallo de conexión. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  async function sendLead(event: FormEvent) {
    event.preventDefault();
    setLeadError(null);
    if (!privacy) {
      setLeadError("Necesitamos que aceptes la política de privacidad.");
      return;
    }
    setLeadSending(true);
    try {
      const res = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          responseId,
          email,
          consent: { privacyAccepted: privacy, contactAccepted: contactOptIn },
          answers,
          durationMs: Date.now() - startedAt.current,
          landingPath: window.location.pathname,
          referrer: document.referrer,
          utm: readUtm(),
          hp_confirm: honeypot.current?.value ?? "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLeadError(data?.error ?? "No se pudo registrar tu solicitud.");
        return;
      }
      setLeadSent(true);
      pushDataLayer(
        result?.maturity
          ? { event: "generate_lead", lead_source: leadSource, maturity_level: result.maturity.level, risk_level: result.riskLevel }
          : { event: "generate_lead", lead_source: leadSource, obligado: result?.obligado, risk_level: result?.riskLevel },
      );
    } catch {
      setLeadError("Fallo de conexión. Inténtalo de nuevo.");
    } finally {
      setLeadSending(false);
    }
  }

  // ---------- RESULTADO (madurez, test RGPD) ----------
  if (result && result.maturity) {
    const m = result.maturity;
    const ratio = m.scoreMax ? Math.round((m.score / m.scoreMax) * 100) : 0;
    const areas = result.gaps;
    return (
      <div className="as-result">
        <div className="as-tags">
          <span className="as-tag as-tag-strong">{m.label}</span>
          {result.review?.recommended && <span className="as-tag">Revisión profesional recomendada</span>}
          <span className="as-tag">{result.sectorLabel}</span>
        </div>

        <h2 className="as-title">{result.titular}</h2>
        <p className="as-motivo">{result.motivo}</p>

        <div className="as-meter">
          <div className="as-meter-head ed-eyebrow">
            <span>Madurez operativa</span>
            <span className="pg-tabular">{ratio}%</span>
          </div>
          <div className="as-meter-bar" role="img" aria-label={`Madurez operativa: ${ratio} %`}>
            <span style={{ width: `${Math.max(3, ratio)}%` }} />
          </div>
        </div>

        {result.review?.recommended && (
          <div className="as-review" role="note">
            <p className="as-lead-title">Recomendamos una revisión profesional</p>
            <ul>
              {result.review.motivos.map((motivo) => (
                <li key={motivo}>{motivo}</li>
              ))}
            </ul>
            <p className="as-review-note">
              El test no determina si necesitas evaluación de impacto, delegado de protección de datos
              u otras medidas: eso requiere analizar tu caso.
            </p>
          </div>
        )}

        <h3 className="as-h3">Área por área</h3>
        <ul className="as-gaps">
          {areas.map((gap) => (
            <li key={gap.id} className={`as-gap as-gap-${gap.estado}`}>
              <span className="as-dot" aria-hidden="true" />
              <div>
                <p className="as-gap-head">
                  <strong>{gap.obligacion}</strong>
                  <span className="ed-eyebrow as-state">{MATURITY_GAP_LABEL[gap.estado]}</span>
                </p>
                <p className="as-gap-detail">{gap.detalle}</p>
              </div>
            </li>
          ))}
        </ul>

        {result.prioridades.length > 0 && (
          <>
            <h3 className="as-h3">Por dónde empezar</h3>
            <ol className="as-prior">
              {result.prioridades.map((p, i) => (
                <li key={p}>
                  <span className="ed-eyebrow">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {leadSent ? (
          <div className="as-lead as-lead-done" role="status">
            <p className="as-lead-title">Informe en camino</p>
            <p>{leadDoneText}</p>
          </div>
        ) : (
          <form onSubmit={sendLead} className="as-lead">
            <p className="as-lead-title">Recibe el informe por email (opcional)</p>
            <p>{leadPitch}</p>
            <div className="as-lead-row">
              <label className="as-field">
                <span className="ed-eyebrow">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="tu@empresa.com"
                />
              </label>
              <button type="submit" disabled={leadSending} className="ed-button">
                {leadSending ? "Enviando…" : "Enviar informe"}
              </button>
            </div>
            <label className="as-check">
              <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.currentTarget.checked)} />
              <span>
                Acepto la <a href="/es/politica-de-privacidad/">política de privacidad</a> para
                recibir el informe.
              </span>
            </label>
            <label className="as-check">
              <input type="checkbox" checked={contactOptIn} onChange={(e) => setContactOptIn(e.currentTarget.checked)} />
              <span>Quiero que me contactéis para comentar el resultado (opcional).</span>
            </label>
            {leadError && (
              <p className="as-error" role="alert">
                {leadError}
              </p>
            )}
          </form>
        )}

        <p className="as-legal">
          {legalNote} (motor {result.engineVersion}). Diagnóstico orientativo: no constituye
          asesoramiento jurídico ni certifica el cumplimiento.
        </p>

        {offer === "rgpd-ops" ? (
          <RgpdOpsOffer result={result} responseId={responseId} />
        ) : (
          <div className="as-cta">
            <a href="/es/contact/" className="ed-button">
              Hablar con un especialista<span className="ed-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  // ---------- RESULTADO ----------
  if (result) {
    const ratio = result.riskScoreMax
      ? Math.round((result.riskScore / result.riskScoreMax) * 100)
      : 0;

    return (
      <div className="as-result">
        <div className="as-tags">
          <span className={`as-tag ${result.obligado === "no" ? "" : "as-tag-strong"}`}>
            {OBLIGADO_LABEL[result.obligado]}
          </span>
          <span className="as-tag">{RISK_LABEL[result.riskLevel]}</span>
          <span className="as-tag">{result.sectorLabel}</span>
        </div>

        <h2 className="as-title">{result.titular}</h2>
        <p className="as-motivo">{result.motivo}</p>

        <div className="as-meter">
          <div className="as-meter-head ed-eyebrow">
            <span>Brecha estimada</span>
            <span className="pg-tabular">{ratio}%</span>
          </div>
          <div className="as-meter-bar">
            <span style={{ width: `${Math.max(3, ratio)}%` }} />
          </div>
        </div>

        <h3 className="as-h3">Obligación por obligación</h3>
        <ul className="as-gaps">
          {result.gaps.map((gap) => (
            <li key={gap.id} className={`as-gap as-gap-${gap.estado}`}>
              <span className="as-dot" aria-hidden="true" />
              <div>
                <p className="as-gap-head">
                  <strong>{gap.obligacion}</strong>
                  <span className="ed-eyebrow as-state">{GAP_STYLES[gap.estado].label}</span>
                </p>
                <p className="as-gap-detail">{gap.detalle}</p>
              </div>
            </li>
          ))}
        </ul>

        {result.prioridades.length > 0 && (
          <>
            <h3 className="as-h3">Por dónde empezar</h3>
            <ol className="as-prior">
              {result.prioridades.map((p, i) => (
                <li key={p}>
                  <span className="ed-eyebrow">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Captura de lead */}
        {leadSent ? (
          <div className="as-lead as-lead-done">
            <p className="as-lead-title">Informe en camino</p>
            <p>{leadDoneText}</p>
          </div>
        ) : (
          <form onSubmit={sendLead} className="as-lead">
            <p className="as-lead-title">Recibe el informe completo</p>
            <p>{leadPitch}</p>
            <div className="as-lead-row">
              <label className="as-field">
                <span className="ed-eyebrow">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="tu@empresa.com"
                />
              </label>
              <button type="submit" disabled={leadSending} className="ed-button">
                {leadSending ? "Enviando…" : "Enviar informe"}
              </button>
            </div>
            <label className="as-check">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.currentTarget.checked)}
              />
              <span>
                Acepto la <a href="/es/politica-de-privacidad/">política de privacidad</a> para
                recibir el informe.
              </span>
            </label>
            <label className="as-check">
              <input
                type="checkbox"
                checked={contactOptIn}
                onChange={(e) => setContactOptIn(e.currentTarget.checked)}
              />
              <span>Quiero que me contactéis para comentar el resultado (opcional).</span>
            </label>
            {leadError && <p className="as-error">{leadError}</p>}
          </form>
        )}

        <p className="as-legal">
          {legalNote} (motor {result.engineVersion}). Información técnica: no constituye
          asesoramiento jurídico ni fiscal.
        </p>

        {offer === "verifactu-kit" ? (
          <VerifactuKitOffer result={result} responseId={responseId} />
        ) : (
          <div className="as-cta">
            <a href="/es/contact/" className="ed-button">
              Hablar con un especialista<span className="ed-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  // ---------- CUESTIONARIO ----------
  return (
    <div className="as-quiz">
      <div className="as-progress">
        <div className="as-meter-head ed-eyebrow">
          <span>
            Pregunta {step + 1} de {TOTAL_STEPS}
          </span>
          <span className="pg-tabular">{progress}%</span>
        </div>
        <div className="as-meter-bar as-meter-thin">
          <span style={{ width: `${Math.max(4, progress)}%` }} />
        </div>
      </div>

      <div className="as-card">
        <h2 className="as-q">{question.title}</h2>
        {question.description && <p className="as-q-desc">{question.description}</p>}

        <div className="as-options">
          {question.options.map((option) => {
            const value = answers[question.id];
            const selected =
              question.type === "multi"
                ? Array.isArray(value) && value.includes(option.value)
                : value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  question.type === "multi"
                    ? toggleMulti(question.id, option.value)
                    : selectSingle(question.id, option.value)
                }
                className={`as-opt ${selected ? "is-selected" : ""}`}
              >
                <span
                  className={`as-mark ${question.type === "multi" ? "as-mark-square" : ""}`}
                  aria-hidden="true"
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <input
          ref={honeypot}
          type="text"
          name="hp_confirm"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-lpignore="true"
          data-1p-ignore="true"
          className="hidden"
          style={{ display: "none" }}
        />

        {error && <p className="as-error">{error}</p>}

        <div className="as-nav">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || sending}
            className="as-back"
          >
            ← Atrás
          </button>

          {question.type === "multi" || step === TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={() => advance()}
              disabled={!canAdvance || sending}
              className="ed-button"
            >
              {sending
                ? "Calculando…"
                : step === TOTAL_STEPS - 1
                  ? "Ver mi resultado"
                  : "Continuar"}
            </button>
          ) : (
            <span className="as-hint">Elige una opción para continuar</span>
          )}
        </div>
      </div>

      <p className="as-foot">{footNote}</p>
    </div>
  );
}
