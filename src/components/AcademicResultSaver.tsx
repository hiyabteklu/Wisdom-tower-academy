"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Target,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  LogIn,
  Gauge,
  Clock,
  Layers,
  Flame,
  BookOpen,
  SkipForward,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  getScopeStats,
  type HubId,
  type ScopeStats,
} from "@/lib/content";

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

export type AcademicResultSaverProps = {
  scopeId: string;
  scopeLabel: string;
  accent?: string;
  scopePath?: string;
  /** When set, board emphasizes metrics for this hub only */
  hub?: HubId;
};

function formatTime(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

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
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
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
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl font-black tabular-nums ${colorClass}`}>
            {`${Math.round(clamped * 10) / 10}`}
            <span className="text-base font-bold text-white/40">%</span>
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

export default function AcademicResultSaver({
  scopeId,
  scopeLabel,
  accent = "text-wisdom-cyan",
  scopePath,
  hub,
}: AcademicResultSaverProps) {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [study, setStudy] = useState<ScopeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (uid: string) => {
      setLoading(true);
      try {
        const { data, error: qErr } = await supabase
          .from("academic_results")
          .select("id, title, total, correct, missed, percent, notes, created_at")
          .eq("user_id", uid)
          .eq("scope_id", scopeId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (qErr) {
          console.warn("academic_results:", qErr.message);
          setResults([]);
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

        if (scopePath) {
          const { stats, error: sErr } = await getScopeStats({ scopePath, hub });
          if (sErr) console.warn("scope stats:", sErr);
          setStudy(stats);
        } else {
          setStudy(null);
        }
      } catch (e) {
        console.error(e);
        setResults([]);
      }
      setLoading(false);
    },
    [scopeId, scopePath, hub]
  );

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
        setStudy(null);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && user) void load(user.id);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [user, load]);

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

  const isBooks = hub === "books" || hub === "short-notes";
  const isFlash = hub === "flashcards";
  const isQuizHub = hub === "question-banks" || hub === "exams";
  const isVideo = hub === "videos";
  const isCombined = !hub;

  const hasStudy =
    !!study &&
    (study.totalStudySeconds > 0 ||
      study.quizAttempted > 0 ||
      study.flashKnow + study.flashAgain + study.flashLearning > 0 ||
      study.rows.length > 0);
  const hasAttempts = results.length > 0;
  const hasAnything = hasStudy || hasAttempts;

  const hubLabel =
    hub === "short-notes"
      ? "short notes"
      : hub
        ? hub.replace(/-/g, " ")
        : "all hubs";

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
            <p className="text-xs text-wisdom-muted">
              {scopeLabel} · {hubLabel} · live activity
            </p>
          </div>
        </div>
        {study && study.streakDays > 0 && (isCombined || isBooks || isFlash || isQuizHub) && (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-sm font-bold text-orange-300">
            <Flame className="w-4 h-4" /> {study.streakDays} day streak
          </span>
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
            Sign in to see reading time, flashcard stats, exam scores, and streaks.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
          >
            <LogIn className="w-4 h-4" /> Sign in
          </Link>
        </div>
      ) : !hasAnything ? (
        <div className="px-6 py-12 text-center">
          <Activity className="w-10 h-10 text-wisdom-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-white/80 mb-1">No activity yet</p>
          <p className="text-sm text-wisdom-muted max-w-sm mx-auto leading-relaxed">
            Open materials in this section — progress appears here automatically.
          </p>
        </div>
      ) : (
        <>
          {study && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border-b border-white/10">
              {(isCombined || isBooks || isVideo) && (
                <StatChip
                  icon={Clock}
                  label={isVideo ? "Watch time" : "Study time"}
                  value={formatTime(
                    isVideo ? study.videoWatchSeconds || study.totalStudySeconds : study.totalStudySeconds
                  )}
                  color="text-cyan-300"
                />
              )}
              {(isCombined || isBooks) && (
                <StatChip
                  icon={BookOpen}
                  label="Avg progress"
                  value={`${study.avgProgressPct}%`}
                  color="text-amber-300"
                />
              )}
              {(isCombined || isQuizHub) && (
                <>
                  <StatChip
                    icon={CheckCircle2}
                    label="Correct"
                    value={String(study.quizCorrect + (hasAttempts ? stats.totalCorrect : 0))}
                    color="text-emerald-300"
                  />
                  <StatChip
                    icon={XCircle}
                    label="Wrong"
                    value={String(study.quizWrong + (hasAttempts ? stats.totalMissed : 0))}
                    color="text-rose-300"
                  />
                  <StatChip
                    icon={Target}
                    label="Questions tried"
                    value={String(study.quizAttempted || stats.attempts)}
                    color="text-cyan-200"
                  />
                  <StatChip
                    icon={Gauge}
                    label="Exam avg"
                    value={study.avgExamPercent > 0 ? `${study.avgExamPercent}%` : stats.avg ? `${stats.avg}%` : "—"}
                    color="text-amber-200"
                  />
                </>
              )}
              {(isCombined || isFlash) && (
                <>
                  <StatChip icon={Layers} label="Cards known" value={String(study.flashKnow)} color="text-violet-300" />
                  <StatChip icon={Layers} label="Cards learning" value={String(study.flashLearning)} color="text-amber-200" />
                  <StatChip icon={XCircle} label="Again" value={String(study.flashAgain)} color="text-rose-300" />
                </>
              )}
              {(isCombined || isBooks || isFlash || isQuizHub) && (
                <StatChip
                  icon={Flame}
                  label="Streak"
                  value={study.streakDays > 0 ? `${study.streakDays}🔥` : "—"}
                  color="text-orange-300"
                />
              )}
            </div>
          )}

          {hasAttempts && (isCombined || isQuizHub) && (
            <div className="px-5 sm:px-8 py-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 border-b border-white/10">
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
          )}

          {study && study.rows.length > 0 && (
            <div className="px-5 sm:px-6 py-5 border-b border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted mb-3">
                Items you opened
              </p>
              <ul className="space-y-2">
                {study.rows
                  .slice()
                  .sort((a, b) => b.totalSeconds - a.totalSeconds)
                  .slice(0, 8)
                  .map((r) => (
                    <li
                      key={r.resourceId}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-wisdom-dark/40 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-white/90 truncate flex-1 min-w-0">{r.title}</span>
                      <span className="text-xs text-wisdom-muted">{formatTime(r.totalSeconds)}</span>
                      <span className="text-xs font-semibold text-amber-200">
                        {Math.round(r.progressPct)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {hasAttempts && (isCombined || isQuizHub) && (
            <div className="px-5 sm:px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted mb-3">
                Scored attempts
              </p>
              <ul className="space-y-2.5">
                {results.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-white/8 bg-wisdom-dark/40 px-4 py-3.5">
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
                        <SkipForward className="w-3 h-3" />
                        {Math.max(0, r.total - r.correct - r.missed)} skipped
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
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-wisdom-card px-4 py-4">
      <div className="flex items-center gap-1.5 text-wisdom-muted mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-display text-xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
