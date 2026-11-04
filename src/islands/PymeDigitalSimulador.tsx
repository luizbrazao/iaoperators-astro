// Simulador de coste neto + solicitud de propuesta de la página /es/pyme-digital/.
// Island React (client:visible). Precios, reglas y aritmética salen de
// src/data/pyme-digital.ts; aquí solo hay estado y presentación.
//
// Envío: reutiliza /api/contact (honeypot `hp_confirm`, Resend) con
// `source: "pyme-digital"`. La Cámara va en `city` y el importe en `budget`
// para que lleguen en campos propios del correo del lead.
// Privacidad: la selección de módulos no sale del navegador hasta que la persona
// envía el formulario. A GTM solo va el evento generate_lead, sin datos personales.
// Estilos: prefijo pd- (editorial-pyme-digital.css) + ct-* de editorial-pages.css.

import { useMemo, useState, type FormEvent } from "react";
import {
  MODULOS,
  PYME_DIGITAL_RULES,
  PYME_DIGITAL_VERSION,
  calcularSeleccion,
  formatEur,
  precioModuloCents,
  type ModuloId,
} from "@/data/pyme-digital";

type Estado = "idle" | "enviando" | "ok";

const SOURCE = "pyme-digital";

const CAMARAS = [
  "Almería",
  "Andújar",
  "Cádiz",
  "Campo de Gibraltar",
  "Córdoba",
  "Granada",
  "Huelva",
  "Jerez",
  "Linares",
  "Málaga",
  "Motril",
  "Sevilla",
  "Otra Cámara",
] as const;

const FASES = [
  "Admitida, estoy en el diagnóstico (fase I)",
  "Tengo el plan de implantación cerrado",
  "Todavía no he pedido la ayuda",
  "No lo sé",
] as const;

function mensajeDeError(status: number): string {
  if (status === 400) return "Revisa el nombre, el correo y la empresa.";
  if (status === 429) return "Demasiados intentos seguidos. Espera un minuto y vuelve a probar.";
  return "No hemos podido enviar la solicitud. Inténtalo de nuevo en unos minutos.";
}

export default function PymeDigitalSimulador() {
  const [seleccion, setSeleccion] = useState<ModuloId[]>(["asistente", "automatizacion"]);
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);

  const calculo = useMemo(() => calcularSeleccion(seleccion), [seleccion]);
  const elegidos = MODULOS.filter((m) => seleccion.includes(m.id));

  function toggle(id: ModuloId) {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nota = (data.message ?? "").trim();
    const fase = (data.fase ?? "").trim();

    const resumen = [
      "[Pyme Digital]",
      `Módulos: ${elegidos.length ? elegidos.map((m) => `${m.nombre} (${formatEur(precioModuloCents(m))})`).join(", ") : "ninguno marcado"}`,
      `Facturado: ${formatEur(calculo.facturadoCents)} · Ayuda estimada: ${formatEur(calculo.ayudaCents)} · Neto: ${formatEur(calculo.netoCents)}`,
      `Situación: ${fase || "sin indicar"}`,
      nota ? `Nota: ${nota}` : "",
      `Simulador v${PYME_DIGITAL_VERSION}`,
    ]
      .filter(Boolean)
      .join("\n");

    setEstado("enviando");
    setError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hp_confirm: data.hp_confirm ?? "",
          name: data.name ?? "",
          email: data.email ?? "",
          company: data.company ?? "",
          city: data.camara ?? "",
          budget: formatEur(calculo.facturadoCents),
          message: resumen,
          source: SOURCE,
        }),
        signal: controller.signal,
      });

      if (res.ok) {
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "generate_lead", lead_source: "Pyme_Digital", modules_count: elegidos.length });
        setEstado("ok");
        form.reset();
        return;
      }

      setError(mensajeDeError(res.status));
      setEstado("idle");
    } catch {
      setError("No hemos podido enviar el formulario. Escríbenos a info@iaoperators.com.");
      setEstado("idle");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <div className="pd-sim">
      <fieldset className="pd-sim-picker">
        <legend className="ed-eyebrow">1. Marca los módulos que te interesan</legend>
        {MODULOS.map((m) => {
          const checked = seleccion.includes(m.id);
          return (
            <label key={m.id} className={`pd-sim-option${checked ? " is-checked" : ""}`}>
              <input type="checkbox" checked={checked} onChange={() => toggle(m.id)} />
              <span className="pd-sim-option-text">
                <span className="pd-sim-option-name">{m.nombre}</span>
                <span className="pd-sim-option-item">Ítem {m.item}</span>
              </span>
              <span className="pd-sim-option-price">{formatEur(precioModuloCents(m))}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="pd-sim-result" aria-live="polite">
        <p className="ed-eyebrow">2. Lo que pagarías</p>
        {seleccion.length === 0 ? (
          <p className="pd-sim-empty">Marca al menos un módulo para ver el cálculo.</p>
        ) : (
          <>
            <dl className="pd-sim-figures">
              <div>
                <dt>Facturado, sin IVA</dt>
                <dd>{formatEur(calculo.facturadoCents, true)}</dd>
              </div>
              <div>
                <dt>Ayuda estimada</dt>
                <dd>− {formatEur(calculo.ayudaCents, true)}</dd>
              </div>
              <div className="pd-sim-net">
                <dt>Coste neto para tu empresa</dt>
                <dd>
                  {formatEur(calculo.netoCents, true)}
                  <small>{String(calculo.netoPct).replace(".", ",")} % de lo facturado</small>
                </dd>
              </div>
            </dl>
            <p className="pd-sim-note">
              Adelantas {formatEur(calculo.adelantoConIvaCents)} con IVA ({PYME_DIGITAL_RULES.vatPct} %) y la Cámara te
              ingresa la ayuda después de justificar. El IVA no es subvencionable, pero normalmente se recupera en la
              declaración.
            </p>
            {calculo.superaTope && (
              <p className="pd-sim-warn" role="note">
                Pasas de {formatEur(PYME_DIGITAL_RULES.maxDirectCents)}: la ayuda no sube de{" "}
                {formatEur(PYME_DIGITAL_RULES.maxAidCents)}, así que cada euro de más lo pagas entero.
              </p>
            )}
          </>
        )}
      </div>

      <div className="pd-sim-form" id="propuesta">
        <p className="ed-eyebrow">3. Pide la propuesta</p>
        {estado === "ok" ? (
          <div className="ct-success" role="status">
            <h3>Recibido. Te escribiremos con la propuesta.</h3>
            <p>
              Te enviaremos la propuesta con los módulos que has marcado, desglosada como pide la Cámara, y las
              preguntas que necesitemos para ajustarla.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="ct-fields" aria-label="Solicitud de propuesta Pyme Digital">
            <input
              type="text"
              name="hp_confirm"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              data-lpignore="true"
              data-1p-ignore="true"
              className="ct-hp"
            />
            <div className="ct-row">
              <label className="ct-field">
                <span className="ed-eyebrow">Nombre *</span>
                <input required name="name" type="text" autoComplete="name" placeholder="Tu nombre" />
              </label>
              <label className="ct-field">
                <span className="ed-eyebrow">Correo *</span>
                <input required name="email" type="email" autoComplete="email" placeholder="tu@empresa.com" />
              </label>
            </div>
            <label className="ct-field">
              <span className="ed-eyebrow">Empresa *</span>
              <input required name="company" type="text" autoComplete="organization" placeholder="Nombre de la empresa" />
            </label>
            <div className="ct-row">
              <label className="ct-field">
                <span className="ed-eyebrow">Cámara de Comercio</span>
                <select name="camara" defaultValue="">
                  <option value="" disabled>
                    Elige tu Cámara
                  </option>
                  {CAMARAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ct-field">
                <span className="ed-eyebrow">¿En qué punto estás?</span>
                <select name="fase" defaultValue="">
                  <option value="" disabled>
                    Elige una opción
                  </option>
                  {FASES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="ct-field">
              <span className="ed-eyebrow">¿Algo que debamos saber? (opcional)</span>
              <textarea
                name="message"
                rows={3}
                placeholder="Por ejemplo: qué dice tu plan de implantación, qué herramientas usáis o si ya recibisteis el Kit Digital."
              />
            </label>
            {error && (
              <p className="ct-error" role="alert">
                {error}
              </p>
            )}
            <div className="ct-submit">
              <button type="submit" className="ed-button" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Enviando…" : "Quiero la propuesta"}
                <span className="ed-arrow" aria-hidden="true">↗</span>
              </button>
              <p className="ct-sla">
                Usamos tus datos solo para preparar la propuesta. <a href="/es/politica-de-privacidad/">Política de privacidad</a>.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
