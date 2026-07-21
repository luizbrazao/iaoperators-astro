import type { APIContext } from "astro";
import { basicAuthMatches } from "./utils";

export function requireSurveyAdminAuth(request: Request) {
  const user = import.meta.env.SURVEY_ADMIN_USER;
  const password = import.meta.env.SURVEY_ADMIN_PASSWORD;
  const isDev = import.meta.env.DEV;

  if ((!user || !password) && isDev) {
    return null;
  }

  if (!user || !password) {
    return new Response("Survey admin credentials are not configured.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (basicAuthMatches(request.headers.get("authorization"), user, password)) {
    return null;
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "www-authenticate": 'Basic realm="IA Operators Survey Admin"',
    },
  });
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function parseBody<T>(context: APIContext) {
  return context.request.json().catch(() => null as T | null);
}
