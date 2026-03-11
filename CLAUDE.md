# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Build production site to ./dist/
npm run preview    # Preview production build locally
```

## Architecture

**Stack:** Astro 5 + React 19 (islands) + Tailwind CSS v4 + Vercel (static output)

**Multilingual (i18n):** 3 locales — `es` (default), `en`, `pt`. All routes are prefixed: `/es/`, `/en/`, `/pt/`. The root `/` redirects to `/es/`. Translation files live in `src/i18n/locales/<locale>/<namespace>.json`. There are two translation utilities:
- `src/i18n/ui.ts` — exports `ui[locale][namespace]` dict and `t(locale, namespace, path)` for Astro components
- `src/i18n/t.ts` — exports `createT(locale, options)` for async usage with `ns:key` syntax

**Page routing:**
- `src/pages/[locale]/` — locale-parameterized routes (blog, portfolio, contact, legal pages)
- `src/pages/en/`, `src/pages/es/`, `src/pages/pt/` — locale home pages and RSS feeds
- `src/pages/api/contact.ts` — contact form API endpoint

**Component pattern:** Static UI in `.astro` components; interactive UI in `src/islands/` as React components (`.jsx`/`.tsx`) hydrated as Astro islands (`client:load`, `client:visible`, etc.).

**Layouts:** `src/layouts/BaseLayout.astro` is the master layout handling SEO meta tags (OpenGraph, Twitter Card, JSON-LD), dark mode, and font loading.

**Home page sections:** Reusable Astro components in `src/sections/home/` (Hero, Services, WhyUs, FAQ, Testimonial, BlogSection) composed in `src/pages/_home.astro`.

**Path alias:** `@/` maps to `src/` (configured in both `tsconfig.json` and `astro.config.mjs`).

**Adding translations:** Add/update JSON files in `src/i18n/locales/<locale>/<namespace>.json`. New namespaces are auto-loaded via `import.meta.glob`. Register new namespaces in `src/i18n/ui.ts` under the `ui` object if used via the `ui` compat layer.

## Blog (Content Collections — 100% local, no external CMS)

Posts live in `src/content/blog/<locale>/<slug>.md`. The schema is in `src/content/config.ts` (Zod-validated at build time).

**To create a new post:**

```bash
# Create the file (replace locale and slug as needed)
touch src/content/blog/es/mi-nuevo-post.md
```

Required frontmatter fields:

```yaml
---
title: "Título del post"
description: "Meta description — 120-160 chars, used for SEO and blog cards"
category: restaurants   # one of: tools | lawyers | architects | accounting | restaurants | others
date: 2025-06-01        # YYYY-MM-DD
locale: es              # es | pt | en
---
```

Optional frontmatter fields:

```yaml
image: /blog/my-image.jpg   # relative to public/ or absolute URL
draft: true                 # hides from listing and build (default: false)
author: "IA Operators"      # defaults to "IA Operators"
faq:                        # renders as collapsible FAQ + FAQPage JSON-LD
  - q: "Question?"
    a: "Answer."
```

**Validation:** Run `npm run build` — Zod schema errors surface immediately with file path and field name. No post with missing required fields will build.

**Data flow:**
- `src/lib/blog.ts` — public API (`fetchBlogPosts`, `fetchBlogEntry`, `fetchBlogSlugs`)
- `src/pages/[locale]/blog/index.astro` — listing page (calls `fetchBlogPosts`)
- `src/pages/[locale]/blog/[slug].astro` — detail page (calls `fetchBlogEntry` + `render()`)
- `src/sections/home/BlogSection.astro` — homepage preview (receives posts as props from `_home.astro`)
- `src/pages/[locale]/rss.xml.ts` — RSS feed (calls `fetchBlogPosts`)

**SEO per post:** `BlogPosting` + `BreadcrumbList` JSON-LD generated automatically. Add `faq` frontmatter to also get `FAQPage` JSON-LD. Canonical, OG, hreflang — all handled by `BaseLayout.astro`.

**Images:** Place images in `public/blog/` and reference as `/blog/filename.jpg`. Alternatively use an external URL.
