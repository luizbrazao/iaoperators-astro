// Persistencia de assessments. Parametrizada por `assessmentKey` desde el día uno:
// el test de Verifactu (Frente B) reutiliza esta capa sin tocar nada.
//
// Tabla propia (`assessment_responses`), separada de `survey_responses`: distinta
// base de consentimiento (lead comercial vs. estudio anónimo) y distinto ciclo de
// vida. Comparte las variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// que ya están configuradas en Vercel, así que no requiere config nueva.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AssessmentConsent, AssessmentRecord } from "./types";

function readEnv(name: string) {
  const importMetaEnv =
    typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;
  return importMetaEnv?.[name] ?? process.env[name];
}

const TABLE = readEnv("ASSESSMENT_SUPABASE_TABLE") || "assessment_responses";

let client: SupabaseClient | null = null;

export class AssessmentStorageError extends Error {
  code: string;
  constructor(message: string, code = "assessment_storage_error", cause?: unknown) {
    super(message, cause ? { cause } : undefined);
    this.name = "AssessmentStorageError";
    this.code = code;
  }
}

export function isAssessmentStorageError(error: unknown): error is AssessmentStorageError {
  return error instanceof AssessmentStorageError;
}

export function isStorageConfigured() {
  return Boolean(readEnv("SUPABASE_URL") && readEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

function getClient(): SupabaseClient {
  const url = readEnv("SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new AssessmentStorageError(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no están configuradas.",
      "assessment_storage_unconfigured",
    );
  }
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

function recordToRow(record: AssessmentRecord) {
  return {
    response_id: record.responseId,
    assessment_key: record.assessmentKey,
    version: record.version,
    locale: record.locale,
    answers: record.answers,
    result: record.result,
    obligado: record.result.obligado,
    risk_level: record.result.riskLevel,
    risk_score: record.result.riskScore,
    sector: record.result.sector,
    engine_version: record.result.engineVersion,
    email: record.email ?? null,
    consent: record.consent ?? {},
    duration_ms: Math.max(0, Math.round(record.durationMs || 0)),
    landing_path: record.source.landingPath,
    referrer: record.source.referrer,
    utm_source: record.source.utmSource,
    utm_medium: record.source.utmMedium,
    utm_campaign: record.source.utmCampaign,
    utm_term: record.source.utmTerm,
    utm_content: record.source.utmContent,
    user_agent_hash: record.source.userAgentHash,
    device_category: record.source.deviceCategory,
    fingerprint_hash: record.source.fingerprintHash,
  };
}

/**
 * Guarda el assessment completado. Devuelve si se pudo persistir.
 *
 * NO lanza hacia el usuario: si Supabase falla, el resultado igualmente se le
 * muestra (ya lo ha "pagado" con 2 minutos de su tiempo). El fallo se registra
 * en consola y se marca `persisted: false`; el paso de email vuelve a intentarlo
 * enviando el registro completo, de modo que el lead —que es la parte de valor—
 * no se pierde por un fallo transitorio en la primera llamada.
 */
export async function persistAssessment(record: AssessmentRecord): Promise<boolean> {
  try {
    const { error } = await getClient().from(TABLE).upsert(recordToRow(record), {
      onConflict: "response_id",
    });
    if (error) throw new AssessmentStorageError(error.message, "assessment_insert_failed", error);
    return true;
  } catch (error) {
    console.error("[assessment/storage] persist failed", error);
    return false;
  }
}

/**
 * Adjunta el email y el consentimiento a un assessment ya guardado.
 * Si la fila no existe (porque el primer guardado falló), reinserta el registro
 * completo que envía el cliente. Idempotente por response_id.
 */
export async function attachAssessmentLead(input: {
  responseId: string;
  email: string;
  consent: AssessmentConsent;
  fallbackRecord?: AssessmentRecord;
}): Promise<{ created: boolean; alreadyHadEmail: boolean }> {
  const supabase = getClient();

  const { data, error: selectError } = await supabase
    .from(TABLE)
    .select("response_id, email")
    .eq("response_id", input.responseId)
    .maybeSingle();

  if (selectError) {
    throw new AssessmentStorageError(selectError.message, "assessment_select_failed", selectError);
  }

  if (!data) {
    if (!input.fallbackRecord) {
      throw new AssessmentStorageError(
        "No existe el assessment indicado y no se envió registro de respaldo.",
        "assessment_not_found",
      );
    }
    const row = recordToRow({
      ...input.fallbackRecord,
      responseId: input.responseId,
      email: input.email,
      consent: input.consent,
    });
    const { error } = await supabase.from(TABLE).upsert(row, { onConflict: "response_id" });
    if (error) {
      throw new AssessmentStorageError(error.message, "assessment_insert_failed", error);
    }
    return { created: true, alreadyHadEmail: false };
  }

  // Si ya tenía email, es un reenvío: lo registramos igual pero el endpoint no
  // vuelve a mandar correos. Evita usar el formulario como amplificador de spam.
  const alreadyHadEmail = Boolean((data as { email?: string | null }).email);

  const { error } = await supabase
    .from(TABLE)
    .update({
      email: input.email,
      consent: input.consent,
      lead_at: new Date().toISOString(),
    })
    .eq("response_id", input.responseId);

  if (error) {
    throw new AssessmentStorageError(error.message, "assessment_update_failed", error);
  }
  return { created: false, alreadyHadEmail };
}
