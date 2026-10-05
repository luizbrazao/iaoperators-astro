// Comportamiento compartido de las landings personalizadas de prospección
// (/tis/*): analítica en dataLayer con el consentimiento del sitio, vídeo sin
// autoplay, cabecera que se fija al hacer scroll y entradas suaves.
//
// Sin dependencias. Cada página lo llama una vez con su identificador:
//   initProspectLanding({ landing: "nuria", gtmId: "GTM-572KJ7HZ" })
//
// Eventos (todos con `landing`):
//   landing_view   al cargar (param `entry` = ?src=, p. ej. "qr")
//   video_play     primera reproducción (vídeo propio o YouTube)
//   video_complete fin del vídeo
//   click_cta      clic en cualquier [data-cta] (param `cta_location`)
//   <evento propio> opcional: si el enlace lleva data-cta-event="click_x",
//                  además de click_cta se envía ese evento (mismos params)
//   scroll_<n>     opcional: profundidad de scroll, si se pasa `scrollMarks`
//                  (p. ej. [50, 90] → scroll_50 y scroll_90, una vez cada uno)
// El page_view lo envía la etiqueta GA4 de GTM. Sin consentimiento no sale
// nada: los eventos quedan en la cola del dataLayer y GTM los procesa si la
// persona acepta durante la misma visita.

import { mountYouTube } from "./youtube-video";

type Params = Record<string, unknown>;
type Win = Window & { dataLayer?: Params[]; __GTM_LOADED__?: boolean };

const CONSENT_KEY = "iaoperators_cookie_consent";

export function initProspectLanding(opts: { landing: string; gtmId: string; videoTitle?: string; scrollMarks?: number[] }) {
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
    a.addEventListener("click", () => {
      const params = { cta_location: a.dataset.cta, cta_url: a.href };
      track("click_cta", params);
      if (a.dataset.ctaEvent) track(a.dataset.ctaEvent, params);
    });
  });

  // Vídeo: solo se reproduce al pulsar. Con data-youtube="<id>" se monta el
  // reproductor de YouTube (youtube-video.ts); si no, el <video> propio.
  const box = document.querySelector<HTMLElement>("[data-video]");
  const cover = box?.querySelector<HTMLButtonElement>("[data-video-play]");
  const video = box?.querySelector<HTMLVideoElement>("video");
  const note = box?.querySelector<HTMLElement>("[data-video-note]");
  const youtubeId = box?.dataset.youtube;
  let played = false;
  let completed = false;
  const onPlay = () => {
    if (!played) { played = true; track("video_play", { video_title: videoTitle }); }
  };
  const onEnd = () => {
    if (!completed) { completed = true; track("video_complete", { video_title: videoTitle }); }
  };
  cover?.addEventListener("click", () => {
    if (youtubeId && box) {
      mountYouTube(box, youtubeId, { onPlay, onEnd });
      return;
    }
    if (!video) {
      if (note) note.hidden = false;
      return;
    }
    box?.classList.add("is-playing");
    video.play().catch(() => { /* quedan los controles nativos */ });
  });
  video?.addEventListener("play", () => {
    box?.classList.add("is-playing");
    onPlay();
  });
  video?.addEventListener("ended", onEnd);

  // Cabecera: fondo y borde solo cuando ya hay scroll.
  const top = document.querySelector<HTMLElement>("[data-top]");
  const onScroll = () => top?.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Profundidad de scroll (opcional). Se calcula sobre la altura total del
  // documento y cada marca se envía una sola vez por visita.
  const marks = (opts.scrollMarks ?? []).filter((m) => m > 0 && m <= 100).sort((a, b) => a - b);
  if (marks.length) {
    const sent = new Set<number>();
    let ticking = false;
    const check = () => {
      ticking = false;
      const doc = document.documentElement;
      const pct = ((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100;
      for (const m of marks) {
        if (pct >= m && !sent.has(m)) { sent.add(m); track(`scroll_${m}`, { percent_scrolled: m }); }
      }
      if (sent.size === marks.length) window.removeEventListener("scroll", onDepth);
    };
    const onDepth = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener("scroll", onDepth, { passive: true });
  }

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
