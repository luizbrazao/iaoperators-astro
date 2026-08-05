/**
 * rehype plugin (sin dependencias) que marca los enlaces externos de todo el
 * Markdown del sitio: `target="_blank"` + `rel="noopener noreferrer"`.
 *
 * - No añade `nofollow`: los enlaces a fuentes oficiales deben pasar autoridad.
 * - Los enlaces internos (rutas relativas, anclas `#`, mailto:, tel:) se dejan
 *   intactos para no romper la navegación ni el índice de contenidos.
 */

const INTERNAL_HOSTS = ["iaoperators.com", "www.iaoperators.com"];

function isExternal(href) {
  if (typeof href !== "string") return false;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const { hostname } = new URL(href);
    return !INTERNAL_HOSTS.includes(hostname.toLowerCase());
  } catch {
    return false;
  }
}

export default function rehypeExternalLinks() {
  return (tree) => {
    const walk = (node) => {
      if (!node || typeof node !== "object") return;

      if (node.type === "element" && node.tagName === "a") {
        const props = (node.properties ??= {});
        if (isExternal(props.href)) {
          props.target = "_blank";
          const existing = Array.isArray(props.rel)
            ? props.rel
            : typeof props.rel === "string"
              ? props.rel.split(/\s+/).filter(Boolean)
              : [];
          for (const value of ["noopener", "noreferrer"]) {
            if (!existing.includes(value)) existing.push(value);
          }
          props.rel = existing;
        }
      }

      if (Array.isArray(node.children)) node.children.forEach(walk);
    };

    walk(tree);
  };
}
