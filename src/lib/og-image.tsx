import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogOGProps {
  title: string;
  author: string;
  categoryLabel: string;
}

// ─── Font loading (cached at module level) ────────────────────────────────────

let fontRegular: ArrayBuffer | undefined;
let fontBold: ArrayBuffer | undefined;

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const file =
    weight === 700
      ? "inter-latin-700-normal.woff"
      : "inter-latin-400-normal.woff";
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.1/files/${file}`
  );
  if (!res.ok) throw new Error(`Font fetch failed (${weight}): ${res.status}`);
  return res.arrayBuffer();
}

export async function getOGFonts() {
  if (!fontRegular) fontRegular = await loadFont(400);
  if (!fontBold) fontBold = await loadFont(700);
  return [
    { name: "Inter", data: fontRegular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: fontBold, weight: 700 as const, style: "normal" as const },
  ];
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
  const fontSize = title.length > 70 ? 40 : title.length > 50 ? 48 : 56;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orange ambient glow — bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,105,0,0.18) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Subtle glow — top-right */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,105,0,0.07) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Top bar: logo + category */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#FF6900",
              display: "flex",
            }}
          />
          <span
            style={{
              color: "white",
              fontSize: "22px",
              fontWeight: 700,
              fontFamily: "Inter",
              letterSpacing: "-0.3px",
            }}
          >
            IA Operators
          </span>
        </div>

        <span
          style={{
            color: "#FF6900",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "Inter",
            backgroundColor: "rgba(255,105,0,0.1)",
            border: "1px solid rgba(255,105,0,0.25)",
            borderRadius: "999px",
            padding: "6px 18px",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Title */}
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <span
          style={{
            color: "white",
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            fontFamily: "Inter",
            lineHeight: 1.2,
            letterSpacing: "-1px",
            maxWidth: "1000px",
          }}
        >
          {title}
        </span>
      </div>

      {/* Bottom bar: author + site */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "24px",
          marginTop: "16px",
        }}
      >
        <span
          style={{
            color: "#9ca3af",
            fontSize: "18px",
            fontFamily: "Inter",
            fontWeight: 400,
          }}
        >
          {author}
        </span>
        <span
          style={{
            color: "#FF6900",
            fontSize: "18px",
            fontFamily: "Inter",
            fontWeight: 600,
          }}
        >
          iaoperators.com
        </span>
      </div>
    </div>
  );
}

// ─── Default site OG image ────────────────────────────────────────────────────

export function createDefaultOGElement(): React.ReactElement {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        padding: "70px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orange glow — bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,105,0,0.2) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "auto",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#FF6900",
            display: "flex",
          }}
        />
        <span
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: 700,
            fontFamily: "Inter",
            letterSpacing: "-0.5px",
          }}
        >
          IA Operators
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "64px",
            fontWeight: 700,
            fontFamily: "Inter",
            lineHeight: 1.1,
            letterSpacing: "-2px",
            maxWidth: "900px",
          }}
        >
          {"Diagnóstico, "}
          <span style={{ color: "#FF6900" }}>prioridad</span>
          {" y ejecución tecnológica."}
        </span>
        <span
          style={{
            color: "#9ca3af",
            fontSize: "22px",
            fontFamily: "Inter",
            fontWeight: 400,
            marginTop: "24px",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          Auditoría, roadmap e implementación para empresas medianas.
        </span>
      </div>

      {/* Bottom */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "24px",
          marginTop: "32px",
        }}
      >
        <span
          style={{
            color: "#6b7280",
            fontSize: "18px",
            fontFamily: "Inter",
          }}
        >
          Málaga, España · ES · PT · EN
        </span>
        <span
          style={{
            color: "#FF6900",
            fontSize: "18px",
            fontFamily: "Inter",
            fontWeight: 600,
          }}
        >
          iaoperators.com
        </span>
      </div>
    </div>
  );
}
