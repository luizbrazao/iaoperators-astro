import type { APIRoute } from "astro";
import { requireSurveyAdminAuth } from "@/lib/survey/admin";
import { recordsToCsv } from "@/lib/survey/csv";
import { listSurveyRecords } from "@/lib/survey/storage";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const auth = requireSurveyAdminAuth(request);
  if (auth) return auth;

  const status = url.searchParams.get("status") ?? undefined;
  const reviewStatus = url.searchParams.get("review") ?? undefined;
  const version = url.searchParams.get("version") ?? undefined;
  const campaign = url.searchParams.get("campaign") ?? undefined;
  const anonymized = url.searchParams.get("anon") === "1";

  const records = await listSurveyRecords({ status, reviewStatus, version, campaign });
  const csv = recordsToCsv(records, { anonymized });

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "cache-control": "no-store",
      "content-disposition": `attachment; filename="${anonymized ? "encuesta-segunda-factura-ia-anon" : "encuesta-segunda-factura-ia"}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
};
