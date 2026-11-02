// Informe en PDF del test de cumplimiento (nov/2026). Se adjunta al email del
// prospecto para que pueda reenviarlo a dirección, a su asesoría o al auditor.
//
// Genérico como email.ts: no contiene textos de ninguna norma. Todo lo
// específico llega en AssessmentBrand. Solo se genera si la marca lo pide
// (`pdfAttachment`); hoy, el test de la Ley 10/2025.
//
// pdf-lib con fuentes estándar (Helvetica, WinAnsi): sin ficheros de fuente ni
// binarios nativos en la función de Vercel. WinAnsi cubre el castellano
// (á é í ó ú ü ñ ¿ ¡ € · –); cualquier carácter fuera de la tabla se sustituye
// antes de dibujar para que un texto nuevo nunca rompa la generación.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { AssessmentBrand } from "./email";
import type { AssessmentResult, GapState } from "./types";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 50;
const CONTENT_W = A4[0] - MARGIN * 2;
const FOOTER_H = 46;

const INK = rgb(0.133, 0.141, 0.122); // #22241f
const MUTED = rgb(0.4, 0.412, 0.376); // #666960
const LINE = rgb(0.816, 0.82, 0.78); // #d0d1c7
const ORANGE = rgb(0.945, 0.396, 0.196); // #f16532
const PAPER = rgb(0.953, 0.945, 0.922); // #f3f1eb

const STATE_LABEL: Record<GapState, string> = {
  ok: "Cubierto",
  parcial: "Parcial",
  gap: "Brecha",
  desconocido: "Sin datos",
};
const STATE_COLOR: Record<GapState, ReturnType<typeof rgb>> = {
  ok: rgb(0.086, 0.502, 0.29),
  parcial: rgb(0.769, 0.522, 0.035),
  gap: rgb(0.808, 0.247, 0.11),
  desconocido: rgb(0.42, 0.447, 0.502),
};
const OBLIGADO_LABEL: Record<string, string> = {
  si: "Obligados",
  probable: "Probablemente obligados",
  no: "Fuera del ámbito",
};
const RISK_LABEL: Record<string, string> = {
  critico: "Riesgo crítico",
  alto: "Riesgo alto",
  medio: "Riesgo medio",
  bajo: "Riesgo bajo",
};

/** Sustituye lo que WinAnsi no puede codificar. Nunca lanza. */
function makeSanitizer(font: PDFFont) {
  const cache = new Map<string, string>();
  const fallback: Record<string, string> = {
    "—": "-", // —
    "’": "'",
    "‘": "'",
    "“": '"',
    "”": '"',
    "…": "...",
    "→": "->",
    "≥": ">=",
    "≤": "<=",
    " ": " ",
    " ": " ",
  };
  return (text: string) =>
    Array.from(String(text ?? "").replace(/\s+/g, " "))
      .map((ch) => {
        const hit = cache.get(ch);
        if (hit !== undefined) return hit;
        let out = ch;
        try {
          font.encodeText(ch);
        } catch {
          out = fallback[ch] ?? "?";
        }
        cache.set(ch, out);
        return out;
      })
      .join("");
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export interface AssessmentPdfOptions {
  /** Fecha del informe. Inyectable para tests deterministas. */
  date?: Date;
}

export async function buildAssessmentPdf(
  result: AssessmentResult,
  brand: AssessmentBrand,
  options: AssessmentPdfOptions = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${brand.cabecera} — IA Operators`);
  doc.setAuthor("IA Operators");
  doc.setCreator("iaoperators.com");
  doc.setLanguage("es-ES");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const clean = makeSanitizer(regular);
  const date = options.date ?? new Date();
  const fecha = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - MARGIN;

  const newPage = () => {
    page = doc.addPage(A4);
    y = A4[1] - MARGIN;
  };
  const ensure = (h: number) => {
    if (y - h < MARGIN + FOOTER_H) newPage();
  };
  const text = (
    raw: string,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; x?: number; width?: number; leading?: number; gap?: number },
  ) => {
    const font = opts.font ?? regular;
    const size = opts.size ?? 10.5;
    const x = opts.x ?? MARGIN;
    const width = opts.width ?? CONTENT_W - (x - MARGIN);
    const leading = opts.leading ?? size * 1.4;
    const lines = wrap(clean(raw), font, size, width);
    for (const line of lines) {
      ensure(leading);
      page.drawText(line, { x, y: y - size, size, font, color: opts.color ?? INK });
      y -= leading;
    }
    y -= opts.gap ?? 0;
  };
  const rule = (gapBefore = 8, gapAfter = 12) => {
    y -= gapBefore;
    ensure(2);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 0.8, color: LINE });
    y -= gapAfter;
  };

  // Cabecera
  page.drawRectangle({ x: 0, y: A4[1] - 6, width: A4[0], height: 6, color: ORANGE });
  y -= 4;
  page.drawText("IA Operators", { x: MARGIN, y: y - 14, size: 14, font: bold, color: INK });
  const fechaTxt = clean(fecha);
  page.drawText(fechaTxt, {
    x: A4[0] - MARGIN - regular.widthOfTextAtSize(fechaTxt, 9),
    y: y - 12,
    size: 9,
    font: regular,
    color: MUTED,
  });
  y -= 34;
  text(brand.cabecera.toUpperCase(), { font: bold, size: 8.5, color: ORANGE, gap: 6 });
  text(result.titular, { font: bold, size: 20, leading: 25, gap: 8 });
  text(result.motivo, { size: 10.5, color: MUTED, gap: 12 });

  // Ficha
  const ficha = [
    OBLIGADO_LABEL[result.obligado] ?? result.obligado,
    RISK_LABEL[result.riskLevel] ?? result.riskLevel,
    `${brand.perfilLabel}: ${result.sectorLabel}`,
  ].join("  ·  ");
  const plazo = brand.plazoHtml(result).replace(/<[^>]+>/g, "");
  const boxLines = [
    ...wrap(clean(ficha), bold, 10, CONTENT_W - 24).map((line) => ({ line, font: bold })),
    ...wrap(clean(plazo), regular, 10, CONTENT_W - 24).map((line) => ({ line, font: regular })),
  ];
  const boxH = boxLines.length * 15 + 18;
  ensure(boxH);
  page.drawRectangle({ x: MARGIN, y: y - boxH, width: CONTENT_W, height: boxH, color: PAPER });
  let by = y - 12;
  for (const { line, font } of boxLines) {
    page.drawText(line, { x: MARGIN + 12, y: by - 10, size: 10, font, color: INK });
    by -= 15;
  }
  y -= boxH + 14;

  const ratio = result.riskScoreMax ? Math.round((result.riskScore / result.riskScoreMax) * 100) : 0;
  ensure(30);
  page.drawText(clean("Brecha estimada"), { x: MARGIN, y: y - 9, size: 9, font: regular, color: MUTED });
  const pct = `${ratio} %`;
  page.drawText(pct, { x: A4[0] - MARGIN - bold.widthOfTextAtSize(pct, 9), y: y - 9, size: 9, font: bold, color: INK });
  y -= 16;
  page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT_W, height: 5, color: LINE });
  page.drawRectangle({ x: MARGIN, y: y - 5, width: (CONTENT_W * Math.max(3, ratio)) / 100, height: 5, color: ORANGE });
  y -= 22;

  // Obligación por obligación
  text(brand.gapsTitle ?? "Obligación por obligación", { font: bold, size: 14, gap: 2 });
  text(brand.evidenceIntro, { size: 9.5, color: MUTED, gap: 4 });
  for (const gap of result.gaps) {
    const dossier = brand.dossier[gap.id];
    const label = clean((brand.stateLabels?.[gap.estado] ?? STATE_LABEL[gap.estado]).toUpperCase());
    // Bloque mínimo para no dejar el título huérfano al pie de página.
    rule(6, 10);
    ensure(48);
    const badgeW = bold.widthOfTextAtSize(label, 7.5) + 10;
    page.drawRectangle({ x: A4[0] - MARGIN - badgeW, y: y - 12, width: badgeW, height: 13, color: STATE_COLOR[gap.estado] });
    page.drawText(label, { x: A4[0] - MARGIN - badgeW + 5, y: y - 9, size: 7.5, font: bold, color: rgb(1, 1, 1) });
    text(gap.obligacion, { font: bold, size: 11, width: CONTENT_W - badgeW - 12, gap: 3 });
    text(gap.detalle, { size: 10, color: INK, gap: 4 });
    if (dossier) {
      text(`${brand.evidenceLabel} ${dossier.evidencia}`, { size: 9, color: MUTED, gap: dossier.esfuerzo ? 1 : 0 });
      if (dossier.esfuerzo) text(`Esfuerzo orientativo: ${dossier.esfuerzo}`, { size: 9, color: MUTED });
    }
  }
  rule(6, 16);

  // Por dónde empezar
  if (result.prioridades.length) {
    ensure(40);
    text("Por dónde empezar", { font: bold, size: 14, gap: 6 });
    result.prioridades.forEach((p, i) => {
      const n = String(i + 1).padStart(2, "0");
      ensure(16);
      page.drawText(n, { x: MARGIN, y: y - 10, size: 9, font: bold, color: ORANGE });
      text(p, { x: MARGIN + 24, size: 10.5, gap: 5 });
    });
    y -= 8;
  }

  // Siguiente paso
  const cta = brand.cta(result);
  const ctaLines = [
    ...wrap(clean(cta.label), bold, 12, CONTENT_W - 28),
    ...(cta.note ? wrap(clean(cta.note), regular, 10, CONTENT_W - 28) : []),
    ...wrap(clean(cta.href.replace(/^https?:\/\//, "")), regular, 10, CONTENT_W - 28),
  ];
  const ctaH = ctaLines.length * 15 + 24;
  ensure(ctaH + 10);
  y -= 6;
  page.drawRectangle({ x: MARGIN, y: y - ctaH, width: CONTENT_W, height: ctaH, color: INK });
  let cy = y - 16;
  const labelCount = wrap(clean(cta.label), bold, 12, CONTENT_W - 28).length;
  ctaLines.forEach((line, i) => {
    const isLabel = i < labelCount;
    const isLink = i === ctaLines.length - 1;
    page.drawText(line, {
      x: MARGIN + 14,
      y: cy - (isLabel ? 11 : 9),
      size: isLabel ? 12 : 10,
      font: isLabel ? bold : regular,
      color: isLink ? ORANGE : PAPER,
    });
    cy -= 15;
  });
  y -= ctaH + 10;

  // Pie en todas las páginas
  const pages = doc.getPages();
  const pie = clean(`${brand.origen} (${brand.legislationId}), motor ${result.engineVersion}. ${brand.disclaimer}`);
  const pieLines = wrap(pie, regular, 7.5, CONTENT_W - 50);
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MARGIN, y: MARGIN + FOOTER_H - 12 }, end: { x: A4[0] - MARGIN, y: MARGIN + FOOTER_H - 12 }, thickness: 0.6, color: LINE });
    pieLines.slice(0, 3).forEach((line, j) => {
      p.drawText(line, { x: MARGIN, y: MARGIN + FOOTER_H - 24 - j * 10, size: 7.5, font: regular, color: MUTED });
    });
    const num = `${i + 1} / ${pages.length}`;
    p.drawText(num, { x: A4[0] - MARGIN - regular.widthOfTextAtSize(num, 7.5), y: MARGIN + FOOTER_H - 24, size: 7.5, font: regular, color: MUTED });
  });

  return doc.save();
}
