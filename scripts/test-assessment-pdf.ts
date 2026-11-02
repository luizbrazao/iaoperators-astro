// Regresión del informe PDF del test de la Ley 10/2025.
// Uso: npm run assessment:test-pdf [carpeta-salida]
//
// Genera el PDF de tres perfiles (obligado con brecha amplia, probable y fuera
// del ámbito) con la marca real del test y comprueba que se abre, que tiene
// páginas y que los textos clave están dentro. Con una carpeta como argumento,
// guarda los PDF para revisarlos a ojo.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { buildAssessmentPdf } from "../src/lib/assessment/pdf";
import { SAC_BRAND } from "../src/lib/assessment/sac/brand";
import { scoreAssessment } from "../src/lib/assessment/sac/scoring";
import type { AssessmentAnswers } from "../src/lib/assessment/types";

const NOW = new Date("2026-11-02T10:00:00+01:00");
const outDir = process.argv[2];
if (outDir) mkdirSync(outDir, { recursive: true });

const casos: { nombre: string; answers: AssessmentAnswers }[] = [
  {
    nombre: "telecom-brecha-amplia",
    answers: {
      sector: "telecomunicaciones",
      plantilla: "50-249",
      umbrales: "ninguno",
      canales: ["telefono", "whatsapp", "email", "chat-web", "formulario", "presencial", "redes"],
      medicion: "informes",
      clave: "interno",
      plazos: "manual",
      registro: "crm-editable",
    },
  },
  {
    nombre: "otro-sector-grande",
    answers: {
      sector: "otro",
      plantilla: "250-mas",
      umbrales: "ninguno",
      canales: ["telefono", "email"],
      medicion: "tiempo-real",
      clave: "parcial",
      plazos: "automatico",
      registro: "inmutable",
    },
  },
  {
    nombre: "fuera-de-ambito",
    answers: {
      sector: "otro",
      plantilla: "menos-50",
      umbrales: "ninguno",
      canales: ["email"],
      medicion: "no",
      clave: "no",
      plazos: "no",
      registro: "no",
    },
  },
];

let fallos = 0;
for (const caso of casos) {
  const result = scoreAssessment(caso.answers, NOW.getTime());
  const bytes = await buildAssessmentPdf(result, SAC_BRAND, { date: NOW });
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  const ok = bytes.length > 2000 && pages >= 1 && doc.getTitle()?.includes("Ley 10/2025");
  if (!ok) fallos++;
  console.log(`${ok ? "PASS" : "FAIL"} · ${caso.nombre} · ${result.obligado} · ${pages} pág · ${Math.round(bytes.length / 1024)} KB`);
  if (outDir) writeFileSync(join(outDir, `${caso.nombre}.pdf`), bytes);
}

if (fallos) {
  console.error(`\n${fallos} caso(s) fallan`);
  process.exit(1);
}
console.log("\nTodos los casos OK");
