import rss from "@astrojs/rss";
import { fetchBlogPosts } from "../../lib/blog";

export async function GET() {
  const posts = await fetchBlogPosts("pt");

  return rss({
    title: "IA Operators (PT) — Blog",
    description: "Notícias e guias práticos sobre IA e automação.",
    site: "https://iaoperators.com",
    items: posts.map((p) => ({
      title: p.title,
      description: p.metaDescription ?? "",
      link: `/pt/blog/${p.slug}/`,
      pubDate: new Date(p.date),
    })),
  });
}
