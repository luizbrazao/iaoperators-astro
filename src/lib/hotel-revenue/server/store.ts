// Acceso a Supabase del Hotel Revenue Operator (service role, solo servidor).
// Las tablas y funciones están en
// supabase/migrations/20261014120000_create_hotel_revenue_leads.sql.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LeadStorageConfig } from "./env";
import type { LeadRow, LeadStore } from "./service";

export class HotelRevenueStorageError extends Error {
  code: string;
  constructor(code: string, cause?: unknown) {
    // El mensaje de PostgREST no contiene datos de filas, pero no se propaga:
    // a los logs solo llega el código.
    super(code, cause ? { cause } : undefined);
    this.name = "HotelRevenueStorageError";
    this.code = code;
  }
}

const TABLE = "hotel_revenue_leads";

let cached: { key: string; client: SupabaseClient } | null = null;

function client(config: LeadStorageConfig): SupabaseClient {
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
  throw new HotelRevenueStorageError(error?.code ? `${code}:${error.code}` : code, error);
}

export function createSupabaseLeadStore(config: LeadStorageConfig): LeadStore {
  const db = () => client(config);
  return {
    async rateLimitHit(key, limit, windowSeconds) {
      const { data, error } = await db().rpc("hotel_revenue_rate_limit_hit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (error) fail(error, "rate_limit_failed");
      return data === true;
    },

    async insertLead(row: LeadRow) {
      const { data, error } = await db().from(TABLE).insert(row).select("id").single();
      if (!error && data) return { id: String(data.id), created: true };
      // 23505 = unique_violation: el mismo submission_id ya está guardado
      // (doble clic o reintento). Se devuelve el lead existente.
      if (error?.code === "23505") {
        const existing = await db().from(TABLE).select("id").eq("submission_id", row.submission_id).single();
        if (existing.error || !existing.data) fail(existing.error, "lead_lookup_failed");
        return { id: String(existing.data.id), created: false };
      }
      fail(error, "lead_insert_failed");
    },

    async claimNotification(leadId) {
      const { data, error } = await db().rpc("hotel_revenue_claim_notification", { p_lead_id: leadId });
      if (error) fail(error, "notification_claim_failed");
      return data === true;
    },

    async markNotification(leadId, status, errorCode, at) {
      const { error } = await db()
        .from(TABLE)
        .update({
          notification_status: status,
          notification_error_code: errorCode,
          notification_sent_at: status === "sent" ? at.toISOString() : null,
        })
        .eq("id", leadId)
        .eq("notification_status", "sending");
      if (error) fail(error, "notification_mark_failed");
    },
  };
}
