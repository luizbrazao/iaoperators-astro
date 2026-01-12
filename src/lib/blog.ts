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

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const tableName = requireEnv("AIRTABLE_TABLE_NAME");

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

  // ✅ Ordenar pelos nomes reais do seu Airtable
  url.searchParams.set("sort[0][field]", "created_at");
  url.searchParams.set("sort[0][direction]", "desc");
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("filterByFormula", "{Divulgar}=TRUE()");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as AirtableListResponse;

  const posts = (data.records ?? [])
    .map((r): BlogPost | null => {
      const f = r.fields ?? {};

      const slug = asString(f.slug);
      const title = asString(f.tittle); // ✅ seu campo real (typo)
      const category = asString(f.category) || "Blog";
      const date = asISODate(f.created_at); // ✅ seu campo real

      const imageUrl =
        asAttachmentUrl(f.featured_image) ?? // ✅ preferir featured_image
        asAttachmentUrl(f.image);

      const metaDescription = asString(f.meta_description) || undefined;
      const content = asString(f.content) || undefined;

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
        locale,
      };
    })
    .filter(Boolean) as BlogPost[];

  return posts;
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function fetchBlogSlugs(): Promise<string[]> {
  const posts = await fetchBlogPosts();
  return posts.map((p) => p.slug);
}
