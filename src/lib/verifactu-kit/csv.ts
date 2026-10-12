// CSV para las exportaciones del Kit. Separador ";" (Excel en español abre así
// sin asistente), BOM UTF-8 para los acentos y neutralización de fórmulas
// (=, +, -, @) para que una celda escrita por el usuario no se ejecute al abrir
// el archivo en una hoja de cálculo (CSV injection).

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  if (/[";\n\r]/.test(text)) text = `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(columns: { key: string; label: string }[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(";");
  const body = rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(";"));
  return `﻿${[header, ...body].join("\r\n")}\r\n`;
}

export function csvResponse(filename: string, csv: string): Response {
  const safe = filename.replace(/[^a-z0-9._-]/gi, "-");
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${safe}"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
