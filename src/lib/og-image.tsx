import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogOGProps {
  title: string;
  author: string;
  categoryLabel: string;
}

export interface SurveyOGProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Rótulo sobre el título ("Encuesta", "Survey"…). */
  kicker?: string;
  /** Texto del pie, a la izquierda de la URL. */
  footer?: string;
}

// ─── Font loading (from bundled files — no network dependency) ────────────────
// process.cwd() is always the project root during `astro build`

let fontRegular: ArrayBuffer | undefined;
let fontMedium: ArrayBuffer | undefined;
let fontMono: ArrayBuffer | undefined;

// `readFileSync(...).buffer` NO es el fichero: es el ArrayBuffer subyacente del
// Buffer, que Node puede compartir con otros datos (pool interno), así que
// puede empezar en otro sitio y contener bytes ajenos. En la Vercel eso hizo
// fallar el build con "Unsupported OpenType signature cons" (oct/2026): satori
// leía el principio de un fichero JS en lugar de la cabecera wOFF. Se copia
// exactamente la ventana [byteOffset, byteOffset + byteLength) del fichero.
function readFont(relativePath: string): ArrayBuffer {
  const file = readFileSync(join(process.cwd(), relativePath));
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

// Diseño editorial (oct/2026): marfil, tinta y naranja, como el sitio. Las
// tres plantillas comparten marco (barra naranja, logo, etiqueta en mono y pie).
// Fuentes estáticas en src/assets/fonts: Manrope 400/500 instanciadas de la
// variable del sitio (satori no lee fuentes variables ni woff2) y un subset
// latino de DejaVu Sans Mono para las etiquetas (licencia en LICENSE-DejaVu.txt).
const C = {
  paper: "#f3f1eb",
  ink: "#22241f",
  muted: "#666960",
  soft: "#74796d",
  line: "#d0d1c7",
  orange: "#f16532",
  rust: "#ae3810",
};

let logoUri: string | undefined;
const LOGO_RATIO = 453 / 82;
function logo(height: number): React.ReactElement {
  if (!logoUri) {
    const file = readFileSync(join(process.cwd(), "public/brand/ia-operators-logo.png"));
    logoUri = `data:image/png;base64,${file.toString("base64")}`;
  }
  return <img src={logoUri} width={Math.round(height * LOGO_RATIO)} height={height} alt="" />;
}

export async function getOGFonts() {
  if (!fontRegular) fontRegular = readFont("src/assets/fonts/manrope-400.ttf");
  if (!fontMedium) fontMedium = readFont("src/assets/fonts/manrope-500.ttf");
  if (!fontMono) fontMono = readFont("src/assets/fonts/dejavu-sans-mono-latin.ttf");
  return [
    { name: "Manrope", data: fontRegular, weight: 400 as const, style: "normal" as const },
    { name: "Manrope", data: fontMedium, weight: 500 as const, style: "normal" as const },
    { name: "Mono", data: fontMono, weight: 400 as const, style: "normal" as const },
  ];
}

function eyebrow(text: string, color: string = C.muted, size = 15): React.ReactElement {
  return (
    <span
      style={{
        fontFamily: "Mono",
        fontSize: `${size}px`,
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        color,
        display: "flex",
      }}
    >
      {text}
    </span>
  );
}

function Frame({
  label,
  footer,
  children,
}: {
  label: string;
  footer: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: C.paper,
        fontFamily: "Manrope",
        position: "relative",
      }}
    >
      <div style={{ height: "8px", width: "1200px", backgroundColor: C.orange, display: "flex" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "52px 72px 48px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {logo(30)}
          {eyebrow(label)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          {children}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${C.line}`,
            paddingTop: "22px",
          }}
        >
          <span style={{ fontSize: "19px", color: C.muted, display: "flex" }}>{footer}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: C.orange, display: "flex" }} />
            <span style={{ fontSize: "19px", fontWeight: 500, color: C.ink, display: "flex" }}>
              iaoperators.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function titleSize(title: string): number {
  if (title.length > 90) return 50;
  if (title.length > 65) return 58;
  if (title.length > 45) return 66;
  return 74;
}

// ─── Category labels ──────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  es: {
    tools: "Herramientas",
    lawyers: "IA para abogados",
    architects: "IA para arquitectos",
    accounting: "IA para contabilidad",
    restaurants: "IA para restaurantes",
    "beauty-salons": "IA para salones",
    compliance: "Cumplimiento normativo",
    others: "Blog",
  },
  pt: {
    tools: "Ferramentas",
    lawyers: "IA para advogados",
    architects: "IA para arquitetos",
    accounting: "IA para contabilidade",
    restaurants: "IA para restaurantes",
    "beauty-salons": "IA para salões",
    others: "Blog",
  },
  en: {
    tools: "Tools",
    lawyers: "AI for Lawyers",
    architects: "AI for Architects",
    accounting: "AI for Accounting",
    restaurants: "AI for Restaurants",
    "beauty-salons": "AI for Beauty",
    others: "Blog",
  },
};

// ─── Blog post OG image ───────────────────────────────────────────────────────

export function createBlogOGElement({ title, author, categoryLabel }: BlogOGProps): React.ReactElement {
  const size = titleSize(title);
  return (
    <Frame label={categoryLabel} footer={author}>
      <span
        style={{
          fontSize: `${size}px`,
          fontWeight: 500,
          lineHeight: 1.08,
          letterSpacing: `${-size * 0.045}px`,
          color: C.ink,
          maxWidth: "1020px",
          display: "flex",
        }}
      >
        {title}
      </span>
    </Frame>
  );
}

// ─── Default site OG image ────────────────────────────────────────────────────
// Mismo mensaje que el hero de la home ES.

export function createDefaultOGElement(): React.ReactElement {
  return (
    <Frame label="Ingeniería de producto y tecnología" footer="Málaga, España · ES · PT · EN">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "84px", fontWeight: 500, lineHeight: 1.02, letterSpacing: "-4px", color: C.ink, display: "flex" }}>
          Conectamos sistemas.
        </span>
        <span style={{ fontSize: "84px", fontWeight: 500, lineHeight: 1.02, letterSpacing: "-4px", color: C.soft, display: "flex" }}>
          Automatizamos operaciones.
        </span>
        <span style={{ fontSize: "25px", lineHeight: 1.45, color: C.muted, marginTop: "28px", maxWidth: "820px", display: "flex" }}>
          Diseñamos y construimos la tecnología que conecta tus herramientas, automatiza el trabajo y aplica IA donde genera valor.
        </span>
      </div>
    </Frame>
  );
}

// ─── Encuestas y landings con mensaje propio ─────────────────────────────────

export function createSurveyOGElement({
  eyebrow: label,
  title,
  subtitle,
  kicker = "Encuesta",
  footer = "Uso de IA, gobernanza y dependencia de proveedores",
}: SurveyOGProps): React.ReactElement {
  const size = titleSize(title);
  return (
    <Frame label={label} footer={footer}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow(kicker, C.rust, 17)}
        <span
          style={{
            fontSize: `${size}px`,
            fontWeight: 500,
            lineHeight: 1.06,
            letterSpacing: `${-size * 0.045}px`,
            color: C.ink,
            marginTop: "18px",
            maxWidth: "1020px",
            display: "flex",
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: "25px", lineHeight: 1.45, color: C.muted, marginTop: "22px", maxWidth: "900px", display: "flex" }}>
          {subtitle}
        </span>
      </div>
    </Frame>
  );
}
