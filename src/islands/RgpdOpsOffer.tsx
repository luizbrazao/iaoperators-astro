// Siguiente paso tras el diagnóstico RGPD. La regla de qué se ofrece vive en
// src/lib/rgpd-ops/segment.ts (la misma que usa el email del informe). El
// resultado gratuito ya se ha mostrado completo arriba: esto no lo recorta.
import { RGPD_OPS_PRODUCT } from "@/data/rgpd-ops";
import { rgpdOfferFor, rgpdSegment } from "@/lib/rgpd-ops/segment";
import { pushRgpdOpsEvent, saveRgpdAssessmentContext } from "@/lib/rgpd-ops/analytics";
import type { AssessmentResult } from "@/lib/assessment/types";

interface Props {
  result: AssessmentResult;
  responseId: string | null;
}

export default function RgpdOpsOffer({ result, responseId }: Props) {
  const mode = rgpdOfferFor(result);
  const segment = rgpdSegment(result);
  const P = RGPD_OPS_PRODUCT;
  const toOps = () =>
    saveRgpdAssessmentContext({ rid: responseId ?? undefined, seg: segment, lvl: result.maturity?.level, risk: result.riskLevel });
  const toReview = () => pushRgpdOpsEvent("review_cta_clicked", { segment, maturity_level: result.maturity?.level, risk_level: result.riskLevel });

  const opsLink = (
    <a className={mode === "ops-primary" ? "ed-button" : "ed-underlined"} href={P.paths.landing} onClick={toOps}>
      {mode === "ops-primary" ? `Ver ${P.name} · ${P.price.displayFull}` : `${P.name} como herramienta de apoyo`}
      <span className="ed-arrow" aria-hidden="true">↗</span>
    </a>
  );
  const reviewLink = (
    <a className={mode === "review-primary" ? "ed-button" : "ed-underlined"} href={P.paths.revision} onClick={toReview}>
      Solicitar una revisión profesional<span className="ed-arrow" aria-hidden="true">↗</span>
    </a>
  );

  if (mode === "review-primary") {
    return (
      <section className="vk-offer ro-offer" aria-labelledby="ro-offer-title">
        <p className="ed-eyebrow">Siguiente paso</p>
        <p id="ro-offer-title" className="vk-offer-title">
          Empieza por una revisión profesional de tu caso
        </p>
        <p>
          Tus respuestas incluyen señales que una herramienta operativa no resuelve sola. Una revisión
          especializada te dirá qué análisis necesitas y en qué orden. Después, {P.name} puede servir para
          mantener el trabajo organizado.
        </p>
        <div className="vk-offer-actions">
          {reviewLink}
          {opsLink}
        </div>
      </section>
    );
  }

  return (
    <section className="vk-offer ro-offer" aria-labelledby="ro-offer-title">
      <p className="ed-eyebrow">Siguiente paso · herramienta operativa</p>
      <p id="ro-offer-title" className="vk-offer-title">
        Organiza la operación con {P.name}
      </p>
      <p>
        El trabajo que te falta no es redactar un documento: es mantener al día tratamientos, proveedores,
        avisos, solicitudes, incidentes y tareas, con fechas y evidencias.
      </p>
      <ul>
        <li>Mapa de tratamientos con borrador de registro de actividades exportable.</li>
        <li>Proveedores con contrato, ubicación y próxima revisión.</li>
        <li>Solicitudes y incidentes con plazos orientativos, y revisión trimestral guiada.</li>
      </ul>
      <div className="vk-offer-actions">
        {opsLink}
        {reviewLink}
      </div>
      <p className="vk-note" style={{ marginTop: 14 }}>
        {P.price.displayFull} · pago único · {P.accessMonths} meses de acceso. Herramienta operativa: no
        constituye asesoramiento jurídico ni certifica el cumplimiento.
      </p>
    </section>
  );
}
