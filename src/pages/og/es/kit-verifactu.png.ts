import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createSurveyOGElement, getOGFonts } from "@/lib/og-image";
import { KIT_PRODUCT as P } from "@/data/verifactu-kit";

// Imagen del producto: og:image de la landing y `image` del schema Product
// (obligatorio para fichas de comerciante en Google). Lee de KIT_PRODUCT para
// que precio y nombre no se desincronicen.
export const GET: APIRoute = async () => {
  const fonts = await getOGFonts();
  const element = createSurveyOGElement({
    eyebrow: `Producto digital · ${P.price.displayFull}`,
    title: P.shortName,
    subtitle: "Para autónomos y pymes: qué te aplica, qué pedir a tu proveedor y qué documentos conservar.",
    kicker: "Kit de preparación",
    footer: "VERI*FACTU · Reglamento de sistemas de facturación",
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
