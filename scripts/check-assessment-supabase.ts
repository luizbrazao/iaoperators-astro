// Verifica que la tabla del test de cumplimiento existe y que PostgREST la ve.
// Uso: npm run assessment:check-supabase
// (con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno)

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const table = process.env.ASSESSMENT_SUPABASE_TABLE || "assessment_responses";

if (!url || !key) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: "missing_env",
        required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error, count } = await supabase.from(table).select("*", { count: "exact", head: true });

const warnings: string[] = [];
if (error?.code === "PGRST205") {
  warnings.push(
    `PostgREST no reconoce ${table}. Aplica la migración 20260726190000_create_assessment_responses.sql y recarga el schema cache con NOTIFY pgrst, 'reload schema';`,
  );
}

// Reparto de leads por veredicto: si la tabla ya tiene datos, esto es el primer
// indicador de si el canal está trayendo empresas realmente obligadas.
let breakdown: Record<string, number> | null = null;
if (!error) {
  const { data } = await supabase
    .from(table)
    .select("obligado")
    .eq("assessment_key", "sac-ley-10-2025")
    .not("email", "is", null);
  if (data) {
    breakdown = data.reduce<Record<string, number>>((acc, row) => {
      const k = String((row as { obligado?: string }).obligado ?? "desconocido");
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
  }
}

console.log(
  JSON.stringify(
    {
      ok: !error,
      table,
      count: error ? null : count,
      leadsPorVeredicto: breakdown,
      error: error
        ? { message: error.message, code: error.code, details: error.details, hint: error.hint }
        : null,
      warnings,
    },
    null,
    2,
  ),
);

process.exit(error ? 1 : 0);
