import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://iaoperators.com",

  // "static" com adapter: páginas são pré-geradas, mas endpoints
  // com prerender=false (ex: /api/contact) correm como Vercel Functions.
  output: "static",
  adapter: vercel(),

  integrations: [
    sitemap({
      serialize(item) {
        return {
          ...item,
          lastmod: new Date().toISOString().split("T")[0],
        };
      },
    }),
    react(),
  ],

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
    "/es/blog/ia-local-privada-sem-mensalidade-qwen-pc/":
      "/es/blog/ia-local-privada-sin-mensualidad-qwen-pc/",
    "/pt/blog/ia-local-privada-sem-mensalidade-qwen-pc/":
      "/pt/blog/como-rodar-modelos-qwen-no-seu-pc/",
    "/en/blog/ia-local-privada-sem-mensalidade-qwen-pc/":
      "/en/blog/run-qwen-models-locally-on-your-pc/",
  },
});
