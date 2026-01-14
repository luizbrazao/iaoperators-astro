export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string; // ISO
  imageUrl?: string;

  // extras (opcional, útil p/ futuro)
  metaDescription?: string;
  content?: string;
  faq?: { q: string; a: string }[];

  locale?: "es" | "pt" | "en";
};

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableListResponse = {
  records: AirtableRecord[];
  offset?: string;
};

function requireEnv(name: string): string {
  const val = import.meta.env[name];
  if (!val || typeof val !== "string") throw new Error(`Missing env var: ${name}`);
  return val;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asISODate(v: unknown): string {
  const s = asString(v);
  if (!s) return "";
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();

  // Airtable pode retornar data como "14/1/2026 10:07am"
  const match = s.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(am|pm)?)?$/i,
  );
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    let hour = Number(match[4] ?? "0");
    const minute = Number(match[5] ?? "0");
    const meridiem = (match[6] ?? "").toLowerCase();

    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function asAttachmentUrl(v: unknown): string | undefined {
  // Airtable attachment: [{ url: "...", ... }]
  if (Array.isArray(v) && v.length > 0) {
    const first = v[0] as any;
    if (first && typeof first.url === "string") return first.url;
  }
  // Às vezes você guarda URL direto como string
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function parseFaq(raw: unknown): { q: string; a: string }[] {
  if (!raw) return [];

  let data: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      data = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const q = stripHtml(asString((item as any).q));
      const a = stripHtml(asString((item as any).a));
      if (!q || !a) return null;
      return { q, a };
    })
    .filter(Boolean) as { q: string; a: string }[];
}
function asCategoryName(fields: Record<string, unknown>): string {
  const raw =
    fields.category_name ??
    fields.Category_name ??
    fields.categoryName ??
    fields.CategoryName ??
    fields.category ??
    fields.Category ??
    fields.categoria ??
    fields.Categoria ??
    fields.categories ??
    fields.Categories ??
    fields.Categorias;

  if (Array.isArray(raw)) {
    const firstString = raw.find((item) => typeof item === "string" && item.trim());
    if (typeof firstString === "string") return firstString.trim();

    const firstNamed = raw.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (typeof (item as any).name === "string" ||
          typeof (item as any).title === "string" ||
          typeof (item as any).value === "string"),
    );
    if (firstNamed && typeof firstNamed === "object") {
      const name =
        (firstNamed as any).name ?? (firstNamed as any).title ?? (firstNamed as any).value ?? "";
      return typeof name === "string" ? name.trim() : "";
    }
    return "";
  }

  if (raw && typeof raw === "object") {
    const name = (raw as any).name ?? (raw as any).title ?? (raw as any).value ?? "";
    return typeof name === "string" ? name.trim() : "";
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    const [first] = trimmed.split(",");
    return (first ?? "").trim();
  }

  return "";
}

type BlogLocale = "es" | "pt" | "en";

function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function mapUserLocale(locale: BlogLocale): string {
  if (locale === "pt") return "pt-BR";
  if (locale === "en") return "en-US";
  return "es-ES";
}

export async function fetchBlogPosts(locale: BlogLocale = "es"): Promise<BlogPost[]> {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const tableName = requireEnv("AIRTABLE_TABLE_NAME");

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

  // ✅ Ordenar pelos nomes reais do seu Airtable
  url.searchParams.set("sort[0][field]", "created_at");
  url.searchParams.set("sort[0][direction]", "desc");
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("cellFormat", "string");
  url.searchParams.set("timeZone", "Europe/Madrid");
  url.searchParams.set("userLocale", mapUserLocale(locale));

  const escapedLocale = escapeFormulaString(locale);
  url.searchParams.set(
    "filterByFormula",
    `AND({Divulgar}=TRUE(), {Locale}="${escapedLocale}")`,
  );

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Airtable fetch failed", {
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as AirtableListResponse;
  const posts = (data.records ?? [])
    .map((r): BlogPost | null => {
      const f = r.fields ?? {};

      const slug = asString(f.slug);
      const title = asString(f.tittle); // ✅ seu campo real (typo)
      const category = asCategoryName(f) || "Blog";
      const date = asISODate(f.created_at); // ✅ seu campo real

      const imageUrl =
        asAttachmentUrl(f.featured_image) ?? // ✅ preferir featured_image
        asAttachmentUrl(f.image);

      const metaDescription = asString(f.meta_description) || undefined;
      const content = asString(f.content) || undefined;
      const faq = parseFaq((f as any).faq);

      const localeRaw = asString(f.locale);
      const locale =
        localeRaw === "es" || localeRaw === "pt" || localeRaw === "en"
            ? (localeRaw as "es" | "pt" | "en")
            : undefined;

      // exigidos para a Home renderizar
      if (!slug || !title || !date) return null;

      return {
        id: r.id,
        slug,
        title,
        category,
        date,
        imageUrl,
        metaDescription,
        content,
        faq,
        locale,
      };
    })
    .filter(Boolean) as BlogPost[];

  return posts;
}

export async function fetchBlogPostBySlug(
  slug: string,
  locale: BlogLocale = "es",
): Promise<BlogPost | null> {
  const posts = await fetchBlogPosts(locale);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function fetchBlogSlugs(locale: BlogLocale = "es"): Promise<string[]> {
  const posts = await fetchBlogPosts(locale);
  return posts.map((p) => p.slug);
}
