import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://iaoperators.com",

  // Astro v5: "hybrid" foi absorvido por "static".
  output: "static",
  adapter: vercel(),

  integrations: [sitemap(), react()],

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
