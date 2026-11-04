import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createSurveyOGElement, getOGFonts } from "@/lib/og-image";
import { PROBLEMA_PROGRAM as P } from "@/data/problema-resuelto";

// og:image de la landing del programa «Problema Resuelto». Generada en el
// build con el mismo marco que el resto.
export const GET: APIRoute = async () => {
  const fonts = await getOGFonts();
  const element = createSurveyOGElement({
    eyebrow: `Programa · Hasta ${P.monthlySlots} problemas al mes`,
    title: P.name,
    subtitle: "Cuéntanos la tarea que te roba horas. Si se resuelve con IA, la construimos gratis.",
    kicker: "IA Operators · España",
    footer: "Un problema · una solución que funciona · dos llamadas",
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
