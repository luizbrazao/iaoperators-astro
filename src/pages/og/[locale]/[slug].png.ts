import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getCollection } from "astro:content";
import {
  createBlogOGElement,
  getOGFonts,
  CATEGORY_LABELS,
} from "@/lib/og-image";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => {
    const [locale, ...rest] = post.id.split("/");
    const slug = rest.join("/").replace(/\.(md|mdx)$/, "");
    return {
      params: { locale, slug },
      props: {
        title: post.data.title,
        author: post.data.author ?? "IA Operators",
        category: post.data.category ?? "others",
        locale,
      },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, author, category, locale } = props as {
    title: string;
    author: string;
    category: string;
    locale: string;
  };

  const categoryLabel =
    CATEGORY_LABELS[locale]?.[category] ??
    CATEGORY_LABELS.en?.[category] ??
    "Blog";

  const fonts = await getOGFonts();

  const element = createBlogOGElement({ title, author, categoryLabel });

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
