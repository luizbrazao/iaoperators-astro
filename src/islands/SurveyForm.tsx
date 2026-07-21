import { useEffect, useMemo, useRef, useState } from "react";
import { surveyQuestions, totalSurveyQuestions } from "@/lib/survey/questions";
import type { SurveyAnswers, SurveyConsentPayload, SurveyQuestionDefinition } from "@/lib/survey/types";

type Props = {
  locale?: string;
  thankYouPath: string;
};

type ConsentState = SurveyConsentPayload;

const FINAL_STEP_INDEX = totalSurveyQuestions;

function pushAnalytics(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const dataLayerHost = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  dataLayerHost.dataLayer = dataLayerHost.dataLayer || [];
  dataLayerHost.dataLayer.push({ event, ...payload });
}

function readUtms() {
  if (typeof window === "undefined") {
    return { source: "", medium: "", campaign: "", term: "", content: "" };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
  };
}

function getInitialConsent(): ConsentState {
  return {
    accepted: false,
    confidentialityNoticeAccepted: false,
    aggregateUseAccepted: false,
    deletionRightsRead: false,
    emailMarketingAccepted: false,
  };
}

function isExclusive(question: SurveyQuestionDefinition, value: string) {
  return question.options.find((option) => option.value === value)?.exclusive === true;
}

function stepLabel(index: number) {
  if (index === FINAL_STEP_INDEX) return "Privacidad y envío";
  return `Pregunta ${index + 1}`;
}

export default function SurveyForm({ locale = "es", thankYouPath }: Props) {
  const [started, setStarted] = useState(false);
  const [responseId, setResponseId] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [consent, setConsent] = useState<ConsentState>(getInitialConsent);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [validationError, setValidationError] = useState("");
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const utms = useMemo(() => readUtms(), []);

  const activeQuestion = surveyQuestions[currentStep];
  const progressCurrent = started ? currentStep + 1 : 0;
  const progressTotal = totalSurveyQuestions + 1;
  const progressPercent = started ? Math.min(100, Math.round((progressCurrent / progressTotal) * 100)) : 0;

  useEffect(() => {
    pushAnalytics("survey_view", {
      survey_slug: "segunda-factura-ia-2026",
      locale,
      page_path: window.location.pathname,
      utm_source: utms.source,
      utm_campaign: utms.campaign,
      device_width: window.innerWidth,
    });
  }, [locale, utms.campaign, utms.source]);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (!started || !responseId || completedRef.current === true) return;

      const payload = JSON.stringify({
        responseId,
        status: "abandoned",
        completionStep: currentStep,
        durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : 0,
        answers,
      });

      navigator.sendBeacon("/api/survey/segunda-factura-ia/session", payload);
      pushAnalytics("survey_abandon", {
        survey_slug: "segunda-factura-ia-2026",
        response_id: responseId,
        last_step: currentStep,
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [answers, currentStep, responseId, started]);

  async function ensureSession() {
    if (responseId) return responseId;

    const res = await fetch("/api/survey/segunda-factura-ia/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        landingPath: window.location.pathname,
        referrer: document.referrer || "",
      }),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.responseId) {
      throw new Error(payload?.error || "No se pudo iniciar la encuesta.");
    }

    setResponseId(payload.responseId);
    return payload.responseId as string;
  }

  function validateCurrentStep() {
    if (currentStep === FINAL_STEP_INDEX) {
      if (!consent.accepted || !consent.aggregateUseAccepted || !consent.confidentialityNoticeAccepted || !consent.deletionRightsRead) {
        return "Debes revisar y aceptar las condiciones obligatorias antes de enviar.";
      }
      return "";
    }

    const question = activeQuestion;
    if (!question) return "";
    const value = answers[question.id];

    if (question.type === "multi") {
      if (!Array.isArray(value) || value.length === 0) {
        return "Selecciona al menos una opción para continuar.";
      }
      return "";
    }

    if (typeof value !== "string" || !value) {
      return "Selecciona una opción para continuar.";
    }

    return "";
  }

  async function syncPartial(nextStep: number, partialAnswers?: SurveyAnswers, status?: "started" | "abandoned") {
    if (!responseId) return;

    await fetch("/api/survey/segunda-factura-ia/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        responseId,
        completionStep: nextStep,
        durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : 0,
        answers: partialAnswers ?? {},
        status,
      }),
      keepalive: status === "abandoned",
    }).catch(() => null);
  }

  async function handleStart() {
    setSessionError("");
    setValidationError("");
    setLoading(true);

    try {
      const id = await ensureSession();
      startedAtRef.current = Date.now();
      setStarted(true);
      pushAnalytics("survey_start", {
        survey_slug: "segunda-factura-ia-2026",
        response_id: id,
        locale,
        utm_source: utms.source,
        utm_campaign: utms.campaign,
      });
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : "No se pudo iniciar la encuesta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    const errorText = validateCurrentStep();
    setValidationError(errorText);
    if (errorText) return;

    setError("");
    setLoading(true);

    try {
      const id = await ensureSession();
      if (!startedAtRef.current) startedAtRef.current = Date.now();
      const question = surveyQuestions[currentStep];
      const partialAnswers = question ? { [question.id]: answers[question.id] } : {};
      const nextStep = currentStep + 1;

      await syncPartial(nextStep, partialAnswers);
      setCurrentStep(nextStep);

      pushAnalytics("survey_step_advance", {
        survey_slug: "segunda-factura-ia-2026",
        response_id: id,
        step_index: currentStep + 1,
        step_name: question?.id || "consent",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar tu avance.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setValidationError("");
    setError("");
    setCurrentStep((step) => Math.max(0, step - 1));
  }

  function handleSingleSelect(questionId: keyof SurveyAnswers, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setValidationError("");
  }

  function handleMultiToggle(question: SurveyQuestionDefinition, value: string) {
    setAnswers((current) => {
      const currentValues = Array.isArray(current[question.id]) ? [...(current[question.id] as string[])] : [];
      const exists = currentValues.includes(value);

      if (isExclusive(question, value)) {
        return { ...current, [question.id]: exists ? [] : [value] };
      }

      const exclusiveValues = question.options.filter((option) => option.exclusive).map((option) => option.value);
      const filtered = currentValues.filter((item) => !exclusiveValues.includes(item));
      const nextValues = exists ? filtered.filter((item) => item !== value) : [...filtered, value];
      return { ...current, [question.id]: nextValues };
    });
    setValidationError("");
  }

  async function handleSubmit() {
    const errorText = validateCurrentStep();
    setValidationError(errorText);
    if (errorText) return;
    if (!responseId) {
      setError("La sesión no está preparada. Vuelve a intentarlo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/survey/segunda-factura-ia/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId,
          answers,
          consent,
          email,
          website: "",
          durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : 0,
          completionStep: FINAL_STEP_INDEX + 1,
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const details = Array.isArray(payload?.details) ? ` ${payload.details.join(" ")}` : "";
        throw new Error((payload?.error || "No se pudo enviar la encuesta.") + details);
      }

      completedRef.current = true;
      pushAnalytics("survey_complete", {
        survey_slug: "segunda-factura-ia-2026",
        response_id: responseId,
        review_status: payload?.reviewStatus || "clean",
        utm_source: utms.source,
        utm_campaign: utms.campaign,
      });

      window.location.assign(thankYouPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la encuesta.");
    } finally {
      setLoading(false);
    }
  }

  function renderQuestion(question: SurveyQuestionDefinition) {
    const value = answers[question.id];

    return (
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
            {stepLabel(currentStep)}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
            {question.title}
          </h2>
          {question.description && (
            <p className="text-sm md:text-base text-white/65">{question.description}</p>
          )}
        </header>

        <div className="grid gap-3">
          {question.options.map((option) => {
            const checked = Array.isArray(value) ? value.includes(option.value) : value === option.value;
            return (
              <label
                key={option.value}
                className={`group flex items-start gap-4 rounded-2xl border p-4 transition ${
                  checked
                    ? "border-orange-500 bg-orange-500/10 shadow-[0_0_0_1px_rgba(249,115,22,0.25)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <input
                  type={question.type === "multi" ? "checkbox" : "radio"}
                  name={question.id}
                  value={option.value}
                  checked={checked}
                  onChange={() =>
                    question.type === "multi"
                      ? handleMultiToggle(question, option.value)
                      : handleSingleSelect(question.id, option.value)
                  }
                  className="mt-1 h-4 w-4 accent-orange-500"
                />
                <span className="text-sm md:text-base text-white/88 leading-relaxed">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  function renderConsentStep() {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
            {stepLabel(FINAL_STEP_INDEX)}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
            Revisión final, privacidad y envío
          </h2>
          <p className="text-sm md:text-base text-white/65">
            Las respuestas se analizarán de forma agregada. No publiques ni pegues datos confidenciales,
            nombres de clientes, contratos completos ni documentos internos identificables.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4 text-sm text-white/78">
          <p>
            Finalidad: entender cómo empresas y profesionales usan IA en el trabajo y qué prácticas de
            gobernanza, control y dependencia tecnológica existen hoy.
          </p>
          <p>
            Uso de resultados: los resultados podrán publicarse únicamente de forma agregada. Ninguna
            respuesta individual se publicará como tal.
          </p>
          <p>
            Eliminación de datos: si decides dejar un email, podrás solicitar la eliminación escribiendo a{" "}
            <a href="mailto:info@iaoperators.com" className="text-orange-400 underline">
              info@iaoperators.com
            </a>
            .
          </p>
          <p>
            Email opcional: si lo facilitas, se almacenará por separado de las respuestas comportamentales
            siempre que el backend de producción esté configurado con el driver recomendado.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/88">
            Email opcional para recibir el estudio cuando esté listo
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@empresa.com"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
          <span className="mt-2 block text-xs text-white/50">
            Este campo no es obligatorio. Puedes responder sin identificarte.
          </span>
        </label>

        <div className="space-y-3">
          {[
            {
              key: "accepted",
              label: "Acepto enviar esta respuesta para fines de investigación exploratoria.",
            },
            {
              key: "aggregateUseAccepted",
              label: "Entiendo que los resultados se utilizarán solo de forma agregada.",
            },
            {
              key: "confidentialityNoticeAccepted",
              label: "Confirmo que no he incluido ni incluiré datos confidenciales o secretos empresariales.",
            },
            {
              key: "deletionRightsRead",
              label: "He leído cómo solicitar la eliminación de mis datos en caso de haber facilitado un identificador.",
            },
            {
              key: "emailMarketingAccepted",
              label: "Acepto recibir por email novedades relacionadas con este estudio (opcional).",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/85"
            >
              <input
                type="checkbox"
                checked={Boolean(consent[item.key as keyof ConsentState])}
                onChange={(event) =>
                  setConsent((current) => ({
                    ...current,
                    [item.key]: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 accent-orange-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
      <aside className="rounded-[28px] border border-white/10 bg-linear-to-br from-white/[0.07] to-white/[0.02] p-6 md:p-7">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">
            Investigación propietaria
          </span>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Encuesta de 3 minutos</h2>
            <p className="text-sm leading-relaxed text-white/68">
              Diseñada para medir adopción, gobernanza, prácticas de control y dependencia de proveedores de
              IA en equipos reales.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/45">
              <span>Progreso</span>
              <span>
                {started ? `${Math.min(progressCurrent, progressTotal)}/${progressTotal}` : `0/${progressTotal}`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/8">
              <div
                className="h-2 rounded-full bg-linear-to-r from-orange-500 to-amber-300 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-white/50">Qué vas a responder</dt>
              <dd className="mt-1 text-white/88">12 preguntas cerradas, sin respuestas abiertas obligatorias.</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-white/50">Qué no debes compartir</dt>
              <dd className="mt-1 text-white/88">Nombres de clientes, contratos completos, credenciales o secretos internos.</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-white/50">Cómo se usarán los datos</dt>
              <dd className="mt-1 text-white/88">Solo para análisis agregado, control de calidad y futura publicación del estudio.</dd>
            </div>
          </dl>

          {!started && (
            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="w-full rounded-full bg-linear-to-r from-orange-500 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Preparando encuesta..." : "Empezar encuesta"}
            </button>
          )}

          {sessionError && <p className="text-sm text-red-300">{sessionError}</p>}
        </div>
      </aside>

      <div className="rounded-[28px] border border-white/10 bg-[#0a0a0a]/90 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        {!started ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
                Antes de empezar
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Queremos medir la segunda factura de la IA: la exposición invisible.
              </h2>
              <p className="text-base leading-relaxed text-white/68">
                Esta encuesta exploratoria analiza cómo se usa la IA en el trabajo, qué información circula por
                esas herramientas y hasta qué punto existen controles reales. No hace falta registrarse.
              </p>
            </div>

            <ul className="grid gap-3 text-sm text-white/82">
              {[
                "Acepta respuestas de empresas, autónomos, consultores y equipos internos.",
                "Está pensada para España, pero admite respuestas de otros mercados para comparación.",
                "Permite segmentar por perfil, tamaño de organización, sector, región y madurez de gobernanza.",
              ].map((item) => (
                <li key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : currentStep < FINAL_STEP_INDEX ? (
          renderQuestion(activeQuestion)
        ) : (
          renderConsentStep()
        )}

        {validationError && <p className="mt-5 text-sm text-red-300">{validationError}</p>}
        {error && <p className="mt-5 text-sm text-red-300">{error}</p>}

        {started && (
          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading || currentStep === 0}
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/82 transition hover:border-white/35 disabled:opacity-40"
            >
              Volver
            </button>

            {currentStep < FINAL_STEP_INDEX ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="rounded-full bg-linear-to-r from-orange-500 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Siguiente"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-full bg-linear-to-r from-orange-500 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar encuesta"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
