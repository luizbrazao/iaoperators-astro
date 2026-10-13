// Tipos de las filas del espacio de trabajo tal y como las devuelve
// rgpd_ops_workspace_snapshot(). Públicos (los usa la island).

export interface BaseRow {
  id: string;
  workspace_id: string;
  version: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow extends BaseRow {
  name: string;
  purpose: string;
  data_subjects: string[];
  data_categories: string[];
  recipients: string;
  transfers: "no" | "si" | "por_determinar";
  transfer_details: string;
  retention: string;
  security_measures: string;
  legal_basis: string;
  legal_basis_note: string;
  status: "borrador" | "en_revision" | "revisado";
  last_reviewed_on: string | null;
}

export interface ProcessorRow extends BaseRow {
  name: string;
  service_category: string;
  role_estimate: string;
  location: "ue_eee" | "fuera_eee" | "mixta" | "desconocida";
  transfer_mechanism: string;
  dpa_status: "verificado" | "pendiente" | "no_aplica";
  dpa_reference: string;
  last_review_on: string | null;
  next_review_on: string | null;
}

export interface CollectionPointRow extends BaseRow {
  name: string;
  kind: string;
  location_ref: string;
  notice_status: "completo" | "parcial" | "pendiente" | "no_aplica";
  layered_info: "si" | "no" | "no_aplica";
  consent_status: "registrado" | "pendiente" | "no_aplica" | "por_determinar";
  last_review_on: string | null;
}

export interface RightsRequestRow extends BaseRow {
  reference: string;
  request_type: string;
  received_on: string;
  due_on: string;
  extended: boolean;
  extended_due_on: string | null;
  extension_notified_on: string | null;
  status: "recibida" | "en_curso" | "respondida" | "denegada" | "archivada";
  responded_on: string | null;
}

export interface IncidentRow extends BaseRow {
  reference: string;
  detected_at: string;
  data_categories: string[];
  affected_scope: string;
  description: string;
  internal_assessment: "sin_evaluar" | "riesgo_improbable" | "riesgo" | "alto_riesgo";
  escalation_decision: "pendiente" | "no_notificar_documentado" | "notificar_aepd" | "notificar_aepd_y_afectados";
  decision_reason: string;
  measures: string;
  aepd_notified_at: string | null;
  subjects_communicated_at: string | null;
  status: "abierto" | "cerrado";
  closed_at: string | null;
}

export interface TaskRow extends BaseRow {
  title: string;
  area: string;
  owner_role: string;
  priority: "alta" | "media" | "baja";
  due_on: string | null;
  status: "pendiente" | "en_curso" | "hecha" | "descartada";
  completed_at: string | null;
  seed_key: string | null;
}

export interface EvidenceRow extends BaseRow {
  title: string;
  area: string;
  kind: string;
  location_ref: string;
  evidence_date: string | null;
  review_due_on: string | null;
}

export interface ReviewRow extends BaseRow {
  period: string;
  status: "en_curso" | "completada";
  checklist: Record<string, boolean>;
  summary: string;
  started_at: string;
  completed_at: string | null;
}

export interface AuditRow {
  id: string;
  occurred_at: string;
  actor: string;
  action: string;
  entity: string | null;
  entity_id: string | null;
  fields: string[];
  detail: string | null;
}

export interface WorkspaceRow {
  id: string;
  order_id: string;
  product_version: string;
  schema_version: number;
  version: number;
  profile: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceSnapshot {
  workspace: WorkspaceRow;
  tratamientos: ActivityRow[];
  proveedores: ProcessorRow[];
  captacion: CollectionPointRow[];
  solicitudes: RightsRequestRow[];
  incidentes: IncidentRow[];
  tareas: TaskRow[];
  evidencias: EvidenceRow[];
  revisiones: ReviewRow[];
  auditoria: AuditRow[];
}

/** Lo que el servidor entrega a la island: el snapshot sin el id del pedido. */
export type ClientSnapshot = Omit<WorkspaceSnapshot, "workspace"> & {
  workspace: Omit<WorkspaceRow, "order_id">;
};
