// Botón de compra de RGPD Ops. Solo envía el responseId del diagnóstico (si
// existe); el servidor decide precio, impuestos y producto.
import { useEffect, useState } from "react";
import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { pushRgpdOpsEvent, readRgpdAssessmentContext } from "@/lib/rgpd-ops/analytics";

interface Props {
  label?: string;
  /** Solo una instancia por página debe emitir view_item. */
  trackView?: boolean;
}

export default function RgpdCheckoutButton({ label = `Comprar ${RGPD_OPS_PRODUCT.name} · ${RGPD_OPS_PRODUCT.price.displayFull}`, trackView = false }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const P = RGPD_OPS_PRODUCT;

  useEffect(() => {
    if (!trackView) return;
    const ctx = readRgpdAssessmentContext();
    pushRgpdOpsEvent("view_item", { segment: ctx.seg, maturity_level: ctx.lvl, risk_level: ctx.risk, value: P.price.amount, currency: P.price.currency });
  }, [trackView]);

  async function buy() {
    setSending(true);
    setError(null);
    const ctx = readRgpdAssessmentContext();
    pushRgpdOpsEvent("begin_checkout", { segment: ctx.seg, maturity_level: ctx.lvl, risk_level: ctx.risk, value: P.price.amount, currency: P.price.currency });
    try {
      const res = await fetch("/api/rgpd-ops/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responseId: ctx.rid ?? null }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string; code?: string } | null;
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "No pudimos iniciar el pago. Inténtalo de nuevo.");
        pushRgpdOpsEvent("checkout_error", { error_code: data?.code ?? `http_${res.status}` });
        setSending(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Fallo de conexión. Inténtalo de nuevo.");
      pushRgpdOpsEvent("checkout_error", { error_code: "network" });
      setSending(false);
    }
  }

  return (
    <div className="vk-buy">
      <button type="button" className="ed-button" onClick={buy} disabled={sending} aria-busy={sending}>
        {sending ? "Abriendo el pago seguro…" : label}
        <span className="ed-arrow" aria-hidden="true">↗</span>
      </button>
      {error && (
        <p className="vk-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
