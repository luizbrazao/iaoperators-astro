// src/i18n/ui.ts
export const locales = ["en", "es", "pt"] as const;
export type Locale = (typeof locales)[number];

type Dict = Record<string, any>;

// Carrega ./locales/{lang}/{namespace}.json
const dictionaries = import.meta.glob<Dict>("./locales/*/*.json", { eager: true });

export function getLocale(currentLocale: string | undefined | null): Locale {
  const candidate = (currentLocale ?? "").toLowerCase();
  return (locales as readonly string[]).includes(candidate) ? (candidate as Locale) : "es";
}

function getDict(locale: Locale, namespace: string): Dict {
  const key = `./locales/${locale}/${namespace}.json`;
  const mod = dictionaries[key];
  if (!mod) return {};
  return (mod as any).default ?? mod;
}

// Tradução por caminho: t(locale,"common","nav.home")
export function t(locale: Locale, namespace: string, path: string, fallback = ""): string {
  const dict = getDict(locale, namespace);
  const value = path
    .split(".")
    .reduce<any>((acc, k) => (acc && k in acc ? acc[k] : undefined), dict);
  return typeof value === "string" ? value : fallback;
}

/**
 * Compat layer: mantém o formato "ui" do projeto antigo.
 * Aqui eu assumo que o Header (e outros) usam ui[locale].common / ui[locale].home etc.
 * Então construímos ui[locale][namespace] a partir dos JSONs.
 */
export const ui: Record<Locale, Record<string, Dict>> = locales.reduce((acc, locale) => {
  acc[locale] = {
    common: getDict(locale, "common"),
    home: getDict(locale, "home"),
    blog: getDict(locale, "blog"),
    contact: getDict(locale, "contact"),
    cookies: getDict(locale, "cookies"),
    portfolio: getDict(locale, "portfolio"),
    projects: getDict(locale, "projects"),
    terms: getDict(locale, "terms"),
    categories: getDict(locale, "categories"),
    blogPost: getDict(locale, "blogPost"),
  };
  return acc;
}, {} as Record<Locale, Record<string, Dict>>);
