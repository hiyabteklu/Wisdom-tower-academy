/** Free resource pages CRUD (admin-editable success stories, universities, etc.). */

import { supabase } from "@/lib/supabase";

export type FreeResourceSlug =
  | "success-stories"
  | "study-techniques"
  | "campus-life"
  | "universities"
  | "departments"
  | "scholarships";

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
  universities: "Universities Info",
  departments: "Department Info",
  scholarships: "Scholarship Info",
};

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

export type FreeResourceInput = {
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

/** List all free resource pages (admin). */
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

/** Get one page by slug. For public pages use publishedOnly. */
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
  input: FreeResourceInput
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

/** Upload image / graphic to free-resources bucket. Returns public path. */
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
