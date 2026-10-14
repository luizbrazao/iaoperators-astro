import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createSurveyOGElement, getOGFonts } from "@/lib/og-image";
import { HOTEL_REVENUE_PRODUCT as P } from "@/data/hotel-revenue";

// og:image de la landing, la calculadora y la página de gracias del Hotel
// Revenue Operator. Generada en el build con el mismo marco que el resto.
export const GET: APIRoute = async () => {
  const fonts = await getOGFonts();
  const element = createSurveyOGElement({
    eyebrow: `Producto para hoteles · ${P.endorsement}`,
    title: P.name,
    subtitle: "Convierte conversaciones en reservas directas e ingresos adicionales para tu hotel.",
    kicker: "Programa piloto · España",
    footer: "Webchat · multilingüe · handoff humano · extras · atribución",
  });

  const svg = await satori(element, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
