// Acceso a Supabase de «Problema Resuelto» (service role, solo servidor). Las
// tablas y funciones están en
// supabase/migrations/20261104120000_create_problema_resuelto.sql.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Ficha } from "../types";
import type { StorageConfig } from "./env";
import type { CasoRow, CasoStore } from "./service";

export class ProblemaStorageError extends Error {
  code: string;
  constructor(code: string, cause?: unknown) {
    // El mensaje de PostgREST no se propaga: a los logs solo llega el código.
    super(code, cause ? { cause } : undefined);
    this.name = "ProblemaStorageError";
    this.code = code;
  }
}

const TABLE = "problema_resuelto_casos";

let cached: { key: string; client: SupabaseClient } | null = null;

function client(config: StorageConfig): SupabaseClient {
  const key = `${config.supabaseUrl}|${config.serviceRoleKey.length}`;
  if (!cached || cached.key !== key) {
    cached = {
      key,
      client: createClient(config.supabaseUrl, config.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    };
  }
  return cached.client;
}

function fail(error: { code?: string } | null, code: string): never {
  throw new ProblemaStorageError(error?.code ? `${code}:${error.code}` : code, error);
}

export function createSupabaseCasoStore(config: StorageConfig): CasoStore {
  const db = () => client(config);
  return {
    async rateLimitHit(key, limit, windowSeconds) {
      const { data, error } = await db().rpc("problema_resuelto_rate_limit_hit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (error) fail(error, "rate_limit_failed");
      return data === true;
    },

    async insertCaso(row: CasoRow) {
      const { data, error } = await db().from(TABLE).insert(row).select("id").single();
      if (!error && data) return { id: String(data.id), created: true };
      // 23505 = unique_violation: el mismo submission_id ya está guardado.
      if (error?.code === "23505") {
        const existing = await db().from(TABLE).select("id").eq("submission_id", row.submission_id).single();
        if (existing.error || !existing.data) fail(existing.error, "caso_lookup_failed");
        return { id: String(existing.data.id), created: false };
      }
      fail(error, "caso_insert_failed");
    },

    async saveFicha(casoId: string, ficha: Ficha | null, status: "ok" | "failed" | "skipped", errorCode: string | null, model: string | null) {
      const { error } = await db()
        .from(TABLE)
        .update({ ficha, ficha_status: status, ficha_error_code: errorCode, llm_model: model })
        .eq("id", casoId);
      if (error) fail(error, "ficha_save_failed");
    },

    async claimNotification(casoId) {
      const { data, error } = await db().rpc("problema_resuelto_claim_notification", { p_caso_id: casoId });
      if (error) fail(error, "notification_claim_failed");
      return data === true;
    },

    async markNotification(casoId, status, errorCode, at) {
      const { error } = await db()
        .from(TABLE)
        .update({
          notification_status: status,
          notification_error_code: errorCode,
          notification_sent_at: status === "sent" ? at.toISOString() : null,
        })
        .eq("id", casoId)
        .eq("notification_status", "sending");
      if (error) fail(error, "notification_mark_failed");
    },
  };
}
