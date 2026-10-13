// Servicio del espacio de trabajo: validación (schema.ts) + persistencia
// (funciones SQL de la migración). Separado de las rutas para poder probarlo
// con un repositorio en memoria.
//
// La autorización llega YA resuelta: el workspaceId sale siempre de la sesión
// (cookie firmada → pedido activo → su espacio), nunca del cliente. Los ids de
// fila que manda el cliente solo se usan junto a ese workspaceId, y la función
// SQL filtra por ambos: un id de otro espacio da "not_found".

import { isUuid } from "../commerce/tokens";
import { RGPD_OPS_PRODUCT } from "../../data/rgpd-ops";
import { SEED_TASKS } from "../../data/rgpd-ops-content";
import { db, fail, RgpdOpsStorageError } from "./db";
import { isEntitySlug, validateCreate, validatePatch, validateProfile, type EntitySlug, type ValidationIssue } from "./schema";
import type { ClientSnapshot, WorkspaceSnapshot } from "./types";

export const MAX_ROWS_PER_ENTITY = 500;

export type RepoResult =
  | { status: "ok"; row: Record<string, unknown> }
  | { status: "conflict"; current: Record<string, unknown> }
  | { status: "not_found" }
  | { status: "limit" };

export interface WorkspaceRepo {
  findWorkspaceId(orderId: string): Promise<string | null>;
  ensureWorkspace(orderId: string): Promise<{ workspace_id: string; created: boolean }>;
  snapshot(workspaceId: string): Promise<WorkspaceSnapshot | null>;
  createEntity(workspaceId: string, slug: EntitySlug, values: Record<string, unknown>, maxRows: number): Promise<RepoResult>;
  updateEntity(workspaceId: string, slug: EntitySlug, id: string, version: number, patch: Record<string, unknown>): Promise<RepoResult>;
  deleteEntity(workspaceId: string, slug: EntitySlug, id: string, version: number): Promise<RepoResult>;
  updateProfile(workspaceId: string, version: number, profile: Record<string, unknown>): Promise<RepoResult>;
  logEvent(workspaceId: string, action: "export" | "access", detail?: string): Promise<void>;
}

// ---------------------------------------------------------------- repositorio Supabase

async function rpc<T>(fn: string, args: Record<string, unknown>, code: string): Promise<T> {
  const { data, error } = await db().rpc(fn, args);
  if (error) fail(error, code);
  return data as T;
}

export const supabaseRepo: WorkspaceRepo = {
  async findWorkspaceId(orderId) {
    const { data, error } = await db().from("rgpd_ops_workspaces").select("id").eq("order_id", orderId).maybeSingle();
    if (error) fail(error, "workspace_select_failed");
    return (data as { id: string } | null)?.id ?? null;
  },
  ensureWorkspace(orderId) {
    return rpc("rgpd_ops_ensure_workspace", { p_order_id: orderId, p_product_version: RGPD_OPS_PRODUCT.version, p_seed_tasks: SEED_TASKS }, "workspace_ensure_failed");
  },
  snapshot(workspaceId) {
    return rpc("rgpd_ops_workspace_snapshot", { p_workspace: workspaceId, p_limit: MAX_ROWS_PER_ENTITY }, "workspace_snapshot_failed");
  },
  createEntity(workspaceId, slug, values, maxRows) {
    return rpc("rgpd_ops_entity_create", { p_workspace: workspaceId, p_entity: slug, p_values: values, p_max_rows: maxRows }, "entity_create_failed");
  },
  updateEntity(workspaceId, slug, id, version, patch) {
    return rpc("rgpd_ops_entity_update", { p_workspace: workspaceId, p_entity: slug, p_id: id, p_version: version, p_patch: patch }, "entity_update_failed");
  },
  deleteEntity(workspaceId, slug, id, version) {
    return rpc("rgpd_ops_entity_delete", { p_workspace: workspaceId, p_entity: slug, p_id: id, p_version: version }, "entity_delete_failed");
  },
  updateProfile(workspaceId, version, profile) {
    return rpc("rgpd_ops_update_profile", { p_workspace: workspaceId, p_version: version, p_profile: profile }, "profile_update_failed");
  },
  async logEvent(workspaceId, action, detail) {
    await rpc("rgpd_ops_log_event", { p_workspace: workspaceId, p_action: action, p_detail: detail ?? null }, "audit_log_failed");
  },
};

// ---------------------------------------------------------------- servicio

export interface ServiceResult {
  status: number;
  body: Record<string, unknown>;
}

const bad = (code: string, error: string, issues?: ValidationIssue[]): ServiceResult => ({
  status: 400,
  body: { error, code, ...(issues ? { issues } : {}) },
});

function versionOf(raw: unknown): number | null {
  return typeof raw === "number" && Number.isInteger(raw) && raw >= 1 && raw <= 1_000_000 ? raw : null;
}

/** Quita el id del pedido antes de entregar el espacio al navegador. */
export function toClientSnapshot(s: WorkspaceSnapshot): ClientSnapshot {
  const { order_id: _order, ...workspace } = s.workspace;
  return { ...s, workspace };
}

function fromRepo(result: RepoResult, okStatus = 200): ServiceResult {
  switch (result.status) {
    case "ok":
      return { status: okStatus, body: { ok: true, row: result.row } };
    case "conflict":
      return {
        status: 409,
        body: { error: "Otro cambio se guardó antes que el tuyo (¿otra pestaña?). Revisa la versión actual.", code: "version_conflict", current: result.current },
      };
    case "not_found":
      return { status: 404, body: { error: "No existe o ya se borró.", code: "not_found" } };
    case "limit":
      return { status: 422, body: { error: `Has llegado al máximo de ${MAX_ROWS_PER_ENTITY} registros en este módulo.`, code: "row_limit" } };
  }
}

/** Traduce errores de restricciones de la BD a respuestas sin detalles internos. */
export function mapStorageError(error: unknown): ServiceResult | null {
  if (!(error instanceof RgpdOpsStorageError)) return null;
  if (error.code.endsWith(":23505")) return { status: 409, body: { error: "Ya existe un registro con esa referencia o periodo.", code: "duplicate" } };
  if (error.code.endsWith(":23514") || error.code.endsWith(":22023") || error.code.endsWith(":22P02") || error.code.endsWith(":22007") || error.code.endsWith(":22008"))
    return { status: 400, body: { error: "Algún valor no es válido.", code: "invalid_values" } };
  return null;
}

export async function serviceCreate(repo: WorkspaceRepo, workspaceId: string, slug: unknown, body: unknown, now = new Date()): Promise<ServiceResult> {
  if (!isEntitySlug(slug)) return { status: 404, body: { error: "Módulo desconocido.", code: "unknown_entity" } };
  const values = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).values : undefined;
  const v = validateCreate(slug, values, now);
  if (!v.ok) return bad("validation_failed", "Revisa los campos marcados.", v.issues);
  return fromRepo(await repo.createEntity(workspaceId, slug, v.values, MAX_ROWS_PER_ENTITY), 201);
}

export async function serviceUpdate(repo: WorkspaceRepo, workspaceId: string, slug: unknown, id: unknown, body: unknown, now = new Date()): Promise<ServiceResult> {
  if (!isEntitySlug(slug)) return { status: 404, body: { error: "Módulo desconocido.", code: "unknown_entity" } };
  if (!isUuid(id)) return { status: 404, body: { error: "No existe o ya se borró.", code: "not_found" } };
  const input = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const version = versionOf(input.version);
  if (!version) return bad("version_required", "Falta la versión del registro.");
  const v = validatePatch(slug, input.values, now);
  if (!v.ok) return bad("validation_failed", "Revisa los campos marcados.", v.issues);
  return fromRepo(await repo.updateEntity(workspaceId, slug, id, version, v.values));
}

export async function serviceDelete(repo: WorkspaceRepo, workspaceId: string, slug: unknown, id: unknown, body: unknown): Promise<ServiceResult> {
  if (!isEntitySlug(slug)) return { status: 404, body: { error: "Módulo desconocido.", code: "unknown_entity" } };
  if (!isUuid(id)) return { status: 404, body: { error: "No existe o ya se borró.", code: "not_found" } };
  const input = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const version = versionOf(input.version);
  if (!version) return bad("version_required", "Falta la versión del registro.");
  const result = await repo.deleteEntity(workspaceId, slug, id, version);
  if (result.status === "ok") return { status: 200, body: { ok: true, id } };
  return fromRepo(result);
}

export async function serviceUpdateProfile(repo: WorkspaceRepo, workspaceId: string, body: unknown): Promise<ServiceResult> {
  const input = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const version = versionOf(input.version);
  if (!version) return bad("version_required", "Falta la versión del espacio.");
  const v = validateProfile(input.profile);
  if (!v.ok) return bad("validation_failed", "Revisa los campos marcados.", v.issues);
  const result = await repo.updateProfile(workspaceId, version, v.values);
  if (result.status === "ok") {
    const { order_id: _o, ...ws } = result.row as Record<string, unknown>;
    return { status: 200, body: { ok: true, workspace: ws } };
  }
  if (result.status === "conflict") {
    const { order_id: _o, ...ws } = result.current as Record<string, unknown>;
    return fromRepo({ status: "conflict", current: ws });
  }
  return fromRepo(result);
}
