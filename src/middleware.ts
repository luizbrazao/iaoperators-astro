import { defineMiddleware } from "astro:middleware";
import { requireSurveyAdminAuth } from "@/lib/survey/admin";

const PROTECTED_PREFIXES = ["/es/admin/segunda-factura-ia/"];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const requiresAdminAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (requiresAdminAuth) {
    const auth = requireSurveyAdminAuth(context.request);
    if (auth) return auth;
  }

  return next();
});
