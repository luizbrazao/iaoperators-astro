// Reconocimientos y listados en directorios.
//
// Se renderiza EXCLUSIVAMENTE en /[locale]/sobre/ mediante
// src/components/Reconocimientos.astro. No debe importarse desde el Header,
// el Footer, BaseLayout ni ningún componente compartido: un enlace en un
// componente global se multiplicaría por todas las rutas del sitio.
//
// Añadir un directorio (Clutch, GoodFirms…) = añadir una entrada aquí.
// El marcado no cambia.

import type { Loc } from "./identidad";

export interface Reconocimiento {
  key: string;
  /** Texto del enlace. Es la marca del directorio, tal cual. */
  anchor: string;
  href: string;
  /** `sponsored` para listados pagados o intercambiados; `ugc` para perfiles
   *  creados por terceros; omitir el valor no es una opción. */
  rel: string;
  caption: Record<Loc, string>;
}

export const RECONOCIMIENTOS: Reconocimiento[] = [
  {
    key: "designrush",
    anchor: "Designrush",
    href: "https://www.designrush.com/agency/digital-marketing/es",
    rel: "sponsored noopener",
    caption: {
      es: "Listados entre las agencias de marketing digital en España",
      pt: "Listados entre as agências de marketing digital em Espanha",
      en: "Listed among the digital marketing agencies in Spain",
    },
  },
];

export const RECONOCIMIENTOS_COPY: Record<
  Loc,
  { title: string; intro: string }
> = {
  es: {
    title: "Reconocimientos y listados",
    intro:
      "Directorios y plataformas donde IA Operators aparece verificada como agencia en activo.",
  },
  pt: {
    title: "Reconhecimentos e listagens",
    intro:
      "Diretórios e plataformas onde a IA Operators aparece verificada como agência em atividade.",
  },
  en: {
    title: "Recognition and listings",
    intro:
      "Directories and platforms where IA Operators is verified as an active agency.",
  },
};
