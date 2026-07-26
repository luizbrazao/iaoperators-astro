// Regresión del motor de scoring del test de la Ley 10/2025.
// Uso: npm run assessment:test-scoring
//
// No hay runner de tests en el proyecto, así que esto es un script plano: se
// ejecuta, imprime el veredicto de cada caso y sale con código 1 si algo cambia.
// Cuando toques las reglas de ./src/lib/assessment/sac/scoring.ts, ejecútalo:
// un motor que emite veredictos de sujeción a una norma no puede cambiar sin querer.

import { scoreAssessment } from "../src/lib/assessment/sac/scoring";
import type { AssessmentAnswers, ObligadoVerdict, RiskLevel } from "../src/lib/assessment/types";

// Fecha fija: el resultado no puede depender de cuándo se ejecuta el test.
const NOW = new Date("2026-07-26T12:00:00+02:00").getTime();

type Caso = {
  nombre: string;
  answers: AssessmentAnswers;
  espera: { obligado: ObligadoVerdict; riskLevel?: RiskLevel };
};

const CASOS: Caso[] = [
  {
    nombre: "Comercializadora eléctrica pequeña — obligada por actividad (art. 2.1), nada montado",
    answers: {
      sector: "agua-gas-electricidad",
      plantilla: "menos-50",
      umbrales: "ninguno",
      canales: ["telefono", "email"],
      medicion: "no",
      clave: "no",
      plazos: "no",
      registro: "no",
    },
    espera: { obligado: "si", riskLevel: "critico" },
  },
  {
    nombre: "PYME de 120 personas con 60 M€ de facturación — obligada por umbral alternativo",
    answers: {
      sector: "otro",
      plantilla: "50-249",
      umbrales: "facturacion",
      canales: ["telefono", "whatsapp", "email"],
      medicion: "informes",
      clave: "parcial",
      plazos: "manual",
      registro: "crm-editable",
    },
    espera: { obligado: "si", riskLevel: "alto" },
  },
  {
    nombre: "Empresa pequeña fuera de sector básico y sin umbrales — no obligada",
    answers: {
      sector: "otro",
      plantilla: "menos-50",
      umbrales: "ninguno",
      canales: ["telefono", "email"],
      medicion: "no",
      clave: "no",
      plazos: "no",
      registro: "no",
    },
    // Riesgo REGULATORIO bajo aunque la brecha operativa sea grande: está fuera del ámbito.
    espera: { obligado: "no", riskLevel: "bajo" },
  },
  {
    nombre: "No conoce las cifras consolidadas — veredicto probable, nunca 'no'",
    answers: {
      sector: "otro",
      plantilla: "50-249",
      umbrales: "no-lo-se",
      canales: ["telefono"],
      medicion: "informes",
      clave: "parcial",
      plazos: "manual",
      registro: "crm-editable",
    },
    espera: { obligado: "probable" },
  },
  {
    nombre: "Grupo consolidado por encima del umbral — la filial entra",
    answers: {
      sector: "otro",
      plantilla: "menos-50",
      umbrales: "grupo",
      canales: ["telefono", "email"],
      medicion: "tiempo-real",
      clave: "unica-omnicanal",
      plazos: "automatico",
      registro: "inmutable",
    },
    espera: { obligado: "si", riskLevel: "bajo" },
  },
  {
    nombre: "Telecom con todo montado — obligada, riesgo bajo",
    answers: {
      sector: "telecomunicaciones",
      plantilla: "250-mas",
      umbrales: "facturacion",
      canales: ["telefono", "whatsapp", "email", "chat-web"],
      medicion: "tiempo-real",
      clave: "unica-omnicanal",
      plazos: "automatico",
      registro: "inmutable",
    },
    espera: { obligado: "si", riskLevel: "bajo" },
  },
];

let fallos = 0;

for (const caso of CASOS) {
  const r = scoreAssessment(caso.answers, NOW);
  const okObligado = r.obligado === caso.espera.obligado;
  const okRiesgo = !caso.espera.riskLevel || r.riskLevel === caso.espera.riskLevel;
  const ok = okObligado && okRiesgo;
  if (!ok) fallos++;

  console.log(`${ok ? "PASS" : "FALLO"} · ${caso.nombre}`);
  console.log(
    `       obligado=${r.obligado} riesgo=${r.riskLevel} score=${r.riskScore}/${r.riskScoreMax}`,
  );
  if (!ok) {
    console.log(
      `       esperado: obligado=${caso.espera.obligado} riesgo=${caso.espera.riskLevel ?? "(cualquiera)"}`,
    );
  }
}

// El motor tiene que ser determinista: misma entrada, mismo resultado.
const a = CASOS[1].answers;
if (JSON.stringify(scoreAssessment(a, NOW)) !== JSON.stringify(scoreAssessment(a, NOW))) {
  fallos++;
  console.log("FALLO · determinismo");
} else {
  console.log("PASS · determinismo");
}

// Entrada vacía no debe romper (defensa: la validación ya la rechaza antes).
try {
  scoreAssessment({}, NOW);
  console.log("PASS · entrada vacía no rompe");
} catch (error) {
  fallos++;
  console.log(`FALLO · entrada vacía lanzó: ${(error as Error).message}`);
}

console.log(fallos ? `\n${fallos} fallo(s)` : "\nTodos los casos OK");
process.exit(fallos ? 1 : 0);
