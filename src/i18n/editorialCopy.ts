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
import portfolioEs from "@/i18n/locales/es/portfolioEditorial.json";
import portfolioEn from "@/i18n/locales/en/portfolioEditorial.json";
import portfolioPt from "@/i18n/locales/pt/portfolioEditorial.json";
import pagesEs from "@/i18n/locales/es/pagesEditorial.json";
import pagesEn from "@/i18n/locales/en/pagesEditorial.json";
import pagesPt from "@/i18n/locales/pt/pagesEditorial.json";
import { asShellLoc } from "@/i18n/editorialShell";

export type HomeIntroCopy = typeof introEs;
export type HomeEditorialCopy = typeof editorialEs;

const INTRO = { es: introEs, en: introEn, pt: introPt } as Record<string, HomeIntroCopy>;
const EDITORIAL = { es: editorialEs, en: editorialEn, pt: editorialPt } as unknown as Record<string, HomeEditorialCopy>;
const HOME = { es: homeEs, en: homeEn, pt: homePt } as unknown as Record<string, typeof homeEs>;

export type PortfolioEditorialCopy = typeof portfolioEs;
const PORTFOLIO = { es: portfolioEs, en: portfolioEn, pt: portfolioPt } as Record<string, PortfolioEditorialCopy>;
export const getPortfolioEditorial = (locale?: string) => PORTFOLIO[asShellLoc(locale)];

// EN/PT solo traen las claves de los pilares trilingües (integración y
// arquitectura); las de cumplimiento existen solo en ES.
export type PagesEditorialCopy = typeof pagesEs;
const PAGES = { es: pagesEs, en: pagesEn, pt: pagesPt } as unknown as Record<string, PagesEditorialCopy>;
export const getPagesEditorial = (locale?: string) => PAGES[asShellLoc(locale)];

export const getHomeIntro = (locale?: string) => INTRO[asShellLoc(locale)];
export const getHomeEditorial = (locale?: string) => EDITORIAL[asShellLoc(locale)];
export const getHomeCopy = (locale?: string) => HOME[asShellLoc(locale)];
