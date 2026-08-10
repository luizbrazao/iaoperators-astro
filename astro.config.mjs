import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";
import vercel from "@astrojs/vercel";
import rehypeExternalLinks from "./src/lib/rehype-external-links.mjs";

/**
 * Rutas excluidas del sitemap por declarar `noindex`.
 * Mantener sincronizado con los `robots="noindex..."` y los
 * `<meta name="robots" content="noindex...">` de `src/pages`.
 */
const NOINDEX_PATHS = [
  // Panel interno
  "/es/admin/",
  // Páginas de "gracias" de la encuesta Segunda Factura IA
  "/estudio/segunda-factura-ia/encuesta/gracias/",
  // Propuestas comerciales privadas
  "/marfa-fase-2/",
  "/propuesta-kpmg/",
  "/propuesta-automatizacion-ia/",
  "/es/proposta-technical-partner/",
  "/pablo-tovar/",
  "/sandra-g-design/",
  "/salones-lume/",
  "/salao-malaga/",
  "/rapiplaga/",
  "/recepcionista-virtual/",
  "/asistente-ia-apartamentos-turisticos/",
  "/roadmap-datadicoco/",
  "/agencia-lanza-ghl/",
  "/desafio-de-60-dias/",
];

export default defineConfig({
  site: "https://iaoperators.com",

  // "static" com adapter: páginas são pré-geradas, mas endpoints
  // com prerender=false (ex: /api/contact) correm como Vercel Functions.
  output: "static",
  adapter: vercel(),

  integrations: [
    sitemap({
      // Páginas con `noindex` (propuestas privadas, panel de administración y
      // páginas de "gracias" de las encuestas) no deben aparecer en el sitemap:
      // enviar a Google una URL que luego le pedimos no indexar es una señal
      // contradictoria. La lista se corresponde una a una con los archivos de
      // `src/pages` que declaran `noindex`.
      filter: (page) => !NOINDEX_PATHS.some((path) => page.includes(path)),
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

    // Tracker del proyecto Datadicoco (cliente, mayo-junio 2026). Vivia en
    // /{es,en,pt}/roadmap/ con robots="index,follow" explicito, en el sitemap
    // y con hreflang reciproco: contenido de cliente (con precios) indexable
    // por triplicado, colisionando con el cluster "roadmap" del blog. Las tres
    // rutas se eliminan (archivos en _to_delete/rotas-roadmap-datadicoco/) y
    // cualquier marcador del cliente cae en la unica URL que queda, que ya es
    // noindex.
    "/es/roadmap/": "/roadmap-datadicoco/",
    "/en/roadmap/": "/roadmap-datadicoco/",
    "/pt/roadmap/": "/roadmap-datadicoco/",

    // Árbol de blog sin prefijo de idioma. `src/pages/blog.astro` generaba
    // /blog/ con el mismo contenido que /es/blog/: dos árboles para la misma
    // página, ambas indexables. Se elimina la ruta y se manda el índice al hub
    // editorial en ES.
    //
    // El comodín de nivel post (/blog/<slug>) NO va aquí: en `output: "static"`
    // Astro trata la clave dinámica como una ruta más y exige un getStaticPaths
    // que no existe (falla el build). Vive en `vercel.json`, en la capa de
    // redirects de la plataforma, que es donde corresponde.
    "/blog/": "/es/blog/",

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
