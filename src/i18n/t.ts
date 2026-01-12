type Dict = Record<string, unknown>;
type Locale = "en" | "es" | "pt";

type Translations = Record<string, Record<string, Dict>>;

// Auto-carrega todos os namespaces: adicione novos JSONs em /locales/<locale>/<namespace>.json
const modules = import.meta.glob<Dict>("./locales/*/*.json", { eager: true });
const translations: Translations = {};

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const locale = match[1];
  const namespace = match[2];
  const data = (mod as any).default ?? mod;

  if (!translations[locale]) translations[locale] = {};
  translations[locale][namespace] = data as Dict;
}

function deepGet(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: any, key) => {
    if (acc && typeof acc === "object" && key in acc) return acc[key];
    return undefined;
  }, obj as any);
}

type CreateTOptions = {
  namespaces?: string[];
  defaultLocale?: Locale;
};

export async function createT(locale: string, options: CreateTOptions = {}) {
  const { namespaces, defaultLocale = "es" } = options;
  const lang: Locale = (locale === "en" || locale === "pt" || locale === "es") ? locale : defaultLocale;
  const defaultNs = namespaces?.[0] ?? "portfolio";

  return (key: string): string => {
    const [nsMaybe, restMaybe] = key.split(":");
    const ns = restMaybe ? nsMaybe : defaultNs;
    const path = restMaybe ? restMaybe : nsMaybe;

    const dict = translations[lang]?.[ns] ?? translations[defaultLocale]?.[ns];
    const value = dict ? deepGet(dict, path) : undefined;

    if (typeof value === "string") return value;

    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing key "${key}" in "${lang}".`);
    }

    return key;
  };
}

// força o TS a tratar como módulo mesmo em edge-cases
export {};
