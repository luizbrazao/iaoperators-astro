// Calculadora de oportunidad + formulario de solicitud del Hotel Revenue
// Operator. Island React (client:visible). Toda la aritmética sale de
// src/lib/hotel-revenue/calculator.ts; aquí solo hay presentación y estado.
//
// Privacidad:
// - Los datos de la calculadora no salen del navegador ni se guardan en ningún
//   almacenamiento hasta que la persona envía el formulario y acepta la
//   política de privacidad.
// - A GTM solo van tramos (buckets), nunca cifras exactas ni datos de contacto
//   (src/lib/hotel-revenue/analytics.ts).
// - El servidor recalcula: no se envían resultados, solo los datos de entrada.

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { HOTEL_REVENUE_CONSENT, HOTEL_REVENUE_DISCLAIMER, HOTEL_REVENUE_PRODUCT } from "@/data/hotel-revenue";
import {
  CALCULATOR_FIELDS,
  CALCULATOR_VERSION,
  DEFAULT_INPUTS,
  DAYS_PER_MONTH,
  INPUT_LIMITS,
  SCENARIOS,
  calculate,
  formatEuros,
  formatNumber,
  formatPct,
  validateCalculatorInputs,
} from "@/lib/hotel-revenue/calculator";
import { pushHotelRevenueEvent, resultDimensions } from "@/lib/hotel-revenue/analytics";
import type { CalculatorField, CalculatorResult, CtaOrigin } from "@/lib/hotel-revenue/types";

type Props = {
  /** "embedded": dentro de la landing. "page": página propia de la calculadora. */
  variant?: "embedded" | "page";
  ctaOrigin?: CtaOrigin;
  /** Nivel de los títulos internos: 3 dentro de una sección con h2 (landing), 2 en la página propia (h1 de la página). */
  headingLevel?: 2 | 3;
};

const FIELD_META: Record<CalculatorField, { label: string; help: string; suffix: string; inputMode: "numeric" | "decimal" }> = {
  rooms: { label: "Habitaciones", help: "De la propiedad que quieres analizar.", suffix: "hab.", inputMode: "numeric" },
  occupancyPct: { label: "Ocupación media", help: "Media anual o de la temporada que te interesa.", suffix: "%", inputMode: "decimal" },
  adr: { label: "ADR", help: "Tarifa media por habitación ocupada y noche.", suffix: "€", inputMode: "decimal" },
  avgStayNights: { label: "Estancia media", help: "Noches por reserva.", suffix: "noches", inputMode: "decimal" },
  otaSharePct: { label: "Reservas vía OTA", help: "Booking, Expedia y similares sobre el total.", suffix: "%", inputMode: "decimal" },
  otaCommissionPct: { label: "Comisión media OTA", help: "Lo que pagas de media por reserva intermediada.", suffix: "%", inputMode: "decimal" },
  upsellAvg: { label: "Ticket medio de un extra", help: "Parking, desayuno, late checkout, traslado…", suffix: "€", inputMode: "decimal" },
};

function toDisplay(value: number): string {
  return String(value).replace(".", ",");
}

function initialValues(): Record<CalculatorField, string> {
  return Object.fromEntries(CALCULATOR_FIELDS.map((f) => [f, toDisplay(DEFAULT_INPUTS[f])])) as Record<CalculatorField, string>;
}

function newSubmissionId(): string {
  const c: Crypto | undefined = typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // Fallback RFC 4122 v4 con getRandomValues (navegadores sin randomUUID).
  const b = new Uint8Array(16);
  if (c) c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

type LeadForm = {
  name: string;
  email: string;
  hotelName: string;
  website: string;
  phone: string;
  propertyCount: string;
  roomCount: string;
  privacyAccepted: boolean;
  hp_confirm: string;
};

type ServerFieldErrors = Partial<Record<string, string>>;

const LEAD_FIELDS: { key: keyof LeadForm; label: string; type: string; autoComplete: string; required: boolean; inputMode?: "numeric" | "email" | "tel" | "url"; placeholder?: string }[] = [
  { key: "name", label: "Nombre", type: "text", autoComplete: "name", required: true },
  { key: "email", label: "Email profesional", type: "email", autoComplete: "email", required: true, inputMode: "email" },
  { key: "hotelName", label: "Hotel o grupo", type: "text", autoComplete: "organization", required: true },
  { key: "website", label: "Web (opcional)", type: "text", autoComplete: "url", required: false, inputMode: "url", placeholder: "hotelejemplo.com" },
  { key: "phone", label: "Teléfono (opcional)", type: "tel", autoComplete: "tel", required: false, inputMode: "tel" },
  { key: "propertyCount", label: "Número de propiedades", type: "text", autoComplete: "off", required: true, inputMode: "numeric" },
  { key: "roomCount", label: "Habitaciones en total", type: "text", autoComplete: "off", required: true, inputMode: "numeric" },
];

export default function HotelRevenueCalculator({ variant = "embedded", ctaOrigin = "calculator_embedded", headingLevel = 2 }: Props) {
  const uid = useId();
  const [values, setValues] = useState<Record<CalculatorField, string>>(initialValues);
  const [interacted, setInteracted] = useState(false);
  const [liveText, setLiveText] = useState("");
  const tracked = useRef({ started: false, completed: false, leadStarted: false });

  const validation = useMemo(() => validateCalculatorInputs(values), [values]);
  const lastValid = useRef<CalculatorResult>(calculate(DEFAULT_INPUTS));
  const result = useMemo(() => {
    if (validation.ok) lastValid.current = calculate(validation.value);
    return lastValid.current;
  }, [validation]);
  const stale = !validation.ok;
  const calcErrors = validation.ok ? {} : validation.errors;

  // Formulario
  const [form, setForm] = useState<LeadForm>({
    name: "",
    email: "",
    hotelName: "",
    website: "",
    phone: "",
    propertyCount: "1",
    roomCount: toDisplay(DEFAULT_INPUTS.rooms),
    privacyAccepted: false,
    hp_confirm: "",
  });
  const roomCountEdited = useRef(false);
  const submissionId = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ServerFieldErrors>({});
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Habitaciones del formulario = las de la calculadora, hasta que se editen a mano.
  useEffect(() => {
    if (!roomCountEdited.current && validation.ok) {
      setForm((f) => ({ ...f, roomCount: String(validation.value.rooms) }));
    }
  }, [validation]);

  // "completed" una sola vez: tras interactuar y con un resultado válido estable.
  useEffect(() => {
    if (!interacted || !validation.ok) return;
    const t = window.setTimeout(() => {
      const r = result.scenarios.realistic;
      setLiveText(
        `Escenario realista: ${formatEuros(r.totalMonthly)} al mes, ${formatEuros(r.totalAnnual)} al año. Estimación orientativa.`,
      );
      if (!tracked.current.completed) {
        tracked.current.completed = true;
        pushHotelRevenueEvent("hotel_revenue_calculator_completed", { ...resultDimensions(result), cta_origin: ctaOrigin });
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [interacted, validation, result, ctaOrigin]);

  function onCalcChange(field: CalculatorField, value: string) {
    if (!tracked.current.started) {
      tracked.current.started = true;
      pushHotelRevenueEvent("hotel_revenue_calculator_started", { cta_origin: ctaOrigin });
    }
    setInteracted(true);
    setValues((v) => ({ ...v, [field]: value.slice(0, 16) }));
  }

  function onLeadFocus() {
    if (tracked.current.leadStarted) return;
    tracked.current.leadStarted = true;
    pushHotelRevenueEvent("hotel_revenue_lead_started", { ...resultDimensions(result), cta_origin: currentCtaOrigin() });
  }

  function currentCtaOrigin(): CtaOrigin {
    // El script de la página guarda aquí el último CTA pulsado (sin almacenamiento).
    const fromPage = typeof document !== "undefined" ? document.documentElement.dataset.hroCta : undefined;
    return (fromPage as CtaOrigin) || ctaOrigin;
  }

  function setField<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    if (key === "roomCount") roomCountEdited.current = true;
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as string]) setFieldErrors((e) => ({ ...e, [key as string]: undefined }));
  }

  function clientErrors(): ServerFieldErrors {
    const e: ServerFieldErrors = {};
    if (form.name.trim().length < 2) e.name = "Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Escribe un email válido.";
    if (form.hotelName.trim().length < 2) e.hotelName = "Escribe el nombre del hotel o del grupo.";
    if (!/^\d{1,3}$/.test(form.propertyCount.trim()) || Number(form.propertyCount) < 1 || Number(form.propertyCount) > 200) e.propertyCount = "Entre 1 y 200.";
    if (!/^\d{1,5}$/.test(form.roomCount.trim()) || Number(form.roomCount) < 1) e.roomCount = "Indica el número total de habitaciones.";
    if (!form.privacyAccepted) e.privacyAccepted = "Necesitamos tu aceptación para poder responderte.";
    return e;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    if (!validation.ok) {
      setStatus("error");
      setFormError("Revisa los datos de la calculadora: hay algún valor fuera de rango.");
      errorRef.current?.focus();
      return;
    }
    const local = clientErrors();
    if (Object.keys(local).length) {
      setFieldErrors(local);
      setStatus("error");
      setFormError("Revisa los campos marcados.");
      window.setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }

    submissionId.current = submissionId.current ?? newSubmissionId();
    setStatus("submitting");
    setFormError("");
    setFieldErrors({});

    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].map((k) => [k, params.get(k) ?? ""]),
    );
    const origin = currentCtaOrigin();

    try {
      const response = await fetch(HOTEL_REVENUE_PRODUCT.paths.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          submissionId: submissionId.current,
          name: form.name,
          email: form.email,
          hotelName: form.hotelName,
          website: form.website,
          phone: form.phone,
          propertyCount: Number(form.propertyCount),
          roomCount: Number(form.roomCount),
          privacyAccepted: form.privacyAccepted,
          consentVersion: HOTEL_REVENUE_CONSENT.version,
          inputs: validation.value,
          context: { landingPath: window.location.pathname, referrer: document.referrer, utm, ctaOrigin: origin },
          hp_confirm: form.hp_confirm,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: ServerFieldErrors };
      if (response.ok && data.ok) {
        setStatus("done");
        pushHotelRevenueEvent(
          "generate_lead",
          { ...resultDimensions(result), cta_origin: origin },
          { onDone: () => window.location.assign(HOTEL_REVENUE_PRODUCT.paths.gracias), timeoutMs: 1200 },
        );
        return;
      }
      setStatus("error");
      setFieldErrors(data.fields ?? {});
      setFormError(data.error || "No hemos podido enviar la solicitud. Inténtalo de nuevo.");
    } catch {
      setStatus("error");
      setFormError("No hay conexión con el servidor. Comprueba tu red e inténtalo de nuevo; tus datos siguen en el formulario.");
    }
    window.setTimeout(() => errorRef.current?.focus(), 0);
  }

  const H = headingLevel === 2 ? "h2" : "h3";
  const realistic = result.scenarios.realistic;
  const describedBy = (field: string, hasError: boolean) => `${uid}-${field}-help${hasError ? ` ${uid}-${field}-err` : ""}`;

  return (
    <div className={`hro-calc hro-calc-${variant}`}>
      <div className="hro-calc-grid">
        <fieldset className="hro-calc-inputs" aria-describedby={`${uid}-intro`}>
          <legend className="ed-eyebrow">Datos de tu hotel · mensual</legend>
          <p id={`${uid}-intro`} className="hro-calc-note">
            Arranca con valores de ejemplo. Cámbialos por los tuyos: nada se envía ni se guarda hasta que pidas el análisis.
          </p>
          <div className="hro-fields">
            {CALCULATOR_FIELDS.map((field) => {
              const meta = FIELD_META[field];
              const limit = INPUT_LIMITS[field];
              const err = calcErrors[field];
              return (
                <div className={`hro-field${err ? " is-invalid" : ""}`} key={field}>
                  <label htmlFor={`${uid}-${field}`}>{meta.label}</label>
                  <div className="hro-input-wrap">
                    <input
                      id={`${uid}-${field}`}
                      name={field}
                      type="text"
                      inputMode={meta.inputMode}
                      autoComplete="off"
                      value={values[field]}
                      onChange={(e) => onCalcChange(field, e.target.value)}
                      aria-invalid={err ? true : undefined}
                      aria-describedby={describedBy(field, Boolean(err))}
                    />
                    <span className="hro-suffix" aria-hidden="true">{meta.suffix}</span>
                  </div>
                  <span id={`${uid}-${field}-help`} className="hro-help">
                    {meta.help} <span className="hro-range">({formatNumber(limit.min)}–{formatNumber(limit.max)} {meta.suffix})</span>
                  </span>
                  {err && (
                    <span id={`${uid}-${field}-err`} className="hro-field-error">
                      {err}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        <section className={`hro-results${stale ? " is-stale" : ""}`} aria-labelledby={`${uid}-res-title`}>
          <H id={`${uid}-res-title`} className="ed-eyebrow hro-results-eyebrow">Oportunidad estimada · escenario realista</H>
          <p className="hro-results-total">
            {formatEuros(realistic.totalMonthly)}
            <span> al mes</span>
          </p>
          <p className="hro-results-annual">{formatEuros(realistic.totalAnnual)} al año, sin estacionalidad</p>
          {stale && <p className="hro-stale-note">Corrige los datos marcados para actualizar el resultado.</p>}

          <div className="hro-table-wrap">
            <table className="hro-table">
              <caption className="hro-sr">Oportunidad por escenario, en euros</caption>
              <thead>
                <tr>
                  <th scope="col"><span className="hro-sr">Concepto</span></th>
                  {SCENARIOS.map((s) => (
                    <th scope="col" key={s.id} className={s.id === "realistic" ? "is-key" : undefined}>{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Reservas OTA que pasan a directa</th>
                  {SCENARIOS.map((s) => <td key={s.id}>{formatPct(s.otaRecoveryRate)}</td>)}
                </tr>
                <tr>
                  <th scope="row">Reservas que compran un extra</th>
                  {SCENARIOS.map((s) => <td key={s.id}>{formatPct(s.upsellAdoptionRate)}</td>)}
                </tr>
                <tr>
                  <th scope="row">Ahorro de comisión / mes</th>
                  {SCENARIOS.map((s) => <td key={s.id}>{formatEuros(result.scenarios[s.id].commissionSavingsMonthly)}</td>)}
                </tr>
                <tr>
                  <th scope="row">Ingresos por extras / mes</th>
                  {SCENARIOS.map((s) => <td key={s.id}>{formatEuros(result.scenarios[s.id].upsellRevenueMonthly)}</td>)}
                </tr>
                <tr className="hro-row-total">
                  <th scope="row">Oportunidad mensual</th>
                  {SCENARIOS.map((s) => <td key={s.id}>{formatEuros(result.scenarios[s.id].totalMonthly)}</td>)}
                </tr>
                <tr className="hro-row-total">
                  <th scope="row">Oportunidad anual</th>
                  {SCENARIOS.map((s) => <td key={s.id}>{formatEuros(result.scenarios[s.id].totalAnnual)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          <dl className="hro-base">
            <div><dt>Noches ocupadas / mes</dt><dd>{formatNumber(result.base.occupiedRoomNights)}</dd></div>
            <div><dt>Reservas estimadas / mes</dt><dd>{formatNumber(result.base.estimatedBookings)}</dd></div>
            <div><dt>Ingresos vía OTA / mes</dt><dd>{formatEuros(result.base.estimatedOtaRevenue)}</dd></div>
            <div><dt>Comisión OTA / mes</dt><dd>{formatEuros(result.base.estimatedOtaCommission)}</dd></div>
          </dl>

          <p className="hro-disclaimer"><strong>{HOTEL_REVENUE_DISCLAIMER}</strong></p>
          <details className="hro-method">
            <summary>Cómo se calcula</summary>
            <ul>
              <li>Mes de {DAYS_PER_MONTH} días: noches ocupadas = habitaciones × {DAYS_PER_MONTH} × ocupación.</li>
              <li>Reservas = noches ocupadas ÷ estancia media. Ingresos vía OTA = noches ocupadas × ADR × % OTA.</li>
              <li>Ahorro de comisión = comisión OTA × % de reservas OTA que pasan a directa. Es un ahorro bruto: no descuenta el coste del canal directo (motor, pasarela de pago, campañas).</li>
              <li>Extras = reservas × % de adopción × ticket medio. Se cuenta un extra por reserva, no por huésped.</li>
              <li>Anual = mensual × 12, sin estacionalidad. Los porcentajes de cada escenario son hipótesis de trabajo, no medias del sector. Modelo v{CALCULATOR_VERSION}.</li>
            </ul>
          </details>
          <p className="hro-sr" aria-live="polite">{liveText}</p>
        </section>
      </div>

      <form
        id={variant === "embedded" ? "hro-solicitud" : "hro-solicitud-calculadora"}
        className="hro-lead"
        noValidate
        onSubmit={onSubmit}
        onFocus={onLeadFocus}
        aria-labelledby={`${uid}-lead-title`}
      >
        <div className="hro-lead-head">
          <p className="ed-eyebrow">Programa piloto · plazas limitadas</p>
          <H id={`${uid}-lead-title`} className="hro-lead-title">Solicita el análisis de tu hotel</H>
          <p>
            Revisamos tus datos, la web y el motor de reservas, y te decimos si el piloto tiene sentido en tu caso.
            Sin compromiso y sin pago en esta fase. No pedimos datos de huéspedes.
          </p>
        </div>

        <div className="hro-lead-fields">
          {LEAD_FIELDS.map((f) => {
            const err = fieldErrors[f.key as string];
            return (
              <div className={`hro-lead-field${err ? " is-invalid" : ""}`} key={f.key}>
                <label htmlFor={`${uid}-lead-${f.key}`}>
                  {f.label}
                  {f.required && <span aria-hidden="true"> *</span>}
                </label>
                <input
                  id={`${uid}-lead-${f.key}`}
                  name={f.key}
                  type={f.type}
                  inputMode={f.inputMode}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  required={f.required}
                  aria-required={f.required || undefined}
                  maxLength={f.key === "hotelName" ? 160 : f.key === "website" ? 200 : f.key === "email" ? 254 : f.key === "phone" ? 32 : 120}
                  value={form[f.key] as string}
                  onChange={(e) => setField(f.key, e.target.value as never)}
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? `${uid}-lead-${f.key}-err` : undefined}
                />
                {f.key === "roomCount" && <span className="hro-help">Se rellena con el dato de la calculadora; ajústalo si tienes varias propiedades.</span>}
                {err && <span id={`${uid}-lead-${f.key}-err`} className="hro-field-error">{err}</span>}
              </div>
            );
          })}
        </div>

        {/* Honeypot: nombre sin significado para que el autocompletado no lo rellene. */}
        <div className="hro-hp" aria-hidden="true">
          <label htmlFor={`${uid}-hp`}>No rellenar</label>
          <input
            id={`${uid}-hp`}
            name="hp_confirm"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            value={form.hp_confirm}
            onChange={(e) => setField("hp_confirm", e.target.value)}
          />
        </div>

        <label className={`hro-check${fieldErrors.privacyAccepted ? " is-invalid" : ""}`}>
          <input
            type="checkbox"
            name="privacyAccepted"
            checked={form.privacyAccepted}
            onChange={(e) => setField("privacyAccepted", e.target.checked)}
            aria-invalid={fieldErrors.privacyAccepted ? true : undefined}
            aria-describedby={fieldErrors.privacyAccepted ? `${uid}-privacy-err` : undefined}
            required
          />
          {/* Texto = HOTEL_REVENUE_CONSENT.text (src/data/hotel-revenue.ts). Si cambia, nueva versión. */}
          <span>
            He leído la <a href={HOTEL_REVENUE_PRODUCT.paths.privacy} target="_blank" rel="noopener">política de privacidad</a> y
            acepto que IA Operators use estos datos para analizar mi caso y contactarme sobre el programa piloto.
          </span>
        </label>
        {fieldErrors.privacyAccepted && <span id={`${uid}-privacy-err`} className="hro-field-error">{fieldErrors.privacyAccepted}</span>}

        <p ref={errorRef} tabIndex={-1} className="hro-form-error" role="alert" hidden={!formError}>
          {formError}
        </p>

        <div className="hro-lead-actions">
          <button type="submit" className="ed-button hro-submit" disabled={status === "submitting" || status === "done"}>
            {status === "submitting" ? "Enviando…" : status === "done" ? "Enviado" : "Solicitar acceso al piloto"}
            <span className="ed-arrow" aria-hidden="true">↗</span>
          </button>
          <p className="hro-legal">
            Responsable: IA Operators. Finalidad: estudiar tu solicitud y contactarte sobre el piloto. Junto a tus datos guardamos
            los valores de la calculadora y el origen de la visita (UTM). Los datos del formulario no se comparten con plataformas publicitarias.
          </p>
        </div>
        <p className="hro-sr" aria-live="polite">{status === "submitting" ? "Enviando solicitud" : status === "done" ? "Solicitud enviada" : ""}</p>
      </form>
    </div>
  );
}
