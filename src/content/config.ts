import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const CATEGORY_KEYS = [
  "tools",
  "lawyers",
  "architects",
  "accounting",
  "restaurants",
  "beauty-salons",
  "others",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORY_KEYS).default("others"),
    articleSection: z.string().optional(),
    date: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    locale: z.enum(["es", "pt", "en"]),
    translationKey: z.string().optional(),
    draft: z.boolean().default(false),
    author: z.string().default("IA Operators"),
    authorTitle: z.string().optional(),
    updatedAt: z.coerce.date().optional(),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
  }),
});

export const collections = { blog };
