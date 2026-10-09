// Formulario de aviso de la página /es/bono-ia/. Reutiliza /api/contact
// (mismo honeypot `hp_confirm`, mismo envío por Resend) y se distingue por
// `source: "bono-ia-aviso"`, que llega en el correo del lead.
// Marcado ct-* de editorial-pages.css, igual que ContactForm variant="editorial".

import { useState, type FormEvent } from "react";

type Estado = "idle" | "enviando" | "ok";

const SOURCE = "bono-ia-aviso";

function mensajeDeError(status: number): string {
  if (status === 400) return "Revisa el nombre, el correo y la empresa.";
  if (status === 429) return "Demasiados intentos seguidos. Espera un minuto y vuelve a probar.";
  return "No hemos podido guardar tu correo. Inténtalo de nuevo en unos minutos.";
}

export default function BonoIaAvisoForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nota = (data.message ?? "").trim();

    setEstado("enviando");
    setError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          message: nota
            ? `[Aviso bono IA] ${nota}`
            : "[Aviso bono IA] Quiere aviso cuando se publiquen las bases.",
          source: SOURCE,
        }),
        signal: controller.signal,
      });

      if (res.ok) {
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "generate_lead", lead_source: "Bono_IA_Aviso" });
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

  if (estado === "ok") {
    return (
      <div className="ct-success" role="status">
        <h3 id="msg-sucesso-lead">Apuntado. Te escribiremos cuando haya bases.</h3>
        <p>
          Solo un correo cuando se publique algo oficial, con lo que exige y si encaja con lo que nos
          has contado.
        </p>
      </div>
    );
  }

  return (
    <div className="ct-form">
      <form onSubmit={onSubmit} className="ct-fields" aria-label="Aviso del bono IA">
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
        <label className="ct-field">
          <span className="ed-eyebrow">¿Qué proceso te gustaría mejorar con IA? (opcional)</span>
          <textarea
            name="message"
            rows={3}
            placeholder="Por ejemplo: responder consultas de clientes, procesar facturas, preparar presupuestos…"
          />
        </label>
        {error && (
          <p className="ct-error" role="alert">
            {error}
          </p>
        )}
        <div className="ct-submit">
          <button type="submit" className="ed-button" disabled={estado === "enviando"}>
            {estado === "enviando" ? "Enviando…" : "Quiero el aviso"}
            <span className="ed-arrow" aria-hidden="true">↗</span>
          </button>
          <p className="ct-sla">
            Usamos tus datos solo para este aviso. <a href="/es/politica-de-privacidad/">Política de privacidad</a>.
          </p>
        </div>
      </form>
    </div>
  );
}
