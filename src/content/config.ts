import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const CATEGORY_KEYS = [
  "tools",
  "lawyers",
  "architects",
  "accounting",
  "restaurants",
  "beauty-salons",
  "privacy",
  "others",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    // Título curto y optimizado para el <title> del SERP (<=60 chars). Opcional:
    // si no se define, se usa `title`. Evita títulos truncados en Google.
    seoTitle: z.string().optional(),
    description: z.string(),
    category: z.enum(CATEGORY_KEYS).default("others"),
    articleSection: z.string().optional(),
    date: z.coerce.date(),
    image: z.string().optional(),
    imageSchema: z.array(z.string()).optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
    imageSrcset: z.string().optional(),
    imageSizes: z.string().optional(),
    imageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    locale: z.enum(["es", "pt", "en"]),
    translationKey: z.string().optional(),
    draft: z.boolean().default(false),
    author: z.string().default("IA Operators"),
    authorTitle: z.string().optional(),
    authorUrl: z.string().optional(),
    authorSameAs: z.array(z.string()).optional(),
    updatedAt: z.coerce.date().optional(),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
    faqSchema: z.boolean().default(true),
  }),
});

export const collections = { blog };
