"use client";

// Admin mobile redesign A12 (layout only). Logic, lock keys, data calls and texts are unchanged.
// Phone rules: no horizontal scrolling, 44 px touch targets, no animate-* / blur / shadow,
// lock modes as a 2-column grid of tiles, folders as 2-column tiles with wrapping labels.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_CONTENT_TREE,
  type AdminNavNode,
} from "@/data/admin-nav";
import {
  listAllLocks,
  setLock,
  clearLock,
  packageLockKey,
  scopeLockKey,
  hubLockKey,
  type LockMode,
  type ContentLockRow,
} from "@/lib/content-locks";
import {
  Lock,
  Unlock,
  ChevronRight,
  FolderOpen,
  RefreshCw,
  Package,
  Shield,
} from "lucide-react";

const MODES: { id: LockMode; label: string; hint: string }[] = [
  {
    id: "open",
    label: "Open",
    hint: "Anyone can access (no purchase gate)",
  },
  {
    id: "require_purchase",
    label: "Require sign-in / purchase",
    hint: "Locked until user owns the package (or free-for-registered)",
  },
  {
    id: "coming_soon",
    label: "Coming soon",
    hint: "Shown as uploading / not ready",
  },
  {
    id: "locked",
    label: "Hard locked",
    hint: "Fully closed (same UI as coming soon)",
  },
];

const PACKAGE_SHORTCUTS: { id: string; label: string }[] = [
  { id: "freshman", label: "Freshman package" },
  { id: "ece-y3-sem-1", label: "ECE Year 3 · Semester 1" },
  { id: "ece-y3-sem-2", label: "ECE Year 3 · Semester 2" },
];

type Crumb = { id: string; label: string; node: AdminNavNode };

const HUB_IDS = [
  "books",
  "short-notes",
  "videos",
  "flashcards",
  "question-banks",
  "exams",
  "life-savers",
];

const modeTileCls =
  "flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-sm font-semibold leading-tight disabled:opacity-50";
const resetCls =
  "col-span-2 flex min-h-[44px] items-center justify-center rounded-full border border-white/12 px-4 text-sm font-semibold text-wisdom-muted disabled:opacity-40";

function modeBadge(mode: LockMode | undefined) {
  if (!mode)
    return (
      <span className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-wisdom-muted">
        default
      </span>
    );
  const colors: Record<LockMode, string> = {
    open: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    require_purchase: "border-amber-400/40 bg-amber-500/15 text-amber-200",
    coming_soon: "border-sky-400/40 bg-sky-500/15 text-sky-200",
    locked: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  };
  return (
    <span
      className={`rounded-lg border px-2 py-0.5 text-xs font-semibold ${colors[mode]}`}
    >
      {mode.replace("_", " ")}
    </span>
  );
}

export default function LocksPanel() {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [locks, setLocks] = useState<ContentLockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const lockMap = useMemo(() => {
    const m = new Map<string, ContentLockRow>();
    for (const l of locks) m.set(l.lockKey, l);
    return m;
  }, [locks]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAllLocks();
    if (res.error) {
      setError(
        res.error.includes("relation") || res.error.includes("does not exist")
          ? "Table missing: run docs/content-locks-setup.sql in Supabase SQL Editor."
          : res.error
      );
      setLocks([]);
    } else {
      setLocks(res.locks);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function applyMode(lockKey: string, mode: LockMode, label?: string) {
    setBusyKey(lockKey);
    const res = await setLock({ lockKey, mode, label: label || null });
    setBusyKey("");
    if (!res.ok) {
      setToast(res.error || "Save failed");
      return;
    }
    setToast(`Saved · ${lockKey} → ${mode}`);
    void load();
  }

  async function resetToDefault(lockKey: string) {
    setBusyKey(lockKey);
    const res = await clearLock(lockKey);
    setBusyKey("");
    if (!res.ok) {
      setToast(res.error || "Clear failed");
      return;
    }
    setToast(`Cleared · ${lockKey} (uses code default)`);
    void load();
  }

  function enter(node: AdminNavNode) {
    setCrumbs((c) => [...c, { id: node.id, label: node.label, node }]);
  }

  function goTo(index: number) {
    setCrumbs((c) => c.slice(0, index + 1));
  }

  function resetRoot() {
    setCrumbs([]);
  }

  const current = crumbs[crumbs.length - 1]?.node;
  const listNodes =
    crumbs.length === 0 ? ADMIN_CONTENT_TREE : current?.children || [];
  const scopePath = current?.scopePath;
  const packageId = current?.packageId;
  const isHub = Boolean(scopePath) && HUB_IDS.includes(current?.id || "");

  const activeKey = isHub
    ? hubLockKey(scopePath!, current!.id)
    : scopePath
      ? scopeLockKey(scopePath)
      : packageId
        ? packageLockKey(packageId)
        : null;

  const activeLock = activeKey ? lockMap.get(activeKey) : undefined;

  return (
    <div className="space-y-4 break-words">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Shield className="h-5 w-5 shrink-0 text-amber-400" />
            Content locks
          </h2>
          <p className="mt-1 text-sm text-wisdom-muted">
            Lock or unlock packages, subjects, and hubs (books, exams, etc.).
            Specific exams stay controlled by the Published checkbox in Content.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-white/12 text-sm font-bold text-white disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Package-level shortcuts */}
      <div className="space-y-3 rounded-2xl border border-white/12 bg-wisdom-card p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
          <Package className="h-3.5 w-3.5 shrink-0" />
          Package shortcuts
        </p>
        <ul className="space-y-3">
          {PACKAGE_SHORTCUTS.map((p) => {
            const key = packageLockKey(p.id);
            const lock = lockMap.get(key);
            return (
              <li
                key={p.id}
                className="space-y-2 rounded-xl border border-white/10 bg-wisdom-dark/40 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 text-sm font-semibold text-white">
                    {p.label}
                  </span>
                  {modeBadge(lock?.mode)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={busyKey === key}
                      onClick={() => applyMode(key, m.id, p.label)}
                      className={`${modeTileCls} ${
                        lock?.mode === m.id
                          ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                          : "border-white/12 text-wisdom-muted"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={busyKey === key || !lock}
                    onClick={() => resetToDefault(key)}
                    className={resetCls}
                  >
                    Default
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tree navigation */}
      <nav className="flex flex-wrap items-center gap-x-1 text-sm">
        <button
          type="button"
          onClick={resetRoot}
          className="min-h-[44px] px-1 font-medium text-amber-300"
        >
          Academy
        </button>
        {crumbs.map((c, i) => (
          <span key={c.id + i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-wisdom-muted" />
            <button
              type="button"
              onClick={() => goTo(i)}
              className={`min-h-[44px] px-1 text-left ${
                i === crumbs.length - 1
                  ? "font-semibold text-white"
                  : "text-cyan-300"
              }`}
            >
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      {/* Controls for current node */}
      {activeKey && (
        <div className="space-y-3 rounded-2xl border border-amber-400/25 bg-wisdom-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            {activeLock?.mode === "open" || !activeLock ? (
              <Unlock className="h-4 w-4 shrink-0 text-emerald-300" />
            ) : (
              <Lock className="h-4 w-4 shrink-0 text-rose-300" />
            )}
            <p className="min-w-0 font-semibold text-white">
              {current?.label || "Selection"}
            </p>
            {modeBadge(activeLock?.mode)}
          </div>
          <p className="break-all font-mono text-xs text-wisdom-muted">{activeKey}</p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busyKey === activeKey}
                onClick={() =>
                  applyMode(activeKey, m.id, current?.label || activeKey)
                }
                className={`${modeTileCls} ${
                  activeLock?.mode === m.id
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                    : "border-white/12 text-wisdom-muted"
                }`}
              >
                {m.id === "open" ? (
                  <Unlock className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="min-w-0">{m.label}</span>
              </button>
            ))}
            <button
              type="button"
              disabled={busyKey === activeKey || !activeLock}
              onClick={() => resetToDefault(activeKey)}
              className={resetCls}
            >
              Reset to code default
            </button>
          </div>
          <p className="text-xs text-wisdom-muted">
            Hub-level locks override subject locks; subject locks override package
            locks. Individual exams: use <strong className="text-white">Published</strong>{" "}
            in the Content tab.
          </p>
        </div>
      )}

      {/* Children list */}
      {!isHub && listNodes.length > 0 && (
        <ul className="grid grid-cols-2 gap-2">
          {listNodes.map((node) => {
            const childKey =
              node.scopePath && HUB_IDS.includes(node.id)
                ? hubLockKey(node.scopePath, node.id)
                : node.scopePath
                  ? scopeLockKey(node.scopePath)
                  : node.packageId
                    ? packageLockKey(node.packageId)
                    : null;
            const childLock = childKey ? lockMap.get(childKey) : undefined;
            return (
              <li key={node.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => enter(node)}
                  className="flex h-full min-h-[64px] w-full flex-col items-start gap-1.5 rounded-2xl border border-white/12 bg-wisdom-card p-3 text-left"
                >
                  <span className="flex w-full items-center justify-between">
                    <FolderOpen className="h-5 w-5 shrink-0 text-amber-400" />
                    <ChevronRight className="h-4 w-4 shrink-0 text-wisdom-muted" />
                  </span>
                  <span className="break-words text-sm font-semibold leading-tight text-white">
                    {node.label}
                  </span>
                  {childLock && modeBadge(childLock.mode)}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isHub && (
        <p className="rounded-2xl border border-dashed border-white/15 py-6 text-center text-sm text-wisdom-muted">
          This is a hub. Use the buttons above to lock/unlock the whole hub.
          Open the <strong className="text-white">Content</strong> tab to publish
          or unpublish individual exams and items.
        </p>
      )}

      {locks.length > 0 && crumbs.length === 0 && (
        <div className="pt-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            All active overrides ({locks.length})
          </p>
          <ul
            className="max-h-60 space-y-2 text-xs"
            style={{ overflowY: "auto", overscrollBehavior: "contain" }}
          >
            {locks.map((l) => (
              <li
                key={l.lockKey}
                className="flex flex-wrap items-center gap-2 text-wisdom-muted"
              >
                <span className="min-w-0 break-all font-mono text-cyan-300/90">{l.lockKey}</span>
                {modeBadge(l.mode)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
