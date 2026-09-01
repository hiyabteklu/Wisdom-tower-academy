/** Learning content CRUD + progress (Supabase). */

import { supabase } from "@/lib/supabase";

export type HubId =
  | "books"
  | "short-notes"
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
    wrong?: number;
    skipped?: number;
    elapsedSec?: number;
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

export type ScopeProgressRow = {
  resourceId: string;
  title: string;
  hub: HubId;
  contentType: ContentType;
  progressPct: number;
  totalSeconds: number;
  focusSeconds: number;
  lastOpenedAt: string | null;
  meta: ProgressMeta;
};

export type ScopeStats = {
  rows: ScopeProgressRow[];
  totalStudySeconds: number;
  avgProgressPct: number;
  quizAttempted: number;
  quizCorrect: number;
  quizWrong: number;
  flashKnow: number;
  flashAgain: number;
  flashLearning: number;
  videoWatchSeconds: number;
  examScores: number[];
  avgExamPercent: number;
  streakDays: number;
};

function rowToResource(row: Record<string, unknown>): LearningResource {
  const rawHub = String(row.hub);
  const hub = (rawHub === "references" ? "short-notes" : rawHub) as HubId;
  return {
    id: String(row.id),
    packageId: String(row.package_id),
    scopePath: String(row.scope_path),
    hub,
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
    // Support legacy hub value during migration window
    if (opts.hub === "short-notes") {
      q = q.in("hub", ["short-notes", "references"]);
    } else if (opts.hub) {
      q = q.eq("hub", opts.hub);
    }
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
  title?: string;
  scopeId?: string;
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

  if (opts.scopeId && opts.total > 0) {
    const missed = Math.max(0, opts.total - opts.score);
    const percent = Math.round((opts.score / opts.total) * 1000) / 10;
    await supabase.from("academic_results").insert({
      user_id: session.user.id,
      scope_id: opts.scopeId,
      title: opts.title || "Exam attempt",
      total: opts.total,
      correct: opts.score,
      missed,
      percent,
    });
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getScopeStats(opts: {
  scopePath: string;
  hub?: HubId;
}): Promise<{ stats: ScopeStats; error?: string }> {
  const empty: ScopeStats = {
    rows: [],
    totalStudySeconds: 0,
    avgProgressPct: 0,
    quizAttempted: 0,
    quizCorrect: 0,
    quizWrong: 0,
    flashKnow: 0,
    flashAgain: 0,
    flashLearning: 0,
    videoWatchSeconds: 0,
    examScores: [],
    avgExamPercent: 0,
    streakDays: 0,
  };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { stats: empty };

  let rq = supabase
    .from("learning_resources")
    .select("id, title, hub, content_type, scope_path")
    .eq("scope_path", opts.scopePath);
  if (opts.hub === "short-notes") {
    rq = rq.in("hub", ["short-notes", "references"]);
  } else if (opts.hub) {
    rq = rq.eq("hub", opts.hub);
  }

  const { data: resources, error: rErr } = await rq;
  if (rErr) return { stats: empty, error: rErr.message };
  if (!resources?.length) return { stats: empty };

  const ids = resources.map((r) => String(r.id));
  const byId = new Map(
    resources.map((r) => {
      const rawHub = String(r.hub);
      const hub = (rawHub === "references" ? "short-notes" : rawHub) as HubId;
      return [
        String(r.id),
        {
          title: String(r.title),
          hub,
          contentType: r.content_type as ContentType,
        },
      ];
    })
  );

  const { data: prog, error: pErr } = await supabase
    .from("learning_progress")
    .select(
      "resource_id, progress_pct, total_seconds, focus_seconds, last_opened_at, meta"
    )
    .eq("user_id", session.user.id)
    .in("resource_id", ids);

  if (pErr) return { stats: empty, error: pErr.message };

  const rows: ScopeProgressRow[] = (prog || []).map((p) => {
    const info = byId.get(String(p.resource_id));
    return {
      resourceId: String(p.resource_id),
      title: info?.title || "Item",
      hub: info?.hub || "books",
      contentType: info?.contentType || "pdf",
      progressPct: Number(p.progress_pct || 0),
      totalSeconds: Number(p.total_seconds || 0),
      focusSeconds: Number(p.focus_seconds || 0),
      lastOpenedAt: p.last_opened_at ? String(p.last_opened_at) : null,
      meta: (p.meta as ProgressMeta) || {},
    };
  });

  let totalStudySeconds = 0;
  let pctSum = 0;
  let quizAttempted = 0;
  let quizCorrect = 0;
  let quizWrong = 0;
  let flashKnow = 0;
  let flashAgain = 0;
  let flashLearning = 0;
  let videoWatchSeconds = 0;
  const examScores: number[] = [];
  const daySet = new Set<string>();

  for (const r of rows) {
    totalStudySeconds += r.totalSeconds;
    pctSum += r.progressPct;
    const q = r.meta.quiz;
    if (q) {
      quizAttempted += Number(q.attempted || 0);
      quizCorrect += Number(q.correct || 0);
      quizWrong =
        q.wrong != null
          ? Number(q.wrong)
          : Math.max(0, Number(q.attempted || 0) - Number(q.correct || 0));
      if (q.submitted && q.total) {
        examScores.push(
          Math.round((Number(q.correct || 0) / Number(q.total)) * 1000) / 10
        );
      }
    }
    const f = r.meta.flashcards;
    if (f) {
      flashKnow += Number(f.know || 0);
      flashAgain += Number(f.again || 0);
      flashLearning += Number(f.learning || 0);
    }
    if (r.meta.video?.watchSeconds) {
      videoWatchSeconds += Number(r.meta.video.watchSeconds || 0);
    }
    if (r.lastOpenedAt) {
      daySet.add(r.lastOpenedAt.slice(0, 10));
    }
  }

  const days = Array.from(daySet).sort().reverse();
  let streakDays = 0;
  if (days.length) {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    let cursor = iso(today);
    if (!daySet.has(cursor)) {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      cursor = iso(y);
    }
    while (daySet.has(cursor)) {
      streakDays += 1;
      const d = new Date(cursor + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    }
  }

  const avgExamPercent =
    examScores.length > 0
      ? Math.round(
          (examScores.reduce((a, b) => a + b, 0) / examScores.length) * 10
        ) / 10
      : 0;

  return {
    stats: {
      rows,
      totalStudySeconds,
      avgProgressPct: rows.length
        ? Math.round((pctSum / rows.length) * 10) / 10
        : 0,
      quizAttempted,
      quizCorrect,
      quizWrong,
      flashKnow,
      flashAgain,
      flashLearning,
      videoWatchSeconds,
      examScores,
      avgExamPercent,
      streakDays,
    },
  };
}

export function freshmanScope(subjectId: string): string {
  return `freshman/${subjectId}`;
}

export function eceScope(semId: string, courseSlug: string): string {
  return `ece/${semId}/${courseSlug}`;
}

export function gradeScope(gradeId: string): string {
  return `grade/${gradeId}`;
}
