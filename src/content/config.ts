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
  "compliance",
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
    // Título para compartir en redes (og:title / twitter:title). Opcional: si no
    // se define se usa `seoTitle` y, en su defecto, `title`. Permite un gancho
    // social distinto del <title> del SERP sin tocar el H1.
    ogTitle: z.string().optional(),
    category: z.enum(CATEGORY_KEYS).default("others"),
    articleSection: z.string().optional(),
    date: z.coerce.date(),
    image: z.string().optional(),
    cover: z.string().optional(),
    imageSchema: z.array(z.string()).optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
    imageSrcset: z.string().optional(),
    // Srcsets en formatos modernos. Si se definen, la portada se sirve dentro de
    // un <picture> con AVIF → WebP → PNG/JPEG. Si no, se mantiene el <img> simple.
    imageSrcsetAvif: z.string().optional(),
    imageSrcsetWebp: z.string().optional(),
    imageSizes: z.string().optional(),
    imageAlt: z.string().optional(),
    // Pasa la portada por el pipeline de imágenes de Astro (astro:assets):
    // genera AVIF/WebP en 480/768/1200 y las sirve desde nuestro dominio.
    // Requiere que el host remoto esté autorizado en `image.domains`
    // (astro.config.mjs). Por defecto `false`: la portada se sirve tal cual.
    optimizeImage: z.boolean().default(false),
    // Imagen dedicada 1200x630 para Open Graph. Si no existe, se usa `image` y,
    // en su defecto, la tarjeta OG generada en /og/{locale}/{slug}.png.
    ogImage: z.string().optional(),
    ogImageWidth: z.number().optional(),
    ogImageHeight: z.number().optional(),
    // Entidades principales del artículo, para schema.org `about`.
    about: z
      .array(
        z.object({
          type: z
            .enum(["Thing", "Organization", "Person", "Place", "SoftwareApplication"])
            .default("Thing"),
          name: z.string(),
        }),
      )
      .optional(),
    // Bio del autor mostrada al final del artículo. Si no se define, se usa el
    // texto por defecto del layout.
    authorBio: z.string().optional(),
    tags: z.array(z.string()).optional(),
    locale: z.enum(["es", "pt", "en"]),
    // Posts relacionados elegidos a mano (slugs del mismo idioma, sin barras).
    // Se muestran primero; el resto de huecos se completa por relevancia.
    // Un slug inexistente rompe el build a propósito, para no publicar enlaces
    // internos rotos.
    related: z.array(z.string()).optional(),
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
    // Bloque CTA al final del post. Sin estos campos se usa el CTA genérico
    // del template; definirlos permite alinear la llamada a la acción con el
    // tema del artículo sin tocar el resto del blog.
    ctaTitle: z.string().optional(),
    ctaText: z.string().optional(),
    ctaPrimaryLabel: z.string().optional(),
    // Ruta interna (p. ej. "/es/auditoria-de-sistemas/"). Debe existir.
    ctaPrimaryHref: z.string().optional(),
  }),
});

export const collections = { blog };
