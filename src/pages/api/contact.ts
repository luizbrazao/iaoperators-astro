import type { APIRoute } from "astro";

// Astro v5: garante que essa rota NÃO será pré-gerada no build,
// virando um endpoint “on-demand” (ex.: Vercel Function).
export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isValidEmail(email: string) {
  // validação simples (não “perfeita”, mas suficiente aqui)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// rate limit best-effort em memória (funciona em dev e em server único)
const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (b.count >= limit) return { ok: false, retryAfterMs: b.resetAt - now };
  b.count++;
  return { ok: true };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json().catch(() => null);

    // honeypot: se preencher, é bot
    const hp = String(body?.website ?? "").trim();
    if (hp) return json({ ok: true }, 200);

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const company = String(body?.company ?? "").trim();
    const city = String(body?.city ?? "").trim();
    const budget = String(body?.budget ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const source = String(body?.source ?? "contact-page").trim();

    if (!name || !email || !company) {
      return json({ error: "Missing required fields: name, email, company." }, 400);
    }
    if (!isValidEmail(email)) {
      return json({ error: "Invalid email." }, 400);
    }

    // rate limit por IP (best effort)
    const ip = clientAddress || "unknown";
    const rl = rateLimit(ip, 8, 60_000);
    if (!rl.ok) {
      return json({ error: "Too many requests. Try again shortly." }, 429);
    }

    // Se você configurar RESEND_API_KEY, envia email.
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    const TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || "info@iaoperators.com";
    const FROM_EMAIL = import.meta.env.CONTACT_FROM_EMAIL || "IA Operators <onboarding@resend.dev>";

    const payload = {
      name,
      email,
      company,
      city: city || null,
      budget: budget || null,
      message: message || null,
      source,
      createdAt: new Date().toISOString(),
      ip,
    };

    if (RESEND_API_KEY) {
      // Envio via Resend REST API (sem SDK)
      const subject = `New lead: ${name} (${company})`;
      const html = `
        <h2>New contact lead</h2>
        <ul>
          <li><b>Name:</b> ${escapeHtml(name)}</li>
          <li><b>Email:</b> ${escapeHtml(email)}</li>
          <li><b>Company:</b> ${escapeHtml(company)}</li>
          <li><b>City:</b> ${escapeHtml(city)}</li>
          <li><b>Budget:</b> ${escapeHtml(budget)}</li>
          <li><b>Source:</b> ${escapeHtml(source)}</li>
          <li><b>IP:</b> ${escapeHtml(ip)}</li>
        </ul>
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
      `;

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [TO_EMAIL],
          reply_to: email,
          subject,
          html,
        }),
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        console.error("[contact] Resend error", r.status, txt);
        return json({ error: "Failed to send message. Try again later." }, 502);
      }

      return json({ ok: true });
    }

    // Sem Resend: só loga (não quebra o front)
    console.log("[contact] lead (no email configured)", payload);
    return json({ ok: true });
  } catch (err) {
    console.error("[contact] unexpected error", err);
    return json({ error: "Unexpected error." }, 500);
  }
};

function escapeHtml(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
