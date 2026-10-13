// CSV para las exportaciones del Kit. Desde oct/2026 la implementación vive en
// src/lib/commerce/csv.ts (compartida con RGPD Ops); este módulo se conserva
// como wrapper para no cambiar ningún import del Kit.
//
// Separador ";", BOM UTF-8 y neutralización de fórmulas (=, +, -, @, tab, CR y
// sus variantes de ancho completo).

export { csvCell, toCsv, csvResponse } from "../commerce/csv";
