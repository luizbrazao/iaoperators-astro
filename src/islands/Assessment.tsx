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

const GAP_STYLES: Record<GapState, { dot: string; label: string; text: string }> = {
  ok: { dot: "bg-emerald-400", label: "Cubierto", text: "text-emerald-400" },
  parcial: { dot: "bg-amber-400", label: "Parcial", text: "text-amber-400" },
  gap: { dot: "bg-red-500", label: "Brecha", text: "text-red-400" },
  desconocido: { dot: "bg-gray-500", label: "Sin datos", text: "text-gray-400" },
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                result.obligado === "no"
                  ? "bg-white/10 text-gray-300"
                  : "bg-orange-500/10 text-orange-400"
              }`}
            >
              {OBLIGADO_LABEL[result.obligado]}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-semibold">
              {RISK_LABEL[result.riskLevel]}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-semibold">
              {result.sectorLabel}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {result.titular}
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">{result.motivo}</p>

          <div className="mb-10">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Brecha estimada</span>
              <span className="tabular-nums">{ratio}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.max(3, ratio)}%` }}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-4">Obligación por obligación</h3>
          <ul className="space-y-3 mb-10">
            {result.gaps.map((gap) => {
              const style = GAP_STYLES[gap.estado];
              return (
                <li key={gap.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${style.dot}`} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-white font-medium">{gap.obligacion}</span>
                        <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mt-2">{gap.detalle}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {result.prioridades.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">Por dónde empezar</h3>
              <ol className="space-y-2 mb-10">
                {result.prioridades.map((p, i) => (
                  <li key={p} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                    <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {/* Captura de lead */}
          {leadSent ? (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 text-center">
              <p className="text-white font-medium mb-2">Informe en camino</p>
              <p className="text-gray-400 text-sm">
                Te escribimos con el detalle por obligación y el orden de ejecución recomendado.
              </p>
            </div>
          ) : (
            <form
              onSubmit={sendLead}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6"
            >
              <p className="text-white font-medium mb-1">Recibe el informe completo</p>
              <p className="text-gray-400 text-sm mb-5">
                El detalle por obligación, el checklist de evidencias para la auditoría y una
                estimación de esfuerzo por cada brecha.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder="tu@empresa.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={leadSending}
                  className="px-6 py-3 rounded-xl bg-orange-500 text-black font-medium hover:bg-orange-400 transition-colors disabled:opacity-50"
                >
                  {leadSending ? "Enviando…" : "Enviar informe"}
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-400 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.currentTarget.checked)}
                  className="mt-0.5"
                />
                <span>
                  Acepto la{" "}
                  <a href="/es/politica-de-privacidad/" className="underline hover:text-orange-400">
                    política de privacidad
                  </a>{" "}
                  para recibir el informe.
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactOptIn}
                  onChange={(e) => setContactOptIn(e.currentTarget.checked)}
                  className="mt-0.5"
                />
                <span>Quiero que me contactéis para comentar el resultado (opcional).</span>
              </label>
              {leadError && <p className="text-red-400 text-sm mt-4">{leadError}</p>}
            </form>
          )}

          <p className="text-xs text-gray-600 mt-8 leading-relaxed">
            {legalNote} (motor {result.engineVersion}). Información técnica: no constituye
            asesoramiento jurídico ni fiscal.
          </p>
        </div>

        <div className="text-center mt-8">
          <a
            href="/es/contact/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-medium hover:bg-orange-500 hover:text-black transition-all duration-300"
          >
            Hablar con un especialista ↗
          </a>
        </div>
      </div>
    );
  }

  // ---------- CUESTIONARIO ----------
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>
            Pregunta {step + 1} de {TOTAL_STEPS}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">{question.title}</h2>
        {question.description && (
          <p className="text-gray-500 text-sm mb-6">{question.description}</p>
        )}

        <div className="space-y-2">
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
                onClick={() =>
                  question.type === "multi"
                    ? toggleMulti(question.id, option.value)
                    : selectSingle(question.id, option.value)
                }
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                  selected
                    ? "bg-orange-500/10 border-orange-500/50 text-white"
                    : "bg-white/[0.02] border-white/5 text-gray-300 hover:border-white/20"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 shrink-0 border transition-colors ${
                      question.type === "multi" ? "rounded" : "rounded-full"
                    } ${selected ? "bg-orange-500 border-orange-500" : "border-white/20"}`}
                  />
                  <span className="text-sm md:text-base">{option.label}</span>
                </span>
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
        />

        {error && <p className="text-red-400 text-sm mt-6">{error}</p>}

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || sending}
            className="text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-30"
          >
            ← Atrás
          </button>

          {question.type === "multi" || step === TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={() => advance()}
              disabled={!canAdvance || sending}
              className="px-6 py-3 rounded-full bg-orange-500 text-black font-medium hover:bg-orange-400 transition-colors disabled:opacity-40"
            >
              {sending
                ? "Calculando…"
                : step === TOTAL_STEPS - 1
                  ? "Ver mi resultado"
                  : "Continuar"}
            </button>
          ) : (
            <span className="text-xs text-gray-600">Elige una opción para continuar</span>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-6">
        Menos de 2 minutos. No pedimos email para ver el resultado.
      </p>
    </div>
  );
}
