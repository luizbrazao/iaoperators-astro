import { useEffect, useMemo, useRef, useState } from "react";
import type { SurveyAnswers, SurveyConsentPayload, SurveyQuestionDefinition } from "@/lib/survey/types";
import { getLocalizedQuestions, normalizeSurveyLang, surveyUi } from "@/lib/survey/i18n";

type Props = {
  locale?: string;
  thankYouPath: string;
};

type ConsentState = SurveyConsentPayload;

const SURVEY_SLUG = "segunda-factura-ia-2026";

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

export default function SurveyForm({ locale = "es", thankYouPath }: Props) {
  const lang = normalizeSurveyLang(locale);
  const t = surveyUi[lang];
  const questions = useMemo(() => getLocalizedQuestions(lang), [lang]);
  const totalQuestions = questions.length;
  const finalStepIndex = totalQuestions;

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

  const activeQuestion = questions[currentStep];
  const progressCurrent = started ? currentStep + 1 : 0;
  const progressTotal = totalQuestions + 1;
  const progressPercent = started ? Math.min(100, Math.round((progressCurrent / progressTotal) * 100)) : 0;

  function stepLabel(index: number) {
    if (index === finalStepIndex) return t.steps.privacyLabel;
    return t.steps.questionLabel(index);
  }

  useEffect(() => {
    pushAnalytics("survey_view", {
      survey_slug: SURVEY_SLUG,
      locale: lang,
      page_path: window.location.pathname,
      utm_source: utms.source,
      utm_campaign: utms.campaign,
      device_width: window.innerWidth,
    });
  }, [lang, utms.campaign, utms.source]);

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
        survey_slug: SURVEY_SLUG,
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
        locale: lang,
        landingPath: window.location.pathname,
        referrer: document.referrer || "",
      }),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.responseId) {
      throw new Error(payload?.error || t.errors.start);
    }

    setResponseId(payload.responseId);
    return payload.responseId as string;
  }

  function validateCurrentStep() {
    if (currentStep === finalStepIndex) {
      if (!consent.accepted || !consent.aggregateUseAccepted || !consent.confidentialityNoticeAccepted || !consent.deletionRightsRead) {
        return t.validation.consent;
      }
      return "";
    }

    const question = activeQuestion;
    if (!question) return "";
    const value = answers[question.id];

    if (question.type === "multi") {
      if (!Array.isArray(value) || value.length === 0) {
        return t.validation.multi;
      }
      return "";
    }

    if (typeof value !== "string" || !value) {
      return t.validation.single;
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
        survey_slug: SURVEY_SLUG,
        response_id: id,
        locale: lang,
        utm_source: utms.source,
        utm_campaign: utms.campaign,
      });
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : t.errors.start);
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
      const question = questions[currentStep];
      const partialAnswers = question ? { [question.id]: answers[question.id] } : {};
      const nextStep = currentStep + 1;

      await syncPartial(nextStep, partialAnswers);
      setCurrentStep(nextStep);

      pushAnalytics("survey_step_advance", {
        survey_slug: SURVEY_SLUG,
        response_id: id,
        step_index: currentStep + 1,
        step_name: question?.id || "consent",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.save);
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
      setError(t.errors.sessionNotReady);
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
          completionStep: finalStepIndex + 1,
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const details = Array.isArray(payload?.details) ? ` ${payload.details.join(" ")}` : "";
        throw new Error((payload?.error || t.errors.submit) + details);
      }

      completedRef.current = true;
      pushAnalytics("survey_complete", {
        survey_slug: SURVEY_SLUG,
        response_id: responseId,
        review_status: payload?.reviewStatus || "clean",
        utm_source: utms.source,
        utm_campaign: utms.campaign,
      });

      window.location.assign(thankYouPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.submit);
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
            {stepLabel(finalStepIndex)}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
            {t.consent.title}
          </h2>
          <p className="text-sm md:text-base text-white/65">
            {t.consent.intro}
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4 text-sm text-white/78">
          <p>{t.consent.purpose}</p>
          <p>{t.consent.resultsUse}</p>
          <p>
            {t.consent.deletionPre}
            <a href="mailto:info@iaoperators.com" className="text-orange-400 underline">
              info@iaoperators.com
            </a>
            {t.consent.deletionPost}
          </p>
          <p>{t.consent.emailStorage}</p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/88">
            {t.consent.emailLabel}
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.consent.emailPlaceholder}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
          <span className="mt-2 block text-xs text-white/50">
            {t.consent.emailHint}
          </span>
        </label>

        <div className="space-y-3">
          {t.consent.items.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/85"
            >
              <input
                type="checkbox"
                checked={Boolean(consent[item.key])}
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
            {t.aside.badge}
          </span>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">{t.aside.title}</h2>
            <p className="text-sm leading-relaxed text-white/68">
              {t.aside.description}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/45">
              <span>{t.aside.progress}</span>
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
              <dt className="text-white/50">{t.aside.whatAnswerLabel}</dt>
              <dd className="mt-1 text-white/88">{t.aside.whatAnswerValue}</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-white/50">{t.aside.whatNotShareLabel}</dt>
              <dd className="mt-1 text-white/88">{t.aside.whatNotShareValue}</dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-white/50">{t.aside.howDataLabel}</dt>
              <dd className="mt-1 text-white/88">{t.aside.howDataValue}</dd>
            </div>
          </dl>

          {!started && (
            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="w-full rounded-full bg-linear-to-r from-orange-500 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? t.aside.preparing : t.aside.startButton}
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
                {t.intro.eyebrow}
              </p>
              <h2 className="text-3xl font-semibold text-white">
                {t.intro.title}
              </h2>
              <p className="text-base leading-relaxed text-white/68">
                {t.intro.text}
              </p>
            </div>

            <ul className="grid gap-3 text-sm text-white/82">
              {t.intro.bullets.map((item) => (
                <li key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : currentStep < finalStepIndex ? (
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
              {t.nav.back}
            </button>

            {currentStep < finalStepIndex ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="rounded-full bg-linear-to-r from-orange-500 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? t.nav.saving : t.nav.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-full bg-linear-to-r from-orange-500 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? t.nav.sending : t.nav.submit}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
