// Entrada del programa «Problema Resuelto»: cuadro estilo chat → agente de
// triaje → datos de contacto → envío. Si el agente no está disponible (sin
// clave, tope diario o error), cae a un formulario con las mismas preguntas y
// el caso se envía igual.
//
// Nada se guarda mientras se conversa: la transcripción vive en este estado y
// viaja firmada por el servidor en cada turno. Solo el envío final la guarda.
// Sin localStorage a propósito: cerrar la pestaña descarta la conversación.

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import {
  COMPANY_SIZES,
  FALLBACK_QUESTIONS,
  MANAGER_AWARE,
  PROBLEMA_BASES_VERSION,
  PROBLEMA_CONSENT,
  PROBLEMA_EXAMPLES,
  PROBLEMA_LIMITS,
  PROBLEMA_PROGRAM as P,
  type FallbackKey,
} from "@/data/problema-resuelto";
import { pushProblemaEvent, type ProblemaEventParams } from "@/lib/problema-resuelto/analytics";
import type { ChatMessage, ChatTurnResponse } from "@/lib/problema-resuelto/types";

type Phase = "compose" | "chat" | "form" | "done";

interface Contact {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  companySize: string;
  managerAware: string;
  privacyAccepted: boolean;
  basesAccepted: boolean;
}

const EMPTY_CONTACT: Contact = {
  name: "",
  email: "",
  company: "",
  jobTitle: "",
  companySize: "",
  managerAware: "",
  privacyAccepted: false,
  basesAccepted: false,
};

const EMPTY_ANSWERS = Object.fromEntries(FALLBACK_QUESTIONS.map((q) => [q.key, ""])) as Record<FallbackKey, string>;

const REQUEST_TIMEOUT_MS = 45000;

function uuid(): string {
  const c: Crypto = globalThis.crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  // Respaldo para navegadores antiguos: UUID v4 con getRandomValues.
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function postJson(url: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> | null }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: res.status, data };
  } finally {
    window.clearTimeout(timer);
  }
}

function context() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = params.get(key);
    if (v) utm[key] = v.slice(0, 100);
  }
  return { landingPath: window.location.pathname, referrer: document.referrer || "", utm };
}

export default function ProblemIntake({ variant = "hero" }: { variant?: "hero" | "closing" }) {
  const [phase, setPhase] = useState<Phase>("compose");
  const [draft, setDraft] = useState("");
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [stateToken, setStateToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [turnsLeft, setTurnsLeft] = useState<number>(PROBLEMA_LIMITS.userTurns);
  const [answers, setAnswers] = useState<Record<FallbackKey, string>>(EMPTY_ANSWERS);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [doneEmail, setDoneEmail] = useState("");
  const [exampleIdx, setExampleIdx] = useState(0);

  const submissionId = useRef<string>("");
  const started = useRef(false);
  const threadEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contactHeading = useRef<HTMLHeadingElement>(null);
  const idPrefix = `pr-${variant}`;

  useEffect(() => {
    submissionId.current = uuid();
  }, []);

  // Ejemplos rotativos en el cuadro vacío. Sin rotación con movimiento reducido.
  useEffect(() => {
    if (phase !== "compose" || draft) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setExampleIdx((i) => (i + 1) % PROBLEMA_EXAMPLES.length), 4200);
    return () => window.clearInterval(t);
  }, [phase, draft]);

  useEffect(() => {
    if (phase === "chat") threadEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [transcript.length, busy, phase]);

  useEffect(() => {
    if (ready) contactHeading.current?.focus();
  }, [ready]);

  const userText = useMemo(
    () => transcript.filter((m) => m.role === "user").map((m) => m.content).join("\n\n"),
    [transcript],
  );

  function goToForm(message: string, reason: NonNullable<ProblemaEventParams["fallback_reason"]>, pending = "") {
    const told = [userText, pending].filter(Boolean).join("\n\n");
    setAnswers((a) => ({ ...a, situacion: a.situacion || told.slice(0, 1500) }));
    setNotice(message);
    setPhase("form");
    setBusy(false);
    pushProblemaEvent("problem_fallback", { fallback_reason: reason });
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const message = draft.trim();
    if (busy || closed || ready) return;
    if (message.length < PROBLEMA_LIMITS.messageMin) {
      setError("Cuéntalo con un poco más de detalle.");
      return;
    }
    setError(null);
    setBusy(true);
    if (!started.current) {
      started.current = true;
      pushProblemaEvent("problem_start", { mode: "chat" });
    }
    if (phase === "compose") setPhase("chat");
    // Se muestra ya el mensaje; el servidor devuelve la versión canónica.
    const optimistic: ChatMessage[] = [...transcript, { role: "user", content: message }];
    setTranscript(optimistic);
    setDraft("");

    try {
      const { status, data } = await postJson(P.paths.chatApi, { message, transcript, state: stateToken });
      const body = data as (ChatTurnResponse & { error?: string }) | null;
      if (status === 200 && body?.mode === "chat") {
        setTranscript(body.transcript);
        setStateToken(body.state);
        setTurnsLeft(body.turnsLeft);
        if (body.piiMasked) setNotice("Hemos ocultado algunos datos personales de tu mensaje. Usa ejemplos inventados, por favor.");
        if (body.offTopic) setClosed(true);
        if (body.ready) {
          setReady(true);
          const turns = String(body.transcript.length / 2) as ProblemaEventParams["turns"];
          pushProblemaEvent("triage_complete", { mode: "chat", turns });
        }
        setBusy(false);
        window.setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
      if (status === 200 && body?.mode === "form") {
        setTranscript(transcript);
        goToForm(body.message, body.reason, message);
        return;
      }
      // Error con mensaje propio: se devuelve el texto al cuadro para no perderlo.
      setTranscript(transcript);
      setDraft(message);
      setBusy(false);
      if (status === 409) {
        setError(String(body?.error ?? "La conversación ha caducado."));
        setClosed(true);
        return;
      }
      if (status === 400 || status === 429) {
        const fields = (data?.fields ?? {}) as Record<string, string>;
        setError(fields.message ?? String(body?.error ?? "Revisa el mensaje."));
        return;
      }
      goToForm("El asistente no ha podido responder. Puedes contarnos el problema en este formulario y lo revisamos igual.", "error", message);
    } catch {
      setTranscript(transcript);
      goToForm("No hemos podido conectar con el asistente. Puedes contarnos el problema en este formulario y lo revisamos igual.", "error", message);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    // En pantallas táctiles Enter es salto de línea; se envía con el botón.
    if (window.matchMedia?.("(pointer: coarse)").matches && !(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    void send();
  }

  function restart() {
    setPhase("compose");
    setTranscript([]);
    setStateToken(null);
    setReady(false);
    setClosed(false);
    setError(null);
    setNotice(null);
    setTurnsLeft(PROBLEMA_LIMITS.userTurns);
    setDraft("");
    submissionId.current = uuid();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function switchToForm() {
    if (!started.current) {
      started.current = true;
      pushProblemaEvent("problem_start", { mode: "form" });
    }
    setAnswers((a) => ({ ...a, situacion: a.situacion || [userText, draft.trim()].filter(Boolean).join("\n\n").slice(0, 1500) }));
    setNotice(null);
    setPhase("form");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setFormError(null);
    setFieldErrors({});
    const mode = phase === "form" ? "form" : "chat";
    const payload = {
      submissionId: submissionId.current,
      mode,
      transcript: mode === "chat" ? transcript : undefined,
      state: mode === "chat" ? stateToken : undefined,
      answers: mode === "form" ? answers : undefined,
      ...contact,
      consentVersion: PROBLEMA_CONSENT.version,
      basesVersion: PROBLEMA_BASES_VERSION,
      context: context(),
      hp_confirm: (document.getElementById(`${idPrefix}-hp`) as HTMLInputElement | null)?.value ?? "",
    };
    try {
      const { status, data } = await postJson(P.paths.submitApi, payload);
      if (status === 200 || status === 201) {
        setDoneEmail(contact.email.trim().toLowerCase());
        setPhase("done");
        pushProblemaEvent("problem_submit", { mode, company_size: contact.companySize as ProblemaEventParams["company_size"] });
        pushProblemaEvent("generate_lead", { mode });
        return;
      }
      if (status === 400 && data?.fields) {
        const fields = data.fields as Record<string, string>;
        setFieldErrors(fields);
        setFormError(fields.transcript ?? "Revisa los campos marcados.");
        return;
      }
      setFormError(String(data?.error ?? `No hemos podido enviar el caso. Escríbenos a info@iaoperators.com.`));
    } catch {
      setFormError("No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo; no se ha guardado nada.");
    } finally {
      setSending(false);
    }
  }

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) => setContact((c) => ({ ...c, [key]: value }));
  const err = (key: string) => fieldErrors[key];

  if (phase === "done") {
    return (
      <div className={`pr-intake pr-intake-${variant}`}>
        <div className="pr-done" role="status">
          <p className="ed-eyebrow">Caso recibido</p>
          <h3>Gracias. Lo leemos y te respondemos en un máximo de {P.responseDays} días laborables.</h3>
          <p>
            La respuesta llegará a <strong>{doneEmail}</strong>: aceptado, aceptado en una versión más pequeña o, si no encaja,
            con una recomendación para resolverlo por tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  const contactFields = (
    <fieldset className="pr-contact" aria-describedby={`${idPrefix}-contact-note`}>
      <legend className="pr-sr">Tus datos</legend>
      <p id={`${idPrefix}-contact-note`} className="pr-contact-note">
        Usa el correo de tu empresa. Solo lo usamos para responderte sobre este caso.
      </p>
      <div className="pr-fields">
        <Field id={`${idPrefix}-name`} label="Nombre" error={err("name")}>
          <input id={`${idPrefix}-name`} autoComplete="name" value={contact.name} onChange={(e) => set("name", e.target.value)} maxLength={120} required />
        </Field>
        <Field id={`${idPrefix}-email`} label="Email de empresa" error={err("email")}>
          <input id={`${idPrefix}-email`} type="email" autoComplete="email" inputMode="email" value={contact.email} onChange={(e) => set("email", e.target.value)} maxLength={254} required />
        </Field>
        <Field id={`${idPrefix}-company`} label="Empresa" error={err("company")}>
          <input id={`${idPrefix}-company`} autoComplete="organization" value={contact.company} onChange={(e) => set("company", e.target.value)} maxLength={160} required />
        </Field>
        <Field id={`${idPrefix}-job`} label="Cargo o área" error={err("jobTitle")}>
          <input id={`${idPrefix}-job`} autoComplete="organization-title" value={contact.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} maxLength={120} required />
        </Field>
        <Field id={`${idPrefix}-size`} label="Tamaño de la empresa" error={err("companySize")}>
          <select id={`${idPrefix}-size`} value={contact.companySize} onChange={(e) => set("companySize", e.target.value)} required>
            <option value="" disabled>Elige una opción</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field id={`${idPrefix}-aware`} label="¿Tu responsable sabe que nos escribes?" error={err("managerAware")}>
          <select id={`${idPrefix}-aware`} value={contact.managerAware} onChange={(e) => set("managerAware", e.target.value)} required>
            <option value="" disabled>Elige una opción</option>
            {MANAGER_AWARE.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Honeypot: nombre sin significado a propósito (el autocompletado rellena `website`). */}
      <div className="pr-hp" aria-hidden="true">
        <label htmlFor={`${idPrefix}-hp`}>No rellenar</label>
        <input id={`${idPrefix}-hp`} name="hp_confirm" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
      </div>

      <label className="pr-check">
        <input type="checkbox" checked={contact.privacyAccepted} onChange={(e) => set("privacyAccepted", e.target.checked)} required />
        <span>
          He leído la <a href={P.paths.privacy} target="_blank" rel="noopener">política de privacidad</a> y acepto que IA Operators use lo
          que he escrito y mis datos de contacto para evaluar mi caso y responderme.
        </span>
      </label>
      {err("privacyAccepted") && <p className="pr-field-error">{err("privacyAccepted")}</p>}
      <label className="pr-check">
        <input type="checkbox" checked={contact.basesAccepted} onChange={(e) => set("basesAccepted", e.target.checked)} required />
        <span>
          Acepto las <a href="#bases">bases del programa</a>, incluida la publicación anónima del caso si lo elegís.
        </span>
      </label>
      {err("basesAccepted") && <p className="pr-field-error">{err("basesAccepted")}</p>}

      <p className="pr-form-error" role="alert" hidden={!formError}>
        {formError}
        {fieldErrors.transcript && (
          <>
            {" "}
            <button type="button" className="pr-linklike" onClick={restart}>Empezar de nuevo</button>
          </>
        )}
      </p>

      <div className="pr-submit-row">
        <button type="submit" className="ed-button pr-submit" disabled={sending}>
          {sending ? "Enviando… (unos segundos)" : "Enviar mi caso"}
          <span className="ed-arrow" aria-hidden="true">↗</span>
        </button>
        <p className="pr-legal">
          Responsable: Luiz Fernando Brazão (IA Operators). Finalidad: evaluar tu caso y responderte. Lo que escribes lo procesa un
          modelo de lenguaje de Anthropic, que actúa como encargado del tratamiento y no lo usa para entrenar sus modelos. Puedes
          ejercer tus derechos en info@iaoperators.com. Más detalle en la política de privacidad.
        </p>
      </div>
      <p className="pr-sr" aria-live="polite">{sending ? "Enviando el caso" : ""}</p>
    </fieldset>
  );

  if (phase === "form") {
    return (
      <div className={`pr-intake pr-intake-${variant}`}>
        <form className="pr-fallback" onSubmit={submit} noValidate>
          {notice && <p className="pr-notice">{notice}</p>}
          {FALLBACK_QUESTIONS.map((q) => (
            <Field key={q.key} id={`${idPrefix}-q-${q.key}`} label={q.label + (q.required ? "" : " (opcional)")} error={err(`answers.${q.key}`)}>
              <textarea
                id={`${idPrefix}-q-${q.key}`}
                rows={q.rows}
                maxLength={1500}
                value={answers[q.key]}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
                required={q.required}
              />
            </Field>
          ))}
          <h3 className="pr-step-title">¿A quién respondemos?</h3>
          {contactFields}
        </form>
      </div>
    );
  }

  const placeholder = PROBLEMA_EXAMPLES[exampleIdx];

  return (
    <div className={`pr-intake pr-intake-${variant}`}>
      {phase === "chat" && (
        <div className="pr-thread" role="log" aria-live="polite" aria-label="Conversación con el asistente">
          {transcript.map((m, i) => (
            <div key={i} className={`pr-msg pr-msg-${m.role}`}>
              <small>{m.role === "user" ? "Tú" : "Asistente"}</small>
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="pr-msg pr-msg-assistant pr-msg-typing">
              <small>Asistente</small>
              <span className="pr-dots" aria-label="Escribiendo">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          <div ref={threadEnd} />
        </div>
      )}

      {notice && phase === "chat" && <p className="pr-notice">{notice}</p>}

      {!ready && !closed && (
        <form className={`pr-composer${phase === "chat" ? " pr-composer-chat" : ""}`} onSubmit={send}>
          <label htmlFor={`${idPrefix}-msg`} className="pr-sr">
            {phase === "compose" ? "Describe la tarea o el problema" : "Tu respuesta"}
          </label>
          <textarea
            id={`${idPrefix}-msg`}
            ref={inputRef}
            rows={phase === "compose" ? 4 : 2}
            maxLength={PROBLEMA_LIMITS.messageMax}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={phase === "compose" ? placeholder : "Escribe tu respuesta…"}
            disabled={busy}
          />
          <div className="pr-composer-bar">
            <span className="pr-count" aria-hidden="true">
              {phase === "chat" ? `${turnsLeft} ${turnsLeft === 1 ? "mensaje" : "mensajes"} más como mucho · ` : ""}
              {draft.length}/{PROBLEMA_LIMITS.messageMax}
            </span>
            <button type="submit" className="ed-button pr-send" disabled={busy || draft.trim().length === 0}>
              {phase === "compose" ? "Contar mi problema" : busy ? "Pensando…" : "Enviar"}
              <span className="ed-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="pr-form-error" role="alert">
          {error}
          {closed && (
            <>
              {" "}
              <button type="button" className="pr-linklike" onClick={restart}>Empezar de nuevo</button>
            </>
          )}
        </p>
      )}

      {phase === "compose" && (
        <p className="pr-micro">
          No pegues datos personales ni información confidencial. Te haremos unas preguntas para entenderlo bien.{" "}
          <button type="button" className="pr-linklike" onClick={switchToForm}>Prefiero un formulario</button>
        </p>
      )}

      {phase === "chat" && closed && !error && (
        <p className="pr-micro">
          Este programa es para problemas de trabajo dentro de una empresa.{" "}
          <button type="button" className="pr-linklike" onClick={restart}>Empezar de nuevo</button>
        </p>
      )}

      {phase === "chat" && !ready && !closed && transcript.length >= 2 && (
        <p className="pr-micro">
          <button type="button" className="pr-linklike" onClick={restart}>Empezar de nuevo</button>
        </p>
      )}

      {ready && (
        <form className="pr-contact-form" onSubmit={submit} noValidate>
          <h3 className="pr-step-title" ref={contactHeading} tabIndex={-1}>Último paso: ¿a quién respondemos?</h3>
          {contactFields}
        </form>
      )}
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className={`pr-field${error ? " pr-field-invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="pr-field-error">{error}</p>}
    </div>
  );
}
