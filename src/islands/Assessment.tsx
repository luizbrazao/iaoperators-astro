// Island genérica de assessment. Antes era AssessmentSAC y tenía el cuestionario
// y los endpoints de la Ley 10/2025 incrustados; al llegar el test de Verifactu
// se parametrizó por props en vez de duplicar 400 líneas de UI, estados de envío
// y captación de lead. Los defaults son los del test de la Ley 10/2025, así que
// <Assessment /> sin props se comporta exactamente como antes.
import { useMemo, useRef, useState, type FormEvent } from "react";
import { QUESTIONS as SAC_QUESTIONS } from "@/lib/assessment/sac/questions";
import type { AssessmentQuestion, AssessmentResult, GapState } from "@/lib/assessment/types";

const SAC_DEFAULTS = {
  submitEndpoint: "/api/assessment/ley-atencion-cliente/submit",
  leadEndpoint: "/api/assessment/ley-atencion-cliente/lead",
  legalNote:
    "Resultado orientativo generado por reglas deterministas sobre el texto de la Ley 10/2025",
} as const;

export interface AssessmentProps {
  questions?: AssessmentQuestion[];
  submitEndpoint?: string;
  leadEndpoint?: string;
  /** Frase que precede a "(motor X). Información técnica: no constituye…". */
  legalNote?: string;
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

const OBLIGADO_LABEL: Record<string, string> = {
  si: "Obligados",
  probable: "Probablemente obligados",
  no: "Fuera del ámbito, con matices",
};

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
    const next = { ...answers, [id]: value };
    setAnswers(next);
    // Avance automático en preguntas de opción única: menos clics, más finalización.
    window.setTimeout(() => advance(next), 180);
  }

  function toggleMulti(id: string, value: string) {
    const current = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
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
      pushDataLayer({
        event: "assessment_completed",
        assessment: "ley-10-2025",
        obligado: data.result.obligado,
        sector: data.result.sector,
        risk_level: data.result.riskLevel,
      });
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
          hp_confirm: honeypot.current?.value ?? "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLeadError(data?.error ?? "No se pudo registrar tu solicitud.");
        return;
      }
      setLeadSent(true);
      pushDataLayer({
        event: "generate_lead",
        lead_source: "Test_Ley_10_2025",
        obligado: result?.obligado,
        risk_level: result?.riskLevel,
      });
    } catch {
      setLeadError("Fallo de conexión. Inténtalo de nuevo.");
    } finally {
      setLeadSending(false);
    }
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
            <p>Te escribimos con el detalle por obligación y el orden de ejecución recomendado.</p>
          </div>
        ) : (
          <form onSubmit={sendLead} className="as-lead">
            <p className="as-lead-title">Recibe el informe completo</p>
            <p>
              El detalle por obligación, el checklist de evidencias para la auditoría y una
              estimación de esfuerzo por cada brecha.
            </p>
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

        <div className="as-cta">
          <a href="/es/contact/" className="ed-button">
            Hablar con un especialista<span className="ed-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
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

      <p className="as-foot">Menos de 2 minutos. No pedimos email para ver el resultado.</p>
    </div>
  );
}
