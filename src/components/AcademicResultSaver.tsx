"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  Percent,
  Calendar,
  BarChart3,
} from "lucide-react";

export type ResultEntry = {
  id: string;
  title: string;
  date: string;
  total: number;
  correct: number;
  missed: number;
  percent: number;
  notes?: string;
};

function storageKey(scopeId: string) {
  return `wt_academic_results_${scopeId}`;
}

function loadResults(scopeId: string): ResultEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(scopeId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResultEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveResults(scopeId: string, list: ResultEntry[]) {
  try {
    localStorage.setItem(storageKey(scopeId), JSON.stringify(list));
  } catch {
    /* quota / private mode */
  }
}

type Props = {
  /** Unique key per grade/course e.g. grade-9-books, freshman-physics, uat */
  scopeId: string;
  scopeLabel: string;
  accent?: string;
};

export default function AcademicResultSaver({
  scopeId,
  scopeLabel,
  accent = "text-wisdom-cyan",
}: Props) {
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("20");
  const [correct, setCorrect] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setResults(loadResults(scopeId));
    setHydrated(true);
  }, [scopeId]);

  const persist = useCallback(
    (next: ResultEntry[]) => {
      setResults(next);
      saveResults(scopeId, next);
    },
    [scopeId]
  );

  const stats = useMemo(() => {
    if (!results.length) {
      return { avg: 0, best: 0, attempts: 0, totalCorrect: 0, totalMissed: 0, trend: 0 };
    }
    const avg = results.reduce((s, r) => s + r.percent, 0) / results.length;
    const best = Math.max(...results.map((r) => r.percent));
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    const totalMissed = results.reduce((s, r) => s + r.missed, 0);
    const trend =
      results.length >= 2 ? results[0].percent - results[1].percent : 0;
    return {
      avg: Math.round(avg * 10) / 10,
      best,
      attempts: results.length,
      totalCorrect,
      totalMissed,
      trend,
    };
  }, [results]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const t = parseInt(total, 10);
    const c = parseInt(correct, 10);
    if (!title.trim()) {
      setError("Add a short title (e.g. Chapter 3 quiz)");
      return;
    }
    if (!Number.isFinite(t) || t < 1) {
      setError("Total questions must be at least 1");
      return;
    }
    if (!Number.isFinite(c) || c < 0 || c > t) {
      setError("Correct answers must be between 0 and total");
      return;
    }
    const missed = t - c;
    const percent = Math.round((c / t) * 1000) / 10;
    const entry: ResultEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      date: new Date().toISOString(),
      total: t,
      correct: c,
      missed,
      percent,
      notes: notes.trim() || undefined,
    };
    persist([entry, ...results]);
    setTitle("");
    setCorrect("");
    setNotes("");
    setOpenForm(false);
  };

  const remove = (id: string) => {
    persist(results.filter((r) => r.id !== id));
  };

  if (!hydrated) {
    return (
      <div className="rounded-3xl border border-white/10 bg-wisdom-card/50 p-6 animate-pulse h-40" />
    );
  }

  return (
    <section className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
      <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              Result <span className={accent}>Saver</span>
            </h2>
            <p className="text-xs text-wisdom-muted">{scopeLabel} · saved on this device</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpenForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold hover:bg-wisdom-cyan-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log result
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border-b border-white/10">
        {[
          {
            label: "Average",
            value: stats.attempts ? `${stats.avg}%` : "—",
            icon: Percent,
            color: "text-cyan-400",
          },
          {
            label: "Best",
            value: stats.attempts ? `${stats.best}%` : "—",
            icon: Target,
            color: "text-emerald-400",
          },
          {
            label: "Correct (all)",
            value: stats.attempts ? String(stats.totalCorrect) : "—",
            icon: CheckCircle2,
            color: "text-green-400",
          },
          {
            label: "Missed (all)",
            value: stats.attempts ? String(stats.totalMissed) : "—",
            icon: XCircle,
            color: "text-rose-400",
          },
        ].map((s) => (
          <div key={s.label} className="bg-wisdom-card px-4 py-4">
            <div className="flex items-center gap-1.5 text-wisdom-muted mb-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`font-display text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {stats.attempts > 0 && (
        <div className="px-5 sm:px-6 py-3 border-b border-white/10 flex flex-wrap items-center gap-4 text-xs text-wisdom-muted">
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            {stats.attempts} attempt{stats.attempts === 1 ? "" : "s"}
          </span>
          {stats.attempts >= 2 && (
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                stats.trend >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${stats.trend < 0 ? "rotate-180" : ""}`} />
              {stats.trend >= 0 ? "+" : ""}
              {stats.trend}% vs previous
            </span>
          )}
        </div>
      )}

      {openForm && (
        <form onSubmit={submit} className="px-5 sm:px-6 py-5 border-b border-white/10 space-y-4 bg-wisdom-dark/30">
          <div>
            <label className="block text-xs font-medium text-wisdom-muted mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm mock · Unit 4 quiz"
              className="field-input text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-wisdom-muted mb-1.5">Total questions</label>
              <input
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="field-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-wisdom-muted mb-1.5">Correct</label>
              <input
                type="number"
                min={0}
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
                placeholder="0"
                className="field-input text-sm"
              />
            </div>
          </div>
          {total && correct !== "" && Number(correct) <= Number(total) && Number(total) > 0 && (
            <p className="text-sm text-wisdom-muted">
              Preview:{" "}
              <span className="text-emerald-400 font-semibold">{correct} correct</span>
              {" · "}
              <span className="text-rose-400 font-semibold">
                {Number(total) - Number(correct)} missed
              </span>
              {" · "}
              <span className={`${accent} font-bold`}>
                {Math.round((Number(correct) / Number(total)) * 1000) / 10}%
              </span>
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-wisdom-muted mb-1.5">Notes (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Topics to review…"
              className="field-input text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold hover:bg-wisdom-cyan-dark transition-colors"
            >
              Save result
            </button>
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-sm text-wisdom-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="px-5 sm:px-6 py-5">
        {!results.length ? (
          <div className="text-center py-8">
            <ClipboardCheck className="w-10 h-10 text-wisdom-muted mx-auto mb-3 opacity-50" />
            <p className="text-sm text-wisdom-muted max-w-sm mx-auto leading-relaxed">
              Log quizzes, mocks, and exams here. Track percent, correct, missed, and your trend over
              time — private to this browser until cloud sync is added.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {results.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-white/8 bg-wisdom-dark/40 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{r.title}</p>
                    <span
                      className={`text-sm font-black tabular-nums ${
                        r.percent >= 80
                          ? "text-emerald-400"
                          : r.percent >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                      }`}
                    >
                      {r.percent}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-wisdom-muted">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400/80" />
                      {r.correct}/{r.total} correct
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-400/80" />
                      {r.missed} missed
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="mt-1.5 text-xs text-wisdom-muted/90 italic line-clamp-2">{r.notes}</p>
                  )}
                  {/* mini bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-xs">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.percent >= 80
                          ? "bg-emerald-400"
                          : r.percent >= 50
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                      style={{ width: `${Math.min(100, r.percent)}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="self-start sm:self-center p-2 rounded-lg text-wisdom-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
