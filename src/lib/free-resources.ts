/** Free resource pages + individual items (success stories, scholarships). */

import { supabase } from "@/lib/supabase";

export type FreeResourceSlug =
  | "success-stories"
  | "study-techniques"
  | "campus-life"
  | "universities"
  | "departments"
  | "scholarships";

export type FreeResourceItemKind =
  | "success_story"
  | "university"
  | "scholarship"
  | "department"
  | "tip"
  | "general";

/** Admin dashboard only manages these (others are hardcoded public pages). */
export const FREE_RESOURCE_SLUGS: FreeResourceSlug[] = [
  "success-stories",
  "scholarships",
];

export const ALL_FREE_RESOURCE_SLUGS: FreeResourceSlug[] = [
  "success-stories",
  "study-techniques",
  "campus-life",
  "universities",
  "departments",
  "scholarships",
];

export const FREE_RESOURCE_LABELS: Record<FreeResourceSlug, string> = {
  "success-stories": "Success Stories",
  "study-techniques": "Study Techniques",
  "campus-life": "Campus Life",
  universities: "Universities",
  departments: "Departments",
  scholarships: "Scholarships",
};

/** Which item kind this page manages in the list UI */
export const PAGE_ITEM_KIND: Partial<Record<FreeResourceSlug, FreeResourceItemKind>> = {
  "success-stories": "success_story",
  scholarships: "scholarship",
};

/** Pages that are mainly one editorial body (tips / guides) */
export const EDITORIAL_SLUGS: FreeResourceSlug[] = [];

export type FreeResourcePage = {
  id: string;
  slug: FreeResourceSlug;
  title: string;
  subtitle: string | null;
  bodyMd: string;
  meta: Record<string, unknown>;
  published: boolean;
  updatedAt: string;
};

export type FreeResourceItem = {
  id: string;
  pageSlug: FreeResourceSlug;
  kind: FreeResourceItemKind;
  title: string;
  subtitle: string | null;
  bodyMd: string;
  imagePath: string | null;
  externalUrl: string | null;
  meta: Record<string, unknown>;
  sortOrder: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapPage(row: Record<string, unknown>): FreeResourcePage {
  return {
    id: String(row.id),
    slug: row.slug as FreeResourceSlug,
    title: String(row.title ?? ""),
    subtitle: row.subtitle != null ? String(row.subtitle) : null,
    bodyMd: String(row.body_md ?? ""),
    meta: (row.meta as Record<string, unknown>) || {},
    published: Boolean(row.published),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapItem(row: Record<string, unknown>): FreeResourceItem {
  return {
    id: String(row.id),
    pageSlug: row.page_slug as FreeResourceSlug,
    kind: (row.kind as FreeResourceItemKind) || "general",
    title: String(row.title ?? ""),
    subtitle: row.subtitle != null ? String(row.subtitle) : null,
    bodyMd: String(row.body_md ?? ""),
    imagePath: row.image_path != null ? String(row.image_path) : null,
    externalUrl: row.external_url != null ? String(row.external_url) : null,
    meta: (row.meta as Record<string, unknown>) || {},
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export function freeResourcePublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path;
  return `${base}/storage/v1/object/public/free-resources/${path.replace(/^\/+/, "")}`;
}

export async function listFreeResourcePages(): Promise<{
  items: FreeResourcePage[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("free_resource_pages")
    .select("*")
    .order("slug");
  if (error) return { items: [], error: error.message };
  return { items: (data || []).map((r) => mapPage(r as Record<string, unknown>)), error: null };
}

export async function getFreeResourcePage(
  slug: FreeResourceSlug,
): Promise<{ item: FreeResourcePage | null; error: string | null }> {
  const { data, error } = await supabase
    .from("free_resource_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return { item: null, error: error.message };
  return { item: data ? mapPage(data as Record<string, unknown>) : null, error: null };
}

export async function upsertFreeResourcePage(input: {
  slug: FreeResourceSlug;
  title: string;
  subtitle?: string | null;
  bodyMd?: string;
  meta?: Record<string, unknown>;
  published?: boolean;
}): Promise<{ item: FreeResourcePage | null; error: string | null }> {
  const payload = {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle ?? null,
    body_md: input.bodyMd ?? "",
    meta: input.meta ?? {},
    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("free_resource_pages")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) return { item: null, error: error.message };
  return { item: mapPage(data as Record<string, unknown>), error: null };
}

export async function listFreeResourceItems(opts: {
  pageSlug: FreeResourceSlug;
  publishedOnly?: boolean;
  kind?: FreeResourceItemKind;
}): Promise<{ items: FreeResourceItem[]; error: string | null }> {
  let q = supabase
    .from("free_resource_items")
    .select("*")
    .eq("page_slug", opts.pageSlug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (opts.publishedOnly) q = q.eq("published", true);
  if (opts.kind) q = q.eq("kind", opts.kind);
  const { data, error } = await q;
  if (error) return { items: [], error: error.message };
  return { items: (data || []).map((r) => mapItem(r as Record<string, unknown>)), error: null };
}

export async function upsertFreeResourceItem(input: {
  id?: string;
  pageSlug: FreeResourceSlug;
  kind: FreeResourceItemKind;
  title: string;
  subtitle?: string | null;
  bodyMd?: string;
  imagePath?: string | null;
  externalUrl?: string | null;
  meta?: Record<string, unknown>;
  sortOrder?: number;
  featured?: boolean;
  published?: boolean;
}): Promise<{ item: FreeResourceItem | null; error: string | null }> {
  const payload: Record<string, unknown> = {
    page_slug: input.pageSlug,
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle ?? null,
    body_md: input.bodyMd ?? "",
    image_path: input.imagePath ?? null,
    external_url: input.externalUrl ?? null,
    meta: input.meta ?? {},
    sort_order: input.sortOrder ?? 0,
    featured: input.featured ?? false,
    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;
  const { data, error } = await supabase
    .from("free_resource_items")
    .upsert(payload)
    .select("*")
    .single();
  if (error) return { item: null, error: error.message };
  return { item: mapItem(data as Record<string, unknown>), error: null };
}

export async function deleteFreeResourceItem(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("free_resource_items").delete().eq("id", id);
  return { error: error?.message ?? null };
}
