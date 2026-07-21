import type { APIRoute } from "astro";
import { requireSurveyAdminAuth, json } from "@/lib/survey/admin";
import { flagSurveySession } from "@/lib/survey/storage";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const auth = requireSurveyAdminAuth(request);
  if (auth) return auth;

  try {
    const body = await request.json().catch(() => null);
    const responseId = String(body?.responseId ?? "").trim();
    const reviewStatus = String(body?.reviewStatus ?? "").trim();
    const note = String(body?.note ?? "").trim();

    if (!responseId || !reviewStatus) {
      return json({ error: "Faltan datos para actualizar la revisión." }, 400);
    }

    const record = await flagSurveySession({
      responseId,
      reviewStatus: reviewStatus as "clean" | "needs_review" | "reviewed",
      note: note || undefined,
    });

    return json({ ok: true, reviewStatus: record.reviewStatus });
  } catch (error) {
    console.error("[survey/review] failed", error);
    return json({ error: "No se pudo actualizar el estado de revisión." }, 500);
  }
};
