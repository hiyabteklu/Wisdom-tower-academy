/** Learning content CRUD + progress (Supabase). */

import { supabase } from "@/lib/supabase";

export type HubId =
  | "books"
  | "references"
  | "videos"
  | "flashcards"
  | "question-banks"
  | "exams";

export type ContentType =
  | "pdf"
  | "markdown"
  | "video_url"
  | "quiz"
  | "exam"
  | "flashcard_deck";

export type LearningResource = {
  id: string;
  packageId: string;
  scopePath: string;
  hub: HubId;
  title: string;
  chapter: number | null;
  sortOrder: number;
  contentType: ContentType;
  storagePath: string | null;
  bodyMd: string | null;
  meta: Record<string, unknown>;
  published: boolean;
  createdAt?: string;
};

export type ResourceInput = {
  id?: string;
  packageId: string;
  scopePath: string;
  hub: HubId;
  title: string;
  chapter?: number | null;
  sortOrder?: number;
  contentType: ContentType;
  storagePath?: string | null;
  bodyMd?: string | null;
  meta?: Record<string, unknown>;
  published?: boolean;
};

export type ProgressMeta = {
  quiz?: {
    attempted: number;
    correct: number;
    total: number;
    accuracy: number;
    submitted?: boolean;
  };
  flashcards?: {
    know: number;
    learning: number;
    again: number;
    seen: number;
    total: number;
    accuracy: number;
  };
  video?: {
    watchSeconds: number;
    lastPosition?: number;
  };
  [key: string]: unknown;
};

function rowToResource(row: Record<string, unknown>): LearningResource {
  return {
    id: String(row.id),
    packageId: String(row.package_id),
    scopePath: String(row.scope_path),
    hub: row.hub as HubId,
    title: String(row.title),
    chapter: row.chapter != null ? Number(row.chapter) : null,
    sortOrder: Number(row.sort_order ?? 0),
    contentType: row.content_type as ContentType,
    storagePath: row.storage_path ? String(row.storage_path) : null,
    bodyMd: row.body_md != null ? String(row.body_md) : null,
    meta: (row.meta as Record<string, unknown>) || {},
    published: Boolean(row.published),
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

export async function listResources(opts: {
  scopePath?: string;
  hub?: HubId;
  packageId?: string;
  publishedOnly?: boolean;
}): Promise<{ items: LearningResource[]; error?: string }> {
  try {
    let q = supabase.from("learning_resources").select("*").order("sort_order", {
      ascending: true,
    });
    if (opts.scopePath) q = q.eq("scope_path", opts.scopePath);
    if (opts.hub) q = q.eq("hub", opts.hub);
    if (opts.packageId) q = q.eq("package_id", opts.packageId);
    if (opts.publishedOnly) q = q.eq("published", true);

    const { data, error } = await q;
    if (error) return { items: [], error: error.message };
    return {
      items: (data || []).map((r) => rowToResource(r as Record<string, unknown>)),
    };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getResourceById(
  id: string
): Promise<{ item?: LearningResource; error?: string }> {
  const { data, error } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return {};
  return { item: rowToResource(data as Record<string, unknown>) };
}

export async function upsertResource(
  input: ResourceInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    package_id: input.packageId,
    scope_path: input.scopePath,
    hub: input.hub,
    title: input.title.trim(),
    chapter: input.chapter ?? null,
    sort_order: input.sortOrder ?? 0,
    content_type: input.contentType,
    storage_path: input.storagePath || null,
    body_md: input.bodyMd || null,
    meta: input.meta || {},
    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("learning_resources")
    .upsert(payload)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id ? String(data.id) : input.id };
}

export async function deleteResource(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("learning_resources").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function uploadLearningFile(
  path: string,
  file: File
): Promise<{ path?: string; error?: string }> {
  if (file.size > 40 * 1024 * 1024) {
    return { error: "Max file size 40 MB" };
  }
  const { error } = await supabase.storage.from("learning-content").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return { error: error.message };
  return { path };
}

export async function getSignedContentUrl(
  storagePath: string,
  expiresSec = 3600
): Promise<{ url?: string; error?: string }> {
  const { data, error } = await supabase.storage
    .from("learning-content")
    .createSignedUrl(storagePath, expiresSec);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

export async function saveProgress(opts: {
  resourceId: string;
  progressPct: number;
  lastPage?: number;
  addSeconds?: number;
  addFocusSeconds?: number;
  meta?: ProgressMeta;
}): Promise<{ ok: boolean; error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const userId = session.user.id;
  const { data: existing } = await supabase
    .from("learning_progress")
    .select("total_seconds, focus_seconds, meta, progress_pct")
    .eq("user_id", userId)
    .eq("resource_id", opts.resourceId)
    .maybeSingle();

  const total =
    Number(existing?.total_seconds || 0) + Math.max(0, opts.addSeconds || 0);
  const focus =
    Number(existing?.focus_seconds || 0) + Math.max(0, opts.addFocusSeconds || 0);

  const prevMeta = (existing?.meta as Record<string, unknown>) || {};
  const nextMeta = opts.meta ? { ...prevMeta, ...opts.meta } : prevMeta;

  // Never decrease progress % unless explicitly completing a better score path
  const nextPct = Math.max(
    Number(existing?.progress_pct || 0),
    Math.min(100, opts.progressPct)
  );

  const { error } = await supabase.from("learning_progress").upsert(
    {
      user_id: userId,
      resource_id: opts.resourceId,
      progress_pct: nextPct,
      last_page: opts.lastPage ?? null,
      total_seconds: total,
      focus_seconds: focus,
      last_opened_at: new Date().toISOString(),
      meta: nextMeta,
    },
    { onConflict: "user_id,resource_id" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getMyProgress(
  resourceId: string
): Promise<{
  pct: number;
  lastPage: number | null;
  totalSeconds: number;
  focusSeconds: number;
  meta: ProgressMeta;
}> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return { pct: 0, lastPage: null, totalSeconds: 0, focusSeconds: 0, meta: {} };
  }

  const { data } = await supabase
    .from("learning_progress")
    .select("progress_pct, last_page, total_seconds, focus_seconds, meta")
    .eq("user_id", session.user.id)
    .eq("resource_id", resourceId)
    .maybeSingle();

  return {
    pct: Number(data?.progress_pct || 0),
    lastPage: data?.last_page != null ? Number(data.last_page) : null,
    totalSeconds: Number(data?.total_seconds || 0),
    focusSeconds: Number(data?.focus_seconds || 0),
    meta: (data?.meta as ProgressMeta) || {},
  };
}

export async function saveExamAttempt(opts: {
  resourceId: string;
  score: number;
  total: number;
  answers: Record<number, number>;
}): Promise<{ ok: boolean; error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("exam_attempts").insert({
    user_id: session.user.id,
    resource_id: opts.resourceId,
    submitted_at: new Date().toISOString(),
    score: opts.score,
    answers: opts.answers,
    meta: { total: opts.total },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function freshmanScope(subjectId: string): string {
  return `freshman/${subjectId}`;
}

export function eceScope(semId: string, courseSlug: string): string {
  return `ece/${semId}/${courseSlug}`;
}
