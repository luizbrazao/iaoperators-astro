// Exportaciones de RGPD Ops. Funciones puras sobre el snapshot del espacio.
//
// Toda exportación lleva versión del producto, fecha, aviso legal y, cuando
// es un documento de trabajo (RAT), la marca de BORRADOR. El CSV neutraliza
// fórmulas (src/lib/commerce/csv.ts).

import { RGPD_OPS_PRODUCT } from "../../data/rgpd-ops";
import { RGPD_BORRADOR, RGPD_DISCLAIMER } from "../../data/rgpd";
import { toCsv, type CsvColumn } from "../commerce/csv";
import { ENTITIES, PROFILE_FIELDS, optionLabel, type EntitySlug, type FieldDef } from "./schema";
import type { WorkspaceSnapshot } from "./types";

export const CSV_TYPES = ["rat", "tratamientos", "proveedores", "captacion", "solicitudes", "incidentes", "tareas", "evidencias", "auditoria"] as const;
export type CsvType = (typeof CSV_TYPES)[number];

export function isCsvType(value: unknown): value is CsvType {
  return typeof value === "string" && (CSV_TYPES as readonly string[]).includes(value);
}

export const BACKUP_FORMAT = "rgpd-ops-backup";
export const BACKUP_FORMAT_VERSION = 1;

function cellValue(def: FieldDef | undefined, value: unknown): unknown {
  if (!def) return value;
  if (def.type === "enum") return optionLabel(def.options, value);
  if (def.type === "enumArray") return Array.isArray(value) ? value.map((v) => optionLabel(def.options, v)).join(", ") : "";
  if (def.type === "boolean") return value ? "Sí" : "No";
  if (def.type === "checklist") return value && typeof value === "object" ? Object.entries(value).filter(([, v]) => v).map(([k]) => k).join(", ") : "";
  return value;
}

function entityColumns(slug: EntitySlug): CsvColumn[] {
  const cols: CsvColumn[] = ENTITIES[slug].fields.map((f) => ({ key: f.key, label: f.label }));
  if (slug === "solicitudes") {
    cols.splice(3, 0, { key: "due_on", label: "Plazo orientativo (1 mes)" }, { key: "extended_due_on", label: "Plazo con prórroga" });
  }
  if (slug === "tareas") cols.push({ key: "completed_at", label: "Completada el" });
  if (slug === "incidentes") cols.push({ key: "closed_at", label: "Cerrado el" });
  if (slug === "revisiones") cols.push({ key: "completed_at", label: "Completada el" });
  cols.push({ key: "updated_at", label: "Última modificación" });
  return cols;
}

function preamble(exportedAt: Date, borrador: boolean): unknown[][] {
  return [
    [`${RGPD_OPS_PRODUCT.name} v${RGPD_OPS_PRODUCT.version}`, `Exportado el ${exportedAt.toISOString().slice(0, 10)}`],
    [borrador ? RGPD_BORRADOR : RGPD_DISCLAIMER],
    [],
  ];
}

const RAT_COLUMNS: CsvColumn[] = [
  { key: "name", label: "Actividad de tratamiento" },
  { key: "responsable", label: "Responsable" },
  { key: "purpose", label: "Fines del tratamiento" },
  { key: "data_subjects", label: "Categorías de interesados" },
  { key: "data_categories", label: "Categorías de datos personales" },
  { key: "recipients", label: "Categorías de destinatarios" },
  { key: "transfers", label: "Transferencias internacionales" },
  { key: "retention", label: "Plazos previstos de supresión" },
  { key: "security_measures", label: "Medidas técnicas y organizativas" },
  { key: "legal_basis", label: "Base jurídica (campo de trabajo, a validar)" },
  { key: "status", label: "Estado" },
];

export function ratRows(snapshot: { tratamientos: WorkspaceSnapshot["tratamientos"]; workspace: { profile: Record<string, unknown> } }): Record<string, unknown>[] {
  const f = (k: string) => ENTITIES.tratamientos.fields.find((x) => x.key === k);
  const empresa = typeof snapshot.workspace.profile?.empresa === "string" && snapshot.workspace.profile.empresa ? String(snapshot.workspace.profile.empresa) : "[completar]";
  return snapshot.tratamientos.map((a) => ({
    name: a.name,
    responsable: empresa,
    purpose: a.purpose || "[completar]",
    data_subjects: cellValue(f("data_subjects"), a.data_subjects) || "[completar]",
    data_categories: cellValue(f("data_categories"), a.data_categories) || "[completar]",
    recipients: a.recipients || "[completar]",
    transfers: [cellValue(f("transfers"), a.transfers), a.transfer_details].filter(Boolean).join(" · "),
    retention: a.retention || "[completar]",
    security_measures: a.security_measures || "[completar]",
    legal_basis: `${cellValue(f("legal_basis"), a.legal_basis)}${a.legal_basis_note ? ` · ${a.legal_basis_note}` : ""}`,
    status: cellValue(f("status"), a.status),
  }));
}

export function buildCsv(type: CsvType, snapshot: WorkspaceSnapshot, exportedAt: Date = new Date()): { filename: string; csv: string } {
  const date = exportedAt.toISOString().slice(0, 10);
  if (type === "rat") {
    return {
      filename: `borrador-rat-${date}.csv`,
      csv: toCsv(RAT_COLUMNS, ratRows(snapshot), preamble(exportedAt, true)),
    };
  }
  if (type === "auditoria") {
    const cols: CsvColumn[] = [
      { key: "occurred_at", label: "Fecha" },
      { key: "actor", label: "Actor" },
      { key: "action", label: "Acción" },
      { key: "entity", label: "Módulo" },
      { key: "fields", label: "Campos" },
    ];
    const rows = snapshot.auditoria.map((a) => ({ ...a, fields: a.fields.join(", ") }));
    return { filename: `historial-${date}.csv`, csv: toCsv(cols, rows, preamble(exportedAt, false)) };
  }
  const slug = type as EntitySlug;
  const cols = entityColumns(slug);
  const defs = new Map(ENTITIES[slug].fields.map((f) => [f.key, f]));
  const rows = (snapshot[slug] as unknown as Record<string, unknown>[]).map((row) =>
    Object.fromEntries(cols.map((c) => [c.key, cellValue(defs.get(c.key), row[c.key])])),
  );
  return { filename: `${slug}-${date}.csv`, csv: toCsv(cols, rows, preamble(exportedAt, slug === "tratamientos")) };
}

function stripInternal<T extends Record<string, unknown>>(rows: T[]): Omit<T, "workspace_id">[] {
  return rows.map(({ workspace_id: _ws, ...rest }) => rest);
}

/** Copia de seguridad JSON versionada. Sin el id del pedido ni el del espacio en las filas. */
export function buildBackup(snapshot: WorkspaceSnapshot, exportedAt: Date = new Date()) {
  const s = snapshot as unknown as Record<string, Record<string, unknown>[]>;
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    product: { key: RGPD_OPS_PRODUCT.key, name: RGPD_OPS_PRODUCT.name, version: RGPD_OPS_PRODUCT.version },
    exportedAt: exportedAt.toISOString(),
    disclaimer: RGPD_DISCLAIMER,
    borrador: RGPD_BORRADOR,
    workspace: {
      schemaVersion: snapshot.workspace.schema_version,
      productVersion: snapshot.workspace.product_version,
      createdAt: snapshot.workspace.created_at,
      version: snapshot.workspace.version,
      profile: snapshot.workspace.profile,
      profileFields: PROFILE_FIELDS.map((f) => f.key),
    },
    data: {
      tratamientos: stripInternal(s.tratamientos),
      proveedores: stripInternal(s.proveedores),
      captacion: stripInternal(s.captacion),
      solicitudes: stripInternal(s.solicitudes),
      incidentes: stripInternal(s.incidentes),
      tareas: stripInternal(s.tareas),
      evidencias: stripInternal(s.evidencias),
      revisiones: stripInternal(s.revisiones),
      auditoria: snapshot.auditoria,
    },
  };
}
