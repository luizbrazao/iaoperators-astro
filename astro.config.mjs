import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";
import vercel from "@astrojs/vercel";
import rehypeExternalLinks from "./src/lib/rehype-external-links.mjs";

export default defineConfig({
  site: "https://iaoperators.com",

  // "static" com adapter: páginas são pré-geradas, mas endpoints
  // com prerender=false (ex: /api/contact) correm como Vercel Functions.
  output: "static",
  adapter: vercel(),

  integrations: [
    sitemap({
      serialize(item) {
        const knownDates = {
          // Menorca hotel chain
          "https://iaoperators.com/es/portfolio/radiografia-cadena-hotelera-menorca/": "2025-04-10",
          "https://iaoperators.com/en/portfolio/hotel-chain-digital-audit-menorca/": "2025-04-10",
          "https://iaoperators.com/pt/portfolio/radiografia-rede-hoteleira-menorca/": "2025-04-10",
          // ChatPlug
          "https://iaoperators.com/es/portfolio/chatplug-whatsapp-altegio/": "2025-03-01",
          "https://iaoperators.com/en/portfolio/chatplug-whatsapp-altegio/": "2025-03-01",
          "https://iaoperators.com/pt/portfolio/chatplug-whatsapp-altegio/": "2025-03-01",
          // Tour booking
          "https://iaoperators.com/es/portfolio/chatbot-reservas-turisticas-whatsapp/": "2025-02-15",
          "https://iaoperators.com/en/portfolio/tourism-booking-chatbot-whatsapp/": "2025-02-15",
          "https://iaoperators.com/pt/portfolio/chatbot-reservas-turisticas-whatsapp/": "2025-02-15",
        };
        const knownDate = knownDates[item.url];
        if (knownDate) return { ...item, lastmod: knownDate };
        return item;
      },
    }),
    react(),
  ],

  // Enlaces externos del Markdown: nueva pestaña + rel seguro, sin nofollow.
  markdown: {
    rehypePlugins: [rehypeExternalLinks],
  },

  // Dominios remotos autorizados para el pipeline de imágenes de Astro
  // (astro:assets). Solo se optimizan las portadas con `optimizeImage: true`
  // en el frontmatter; el resto de posts sigue sirviendo la URL original.
  image: {
    domains: ["scribos.s3.us-east-1.amazonaws.com"],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },

  i18n: {
    locales: ["en", "es", "pt"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: true },
  },

  redirects: {
    "/": "/es/",
    "/sitemap.xml": "/sitemap-index.xml",
    // Portfolio slug redirects (old → new localized slugs)
    "/en/portfolio/radiografia-cadena-hotelera-menorca/": "/en/portfolio/hotel-chain-digital-audit-menorca/",
    "/pt/portfolio/radiografia-cadena-hotelera-menorca/": "/pt/portfolio/radiografia-rede-hoteleira-menorca/",
    "/en/portfolio/chatbot-reservas-turisticas-whatsapp/": "/en/portfolio/tourism-booking-chatbot-whatsapp/",
    "/es/blog/ia-local-privada-sem-mensalidade-qwen-pc/":
      "/es/blog/ia-local-privada-sin-mensualidad-qwen-pc/",
    "/pt/blog/ia-local-privada-sem-mensalidade-qwen-pc/":
      "/pt/blog/como-rodar-modelos-qwen-no-seu-pc/",
    "/en/blog/ia-local-privada-sem-mensalidade-qwen-pc/":
      "/en/blog/run-qwen-models-locally-on-your-pc/",
  },
});
