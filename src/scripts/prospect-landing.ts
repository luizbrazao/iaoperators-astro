// Comportamiento compartido de las landings personalizadas de prospección
// (/tis/*): analítica en dataLayer con el consentimiento del sitio, vídeo sin
// autoplay, cabecera que se fija al hacer scroll y entradas suaves.
//
// Sin dependencias. Cada página lo llama una vez con su identificador:
//   initProspectLanding({ landing: "nuria", gtmId: "GTM-572KJ7HZ" })
//
// Eventos (todos con `landing`):
//   landing_view   al cargar (param `entry` = ?src=, p. ej. "qr")
//   video_play     primera reproducción
//   video_complete fin del vídeo
//   click_cta      clic en cualquier [data-cta] (param `cta_location`)
// El page_view lo envía la etiqueta GA4 de GTM. Sin consentimiento no sale
// nada: los eventos quedan en la cola del dataLayer y GTM los procesa si la
// persona acepta durante la misma visita.

type Params = Record<string, unknown>;
type Win = Window & { dataLayer?: Params[]; __GTM_LOADED__?: boolean };

const CONSENT_KEY = "iaoperators_cookie_consent";

export function initProspectLanding(opts: { landing: string; gtmId: string; videoTitle?: string }) {
  const w = window as Win;
  const { landing, gtmId } = opts;
  const videoTitle = opts.videoTitle ?? `${landing}_luiz`;

  const track = (event: string, params: Params = {}) => {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, landing, ...params });
  };

  const loadGTM = () => {
    if (w.__GTM_LOADED__ || !gtmId) return;
    w.__GTM_LOADED__ = true;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(s);
  };

  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };
  const writeConsent = (v: string) => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch { /* sin almacenamiento */ }
  };

  track("landing_view", { entry: new URLSearchParams(location.search).get("src") || "direct" });

  // Consentimiento: misma clave que el banner del resto del sitio.
  const bar = document.querySelector<HTMLElement>("[data-consent]");
  const consent = readConsent();
  if (consent === "accepted") loadGTM();
  else if (consent === null && bar) bar.hidden = false;
  bar?.querySelector("[data-consent-accept]")?.addEventListener("click", () => {
    writeConsent("accepted");
    loadGTM();
    bar.hidden = true;
  });
  bar?.querySelector("[data-consent-reject]")?.addEventListener("click", () => {
    writeConsent("rejected");
    bar.hidden = true;
  });

  document.querySelectorAll<HTMLAnchorElement>("[data-cta]").forEach((a) => {
    a.addEventListener("click", () => track("click_cta", { cta_location: a.dataset.cta, cta_url: a.href }));
  });

  // Vídeo: solo se reproduce al pulsar.
  const box = document.querySelector<HTMLElement>("[data-video]");
  const cover = box?.querySelector<HTMLButtonElement>("[data-video-play]");
  const video = box?.querySelector<HTMLVideoElement>("video");
  const note = box?.querySelector<HTMLElement>("[data-video-note]");
  let played = false;
  let completed = false;
  cover?.addEventListener("click", () => {
    if (!video) {
      if (note) note.hidden = false;
      return;
    }
    box?.classList.add("is-playing");
    video.play().catch(() => { /* quedan los controles nativos */ });
  });
  video?.addEventListener("play", () => {
    box?.classList.add("is-playing");
    if (!played) { played = true; track("video_play", { video_title: videoTitle }); }
  });
  video?.addEventListener("ended", () => {
    if (!completed) { completed = true; track("video_complete", { video_title: videoTitle }); }
  });

  // Cabecera: fondo y borde solo cuando ya hay scroll.
  const top = document.querySelector<HTMLElement>("[data-top]");
  const onScroll = () => top?.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Entradas suaves. Con prefers-reduced-motion el CSS de la página las anula.
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  return { track };
}
