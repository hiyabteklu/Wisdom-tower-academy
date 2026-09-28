"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Gauge,
  HelpCircle,
  Layers,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
  AlertTriangle,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  computeStudentAnalytics,
  type StudentAnalyticsResult,
  resolveStudentTrackBenchmark,
  ACADEMIC_KNOWLEDGE_BASE,
} from "@/lib/student-knowledge-base";

export interface StudentAnalyticsProps {
  userId: string;
  studentName?: string;
  educationLevel?: string | null;
  stream?: string | null;
  userCreatedAt?: string;
  dailyGoalMinutes?: number;
  enrolledPackageIds?: string[];
  className?: string;
}

export default function StudentAnalyticsDashboard({
  userId,
  studentName = "Scholar",
  educationLevel,
  stream,
  userCreatedAt,
  dailyGoalMinutes = 45,
  enrolledPackageIds = [],
  className = "",
}: StudentAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTrackKey, setSelectedTrackKey] = useState<string>("");

  // Raw progress records from Supabase learning_progress
  const [rawProgress, setRawProgress] = useState<
    {
      resource_id: string;
      progress_pct: number;
      total_seconds: number;
      focus_seconds: number;
      last_opened_at: string | null;
      meta: Record<string, unknown>;
    }[]
  >([]);

  // Fetch real user progress from Supabase
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      if (!userId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("learning_progress")
          .select("resource_id, progress_pct, total_seconds, focus_seconds, last_opened_at, meta")
          .eq("user_id", userId);

        if (!cancelled && !error && data) {
          setRawProgress(data);
        }
      } catch (err) {
        console.warn("[StudentAnalytics] Failed to fetch learning_progress:", err);
      }
      if (!cancelled) setLoading(false);
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Determine initial benchmark track key based on auto-read registration
  const defaultResolvedTrack = useMemo(() => {
    const touched = rawProgress.map((p) => p.resource_id);
    return resolveStudentTrackBenchmark(educationLevel, stream, enrolledPackageIds, touched);
  }, [educationLevel, stream, enrolledPackageIds, rawProgress]);

  useEffect(() => {
    if (!selectedTrackKey) {
      setSelectedTrackKey(defaultResolvedTrack.trackId);
    }
  }, [defaultResolvedTrack.trackId, selectedTrackKey]);

  // Compute rich dynamic analytics evaluated against the Knowledge Base
  const analytics: StudentAnalyticsResult = useMemo(() => {
    // If the user selected a different track in the dropdown, pass that override
    const effectiveEduLevel = selectedTrackKey || educationLevel;
    return computeStudentAnalytics(
      rawProgress,
      studentName,
      effectiveEduLevel,
      stream,
      userCreatedAt,
      enrolledPackageIds
    );
  }, [rawProgress, studentName, selectedTrackKey, educationLevel, stream, userCreatedAt, enrolledPackageIds]);

  const isAutoDetected = selectedTrackKey === defaultResolvedTrack.trackId;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ========================================================= */}
      {/* REGISTERED CURRICULUM BANNER & TRACK SELECTOR             */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-wisdom-card via-wisdom-navy to-wisdom-card p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              {isAutoDetected ? "Auto-Read From Your Registration" : "Enrolled Curriculum View"}
            </span>
            {educationLevel && (
              <span className="text-xs font-semibold text-wisdom-muted">
                Profile Level: <strong className="text-white">{educationLevel}</strong>
                {stream ? ` · ${stream}` : ""}
              </span>
            )}
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
            {analytics.trackBenchmark.trackName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All analytics below are drawn from your registered courses ({analytics.courseBreakdown.length} official subjects), active chapter reading logs, and question drill accuracy.
          </p>
        </div>

        {/* Track Customizer Dropdown */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted">
            Inspect Enrolled Curriculum
          </label>
          <div className="relative">
            <select
              value={selectedTrackKey || defaultResolvedTrack.trackId}
              onChange={(e) => setSelectedTrackKey(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-2xl border border-white/15 bg-black/40 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
            >
              {Object.values(ACADEMIC_KNOWLEDGE_BASE).map((t) => (
                <option key={t.trackId} value={t.trackId} className="bg-wisdom-navy text-white text-xs">
                  {t.trackName} ({t.coreSubjects.length} subjects)
                  {t.trackId === defaultResolvedTrack.trackId ? " ★ Registered" : ""}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-300 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4 PRIMARY METRIC CARDS — DIRECT TO THE STUDENT             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. YOUR STUDY TIME */}
        <div className="card-modern p-5 border-white/10 bg-wisdom-card/80 flex flex-col justify-between hover:border-cyan-400/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Your Study Time
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-300">
                {analytics.weeklyProgressPct}% of Goal
              </span>
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-white">
              {analytics.totalStudyHours}
              <span className="text-base font-normal text-wisdom-muted ml-1">hrs</span>
            </p>
            <p className="text-xs text-cyan-300/90 font-semibold mt-1">
              Target: {analytics.weeklyTargetHours} hrs / week
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/8 text-[11px] text-wisdom-muted leading-tight">
            {analytics.hoursRemainingThisWeek > 0
              ? `You need ${analytics.hoursRemainingThisWeek} more hours this week to reach institutional target.`
              : "You have completed your weekly study quota for this syllabus."}
          </div>
        </div>

        {/* 2. YOUR READING SPEED & FOCUS */}
        <div className="card-modern p-5 border-white/10 bg-wisdom-card/80 flex flex-col justify-between hover:border-amber-400/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Your Reading Speed
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300">
                {analytics.focusRatioPct}% Focus
              </span>
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-amber-300">
              {analytics.readingSpeedWpm}
              <span className="text-sm font-normal text-wisdom-muted ml-1">WPM</span>
            </p>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Benchmark: {analytics.trackBenchmark.expectedReadingWpm} WPM
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/8 text-[11px] text-wisdom-muted leading-tight">
            Your reading rate is measured across textbook chapters and lecture notes.
          </div>
        </div>

        {/* 3. YOUR QUESTION ACCURACY RATE */}
        <div className="card-modern p-5 border-white/10 bg-wisdom-card/80 flex flex-col justify-between hover:border-emerald-400/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Your Question Accuracy
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {analytics.questionsCorrect}/{analytics.questionsAttempted} Solved
              </span>
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-emerald-400">
              {analytics.questionAccuracyPct}%
            </p>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Standing: <span className="text-emerald-300">{analytics.masteryTier}</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/8 text-[11px] text-wisdom-muted leading-tight">
            Derived from all chapter drills, midterm questions, and practice exams.
          </div>
        </div>

        {/* 4. YOUR ACTIVE STUDY STREAK */}
        <div className="card-modern p-5 border-white/10 bg-wisdom-card/80 flex flex-col justify-between hover:border-orange-400/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Your Study Streak
              </span>
              <span className="text-[10px] font-bold text-orange-300 uppercase">
                {analytics.streakStatus}
              </span>
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-orange-400">
              {analytics.currentStreakDays}
              <span className="text-base font-normal text-wisdom-muted ml-1">days</span>
            </p>
            <p className="text-xs text-orange-300/90 font-semibold mt-1">
              Continuous daily learning
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/8 text-[11px] text-wisdom-muted leading-tight">
            Log at least 20 minutes today to maintain your consecutive streak.
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DIRECT ACADEMIC DIRECTIVES — 1-ON-1 PERSONAL TO STUDENT   */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-[#0a1426] via-wisdom-card to-wisdom-dark p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Academic Performance Directives
              </span>
              <span className="text-xs text-wisdom-muted">
                Direct Evaluation for {studentName}
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-white mt-1">
              What your recent activities indicate you must do
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200">
              Rank: <strong className="text-cyan-300">{analytics.masteryTier}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Urgent Task */}
          <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.03] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Immediate Priority for You
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analytics.tailoredDirectives.urgentTask}
            </p>
          </div>

          {/* Schedule Directives */}
          <div className="p-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.03] space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
              <Calendar className="w-4 h-4 shrink-0" />
              Your Weekly Schedule Calibration
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analytics.tailoredDirectives.scheduleAdvice}
            </p>
          </div>

          {/* Retention Advice */}
          <div className="p-4 rounded-2xl border border-purple-500/25 bg-purple-500/[0.03] space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              <Zap className="w-4 h-4 shrink-0" />
              Your Reading & Recall Protocol
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analytics.tailoredDirectives.retentionAdvice}
            </p>
          </div>

          {/* Standing / Pacing */}
          <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <Timer className="w-4 h-4 shrink-0" />
              Your Exam Pacing & Standing
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analytics.tailoredDirectives.complimentOrCaution} {analytics.pacingDiagnosis.message}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COURSE-BY-COURSE REGISTERED CURRICULUM BREAKDOWN          */}
      {/* ========================================================= */}
      <div className="card-modern p-5 sm:p-7 border-white/10 bg-wisdom-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-300" />
              Your Registered Courses: Mastery & Question Accuracy
            </h3>
            <p className="text-xs text-wisdom-muted mt-0.5">
              Official subjects in your enrolled track: <strong>{analytics.trackBenchmark.trackName}</strong>.
            </p>
          </div>

          <Link
            href="/learning"
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-center"
          >
            Open Learning Hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.courseBreakdown.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/20 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display text-sm sm:text-base font-bold text-white leading-snug truncate">
                      {course.name}
                    </h4>
                    <p className="text-[11px] text-slate-300/80 line-clamp-2 leading-relaxed mt-1">
                      {course.description}
                    </p>
                    <span className="text-[10px] text-wisdom-muted block mt-1.5 font-mono">
                      {course.credits} Credits · Recommended: {course.recommendedHours} hrs/wk
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                      course.status === "Mastered"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : course.status === "Proficient"
                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/30"
                        : course.status === "Developing"
                        ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                {/* Accuracy & Mastery Bars */}
                <div className="space-y-2 pt-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-wisdom-muted text-[11px]">Syllabus Mastery</span>
                      <span className="font-mono font-bold text-white">{course.calculatedMasteryPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${course.calculatedMasteryPct}%` }}
                        className={`h-full rounded-full transition-all duration-700 ${
                          course.calculatedMasteryPct >= 85
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : course.calculatedMasteryPct >= 75
                            ? "bg-gradient-to-r from-cyan-500 to-sky-400"
                            : "bg-gradient-to-r from-amber-500 to-orange-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-wisdom-muted pt-1">
                    <span>
                      Accuracy: <strong className="text-white font-mono">{course.accuracyPct}%</strong>
                    </span>
                    <span>
                      Drills Solved: <strong className="text-cyan-300 font-mono">{course.questionsSolved}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Tactical Advice & Link to Subject */}
              <div className="pt-3 border-t border-white/6 space-y-2.5">
                <div className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                    Your Next Best Step
                  </span>
                  <p className="text-[11.5px] leading-relaxed">
                    {course.actionAdvice}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={course.route}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    Open {course.name} Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] font-mono text-wisdom-muted">
                    {course.studyMinutes}m logged
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* YOUR WEEKLY CADENCE & DAILY STUDY DISTRIBUTION            */}
      {/* ========================================================= */}
      <div className="card-modern p-5 sm:p-7 border-white/10 bg-wisdom-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-300" />
              Your Weekly Study Distribution & Daily Rhythm
            </h3>
            <p className="text-xs text-wisdom-muted mt-0.5">
              Daily minutes logged in your coursework (Monday through Sunday).
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 self-start sm:self-center">
            Current Week Ledger
          </span>
        </div>

        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {analytics.dailyDistribution.map((d) => {
              const max = 120;
              const heightPct = Math.min(100, Math.max(14, Math.round((d.minutes / max) * 100)));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes}m
                  </span>
                  <div className="w-full max-w-[2.5rem] bg-white/5 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-amber-300 rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-wisdom-muted">
          <span>
            Daily Target: <strong className="text-white">{dailyGoalMinutes} mins</strong> per day
          </span>
          <span className="text-cyan-300">
            Total this week: <strong className="text-white">{analytics.totalStudyHours} hours</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
