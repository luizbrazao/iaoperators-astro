// Formulario para pedir un nuevo enlace de acceso a RGPD Ops. La respuesta
// del servidor es la misma exista o no la compra (no enumerable).
import { useRef, useState, type FormEvent } from "react";

export default function RgpdAccessRequest({ title = "Pide tu enlace de acceso" }: { title?: string }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hp = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/rgpd-ops/request-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, hp_confirm: hp.current?.value ?? "" }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
      if (!res.ok) setError(data?.error ?? "No se pudo enviar la solicitud.");
      else setMessage(data?.message ?? "Solicitud recibida.");
    } catch {
      setError("Fallo de conexión. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="vk-request">
      <p className="ed-eyebrow">Acceso a RGPD Ops</p>
      <p className="vk-offer-title">{title}</p>
      <p className="vk-note" style={{ marginTop: 8 }}>
        Escribe el email que usaste al comprar. Te enviaremos un enlace de un solo uso. Tu espacio se guarda en el
        servidor: puedes entrar desde cualquier dispositivo.
      </p>
      <form onSubmit={submit}>
        <label className="vk-field">
          <span>Email de la compra</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="tu@empresa.com" />
        </label>
        <input
          ref={hp}
          type="text"
          name="hp_confirm"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-lpignore="true"
          data-1p-ignore="true"
          style={{ display: "none" }}
        />
        <button type="submit" className="ed-button" disabled={sending} aria-busy={sending}>
          {sending ? "Enviando…" : "Enviarme el enlace"}
          <span className="ed-arrow" aria-hidden="true">↗</span>
        </button>
      </form>
      {message && (
        <p className="vk-status" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="vk-error" role="alert" style={{ marginTop: 14 }}>
          {error}
        </p>
      )}
    </div>
  );
}
