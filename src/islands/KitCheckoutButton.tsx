// Botón de compra del Kit. Solo envía el responseId del test (si existe); el
// servidor decide precio, impuestos y producto.
import { useEffect, useState } from "react";
import { KIT_PRODUCT } from "@/data/verifactu-kit";
import { pushKitEvent, readAssessmentContext } from "@/lib/verifactu-kit/analytics";

interface Props {
  label?: string;
  /** Solo una instancia por página debe emitir view_item. */
  trackView?: boolean;
}

export default function KitCheckoutButton({ label = `Comprar el Kit · ${KIT_PRODUCT.price.displayFull}`, trackView = false }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackView) return;
    const ctx = readAssessmentContext();
    pushKitEvent("view_item", { assessment_segment: ctx.seg, risk_level: ctx.risk, value: KIT_PRODUCT.price.amount, currency: KIT_PRODUCT.price.currency });
  }, [trackView]);

  async function buy() {
    setSending(true);
    setError(null);
    const ctx = readAssessmentContext();
    pushKitEvent("begin_checkout", { assessment_segment: ctx.seg, risk_level: ctx.risk, value: KIT_PRODUCT.price.amount, currency: KIT_PRODUCT.price.currency });
    try {
      const res = await fetch("/api/verifactu-kit/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responseId: ctx.rid ?? null }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string; code?: string } | null;
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "No pudimos iniciar el pago. Inténtalo de nuevo.");
        pushKitEvent("checkout_error", { error_code: data?.code ?? `http_${res.status}` });
        setSending(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Fallo de conexión. Inténtalo de nuevo.");
      pushKitEvent("checkout_error", { error_code: "network" });
      setSending(false);
    }
  }

  return (
    <div className="vk-buy">
      <button type="button" className="ed-button" onClick={buy} disabled={sending}>
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
