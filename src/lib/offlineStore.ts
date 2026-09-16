/** Device-local offline store for learning resources + progress + sync queue. */

const RESOURCES_KEY = "wta_offline_resources_v1";
const PROGRESS_KEY = "wta_offline_progress_v1";
const QUEUE_KEY = "wta_offline_sync_queue_v1";

export type QueuedSave =
  | {
      kind: "progress";
      id: string;
      payload: {
        resourceId: string;
        progressPct: number;
        lastPage?: number;
        addSeconds?: number;
        addFocusSeconds?: number;
        meta?: Record<string, unknown>;
      };
      createdAt: string;
    }
  | {
      kind: "exam";
      id: string;
      payload: {
        resourceId: string;
        score: number;
        total: number;
        answers: Record<number, number>;
        title?: string;
        scopeId?: string;
      };
      createdAt: string;
    };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function cacheResources(
  cacheKey: string,
  items: unknown[]
): void {
  if (typeof window === "undefined") return;
  try {
    const all = safeParse<Record<string, unknown[]>>(
      localStorage.getItem(RESOURCES_KEY),
      {}
    );
    all[cacheKey] = items;
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

export function readCachedResources<T>(cacheKey: string): T[] {
  if (typeof window === "undefined") return [];
  const all = safeParse<Record<string, T[]>>(
    localStorage.getItem(RESOURCES_KEY),
    {}
  );
  return all[cacheKey] || [];
}

export function cacheProgress(
  resourceId: string,
  data: {
    pct: number;
    lastPage: number | null;
    totalSeconds: number;
    focusSeconds: number;
    meta: Record<string, unknown>;
  }
): void {
  if (typeof window === "undefined") return;
  try {
    const all = safeParse<Record<string, typeof data>>(
      localStorage.getItem(PROGRESS_KEY),
      {}
    );
    all[resourceId] = data;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

export function readCachedProgress(resourceId: string): {
  pct: number;
  lastPage: number | null;
  totalSeconds: number;
  focusSeconds: number;
  meta: Record<string, unknown>;
} | null {
  if (typeof window === "undefined") return null;
  const all = safeParse<Record<string, {
    pct: number;
    lastPage: number | null;
    totalSeconds: number;
    focusSeconds: number;
    meta: Record<string, unknown>;
  }>>(localStorage.getItem(PROGRESS_KEY), {});
  return all[resourceId] || null;
}

export function enqueueSync(item: QueuedSave): void {
  if (typeof window === "undefined") return;
  try {
    const q = safeParse<QueuedSave[]>(localStorage.getItem(QUEUE_KEY), []);
    q.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* quota */
  }
}

export function readQueue(): QueuedSave[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(QUEUE_KEY), []);
}

export function writeQueue(q: QueuedSave[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function isProbablyOffline(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.onLine === false;
}
