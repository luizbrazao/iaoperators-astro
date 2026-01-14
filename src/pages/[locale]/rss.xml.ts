import rss from "@astrojs/rss";
import { fetchBlogPosts } from "../../lib/blog";

export async function getStaticPaths() {
  return ["es", "pt", "en"].map((locale) => ({ params: { locale } }));
}

export async function GET({ params }: { params: { locale: "es" | "pt" | "en" } }) {
  const locale = params.locale;

  const posts = await fetchBlogPosts(locale);

  const titleMap = {
    es: "IA Operators (ES) — Blog",
    pt: "IA Operators (PT) — Blog",
    en: "IA Operators (EN) — Blog",
  };

  const descMap = {
    es: "Ideas y guías prácticas de IA y automatización.",
    pt: "Ideias e guias práticos de IA e automação.",
    en: "Practical guides and ideas on AI & automation.",
  };

  return rss({
    title: titleMap[locale],
    description: descMap[locale],
    site: "https://iaoperators.com",
    items: posts.map((p) => ({
      title: p.title,
      description: p.metaDescription ?? "",
      link: `/${locale}/blog/${p.slug}/`,
      pubDate: new Date(p.date),
    })),
  });
}
