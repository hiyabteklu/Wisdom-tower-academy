/** Free resource pages + individual items (universities, stories, scholarships). */

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

export const FREE_RESOURCE_SLUGS: FreeResourceSlug[] = [
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
  universities: "university",
  scholarships: "scholarship",
  departments: "department",
};

/** Pages that are mainly one editorial body (tips / guides) */
export const EDITORIAL_SLUGS: FreeResourceSlug[] = [
  "study-techniques",
  "campus-life",
];

export type FreeResourcePage = {
  id: string;
  slug: FreeResourceSlug;
  title: string;
  subtitle: string | null;
  bodyMd: string;
  meta: Record<string, unknown>;
  coverPath: string | null;
  published: boolean;
  sortOrder: number;
  updatedBy: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FreeResourceItem = {
  id: string;
  pageSlug: FreeResourceSlug;
  kind: FreeResourceItemKind;
  title: string;
  subtitle: string | null;
  bodyMd: string;
  imagePath: string | null;
  gallery: { path: string; caption?: string }[];
  meta: Record<string, unknown>;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  deadline: string | null;
  externalUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FreeResourcePageInput = {
  id?: string;
  slug: FreeResourceSlug;
  title: string;
  subtitle?: string | null;
  bodyMd?: string;
  meta?: Record<string, unknown>;
  coverPath?: string | null;
  published?: boolean;
  sortOrder?: number;
  updatedBy?: string | null;
};

export type FreeResourceItemInput = {
  id?: string;
  pageSlug: FreeResourceSlug;
  kind: FreeResourceItemKind;
  title: string;
  subtitle?: string | null;
  bodyMd?: string;
  imagePath?: string | null;
  gallery?: { path: string; caption?: string }[];
  meta?: Record<string, unknown>;
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  deadline?: string | null;
  externalUrl?: string | null;
};

function rowToPage(row: Record<string, unknown>): FreeResourcePage {
  return {
    id: String(row.id),
    slug: row.slug as FreeResourceSlug,
    title: String(row.title),
    subtitle: row.subtitle != null ? String(row.subtitle) : null,
    bodyMd: row.body_md != null ? String(row.body_md) : "",
    meta: (row.meta as Record<string, unknown>) || {},
    coverPath: row.cover_path ? String(row.cover_path) : null,
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order ?? 0),
    updatedBy: row.updated_by != null ? String(row.updated_by) : null,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function rowToItem(row: Record<string, unknown>): FreeResourceItem {
  const gal = row.gallery;
  let gallery: { path: string; caption?: string }[] = [];
  if (Array.isArray(gal)) {
    gallery = gal
      .map((g) => {
        if (g && typeof g === "object" && "path" in g) {
          return {
            path: String((g as { path: string }).path),
            caption:
              "caption" in g && (g as { caption?: string }).caption
                ? String((g as { caption: string }).caption)
                : undefined,
          };
        }
        return null;
      })
      .filter(Boolean) as { path: string; caption?: string }[];
  }
  return {
    id: String(row.id),
    pageSlug: row.page_slug as FreeResourceSlug,
    kind: row.kind as FreeResourceItemKind,
    title: String(row.title),
    subtitle: row.subtitle != null ? String(row.subtitle) : null,
    bodyMd: row.body_md != null ? String(row.body_md) : "",
    imagePath: row.image_path ? String(row.image_path) : null,
    gallery,
    meta: (row.meta as Record<string, unknown>) || {},
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order ?? 0),
    deadline: row.deadline != null ? String(row.deadline).slice(0, 10) : null,
    externalUrl: row.external_url != null ? String(row.external_url) : null,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function listFreeResourcePages(): Promise<{
  items: FreeResourcePage[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("free_resource_pages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return { items: [], error: error.message };
    return {
      items: (data || []).map((r) => rowToPage(r as Record<string, unknown>)),
    };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getFreeResourcePage(
  slug: FreeResourceSlug,
  opts?: { publishedOnly?: boolean }
): Promise<{ item?: FreeResourcePage; error?: string }> {
  try {
    let q = supabase.from("free_resource_pages").select("*").eq("slug", slug);
    if (opts?.publishedOnly) q = q.eq("published", true);
    const { data, error } = await q.maybeSingle();
    if (error) return { error: error.message };
    if (!data) return {};
    return { item: rowToPage(data as Record<string, unknown>) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertFreeResourcePage(
  input: FreeResourcePageInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    slug: input.slug,
    title: input.title.trim(),
    subtitle: input.subtitle ?? null,
    body_md: input.bodyMd ?? "",
    meta: input.meta ?? {},
    cover_path: input.coverPath ?? null,
    published: input.published ?? false,
    sort_order: input.sortOrder ?? 0,
    updated_by: input.updatedBy ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("free_resource_pages")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id ? String(data.id) : input.id };
}

export async function listFreeResourceItems(opts: {
  pageSlug: FreeResourceSlug;
  publishedOnly?: boolean;
  kind?: FreeResourceItemKind;
}): Promise<{ items: FreeResourceItem[]; error?: string }> {
  try {
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
    return {
      items: (data || []).map((r) => rowToItem(r as Record<string, unknown>)),
    };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertFreeResourceItem(
  input: FreeResourceItemInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    page_slug: input.pageSlug,
    kind: input.kind,
    title: input.title.trim(),
    subtitle: input.subtitle ?? null,
    body_md: input.bodyMd ?? "",
    image_path: input.imagePath ?? null,
    gallery: input.gallery ?? [],
    meta: input.meta ?? {},
    featured: input.featured ?? false,
    published: input.published ?? false,
    sort_order: input.sortOrder ?? 0,
    deadline: input.deadline || null,
    external_url: input.externalUrl || null,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("free_resource_items")
    .upsert(payload)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id ? String(data.id) : input.id };
}

export async function deleteFreeResourceItem(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("free_resource_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function uploadFreeResourceFile(
  path: string,
  file: File
): Promise<{ path?: string; publicUrl?: string; error?: string }> {
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Max file size 8 MB" };
  }
  const { error } = await supabase.storage.from("free-resources").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from("free-resources").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export function freeResourcePublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from("free-resources").getPublicUrl(storagePath);
  return data.publicUrl;
}
