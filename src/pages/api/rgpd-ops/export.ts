// GET /api/rgpd-ops/export?formato=json
// GET /api/rgpd-ops/export?formato=csv&tipo=rat|tratamientos|proveedores|…
//
// Solo con sesión válida y pedido activo. El servidor lee el espacio de la
// sesión y genera el archivo; el cliente no envía contenido. Cada exportación
// queda en el historial (acción y formato, sin contenido).
import type { APIRoute } from "astro";
import { csvResponse } from "@/lib/commerce/csv";
import { buildBackup, buildCsv, isCsvType } from "@/lib/rgpd-ops/export";
import { errorCode, opsLog, requestIdFrom } from "@/lib/rgpd-ops/log";
import { guardPrivate, jsonResponse, methodNotAllowed, NO_STORE_HEADERS } from "@/lib/rgpd-ops/http";
import { supabaseRepo } from "@/lib/rgpd-ops/workspace";

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const requestId = requestIdFrom(ctx.request);
  const formato = ctx.url.searchParams.get("formato");
  const tipo = ctx.url.searchParams.get("tipo");
  if (formato !== "json" && !(formato === "csv" && isCsvType(tipo))) {
    return jsonResponse({ error: "Exportación desconocida.", code: "bad_type" }, 400, requestId);
  }
  const g = await guardPrivate(ctx, requestId, { mutation: false, scope: "exportSession" });
  if (!g.ok) return g.response;
  try {
    const snap = await supabaseRepo.snapshot(g.workspaceId);
    if (!snap) return jsonResponse({ error: "Espacio no disponible.", code: "not_found" }, 404, requestId);
    const now = new Date();
    const detail = formato === "json" ? "json" : `csv:${tipo}`;
    await supabaseRepo.logEvent(g.workspaceId, "export", detail).catch(() => undefined);
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: "export", status: "ok", detail });
    if (formato === "json") {
      const filename = `rgpd-ops-copia-${now.toISOString().slice(0, 10)}.json`;
      return new Response(JSON.stringify(buildBackup(snap, now), null, 2), {
        status: 200,
        headers: {
          ...NO_STORE_HEADERS,
          "content-type": "application/json; charset=utf-8",
          "content-disposition": `attachment; filename="${filename}"`,
          "cache-control": "private, no-store",
        },
      });
    }
    const { filename, csv } = buildCsv(tipo as Parameters<typeof buildCsv>[0], snap, now);
    return csvResponse(filename, csv);
  } catch (error) {
    opsLog({ request_id: requestId, workspace_id: g.workspaceId, action: "export", status: "error", error_code: errorCode(error) });
    return jsonResponse({ error: "No se pudo exportar.", code: "unavailable" }, 503, requestId);
  }
};

export const ALL: APIRoute = () => methodNotAllowed("GET");
