import rss from "@astrojs/rss";
import { fetchBlogPosts } from "../../lib/blog";

export async function GET() {
  const posts = await fetchBlogPosts("es");

  return rss({
    title: "IA Operators (ES) — Blog",
    description: "Novedades y guías prácticas de IA y automatización.",
    site: "https://iaoperators.com",
    items: posts.map((p) => ({
      title: p.title,
      description: p.metaDescription ?? "",
      link: `/es/blog/${p.slug}/`,
      pubDate: new Date(p.date),
    })),
  });
}
