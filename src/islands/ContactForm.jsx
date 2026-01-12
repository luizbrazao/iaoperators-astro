// /Users/luizbrazao/Projetos/iaoperators-astro/src/islands/ContactForm.jsx

import { useMemo, useState } from "react";
import { getLocale, ui } from "../i18n/ui";

function safeGet(obj, path, fallback) {
  try {
    return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
}

async function safeReadResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return { json };
    }
    const text = await res.text();
    return { text };
  } catch {
    return {};
  }
}

export default function ContactForm({ locale: localeProp = "es" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const locale = useMemo(() => getLocale(localeProp), [localeProp]);

  const dict = ui?.[locale] ?? ui?.es ?? ui?.en ?? ui?.pt ?? {};
  const contact = safeGet(dict, "contact", safeGet(dict, "home.contact", {}));

  const t = {
    badge: contact?.badge ?? "Contact",
    title: contact?.title ?? "Let’s talk",
    subtitle: contact?.subtitle ?? "Tell us what you want to build.",
    formTitle: contact?.formTitle ?? "Send us a message",
    name: contact?.name ?? "Name",
    namePlaceholder: contact?.namePlaceholder ?? "Your name",
    email: contact?.email ?? "Email",
    emailPlaceholder: contact?.emailPlaceholder ?? "you@email.com",
    company: contact?.company ?? "Company",
    companyPlaceholder: contact?.companyPlaceholder ?? "Company name",
    city: contact?.city ?? "City",
    cityPlaceholder: contact?.cityPlaceholder ?? "Málaga",
    budget: contact?.budget ?? "Budget",
    budgetPlaceholder: contact?.budgetPlaceholder ?? "Select one",
    message: contact?.message ?? "Message",
    messagePlaceholder: contact?.messagePlaceholder ?? "Tell us briefly what you need",
    send: contact?.send ?? "Send",
    sending: contact?.sending ?? "Sending...",
    sla: contact?.sla ?? "We usually reply within 24 hours.",
    errorGeneric: contact?.errorGeneric ?? "Something went wrong. Try again.",
    errorWhatsapp: contact?.errorWhatsapp ?? "If it fails, contact us on WhatsApp.",
    successText: contact?.successText ?? "We received your message. We’ll contact you soon.",
    backHome: contact?.backHome ?? "Back home",
    whatsappText: contact?.whatsappText ?? "Hi! I want to talk about AI Operators.",
    whatsapp: contact?.whatsapp ?? "WhatsApp",
    office: contact?.office ?? "Office",
    faq: contact?.faq ?? "FAQ",
    faq1q: contact?.faq1q ?? "How fast do you reply?",
    faq1a: contact?.faq1a ?? "Usually within 24 hours.",
    faq2q: contact?.faq2q ?? "Do you work with small businesses?",
    faq2a: contact?.faq2a ?? "Yes—projects are adapted to your stage.",
    faq3q: contact?.faq3q ?? "Can we start with a pilot?",
    faq3a: contact?.faq3a ?? "Yes. We can validate ROI quickly.",
    budgetOptions: [
      contact?.budgetLess1k ?? "Less than €1k",
      contact?.budget1to3k ?? "€1k–€3k",
      contact?.budget3to5k ?? "€3k–€5k",
      contact?.budgetMore5k ?? "More than €5k",
      contact?.budgetCustom ?? "Custom",
    ],
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact-page" }),
        signal: controller.signal,
      });

      const payload = await safeReadResponse(res);

      if (res.ok) {
        setSuccess(true);
        form.reset();
        return;
      }

      const backendError =
        payload?.json?.error ||
        payload?.json?.message ||
        (typeof payload?.text === "string" && payload.text.trim().slice(0, 300));

      setError(backendError || t.errorGeneric || `HTTP ${res.status}`);
    } catch (err) {
      if (err?.name === "AbortError") {
        setError(t.errorGeneric || "Timeout. Try again.");
      } else {
        setError(t.errorWhatsapp);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-transparent text-white min-h-screen flex items-center justify-center">
        <div className="max-w-2xl text-center p-8">
          <h1 id="msg-sucesso-lead" className="text-3xl font-bold mb-4">
            ¡Gracias por contactarnos!
          </h1>
          <p className="text-gray-300 mb-8">{t.successText}</p>
          <a
            href={`/${locale}/`}
            className="px-6 py-3 rounded-lg bg-orange-500 font-bold"
          >
            {t.backHome}
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 px-4 bg-[#101010]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 bg-linear-to-b from-[#212121] to-[#111] rounded-2xl p-6 md:p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">{t.formTitle}</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* honeypot anti-spam */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-300">{t.name} *</span>
                <input
                  required
                  name="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  className="mt-1 w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-300">{t.email} *</span>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  className="mt-1 w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 outline-none focus:border-orange-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-300">{t.company} *</span>
                <input
                  required
                  name="company"
                  type="text"
                  placeholder={t.companyPlaceholder}
                  className="mt-1 w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-300">{t.city}</span>
                <input
                  name="city"
                  type="text"
                  placeholder={t.cityPlaceholder}
                  className="mt-1 w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 outline-none focus:border-orange-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-gray-300">{t.budget} *</span>
              <select
                name="budget"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 outline-none focus:border-orange-500"
              >
                <option value="" disabled>
                  {t.budgetPlaceholder}
                </option>
                {t.budgetOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">{t.message}</span>
              <textarea
                name="message"
                rows={6}
                placeholder={t.messagePlaceholder}
                className="mt-1 w-full rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 outline-none focus:border-orange-500"
              />
            </label>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-2">
                <span aria-hidden="true">⚠</span> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 active:scale-100 transition disabled:opacity-60"
            >
              <span aria-hidden="true">➤</span> {loading ? t.sending : t.send}
            </button>

            <p className="text-xs text-gray-400">{t.sla}</p>
          </form>
        </div>

        {/* Sidebar info */}
        <aside className="space-y-4">
          <div className="bg-[#181818] rounded-2xl p-5 border border-white/5">
            <div className="flex items-start gap-3">
              <span className="mt-1" aria-hidden="true">
                📍
              </span>
              <div>
                <h3 className="font-semibold mb-1">{t.office}</h3>
                <p className="text-gray-300 text-sm">Málaga, ES</p>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/34662423523?text=${encodeURIComponent(
              t.whatsappText
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#181818] rounded-2xl p-5 border border-white/5 hover:scale-[1.01] transition"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1" aria-hidden="true">
                📞
              </span>
              <div>
                <h3 className="font-semibold mb-1">{t.whatsapp}</h3>
                <p className="text-gray-300 text-sm">+34 662 423 523</p>
              </div>
            </div>
          </a>

          <a
            href="mailto:info@iaoperators.com"
            className="block bg-[#181818] rounded-2xl p-5 border border-white/5 hover:scale-[1.01] transition"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1" aria-hidden="true">
                ✉️
              </span>
              <div>
                <h3 className="font-semibold mb-1">{t.email}</h3>
                <p className="text-gray-300 text-sm">info@iaoperators.com</p>
              </div>
            </div>
          </a>

          <div className="bg-[#181818] rounded-2xl p-5 border border-white/5">
            <h3 className="font-semibold mb-2">{t.faq}</h3>

            <details className="bg-[#232323] rounded-lg p-3 mb-2">
              <summary className="font-medium cursor-pointer">{t.faq1q}</summary>
              <p className="text-gray-300 mt-2 text-sm">{t.faq1a}</p>
            </details>

            <details className="bg-[#232323] rounded-lg p-3 mb-2">
              <summary className="font-medium cursor-pointer">{t.faq2q}</summary>
              <p className="text-gray-300 mt-2 text-sm">{t.faq2a}</p>
            </details>

            <details className="bg-[#232323] rounded-lg p-3">
              <summary className="font-medium cursor-pointer">{t.faq3q}</summary>
              <p className="text-gray-300 mt-2 text-sm">{t.faq3a}</p>
            </details>
          </div>
        </aside>
      </div>
    </section>
  );
}
