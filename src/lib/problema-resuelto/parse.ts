// Lectura robusta de lo que devuelve el modelo. Pura: sin red ni servidor.
//
// El modelo debe contestar con un objeto JSON, pero no se confía en ello: se
// busca el primer objeto equilibrado del texto, se valida campo a campo con
// listas cerradas y se recorta. Lo que no cuadra se descarta o se sustituye
// por un valor neutro; nunca se propaga texto arbitrario a un enum.

import { SUBMIT_LIMITS } from "./validation";
import type { EncajeSugerido, Entregable, Ficha, Riesgo } from "./types";

/** Primer objeto JSON equilibrado dentro de un texto (ignora ```json y prosa alrededor). */
export function extractJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          const value = JSON.parse(text.slice(start, i + 1));
          return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+\n/g, "\n").trim().slice(0, max) : "";
}

export interface TriageOutput {
  reply: string;
  ready: boolean;
  offTopic: boolean;
  /** false si el modelo no devolvió el JSON esperado y se usó su texto tal cual. */
  structured: boolean;
}

export function parseTriageOutput(text: string): TriageOutput | null {
  const obj = extractJsonObject(text);
  if (obj) {
    const reply = str(obj.reply, SUBMIT_LIMITS.assistantMax);
    if (reply) return { reply, ready: obj.ready === true, offTopic: obj.off_topic === true, structured: true };
  }
  // Sin JSON utilizable: si hay texto razonable, se usa como respuesta y la
  // conversación sigue. Nunca se marca ready ni off_topic a ciegas.
  const plain = text.replace(/```[a-z]*|```/gi, "").trim().slice(0, SUBMIT_LIMITS.assistantMax);
  if (plain.length >= 2 && !plain.startsWith("{")) return { reply: plain, ready: false, offTopic: false, structured: false };
  return null;
}

const ENCAJES: readonly EncajeSugerido[] = ["encaja", "reducido", "no_encaja", "dudoso"];
const ENTREGABLES: readonly Entregable[] = ["flujo", "asistente", "script", "hoja_calculo", "prototipo", "otro"];
const RIESGOS: readonly Riesgo[] = ["datos_personales", "acceso_sistemas", "sin_permiso", "alcance_grande", "otro"];

function strList(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** null si ni siquiera hay un resumen: entonces la ficha se marca como fallida. */
export function parseFicha(text: string): Ficha | null {
  const obj = extractJsonObject(text);
  if (!obj) return null;
  const resumen = str(obj.resumen, 800);
  if (!resumen) return null;
  const complejidadRaw = Number(obj.complejidad);
  const complejidad = (Number.isInteger(complejidadRaw) && complejidadRaw >= 1 && complejidadRaw <= 5 ? complejidadRaw : 3) as Ficha["complejidad"];
  const encaje = ENCAJES.includes(obj.encaje_sugerido as EncajeSugerido) ? (obj.encaje_sugerido as EncajeSugerido) : "dudoso";
  const entregable = ENTREGABLES.includes(obj.entregable_sugerido as Entregable) ? (obj.entregable_sugerido as Entregable) : "otro";
  const riesgos = strList(obj.riesgos, 5, 40).filter((r): r is Riesgo => RIESGOS.includes(r as Riesgo));
  return {
    resumen,
    situacion_actual: str(obj.situacion_actual, 1200) || "no consta",
    frecuencia: str(obj.frecuencia, 300) || "no consta",
    tiempo_estimado: str(obj.tiempo_estimado, 300) || "no consta",
    herramientas: strList(obj.herramientas, 12, 60),
    resultado_deseado: str(obj.resultado_deseado, 600) || "no consta",
    encaje_sugerido: encaje,
    motivo_encaje: str(obj.motivo_encaje, 600) || "no consta",
    complejidad,
    entregable_sugerido: entregable,
    riesgos: [...new Set(riesgos)],
    senales_comerciales: str(obj.senales_comerciales, 600) || "no consta",
  };
}
