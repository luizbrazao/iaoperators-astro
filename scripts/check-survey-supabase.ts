import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const responsesTable = process.env.SURVEY_SUPABASE_RESPONSES_TABLE || "survey_responses";
const emailsTable = process.env.SURVEY_SUPABASE_EMAILS_TABLE || "survey_response_emails";

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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkTable(table: string) {
  const { error, count } = await supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });

  return {
    table,
    ok: !error,
    count: error ? null : count,
    error: error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      : null,
  };
}

const responses = await checkTable(responsesTable);
const emails = await checkTable(emailsTable);

const warnings: string[] = [];

for (const result of [responses, emails]) {
  if (result.error?.code === "PGRST205") {
    warnings.push(
      `PostgREST no reconoce ${result.table}. Aplica la migración SQL y/o recarga el schema cache con NOTIFY pgrst, 'reload schema';`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok: responses.ok && emails.ok,
      responses,
      emails,
      warnings,
    },
    null,
    2,
  ),
);

process.exit(responses.ok && emails.ok ? 0 : 1);
