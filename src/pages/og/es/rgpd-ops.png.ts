import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createSurveyOGElement, getOGFonts } from "@/lib/og-image";
import { RGPD_OPS_PRODUCT as P } from "@/data/rgpd-ops";

// Imagen del producto: og:image de la landing y `image` del schema Product
// (obligatorio para fichas de comerciante en Google). Lee de RGPD_OPS_PRODUCT
// para que precio y nombre no se desincronicen.
export const GET: APIRoute = async () => {
  const fonts = await getOGFonts();
  const element = createSurveyOGElement({
    eyebrow: `Herramienta online · ${P.price.displayFull}`,
    title: P.name,
    subtitle: P.tagline,
    kicker: "Protección de datos",
    footer: "Tratamientos, proveedores, solicitudes, incidentes y evidencias",
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
