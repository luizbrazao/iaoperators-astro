import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createDefaultOGElement, getOGFonts } from "@/lib/og-image";

export const GET: APIRoute = async () => {
  const fonts = await getOGFonts();
  const element = createDefaultOGElement();

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
