import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createSurveyOGElement, getOGFonts } from "@/lib/og-image";

export const GET: APIRoute = async () => {
  const fonts = await getOGFonts();
  const element = createSurveyOGElement({
    eyebrow: "Exploratory study 2026",
    title: "The Second Bill of AI 2026",
    subtitle:
      "Survey on AI use at work, exposure of internal information and vendor dependency.",
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
