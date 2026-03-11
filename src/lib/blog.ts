/**
 * blog.ts — Local blog data layer (Astro Content Collections)
 *
 * Replaces Airtable integration. Posts live in src/content/blog/{locale}/*.md
 * Schema is defined and validated in src/content/config.ts (Zod).
 *
 * Build-time validation: if a required field is missing or wrong type,
 * the build fails early with a clear error message from Astro/Zod.
 */

import { getCollection, type CollectionEntry } from "astro:content";

// ─── Public types ──────────────────────────────────────────────────────────

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string; // ISO 8601
  imageUrl?: string;
  description?: string;
  locale?: "es" | "pt" | "en";
  faq?: { q: string; a: string }[];
  author?: string;
};

export type BlogLocale = "es" | "pt" | "en";

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Extracts the URL slug from a content collection entry id.
 * Entry id format (glob loader): "{locale}/{slug}" (extension already stripped by Astro).
 */
function entrySlug(entry: CollectionEntry<"blog">, locale: BlogLocale): string {
  return entry.id
    .replace(`${locale}/`, "")
    .replace(/\.(md|mdx)$/, ""); // safety strip in case loader keeps extension
}

function entryToPost(entry: CollectionEntry<"blog">, locale: BlogLocale): BlogPost {
  return {
    id: entry.id,
    slug: entrySlug(entry, locale),
    title: entry.data.title,
    category: entry.data.category,
    date: entry.data.date.toISOString(),
    imageUrl: entry.data.image,
    description: entry.data.description,
    locale: entry.data.locale,
    faq: entry.data.faq,
    author: entry.data.author,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Returns all published posts for a locale, sorted by date descending.
 * Drafts (draft: true) are excluded automatically.
 */
export async function fetchBlogPosts(locale: BlogLocale = "es"): Promise<BlogPost[]> {
  const entries = await getCollection("blog", ({ id, data }) => {
    if (data.draft) return false;
    return id.startsWith(`${locale}/`);
  });

  return entries
    .map((entry) => entryToPost(entry, locale))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Returns the raw Content Collection entry for a slug + locale.
 * Use this when you need to call render() to get the <Content /> component.
 */
export async function fetchBlogEntry(
  slug: string,
  locale: BlogLocale = "es",
): Promise<CollectionEntry<"blog"> | null> {
  const entries = await getCollection("blog", ({ id, data }) => {
    if (data.draft) return false;
    return id.startsWith(`${locale}/`);
  });

  return entries.find((entry) => entrySlug(entry, locale) === slug) ?? null;
}

/** Returns just the slugs for a locale (used for getStaticPaths etc.) */
export async function fetchBlogSlugs(locale: BlogLocale = "es"): Promise<string[]> {
  const posts = await fetchBlogPosts(locale);
  return posts.map((p) => p.slug);
}

/** @deprecated Use fetchBlogEntry + render() for the full post page. */
export async function fetchBlogPostBySlug(
  slug: string,
  locale: BlogLocale = "es",
): Promise<BlogPost | null> {
  const entry = await fetchBlogEntry(slug, locale);
  return entry ? entryToPost(entry, locale) : null;
}
