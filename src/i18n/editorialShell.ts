// Rótulos del shell editorial (EditorialHeader + EditorialFooter) en los tres
// idiomas. El texto ES es el que ya estaba escrito a mano en los componentes:
// no cambia ni una coma, así que las páginas ES salen idénticas.
//
// Las rutas se construyen con `shellHref()`: los slugs de estas páginas son los
// mismos en los tres idiomas (/en/sobre/, /pt/contact/…), igual que en el
// Header/Footer oscuros.

export type ShellLoc = "es" | "en" | "pt";

export const asShellLoc = (locale: string | undefined): ShellLoc =>
  locale === "en" || locale === "pt" ? locale : "es";

export const shellHref = (locale: ShellLoc, path = "") => `/${locale}/${path}`;

export const SHELL = {
  es: {
    skip: "Saltar al contenido",
    homeAria: "IA Operators, inicio",
    mainNav: "Navegación principal",
    mobileNav: "Navegación móvil",
    menu: "Menú",
    languages: "Idiomas",
    cases: "Casos",
    allCapabilities: "Todas las capacidades",
    talk: "¿Hablamos?",
    siteLinks: "Enlaces del sitio",
    solutions: "Soluciones",
    integrations: "Integraciones",
    company: "Empresa",
    capabilities: "Capacidades",
    about: "Sobre",
    methodology: "Metodología",
    contact: "Contacto",
    community: "Comunidad",
    terms: "Términos y Condiciones",
    privacy: "Privacidad",
    siteLanguages: "Idiomas del sitio",
    top: "Volver arriba ↑",
  },
  en: {
    skip: "Skip to content",
    homeAria: "IA Operators, home",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    menu: "Menu",
    languages: "Languages",
    cases: "Cases",
    allCapabilities: "All capabilities",
    talk: "Let's talk",
    siteLinks: "Site links",
    solutions: "Solutions",
    integrations: "Integrations",
    company: "Company",
    capabilities: "Capabilities",
    about: "About",
    methodology: "Methodology",
    contact: "Contact",
    community: "Community",
    terms: "Terms and Conditions",
    privacy: "Privacy",
    siteLanguages: "Site languages",
    top: "Back to top ↑",
  },
  pt: {
    skip: "Pular para o conteúdo",
    homeAria: "IA Operators, início",
    mainNav: "Navegação principal",
    mobileNav: "Navegação móvel",
    menu: "Menu",
    languages: "Idiomas",
    cases: "Cases",
    allCapabilities: "Todas as capacidades",
    talk: "Vamos conversar?",
    siteLinks: "Links do site",
    solutions: "Soluções",
    integrations: "Integrações",
    company: "Empresa",
    capabilities: "Capacidades",
    about: "Sobre",
    methodology: "Metodologia",
    contact: "Contato",
    community: "Comunidade",
    terms: "Termos e Condições",
    privacy: "Privacidade",
    siteLanguages: "Idiomas do site",
    top: "Voltar ao topo ↑",
  },
} as const satisfies Record<ShellLoc, Record<string, string>>;
