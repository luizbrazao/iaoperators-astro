// Copys de la home editorial por idioma. La forma la fija el JSON ES; EN/PT
// tienen las mismas claves salvo `capabilities.pillars.cumplimiento`, que solo
// existe en ES (el pilar de cumplimiento es ES-only por decisión).
import introEs from "@/i18n/locales/es/homeIntro.json";
import introEn from "@/i18n/locales/en/homeIntro.json";
import introPt from "@/i18n/locales/pt/homeIntro.json";
import editorialEs from "@/i18n/locales/es/homeEditorial.json";
import editorialEn from "@/i18n/locales/en/homeEditorial.json";
import editorialPt from "@/i18n/locales/pt/homeEditorial.json";
import homeEs from "@/i18n/locales/es/home.json";
import homeEn from "@/i18n/locales/en/home.json";
import homePt from "@/i18n/locales/pt/home.json";
import { asShellLoc } from "@/i18n/editorialShell";

export type HomeIntroCopy = typeof introEs;
export type HomeEditorialCopy = typeof editorialEs;

const INTRO = { es: introEs, en: introEn, pt: introPt } as Record<string, HomeIntroCopy>;
const EDITORIAL = { es: editorialEs, en: editorialEn, pt: editorialPt } as unknown as Record<string, HomeEditorialCopy>;
const HOME = { es: homeEs, en: homeEn, pt: homePt } as unknown as Record<string, typeof homeEs>;

export const getHomeIntro = (locale?: string) => INTRO[asShellLoc(locale)];
export const getHomeEditorial = (locale?: string) => EDITORIAL[asShellLoc(locale)];
export const getHomeCopy = (locale?: string) => HOME[asShellLoc(locale)];
