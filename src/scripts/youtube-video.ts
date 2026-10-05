// Vídeo de YouTube para las landings personalizadas (/tis/*).
//
// Nada de YouTube se carga hasta que la persona pulsa la portada: ni iframe,
// ni API, ni cookies. Al pulsar se carga la IFrame API, se monta el reproductor
// y se avisa de reproducción y fin para la analítica (video_play /
// video_complete). El reproductor de la API usa youtube.com: con el host
// youtube-nocookie.com los mensajes del iframe no llegan (onReady y
// onStateChange no se disparan) y se pierden los eventos. Si la API no carga
// (bloqueador, red), cae a un iframe simple de youtube-nocookie.com: el vídeo
// se ve igual, sin eventos de progreso.

type YTEvent = { data: number; target: YTPlayer };
const NOT_EMBEDDABLE = [100, 101, 150]; // vídeo no encontrado, privado o sin permiso de inserción
type YTPlayer = { getIframe(): HTMLIFrameElement; playVideo(): void };
type YTNamespace = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
};
type YTWin = Window & { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };

const NOCOOKIE = "https://www.youtube-nocookie.com";
const FILL = "position:absolute;inset:0;width:100%;height:100%;border:0;";

let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  const w = window as YTWin;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (!apiPromise) {
    apiPromise = new Promise<YTNamespace>((resolve, reject) => {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prev?.();
        if (w.YT) resolve(w.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => {
        apiPromise = null;
        reject(new Error("YouTube IFrame API no disponible"));
      };
      document.head.appendChild(s);
      // Si en 8 s no hay API, se usa el iframe simple.
      setTimeout(() => reject(new Error("YouTube IFrame API: tiempo agotado")), 8000);
    });
  }
  return apiPromise;
}

function showLink(box: HTMLElement, slot: HTMLElement, videoId: string) {
  const a = document.createElement("a");
  a.href = `https://youtu.be/${encodeURIComponent(videoId)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "Ver el vídeo en YouTube ↗";
  a.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-family:inherit;font-weight:600;font-size:15px;line-height:1.4;text-decoration:underline;text-underline-offset:4px;background:rgba(0,0,0,.72);";
  // El reproductor sustituye al slot por su iframe: se quitan ambos.
  slot.remove();
  box.querySelectorAll("iframe").forEach((f) => f.remove());
  box.appendChild(a);
}

export function mountYouTube(
  box: HTMLElement,
  videoId: string,
  hooks: { title?: string; onPlay?: () => void; onEnd?: () => void } = {},
) {
  if (box.dataset.ytMounted) return;
  box.dataset.ytMounted = "1";
  const title = hooks.title ?? "Vídeo de Luiz Brazão, IA Operators";

  const slot = document.createElement("div");
  slot.style.cssText = FILL;
  box.appendChild(slot);
  box.classList.add("is-playing");

  let ready = false;
  loadApi()
    .then((YT) => {
      new YT.Player(slot, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1, origin: location.origin },
        events: {
          onReady: (e: YTEvent) => {
            ready = true;
            e.target.getIframe().style.cssText = FILL;
            e.target.playVideo();
          },
          // Si YouTube no deja reproducirlo aquí, se ofrece abrirlo en YouTube.
          onError: (e: YTEvent) => {
            if (NOT_EMBEDDABLE.includes(e.data)) showLink(box, slot, videoId);
          },
          onStateChange: (e: YTEvent) => {
            if (e.data === YT.PlayerState.PLAYING) hooks.onPlay?.();
            if (e.data === YT.PlayerState.ENDED) hooks.onEnd?.();
          },
        },
      });
    })
    .catch(() => {
      if (ready) return;
      const f = document.createElement("iframe");
      f.src = `${NOCOOKIE}/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;
      f.title = title;
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.style.cssText = FILL;
      slot.replaceChildren(f);
      hooks.onPlay?.();
    });
}
