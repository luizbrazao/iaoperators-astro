// /api/verifactu-kit/export — CSV del Kit, solo con sesión válida y pedido activo.
//
// GET  ?tipo=…              → plantilla vacía (cabeceras + fila de ejemplo).
// POST {tipo, rows}         → CSV con las filas que el comprador ha rellenado
//                             en su navegador. El servidor valida tipo, columnas
//                             y tamaños; nada se guarda.
import type { APIRoute } from "astro";
import { KIT_EXPORTS, KIT_MODULES, KIT_ANSWER_LABELS, type KitExportType, type KitAnswer } from "@/data/verifactu-kit-content";
import { getAuthorizedOrder } from "@/lib/verifactu-kit/auth";
import { csvResponse, toCsv } from "@/lib/verifactu-kit/csv";
import { kitLog, requestIdFrom } from "@/lib/verifactu-kit/log";
import { isAllowedOrigin } from "@/lib/verifactu-kit/origin";
import { checkRateLimit } from "@/lib/verifactu-kit/rate-limit";
import { jsonResponse, methodNotAllowed } from "./_http";

export const prerender = false;

const MAX_ROWS = 200;
const MAX_CELL = 2000;

function isExportType(value: unknown): value is KitExportType {
  return typeof value === "string" && Object.hasOwn(KIT_EXPORTS, value);
}

function templateRows(tipo: KitExportType): Record<string, string>[] {
  const def = KIT_EXPORTS[tipo];
  if (def.fromChecklist) {
    const mod = KIT_MODULES.find((m) => m.id === def.fromChecklist);
    return (mod?.checklist ?? []).map((item) => ({ pregunta: item.texto, respuesta: "", nota: "" }));
  }
  const mod = KIT_MODULES.find((m) => m.tabla?.exportType === tipo);
  return mod?.tabla ? [mod.tabla.ejemplo] : [];
}

function cleanRows(tipo: KitExportType, raw: unknown): Record<string, string>[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_ROWS) return null;
  const keys = KIT_EXPORTS[tipo].columns.map((c) => c.key);
  const rows: Record<string, string>[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const row: Record<string, string> = {};
    for (const key of keys) {
      const value = (item as Record<string, unknown>)[key];
      let text = value === undefined || value === null ? "" : String(value).slice(0, MAX_CELL);
      // Respuestas guardadas como clave interna → etiqueta legible.
      if (key === "respuesta" && Object.hasOwn(KIT_ANSWER_LABELS, text)) text = KIT_ANSWER_LABELS[text as KitAnswer];
      row[key] = text;
    }
    rows.push(row);
  }
  return rows;
}

async function authorize(context: Parameters<APIRoute>[0], requestId: string) {
  const auth = await getAuthorizedOrder(context.cookies, context.url, requestId);
  if (auth.status === "unavailable") return { error: jsonResponse({ error: "Servicio no disponible.", code: "unavailable" }, 503, requestId) };
  if (auth.status !== "ok") return { error: jsonResponse({ error: "Necesitas acceder al Kit.", code: "unauthorized" }, 401, requestId) };
  if (!(await checkRateLimit("exportSession", auth.order.id, "open", requestId))) {
    return { error: jsonResponse({ error: "Demasiadas descargas seguidas.", code: "rate_limited" }, 429, requestId) };
  }
  return { order: auth.order };
}

export const GET: APIRoute = async (context) => {
  const requestId = requestIdFrom(context.request);
  const tipo = context.url.searchParams.get("tipo");
  if (!isExportType(tipo)) return jsonResponse({ error: "Tipo de exportación desconocido.", code: "bad_type" }, 400, requestId);
  const { error, order } = await authorize(context, requestId);
  if (error) return error;
  kitLog({ request_id: requestId, order_id: order!.id, action: "export_template", status: "ok", detail: tipo });
  return csvResponse(KIT_EXPORTS[tipo].filename, toCsv(KIT_EXPORTS[tipo].columns, templateRows(tipo)));
};

export const POST: APIRoute = async (context) => {
  const requestId = requestIdFrom(context.request);
  if (!isAllowedOrigin(context.request, context.url)) {
    return jsonResponse({ error: "Origen no permitido.", code: "origin_not_allowed" }, 403, requestId);
  }
  const body = (await context.request.json().catch(() => null)) as { tipo?: unknown; rows?: unknown } | null;
  if (!isExportType(body?.tipo)) return jsonResponse({ error: "Tipo de exportación desconocido.", code: "bad_type" }, 400, requestId);
  const tipo = body!.tipo as KitExportType;
  const rows = cleanRows(tipo, body?.rows);
  if (!rows) return jsonResponse({ error: "Datos de exportación no válidos.", code: "bad_rows" }, 400, requestId);
  const { error, order } = await authorize(context, requestId);
  if (error) return error;
  kitLog({ request_id: requestId, order_id: order!.id, action: "export_data", status: "ok", detail: `${tipo}:${rows.length}` });
  return csvResponse(KIT_EXPORTS[tipo].filename, toCsv(KIT_EXPORTS[tipo].columns, rows));
};

export const ALL: APIRoute = () => methodNotAllowed("GET, POST");
