// Cliente de Supabase de RGPD Ops (service role, solo server-side).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readEnv, RgpdOpsConfigError } from "./env";

export class RgpdOpsStorageError extends Error {
  code: string;
  constructor(message: string, code = "rgpd_ops_storage_error", cause?: unknown) {
    super(message, cause ? { cause } : undefined);
    this.name = "RgpdOpsStorageError";
    this.code = code;
  }
}

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  const url = readEnv("SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new RgpdOpsConfigError([!url && "SUPABASE_URL", !key && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean) as string[]);
  }
  if (!client) client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** El mensaje de PostgREST no contiene datos de filas; el código de Postgres se conserva. */
export function fail(error: { message: string; code?: string } | null, code: string): never {
  throw new RgpdOpsStorageError(error?.message ?? code, error?.code ? `${code}:${error.code}` : code, error);
}
