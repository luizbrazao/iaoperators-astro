/**
 * Generates 3 branded hero images for the B2B blog posts.
 * Uses pure SVG → PNG via @resvg/resvg-js (already installed).
 * Style: dark background, orange accent, abstract geometric.
 */

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/blog");
mkdirSync(OUT_DIR, { recursive: true });

const W = 1280;
const H = 720;

// ─── Colour palette ───────────────────────────────────────────────────────────
const BG = "#090909";
const ORANGE = "#FF6900";
const ORANGE_DIM = "#FF6900";
const GRAY = "#1a1a1a";
const WHITE_10 = "rgba(255,255,255,0.06)";
const WHITE_5 = "rgba(255,255,255,0.03)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function savePng(svg, filename) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
  const png = resvg.render().asPng();
  const out = join(OUT_DIR, filename);
  writeFileSync(out, png);
  console.log(`✓  ${filename}  (${Math.round(png.length / 1024)} KB)`);
}

function defs(...content) {
  return `<defs>${content.join("")}</defs>`;
}

function radialGlow(id, cx, cy, r, color, opacity = 0.25) {
  return `
    <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>`;
}

function baseRect() {
  return `<rect width="${W}" height="${H}" fill="${BG}"/>`;
}

// Subtle grid
function grid(spacing = 60) {
  const lines = [];
  for (let x = 0; x <= W; x += spacing) {
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${WHITE_5}" stroke-width="1"/>`
    );
  }
  for (let y = 0; y <= H; y += spacing) {
    lines.push(
      `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${WHITE_5}" stroke-width="1"/>`
    );
  }
  return `<g>${lines.join("")}</g>`;
}

// ─── Image 1: Technology Systems Audit ───────────────────────────────────────
// Concept: interconnected nodes — mapping an ecosystem

function image1() {
  // Node positions (cx, cy, radius, opacity)
  const nodes = [
    // Central cluster
    { x: 640, y: 360, r: 18, orange: true, bright: true },
    { x: 480, y: 280, r: 12, orange: true, bright: false },
    { x: 800, y: 290, r: 10, orange: false },
    { x: 760, y: 440, r: 14, orange: true, bright: false },
    { x: 510, y: 460, r: 11, orange: false },
    // Outer ring
    { x: 300, y: 200, r: 8, orange: false },
    { x: 220, y: 370, r: 9, orange: false },
    { x: 340, y: 530, r: 7, orange: false },
    { x: 580, y: 570, r: 8, orange: true, bright: false },
    { x: 900, y: 500, r: 9, orange: false },
    { x: 970, y: 330, r: 8, orange: false },
    { x: 880, y: 180, r: 7, orange: false },
    { x: 680, y: 150, r: 8, orange: false },
    { x: 420, y: 150, r: 7, orange: false },
    // Satellite
    { x: 150, y: 260, r: 5, orange: false },
    { x: 130, y: 470, r: 5, orange: false },
    { x: 450, y: 620, r: 5, orange: false },
    { x: 720, y: 610, r: 5, orange: false },
    { x: 1050, y: 220, r: 5, orange: false },
    { x: 1080, y: 430, r: 5, orange: false },
  ];

  // Connections (index pairs)
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 5], [1, 13], [1, 6],
    [2, 10], [2, 11], [2, 12],
    [3, 9], [3, 10],
    [4, 7], [4, 8],
    [5, 6], [5, 14],
    [6, 7], [6, 15],
    [7, 8], [7, 16],
    [8, 17], [9, 19], [10, 18], [10, 19],
    [11, 18], [12, 13],
    [14, 15], [16, 17],
  ];

  const edgeSvg = edges.map(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    const isOrange = na.orange && nb.orange;
    const isHalf = na.orange || nb.orange;
    const color = isOrange ? ORANGE : isHalf ? "rgba(255,105,0,0.35)" : WHITE_10;
    const w = isOrange ? 1.5 : 1;
    return `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${color}" stroke-width="${w}" stroke-dasharray="${isOrange ? "none" : "4,6"}"/>`;
  }).join("");

  const nodeSvg = nodes.map((n) => {
    const fill = n.orange ? (n.bright ? ORANGE : "rgba(255,105,0,0.6)") : GRAY;
    const stroke = n.orange ? ORANGE : "rgba(255,255,255,0.08)";
    const glow = n.bright ? `<circle cx="${n.x}" cy="${n.y}" r="${n.r * 3}" fill="url(#glow0)"/>` : "";
    return `${glow}<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${fill}" stroke="${stroke}" stroke-width="${n.bright ? 2 : 1}"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs(
    radialGlow("glo1", 640, 360, 500, ORANGE, 0.12),
    radialGlow("glo2", 200, 600, 350, ORANGE, 0.06),
    radialGlow("glow0", 640, 360, 60, ORANGE, 0.5)
  )}
  ${baseRect()}
  <rect width="${W}" height="${H}" fill="url(#glo1)"/>
  <rect width="${W}" height="${H}" fill="url(#glo2)"/>
  ${grid(60)}
  ${edgeSvg}
  ${nodeSvg}
</svg>`;

  savePng(svg, "auditoria-sistemas-tecnologicos.png");
}

// ─── Image 2: Technology Roadmap ─────────────────────────────────────────────
// Concept: phased timeline with milestones and decision gates

function image2() {
  const phases = [
    { label: "01", x: 160, active: false },
    { label: "02", x: 360, active: true },
    { label: "03", x: 560, active: true },
    { label: "04", x: 760, active: false },
    { label: "05", x: 960, active: false },
    { label: "06", x: 1120, active: false },
  ];

  const lineY = 360;
  const dotR = 14;

  // Main timeline line
  const line = `<line x1="80" y1="${lineY}" x2="${W - 80}" y2="${lineY}" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>`;

  // Progress line up to active phase
  const activeX = phases.filter(p => p.active).pop()?.x ?? phases[0].x;
  const progressLine = `<line x1="80" y1="${lineY}" x2="${activeX}" y2="${lineY}" stroke="${ORANGE}" stroke-width="2" stroke-opacity="0.6"/>`;

  // Vertical branch lines going up/down
  const branches = phases.map((p, i) => {
    const goUp = i % 2 === 0;
    const len = goUp ? 120 : 100;
    const y2 = goUp ? lineY - len : lineY + len;
    const color = p.active ? ORANGE : "rgba(255,255,255,0.08)";
    return `<line x1="${p.x}" y1="${lineY}" x2="${p.x}" y2="${y2}" stroke="${color}" stroke-width="1" stroke-dasharray="4,4"/>
    <rect x="${p.x - 30}" y="${goUp ? lineY - len - 28 : lineY + len}" width="60" height="28" rx="4" fill="${p.active ? "rgba(255,105,0,0.12)" : "rgba(255,255,255,0.03)"}" stroke="${p.active ? ORANGE : "rgba(255,255,255,0.06)"}" stroke-width="1"/>`;
  }).join("");

  // Phase dots
  const dots = phases.map(p => {
    const fill = p.active ? ORANGE : "#1a1a1a";
    const stroke = p.active ? ORANGE : "rgba(255,255,255,0.12)";
    const glow = p.active ? `<circle cx="${p.x}" cy="${lineY}" r="${dotR * 2.5}" fill="rgba(255,105,0,0.15)"/>` : "";
    return `${glow}<circle cx="${p.x}" cy="${lineY}" r="${dotR}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }).join("");

  // Decorative arcs in background
  const arcs = [
    `<ellipse cx="640" cy="360" rx="500" ry="200" fill="none" stroke="${WHITE_5}" stroke-width="1"/>`,
    `<ellipse cx="640" cy="360" rx="350" ry="140" fill="none" stroke="${WHITE_5}" stroke-width="1"/>`,
    `<ellipse cx="640" cy="360" rx="200" ry="80" fill="none" stroke="rgba(255,105,0,0.05)" stroke-width="1"/>`,
  ].join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs(
    radialGlow("glo1", 360, 360, 400, ORANGE, 0.1),
    radialGlow("glo2", 960, 360, 300, ORANGE, 0.06)
  )}
  ${baseRect()}
  <rect width="${W}" height="${H}" fill="url(#glo1)"/>
  <rect width="${W}" height="${H}" fill="url(#glo2)"/>
  ${grid(80)}
  ${arcs}
  ${branches}
  ${line}
  ${progressLine}
  ${dots}
</svg>`;

  savePng(svg, "roadmap-tecnologico.png");
}

// ─── Image 3: n8n vs Zapier vs Make ──────────────────────────────────────────
// Concept: 3 automation pipelines flowing left to right

function image3() {
  const pipelineY = [200, 360, 520];
  const nodeXs = [120, 280, 460, 640, 820, 1000, 1160];

  // Which nodes are "active" (orange) per row
  const activeNodes = [
    new Set([0, 2, 4, 6]),
    new Set([0, 1, 3, 5, 6]),
    new Set([0, 3, 4, 6]),
  ];

  const pipes = pipelineY.map((y, row) => {
    const active = activeNodes[row];
    const isTopRow = row === 0;
    const isMidRow = row === 1;

    // Connecting lines
    const lines = nodeXs.slice(0, -1).map((x, i) => {
      const isOrange = active.has(i) && active.has(i + 1);
      const color = isOrange ? `rgba(255,105,0,0.5)` : "rgba(255,255,255,0.05)";
      const w = isOrange ? 2 : 1;
      return `<line x1="${x + 16}" y1="${y}" x2="${nodeXs[i + 1] - 16}" y2="${y}" stroke="${color}" stroke-width="${w}"/>`;
    }).join("");

    // Data flow particle (animated would be better, but SVG static)
    const flowDots = isMidRow
      ? [380, 580, 760, 940].map(
          (fx) =>
            `<circle cx="${fx}" cy="${y}" r="3" fill="${ORANGE}" opacity="0.6"/>`
        ).join("")
      : "";

    // Nodes
    const nds = nodeXs.map((x, i) => {
      const isActive = active.has(i);
      const r = isActive ? 16 : 12;
      const fill = isActive ? (isMidRow ? ORANGE : "rgba(255,105,0,0.5)") : "#131313";
      const stroke = isActive ? ORANGE : "rgba(255,255,255,0.08)";
      const glow = isActive && isMidRow
        ? `<circle cx="${x}" cy="${y}" r="${r * 2}" fill="rgba(255,105,0,0.12)"/>`
        : "";
      return `${glow}<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.4}" fill="${fill}" stroke="${stroke}" stroke-width="${isActive ? 1.5 : 1}"/>`;
    }).join("");

    return `${lines}${flowDots}${nds}`;
  }).join("");

  // Horizontal separators between rows
  const separators = [
    `<line x1="80" y1="280" x2="${W - 80}" y2="280" stroke="${WHITE_5}" stroke-width="1"/>`,
    `<line x1="80" y1="440" x2="${W - 80}" y2="440" stroke="${WHITE_5}" stroke-width="1"/>`,
  ].join("");

  // Row glows
  const rowGlows = [
    `<radialGradient id="rg0" cx="640" cy="200" r="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>`,
    `<radialGradient id="rg1" cx="640" cy="360" r="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>`,
    `<radialGradient id="rg2" cx="640" cy="520" r="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>
    </radialGradient>`,
  ].join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${rowGlows}
  </defs>
  ${baseRect()}
  <rect width="${W}" height="${H}" fill="url(#rg0)"/>
  <rect width="${W}" height="${H}" fill="url(#rg1)"/>
  <rect width="${W}" height="${H}" fill="url(#rg2)"/>
  ${grid(70)}
  ${separators}
  ${pipes}
</svg>`;

  savePng(svg, "automatizacion-comparativa.png");
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log("Generating blog hero images...\n");
image1();
image2();
image3();
console.log("\nDone.");
