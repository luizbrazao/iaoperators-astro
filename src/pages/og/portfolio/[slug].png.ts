import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createSurveyOGElement, getOGFonts } from "@/lib/og-image";
import { projects } from "@/data/projects";
import projectsEs from "@/i18n/locales/es/projects.json";

// og:image de las fichas del portfolio que no tienen imagen propia publicable.
// Solo se generan las que la declaran con ruta /og/portfolio/<slug>.png en
// projects.ts, así que el resto de casos no cambia. Texto en ES: la imagen es
// la misma para los tres idiomas (igual que las demás og:image del sitio).
const PREFIX = "/og/portfolio/";
type CaseCopy = { title: string; subtitle?: string; category: string; sheet?: { stack?: string } };

export const getStaticPaths: GetStaticPaths = () =>
  projects
    .filter((p) => p.ogImage?.startsWith(PREFIX))
    .map((p) => {
      const caseKey = p.titleKey.replace(/^projects:/, "").replace(/\.title$/, "");
      const copy = (projectsEs as unknown as Record<string, CaseCopy>)[caseKey];
      return {
        params: { slug: p.ogImage!.slice(PREFIX.length).replace(/\.png$/, "") },
        props: { copy },
      };
    });

export const GET: APIRoute = async ({ props }) => {
  const { copy } = props as { copy: CaseCopy };
  const fonts = await getOGFonts();
  const element = createSurveyOGElement({
    eyebrow: copy.category,
    title: copy.title,
    subtitle: copy.subtitle ?? "",
    kicker: "Portfolio",
    footer: copy.sheet?.stack ?? "IA Operators",
  });
  const svg = await satori(element, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
