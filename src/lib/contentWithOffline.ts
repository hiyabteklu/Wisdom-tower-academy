/**
 * Offline-aware wrappers around content.ts
 * - Cache resource lists when online
 * - Read from cache when offline
 * - Mirror progress locally
 * - Queue saveProgress / saveExamAttempt and flush when online
 */

export * from "@/lib/content";

import {
  listResources as listResourcesOnline,
  getMyProgress as getMyProgressOnline,
  saveProgress as saveProgressOnline,
  saveExamAttempt as saveExamAttemptOnline,
  type LearningResource,
  type ProgressMeta,
  type HubId,
} from "@/lib/content";
import {
  cacheResources,
  readCachedResources,
  cacheProgress,
  readCachedProgress,
  enqueueSync,
  readQueue,
  writeQueue,
  isProbablyOffline,
  type QueuedSave,
} from "@/lib/offlineStore";

function resourceCacheKey(opts: {
  scopePath?: string;
  hub?: HubId;
  packageId?: string;
  publishedOnly?: boolean;
}) {
  return [
    opts.scopePath || "",
    opts.hub || "",
    opts.packageId || "",
    opts.publishedOnly ? "1" : "0",
  ].join("|");
}

export async function listResources(opts: {
  scopePath?: string;
  hub?: HubId;
  packageId?: string;
  publishedOnly?: boolean;
}): Promise<{ items: LearningResource[]; error?: string }> {
  const key = resourceCacheKey(opts);

  if (isProbablyOffline()) {
    const cached = readCachedResources<LearningResource>(key);
    if (cached.length) return { items: cached };
    return { items: [], error: "Offline — open this hub once online to cache it." };
  }

  try {
    const res = await listResourcesOnline(opts);
    if (res.items.length) cacheResources(key, res.items);
    return res;
  } catch {
    const cached = readCachedResources<LearningResource>(key);
    if (cached.length) return { items: cached };
    return { items: [], error: "Network error" };
  }
}

export async function getMyProgress(resourceId: string): Promise<{
  pct: number;
  lastPage: number | null;
  totalSeconds: number;
  focusSeconds: number;
  meta: ProgressMeta;
}> {
  const local = readCachedProgress(resourceId);

  if (isProbablyOffline()) {
    if (local) {
      return {
        pct: local.pct,
        lastPage: local.lastPage,
        totalSeconds: local.totalSeconds,
        focusSeconds: local.focusSeconds,
        meta: local.meta as ProgressMeta,
      };
    }
    return { pct: 0, lastPage: null, totalSeconds: 0, focusSeconds: 0, meta: {} };
  }

  try {
    const remote = await getMyProgressOnline(resourceId);
    // Prefer higher local progress if user practiced offline
    if (local && local.pct > remote.pct) {
      return {
        pct: local.pct,
        lastPage: local.lastPage,
        totalSeconds: Math.max(local.totalSeconds, remote.totalSeconds),
        focusSeconds: Math.max(local.focusSeconds, remote.focusSeconds),
        meta: { ...remote.meta, ...local.meta } as ProgressMeta,
      };
    }
    cacheProgress(resourceId, {
      pct: remote.pct,
      lastPage: remote.lastPage,
      totalSeconds: remote.totalSeconds,
      focusSeconds: remote.focusSeconds,
      meta: remote.meta as Record<string, unknown>,
    });
    return remote;
  } catch {
    if (local) {
      return {
        pct: local.pct,
        lastPage: local.lastPage,
        totalSeconds: local.totalSeconds,
        focusSeconds: local.focusSeconds,
        meta: local.meta as ProgressMeta,
      };
    }
    return { pct: 0, lastPage: null, totalSeconds: 0, focusSeconds: 0, meta: {} };
  }
}

export async function saveProgress(opts: {
  resourceId: string;
  progressPct: number;
  lastPage?: number;
  addSeconds?: number;
  addFocusSeconds?: number;
  meta?: ProgressMeta;
}): Promise<{ ok: boolean; error?: string }> {
  const prev = readCachedProgress(opts.resourceId);
  const next = {
    pct: Math.max(prev?.pct || 0, Math.min(100, opts.progressPct)),
    lastPage: opts.lastPage ?? prev?.lastPage ?? null,
    totalSeconds: (prev?.totalSeconds || 0) + Math.max(0, opts.addSeconds || 0),
    focusSeconds:
      (prev?.focusSeconds || 0) + Math.max(0, opts.addFocusSeconds || 0),
    meta: {
      ...(prev?.meta || {}),
      ...(opts.meta || {}),
    },
  };
  cacheProgress(opts.resourceId, next);

  if (isProbablyOffline()) {
    enqueueSync({
      kind: "progress",
      id: `p-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  try {
    return await saveProgressOnline(opts);
  } catch {
    enqueueSync({
      kind: "progress",
      id: `p-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }
}

export async function saveExamAttempt(opts: {
  resourceId: string;
  score: number;
  total: number;
  answers: Record<number, number>;
  title?: string;
  scopeId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  // Always keep local quiz meta for offline retakes
  const prev = readCachedProgress(opts.resourceId);
  const accuracy =
    opts.total > 0 ? Math.round((opts.score / opts.total) * 1000) / 10 : 0;
  cacheProgress(opts.resourceId, {
    pct: Math.max(prev?.pct || 0, accuracy),
    lastPage: prev?.lastPage ?? null,
    totalSeconds: prev?.totalSeconds || 0,
    focusSeconds: prev?.focusSeconds || 0,
    meta: {
      ...(prev?.meta || {}),
      quiz: {
        attempted: opts.total,
        correct: opts.score,
        total: opts.total,
        accuracy,
        submitted: true,
        wrong: Math.max(0, opts.total - opts.score),
      },
    },
  });

  if (isProbablyOffline()) {
    enqueueSync({
      kind: "exam",
      id: `e-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  try {
    return await saveExamAttemptOnline(opts);
  } catch {
    enqueueSync({
      kind: "exam",
      id: `e-${opts.resourceId}-${Date.now()}`,
      payload: opts,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }
}

/** Push queued offline saves to Supabase when connection returns. */
export async function flushOfflineQueue(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isProbablyOffline()) return;

  const q = readQueue();
  if (!q.length) return;

  const remaining: QueuedSave[] = [];
  for (const item of q) {
    try {
      if (item.kind === "progress") {
        const r = await saveProgressOnline(item.payload);
        if (!r.ok) remaining.push(item);
      } else {
        const r = await saveExamAttemptOnline(item.payload);
        if (!r.ok) remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
}
