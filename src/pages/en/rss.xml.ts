import rss from "@astrojs/rss";
import { fetchBlogPosts } from "../../lib/blog";

export async function GET() {
  const posts = (await fetchBlogPosts()).filter((p) => !p.locale || p.locale === "en");

  return rss({
    title: "IA Operators (EN) — Blog",
    description: "News and practical guides on AI and automation.",
    site: "https://iaoperators.com",
    items: posts.map((p) => ({
      title: p.title,
      description: p.metaDescription ?? "",
      link: `/en/blog/${p.slug}/`,
      pubDate: new Date(p.date),
    })),
  });
}
