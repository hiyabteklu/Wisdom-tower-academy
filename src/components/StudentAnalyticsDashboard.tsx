"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Gauge,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
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

  // Compute rich dynamic analytics evaluated against real records
  const analytics: StudentAnalyticsResult = useMemo(() => {
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

  const trackOptions = Object.values(ACADEMIC_KNOWLEDGE_BASE).map((t) => ({
    value: t.trackId,
    label: t.trackId === defaultResolvedTrack.trackId ? `${t.trackName} (Enrolled)` : t.trackName,
    description: `${t.category} · ${t.weeklyTargetHours}h / week target`,
  }));

  return (
    <div className={`space-y-8 sm:space-y-10 ${className}`}>
      {/* ========================================================= */}
      {/* 1. EXECUTIVE SYSTEM VERIFICATION BANNER                    */}
      {/* ========================================================= */}
      <div className="rounded-[2rem] border border-sky-500/25 bg-gradient-to-br from-[#071124]/85 via-[#0b1730]/80 to-[#060e1d]/85 backdrop-blur-2xl p-6 sm:p-8 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.35)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/30">
              <GraduationCap className="w-4 h-4 text-sky-400" />
              Verified Academic Analytics
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-slate-300 bg-white/[0.04] border border-white/10">
              Standing: <strong className="text-cyan-300 font-bold">{analytics.masteryTier}</strong>
            </span>
          </div>

          {/* Academic Track Benchmark Selector */}
          <div className="flex items-center gap-2.5">
            <div className="w-56 sm:w-64">
              <CustomSelect
                value={selectedTrackKey || defaultResolvedTrack.trackId}
                onChange={(val) => setSelectedTrackKey(val)}
                options={trackOptions}
                searchable={false}
              />
            </div>
          </div>
        </div>

        {/* The Exact "According to your records and our system..." statement */}
        <div className="p-5 sm:p-6 rounded-2xl border border-sky-400/25 bg-sky-500/[0.07] backdrop-blur-md space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>System Executive Assessment</span>
          </p>
          <p className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
            According to your verified study records and our academic system, your cumulative study time is{" "}
            <strong className="text-white font-semibold">{analytics.studyTimeAnalysis.totalStudyHours} hours</strong> (
            {analytics.studyTimeAnalysis.totalStudyMinutes} minutes). You are tracking at{" "}
            <strong className="text-cyan-300 font-semibold">{analytics.weeklyProgressPct}%</strong> of your{" "}
            {analytics.weeklyTargetHours}-hour weekly target with an active streak of{" "}
            <strong className="text-amber-300 font-semibold">{analytics.currentStreakDays} days</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOUR HIGH-CONTRAST LEVEL-COLORED HUD METRICS            */}
      {/* ========================================================= */}
      {(() => {
        // Study Time Level
        const timeLevel =
          analytics.weeklyProgressPct >= 75
            ? { text: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-400/50", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", status: "On Target" }
            : analytics.weeklyProgressPct >= 50
            ? { text: "text-amber-400", border: "border-amber-500/30 hover:border-amber-400/50", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", status: "Moderate Pace" }
            : { text: "text-rose-400", border: "border-rose-500/30 hover:border-rose-400/50", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30", status: "Under Goal" };

        // Reading Speed Ratio
        const speedRatio = Math.round(
          (analytics.readingSpeedWpm / (analytics.trackBenchmark.expectedReadingWpm || 180)) * 100
        );
        const speedLevel =
          speedRatio >= 90
            ? { text: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-400/50", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", status: "High Velocity" }
            : speedRatio >= 65
            ? { text: "text-amber-400", border: "border-amber-500/30 hover:border-amber-400/50", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", status: "Standard Pace" }
            : { text: "text-rose-400", border: "border-rose-500/30 hover:border-rose-400/50", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30", status: "Pacing Warning" };

        // Question Accuracy Level
        const accuracyLevel =
          analytics.questionAccuracyPct >= 75
            ? { text: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-400/50", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", status: "Mastery Level" }
            : analytics.questionAccuracyPct >= 50
            ? { text: "text-amber-400", border: "border-amber-500/30 hover:border-amber-400/50", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", status: "Developing" }
            : { text: "text-rose-400", border: "border-rose-500/30 hover:border-rose-400/50", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30", status: "Needs Review" };

        // Streak Level
        const streakLevel =
          analytics.currentStreakDays >= 7
            ? { text: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-400/50", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }
            : analytics.currentStreakDays >= 3
            ? { text: "text-amber-400", border: "border-amber-500/30 hover:border-amber-400/50", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" }
            : { text: "text-rose-400", border: "border-rose-500/30 hover:border-rose-400/50", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" };

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Study Time */}
            <div className={`p-6 sm:p-7 rounded-[1.75rem] border bg-[#0b1329]/75 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between ${timeLevel.border} transition-all duration-300 hover:scale-[1.01]`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-400/30 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Study Time
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${timeLevel.badge}`}>
                    {timeLevel.status}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-extrabold ${timeLevel.text}`}>
                  {analytics.totalStudyHours}
                  <span className="text-base font-normal text-slate-400 ml-1.5">hrs</span>
                </p>
                <p className="text-xs text-slate-300 font-medium mt-1.5">
                  Target: {analytics.weeklyTargetHours} hrs/wk ({analytics.weeklyProgressPct}%)
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/[0.08] text-xs text-slate-400 leading-relaxed">
                {analytics.hoursRemainingThisWeek > 0
                  ? `${analytics.hoursRemainingThisWeek} hrs remaining to hit weekly quota.`
                  : "Weekly institutional study quota reached."}
              </div>
            </div>

            {/* Card 2: Reading Speed & Focus */}
            <div className={`p-6 sm:p-7 rounded-[1.75rem] border bg-[#0b1329]/75 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between ${speedLevel.border} transition-all duration-300 hover:scale-[1.01]`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Reading Speed
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${speedLevel.badge}`}>
                    {analytics.readingAnalysis.method.split("/")[0].trim()}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-extrabold ${speedLevel.text}`}>
                  {analytics.readingSpeedWpm}
                  <span className="text-sm font-normal text-slate-400 ml-1.5">WPM</span>
                </p>
                <p className="text-xs text-slate-300 font-medium mt-1.5">
                  Focus Dwell Ratio: <strong className="text-white">{analytics.focusRatioPct}%</strong>
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/[0.08] text-xs text-slate-400 leading-relaxed">
                Benchmark: {analytics.trackBenchmark.expectedReadingWpm} WPM for {analytics.trackBenchmark.trackName}.
              </div>
            </div>

            {/* Card 3: Question Accuracy */}
            <div className={`p-6 sm:p-7 rounded-[1.75rem] border bg-[#0b1329]/75 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between ${accuracyLevel.border} transition-all duration-300 hover:scale-[1.01]`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Accuracy
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${accuracyLevel.badge}`}>
                    {accuracyLevel.status}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-extrabold ${accuracyLevel.text}`}>
                  {analytics.questionAccuracyPct}%
                </p>
                <p className="text-xs text-slate-300 font-medium mt-1.5">
                  Solved: {analytics.questionsCorrect} of {analytics.questionsAttempted} drills
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/[0.08] text-xs text-slate-400 leading-relaxed">
                Retention Index: <strong className="text-white">{analytics.retentionAnalysis.retentionIndexPct}%</strong>
              </div>
            </div>

            {/* Card 4: Active Streak */}
            <div className={`p-6 sm:p-7 rounded-[1.75rem] border bg-[#0b1329]/75 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between ${streakLevel.border} transition-all duration-300 hover:scale-[1.01]`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Active Streak
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${streakLevel.badge}`}>
                    {analytics.currentStreakDays >= 7 ? "Unbroken" : "Active"}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-extrabold ${streakLevel.text}`}>
                  {analytics.currentStreakDays}
                  <span className="text-base font-normal text-slate-400 ml-1.5">days</span>
                </p>
                <p className="text-xs text-slate-300 font-medium mt-1.5">
                  Daily active learning recorded
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-white/[0.08] text-xs text-slate-400 leading-relaxed">
                Daily goal: {dailyGoalMinutes} mins / day.
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 3. READING SPEED & READING METHOD IN-DEPTH DIAGNOSTIC       */}
      {/* ========================================================= */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0b1329]/75 backdrop-blur-2xl p-6 sm:p-8 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.3)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/30">
                Cognitive Reading Diagnostic
              </span>
              <span className="text-xs text-slate-400">
                Evaluated across syllabus chapters & lecture notes
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Your Reading Speed & Method Analysis
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`text-xs font-semibold px-4 py-1.5 rounded-full border ${analytics.readingAnalysis.methodColor}`}>
              Method: {analytics.readingAnalysis.method}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Diagnostic 1: Reading Velocity */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md space-y-2.5 hover:bg-white/[0.05] transition-all duration-200">
            <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-2 text-cyan-300">
                <Gauge className="w-4 h-4" />
                Velocity Rate
              </span>
              <span className="font-mono text-white text-sm font-semibold">{analytics.readingAnalysis.speedWpm} WPM</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Your reading velocity is calculated at <strong>{analytics.readingAnalysis.speedWpm} Words Per Minute</strong>. 
              {analytics.readingAnalysis.speedWpm >= 285
                ? " This falls in the rapid scanning category. You transition through text quickly."
                : analytics.readingAnalysis.speedWpm >= 180
                ? " This is an optimal pace for technical and academic comprehension."
                : " This is a deliberate, step-by-step pace ideal for formulas and derivations."}
            </p>
          </div>

          {/* Diagnostic 2: Reading Method Classification */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md space-y-2.5 hover:bg-white/[0.05] transition-all duration-200">
            <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-2 text-amber-300">
                <Compass className="w-4 h-4" />
                Detected Method
              </span>
              <span className="font-semibold text-amber-300">{analytics.readingAnalysis.methodBadge}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {analytics.readingAnalysis.methodDescription}
            </p>
          </div>

          {/* Diagnostic 3: Retention Impact */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md space-y-2.5 hover:bg-white/[0.05] transition-all duration-200">
            <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-2 text-emerald-300">
                <Zap className="w-4 h-4" />
                Retention Impact
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{analytics.focusRatioPct}% Focus</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {analytics.readingAnalysis.retentionImpact}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RETENTION & ACCURACY DIAGNOSIS                          */}
      {/* ========================================================= */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0b1329]/75 backdrop-blur-2xl p-6 sm:p-8 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.3)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                Retention & Exam Accuracy
              </span>
              <span className="text-xs text-slate-400">
                Derived from drills, chapter checks, and question sets
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Active Recall & Question Precision
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`text-xs font-semibold px-4 py-1.5 rounded-full border ${analytics.retentionAnalysis.ratingColor}`}>
              {analytics.retentionAnalysis.rating}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Accuracy Breakdown */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md space-y-3.5 hover:bg-white/[0.05] transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Accuracy & Solved Volume
              </span>
              <span className="font-mono text-cyan-300 font-bold text-sm">
                {analytics.retentionAnalysis.accuracyPct}%
              </span>
            </div>

            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${analytics.retentionAnalysis.accuracyPct}%` }}
                className={`h-full rounded-full transition-all duration-700 ${
                  analytics.retentionAnalysis.accuracyPct >= 75
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : analytics.retentionAnalysis.accuracyPct >= 50
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-rose-500 to-red-400"
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-slate-300 text-xs pt-1">
              <span>
                Correctly Solved: <strong className="text-white font-mono">{analytics.retentionAnalysis.questionsCorrect}</strong>
              </span>
              <span>
                Total Attempted: <strong className="text-white font-mono">{analytics.retentionAnalysis.questionsAttempted}</strong>
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed pt-1 text-xs">
              {analytics.retentionAnalysis.explanation}
            </p>
          </div>

          {/* Exam Pacing Diagnostic */}
          <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md space-y-3.5 hover:bg-white/[0.05] transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                Exam Solve Pacing
              </span>
              <span className="font-mono text-amber-300 font-bold text-sm">
                {analytics.averageMinutesPerQuestion} min/q
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-white/8 bg-black/30 text-xs text-slate-300 leading-relaxed">
              {analytics.pacingDiagnosis.message}
            </div>

            <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
              <span>National Threshold: <strong>{analytics.trackBenchmark.targetMinutesPerQuestion}m</strong></span>
              <span className={analytics.pacingDiagnosis.status === "Optimal" ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                Status: {analytics.pacingDiagnosis.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. RECOMMENDATIONS                                         */}
      {/* ========================================================= */}
      <div className="rounded-[2rem] border border-cyan-500/25 bg-gradient-to-br from-[#061226]/85 via-[#091836]/80 to-[#050e20]/85 backdrop-blur-2xl p-6 sm:p-8 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.35)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Actionable Directives
              </span>
              <span className="text-xs text-slate-300">
                Personalized study guidance for {studentName}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              System Recommendations For Your Study Routine
            </h3>
          </div>

          <span className="text-xs font-mono font-bold text-cyan-300 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 self-start sm:self-center">
            {analytics.recommendations.length} Specific Adjustments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {analytics.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md hover:border-cyan-400/40 hover:bg-white/[0.05] transition-all duration-300 space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                    {rec.category}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-white">
                  {rec.title}
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed mt-1.5">
                  {rec.description}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.06] text-xs text-cyan-200 font-medium">
                <strong className="text-cyan-300 block text-[10px] uppercase tracking-wider mb-1">
                  Actionable Step:
                </strong>
                {rec.actionableStep}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. CRITICAL WARNING SYSTEM (Immediately Stop Signals)     */}
      {/* ========================================================= */}
      <div className="rounded-[2rem] border border-rose-500/25 bg-[#0b1329]/75 backdrop-blur-2xl p-6 sm:p-8 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.35)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Critical Warning System
              </span>
              <span className="text-xs text-slate-400">
                Derived directly from your recent study telemetry
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Immediately Stop Signals & Habits
            </h3>
          </div>

          <span className="text-xs font-mono font-bold text-rose-300 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 self-start sm:self-center">
            {analytics.immediatelyStopSignals.length} Active Directives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {analytics.immediatelyStopSignals.map((sig) => (
            <div
              key={sig.id}
              className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md hover:border-rose-400/40 hover:bg-white/[0.05] transition-all duration-300 space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {sig.severity} Alert
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{sig.signal}</span>
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed mt-1.5">
                  <strong className="text-white">Observed Data: </strong>
                  {sig.observedData}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-slate-200 font-medium">
                <strong className="text-rose-400 block text-[10px] uppercase tracking-wider mb-1">
                  Immediate Corrective Action:
                </strong>
                {sig.immediateAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. WEEKLY READING TIME & DAILY STUDY RHYTHM CHART          */}
      {/* ========================================================= */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0b1329]/75 backdrop-blur-2xl p-6 sm:p-8 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.3)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-sky-400" />
              Weekly Reading Time & Daily Study Rhythm
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verified daily distribution of your reading sessions and question practice (Monday – Sunday).
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-cyan-300 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 self-start sm:self-center">
            {analytics.totalStudyHours} hrs logged this week
          </span>
        </div>

        <div className="h-44 flex items-end justify-between gap-2.5 sm:gap-5 px-3 pt-3">
          {analytics.dailyDistribution.map((d) => {
            const max = 120;
            const heightPct = Math.min(100, Math.max(14, Math.round((d.minutes / max) * 100)));
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2.5 group">
                <span className="text-[10px] font-mono font-bold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.minutes}m
                </span>
                <div className="w-full max-w-[2.5rem] bg-white/[0.04] rounded-t-2xl overflow-hidden h-32 flex items-end p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-amber-300 rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
