import { useEffect, useMemo, useState } from "react";
import { getLocale, ui } from "../i18n/ui";

const STORAGE_KEY = "iaoperators_cookie_consent"; // "accepted" | "rejected"

/* ================================
   CONSENT STORAGE
   ================================ */
function readConsent() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
    return null;
  } catch {
    return null;
  }
}

function writeConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

/* ================================
   GTM LOADER
   ================================ */
function loadGTM() {
  if (typeof window === "undefined") return;
  if (window.__GTM_LOADED__) return;

  const id =
    window.__GTM_ID__ ||
    import.meta.env.PUBLIC_GTM_ID ||
    import.meta.env.VITE_GTM_ID;

  if (!id) return;

  window.__GTM_LOADED__ = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(
    id
  )}`;
  document.head.appendChild(script);
}

/* ================================
   COMPONENT
   ================================ */
export default function CookieBanner({ forceOpen = false, onClose } = {}) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  /* Locale seguro (client-side) */
  const locale = useMemo(() => {
    if (typeof document === "undefined") return "es";
    return getLocale(document.documentElement.lang || "es");
  }, []);

  const dict = ui?.[locale] ?? ui?.es ?? ui?.en ?? ui?.pt ?? {};
  const cookiesDict =
    dict?.cookies ?? dict?.common?.cookies ?? dict?.home?.cookies ?? {};

  const labels = {
    title: cookiesDict?.title ?? "Cookies",
    description:
      cookiesDict?.description ??
      "Usamos cookies para melhorar sua experiência.",
    privacyLink: cookiesDict?.privacyLink ?? "Política de Privacidade",
    accept: cookiesDict?.accept ?? "Aceitar",
    reject: cookiesDict?.reject ?? "Rejeitar",
  };

  /* Inicialização */
  useEffect(() => {
    setReady(true);
    const consent = readConsent();
    if (consent === null) setOpen(true);
  }, []);

  /* Forçar abertura (opcional) */
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  /* 🔑 EVENTO GLOBAL (Footer → Cookies) */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOpen = () => setOpen(true);
    window.addEventListener("iaoperators:open-cookies", onOpen);

    return () => {
      window.removeEventListener("iaoperators:open-cookies", onOpen);
    };
  }, []);

  if (!ready || !open) return null;

  const handleAccept = () => {
    writeConsent("accepted");
    loadGTM();
    setOpen(false);
    onClose?.();
  };

  const handleReject = () => {
    writeConsent("rejected");
    setOpen(false);
    onClose?.();
  };

  const privacyHref =
    cookiesDict?.privacyHref ?? `/${locale}/politica-de-privacidad/`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-9999 px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/90 backdrop-blur p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/85">
            <p className="font-semibold text-white">{labels.title}</p>

            <p className="mt-1 text-white/70">
              {labels.description}{" "}
              <a href={privacyHref} className="underline hover:text-orange-400">
                {labels.privacyLink}
              </a>
              .
            </p>
          </div>

          <div className="flex gap-3 md:shrink-0">
            <button
              type="button"
              onClick={handleReject}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:border-white/40 transition"
            >
              {labels.reject}
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-orange-500 transition"
            >
              {labels.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
