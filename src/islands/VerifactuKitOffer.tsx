// Siguiente paso tras el resultado del test de Verifactu. La regla de qué se
// ofrece vive en src/lib/verifactu-kit/segment.ts (la misma que usa el email).
// El resultado gratuito ya se ha mostrado completo arriba: esto no lo recorta.
import { KIT_PRODUCT } from "@/data/verifactu-kit";
import { kitOfferFor } from "@/lib/verifactu-kit/segment";
import { pushKitEvent, saveAssessmentContext } from "@/lib/verifactu-kit/analytics";
import type { AssessmentResult } from "@/lib/assessment/types";

interface Props {
  result: AssessmentResult;
  responseId: string | null;
}

export default function VerifactuKitOffer({ result, responseId }: Props) {
  const mode = kitOfferFor(result);
  const ctx = { rid: responseId ?? undefined, seg: result.sector, risk: result.riskLevel };

  const toKit = () => saveAssessmentContext(ctx);
  const toAudit = () =>
    pushKitEvent("audit_cta_clicked", { assessment_segment: result.sector, risk_level: result.riskLevel });

  if (mode === "none") {
    return (
      <div className="vk-offer-free">
        <p className="ed-eyebrow">Qué hacer ahora</p>
        <p className="vk-offer-title">No necesitas contratar nada</p>
        <p>
          Guarda este resultado y confírmalo con tu asesoría, sobre todo si una parte de tu actividad
          no encaja del todo en la exclusión. Si tu situación cambia, vuelve a hacer el test.
        </p>
        <div className="vk-offer-actions">
          <a className="ed-underlined" href="/es/cumplimiento/verifactu/plazos/">
            Fechas vigentes y exclusiones <span className="ed-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    );
  }

  const kitLink = (
    <a className={mode === "kit-primary" ? "ed-button" : "ed-underlined"} href={KIT_PRODUCT.paths.landing} onClick={toKit}>
      {mode === "kit-primary" ? `Ver el Kit · ${KIT_PRODUCT.price.displayFull}` : `Kit de preparación · ${KIT_PRODUCT.price.displayFull}`}
      <span className="ed-arrow" aria-hidden="true">↗</span>
    </a>
  );
  const auditLink = (
    <a className={mode === "audit-primary" ? "ed-button" : "ed-underlined"} href={KIT_PRODUCT.paths.auditoria} onClick={toAudit}>
      Solicitar auditoría del sistema<span className="ed-arrow" aria-hidden="true">↗</span>
    </a>
  );

  if (mode === "kit-primary") {
    return (
      <section className="vk-offer" aria-labelledby="vk-offer-title">
        <p className="ed-eyebrow">Siguiente paso · producto digital</p>
        <p id="vk-offer-title" className="vk-offer-title">
          Prepárate con el {KIT_PRODUCT.shortName}
        </p>
        <p>
          Con software estándar u hojas de cálculo, el trabajo no es programar: es saber qué pedir a tu
          proveedor, ordenar cómo facturas y decidir con datos si te quedas, actualizas o cambias.
        </p>
        <ul>
          <li>Árbol «¿Me aplica?» y fechas vigentes, con el aplazamiento anunciado explicado.</li>
          <li>Preguntas y emails listos para tu proveedor y tu gestoría.</li>
          <li>Inventario de facturación, matriz de proveedores, dossier y plan de 30 días.</li>
        </ul>
        <div className="vk-offer-actions">
          {kitLink}
          {auditLink}
        </div>
        <p className="vk-note" style={{ marginTop: 14 }}>
          {KIT_PRODUCT.price.display} {KIT_PRODUCT.price.taxNote}. Orientativo: no emite facturas ni certifica el cumplimiento.
        </p>
      </section>
    );
  }

  return (
    <section className="vk-offer" aria-labelledby="vk-offer-title">
      <p className="ed-eyebrow">Siguiente paso</p>
      <p id="vk-offer-title" className="vk-offer-title">
        Tu caso pide una auditoría técnica del sistema
      </p>
      <p>
        Con tu sistema ({result.sectorLabel}), la adaptación pasa por el propio sistema: puntos de
        emisión, series, vía de integración y modalidad. La auditoría dura de tres a cinco días y sale con el
        alcance cerrado.
      </p>
      <div className="vk-offer-actions">
        {auditLink}
        {kitLink}
      </div>
      <p className="vk-note" style={{ marginTop: 14 }}>
        Si antes quieres ordenar la documentación y las preguntas a tu proveedor, el Kit te sirve como
        preparación. No sustituye la auditoría.
      </p>
    </section>
  );
}
