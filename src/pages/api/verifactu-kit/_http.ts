// Utilidades HTTP compartidas por los endpoints del Kit. El prefijo "_" hace
// que Astro no lo publique como ruta.

export const NO_STORE_HEADERS = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
  "referrer-policy": "no-referrer",
} as const;

export function jsonResponse(data: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(requestId ? { ...(data as object), requestId } : data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...NO_STORE_HEADERS },
  });
}

export function methodNotAllowed(allow: string): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { allow, "content-type": "text/plain; charset=utf-8", ...NO_STORE_HEADERS },
  });
}

export function redirect303(location: string, headers?: Headers): Response {
  const h = new Headers(headers);
  h.set("location", location);
  for (const [k, v] of Object.entries(NO_STORE_HEADERS)) h.set(k, v);
  return new Response(null, { status: 303, headers: h });
}
