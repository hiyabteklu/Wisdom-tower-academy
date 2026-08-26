"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  LogIn,
  Gauge,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type ResultEntry = {
  id: string;
  title: string;
  date: string;
  total: number;
  correct: number;
  missed: number;
  percent: number;
  notes?: string | null;
};

type Props = {
  /** Unique key per grade/course e.g. grade-9-books, freshman-physics, uat */
  scopeId: string;
  scopeLabel: string;
  accent?: string;
};

/** Circular gauge — percent 0–100, animated stroke */
function CircularGauge({
  percent,
  size = 140,
  stroke = 10,
  label,
  sublabel,
  colorClass = "text-cyan-400",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
  colorClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;

  const tone =
    clamped >= 80 ? "#34d399" : clamped >= 50 ? "#fbbf24" : clamped > 0 ? "#fb7185" : "#64748b";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          {/* progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
            style={{
              filter: clamped > 0 ? `drop-shadow(0 0 6px ${tone}55)` : undefined,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl font-black tabular-nums ${colorClass}`}>
            {clamped > 0 || percent === 0 ? `${Math.round(clamped * 10) / 10}` : "—"}
            {clamped > 0 || percent === 0 ? (
              <span className="text-base font-bold text-white/40">%</span>
            ) : null}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-wisdom-muted mt-0.5">
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <p className="mt-2 text-xs text-wisdom-muted text-center max-w-[10rem]">{sublabel}</p>
      )}
    </div>
  );
}

/** Mini horizontal spark bars for recent attempts */
function SparkBars({ results }: { results: ResultEntry[] }) {
  const slice = results.slice(0, 12).reverse();
  if (!slice.length) return null;
  const maxH = 36;

  return (
    <div className="flex items-end gap-1 h-10">
      {slice.map((r) => {
        const h = Math.max(4, (r.percent / 100) * maxH);
        const bg =
          r.percent >= 80
            ? "bg-emerald-400"
            : r.percent >= 50
              ? "bg-amber-400"
              : "bg-rose-400";
        return (
          <div
            key={r.id}
            title={`${r.title}: ${r.percent}%`}
            className={`w-2 sm:w-2.5 rounded-t-sm ${bg} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: h }}
          />
        );
      })}
    </div>
  );
}

export default function AcademicResultSaver({
  scopeId,
  scopeLabel,
  accent = "text-wisdom-cyan",
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    setError("");
    try {
      const { data, error: qErr } = await supabase
        .from("academic_results")
        .select("id, title, total, correct, missed, percent, notes, created_at")
        .eq("user_id", uid)
        .eq("scope_id", scopeId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (qErr) {
        // Table may not exist yet — fail soft
        console.warn("academic_results:", qErr.message);
        setResults([]);
        if (qErr.code === "42P01" || /does not exist|relation/i.test(qErr.message)) {
          setError("Progress table not set up yet. Run the Supabase SQL in the project docs.");
        }
      } else {
        setResults(
          (data || []).map((row) => ({
            id: row.id,
            title: row.title,
            date: row.created_at,
            total: row.total,
            correct: row.correct,
            missed: row.missed,
            percent: Number(row.percent),
            notes: row.notes,
          }))
        );
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    }
    setLoading(false);
  }, [scopeId]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!mounted) return;
      setUser(u);
      if (u) load(u.id);
      else setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) load(u.id);
      else {
        setResults([]);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [load]);

  const stats = useMemo(() => {
    if (!results.length) {
      return { avg: 0, best: 0, attempts: 0, totalCorrect: 0, totalMissed: 0, trend: 0, latest: 0 };
    }
    const avg = results.reduce((s, r) => s + r.percent, 0) / results.length;
    const best = Math.max(...results.map((r) => r.percent));
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    const totalMissed = results.reduce((s, r) => s + r.missed, 0);
    const trend = results.length >= 2 ? results[0].percent - results[1].percent : 0;
    return {
      avg: Math.round(avg * 10) / 10,
      best,
      attempts: results.length,
      totalCorrect,
      totalMissed,
      trend,
      latest: results[0].percent,
    };
  }, [results]);

  return (
    <section className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
      <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              Progress <span className={accent}>Tracker</span>
            </h2>
            <p className="text-xs text-wisdom-muted">{scopeLabel} · from your history</p>
          </div>
        </div>
        {stats.attempts > 0 && (
          <div className="flex items-center gap-3">
            <SparkBars results={results} />
            {stats.attempts >= 2 && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  stats.trend >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                <TrendingUp className={`w-3.5 h-3.5 ${stats.trend < 0 ? "rotate-180" : ""}`} />
                {stats.trend >= 0 ? "+" : ""}
                {Math.round(stats.trend * 10) / 10}%
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-10 flex justify-center">
          <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !user ? (
        <div className="px-6 py-12 text-center">
          <LogIn className="w-10 h-10 text-wisdom-muted mx-auto mb-3 opacity-50" />
          <p className="text-sm text-wisdom-muted max-w-sm mx-auto mb-5 leading-relaxed">
            Sign in to see your live progress — averages, best scores, and attempt history sync from
            your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold hover:bg-wisdom-cyan-dark transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
        </div>
      ) : error ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-amber-300/90 max-w-md mx-auto">{error}</p>
        </div>
      ) : !results.length ? (
        <div className="px-6 py-12 text-center">
          <Activity className="w-10 h-10 text-wisdom-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-white/80 mb-1">No attempts yet in this scope</p>
          <p className="text-sm text-wisdom-muted max-w-sm mx-auto leading-relaxed">
            When you complete quizzes, mocks, or exams linked to this pathway, your scores appear
            here automatically — gauges, trends, and history. No manual logging.
          </p>
        </div>
      ) : (
        <>
          {/* Gauges */}
          <div className="px-5 sm:px-8 py-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
            <CircularGauge
              percent={stats.latest}
              label="Latest"
              sublabel={results[0]?.title}
              colorClass={
                stats.latest >= 80
                  ? "text-emerald-400"
                  : stats.latest >= 50
                    ? "text-amber-400"
                    : "text-rose-400"
              }
            />
            <CircularGauge
              percent={stats.avg}
              label="Average"
              sublabel={`${stats.attempts} attempt${stats.attempts === 1 ? "" : "s"}`}
              colorClass="text-cyan-400"
              size={120}
              stroke={9}
            />
            <CircularGauge
              percent={stats.best}
              label="Best"
              sublabel="Personal peak"
              colorClass="text-emerald-400"
              size={120}
              stroke={9}
            />
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border-b border-white/10">
            {[
              {
                label: "Correct (all)",
                value: String(stats.totalCorrect),
                icon: CheckCircle2,
                color: "text-green-400",
              },
              {
                label: "Missed (all)",
                value: String(stats.totalMissed),
                icon: XCircle,
                color: "text-rose-400",
              },
              {
                label: "Attempts",
                value: String(stats.attempts),
                icon: Target,
                color: "text-cyan-400",
              },
              {
                label: "Trend",
                value:
                  stats.attempts >= 2
                    ? `${stats.trend >= 0 ? "+" : ""}${Math.round(stats.trend * 10) / 10}%`
                    : "—",
                icon: TrendingUp,
                color: stats.trend >= 0 ? "text-emerald-400" : "text-rose-400",
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

          {/* History timeline (read-only) */}
          <div className="px-5 sm:px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted mb-3">
              Recent history
            </p>
            <ul className="space-y-2.5">
              {results.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-white/8 bg-wisdom-dark/40 px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate flex-1 min-w-0">{r.title}</p>
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
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-xs">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        r.percent >= 80
                          ? "bg-emerald-400"
                          : r.percent >= 50
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                      style={{ width: `${Math.min(100, r.percent)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

/**
 * Supabase table (run once in SQL editor):
 *
 * create table if not exists public.academic_results (
 *   id uuid primary key default gen_random_uuid(),
 *   user_id uuid not null references auth.users(id) on delete cascade,
 *   scope_id text not null,
 *   title text not null,
 *   total int not null check (total > 0),
 *   correct int not null check (correct >= 0),
 *   missed int not null check (missed >= 0),
 *   percent numeric(5,1) not null,
 *   notes text,
 *   created_at timestamptz not null default now()
 * );
 * create index on public.academic_results (user_id, scope_id, created_at desc);
 * alter table public.academic_results enable row level security;
 * create policy "Users read own results" on public.academic_results
 *   for select using (auth.uid() = user_id);
 * create policy "Users insert own results" on public.academic_results
 *   for insert with check (auth.uid() = user_id);
 *
 * Future quizzes/mocks should INSERT into this table; the UI only reads.
 */
