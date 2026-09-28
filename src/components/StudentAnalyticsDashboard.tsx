"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Gauge,
  GraduationCap,
  Layers,
  RotateCcw,
  ShieldAlert,
  Target,
  Timer,
  TrendingUp,
  Zap,
  FileDown,
  Download,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
import { generateWeeklyReportPdf } from "@/lib/pdf-report-generator";
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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

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

  const isAutoDetected = selectedTrackKey === defaultResolvedTrack.trackId;

  const handleDownloadReport = () => {
    setGeneratingPdf(true);
    try {
      const doc = generateWeeklyReportPdf({
        analytics,
        profile: {
          full_name: studentName,
          education_level: educationLevel,
          stream,
        },
        referenceId: `WTA-${userId.slice(0, 6).toUpperCase()}-2026`,
      });
      doc.save(`WTA-Weekly-Report-${studentName.replace(/\s+/g, "_")}.pdf`);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error("[Dashboard] Error generating report PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const trackOptions = Object.values(ACADEMIC_KNOWLEDGE_BASE).map((t) => ({
    value: t.trackId,
    label: t.trackId === defaultResolvedTrack.trackId ? `${t.trackName} (Enrolled)` : t.trackName,
    description: `${t.category} · ${t.weeklyTargetHours}h / week target`,
  }));

  return (
    <div className={`space-y-7 ${className}`}>
      {/* ========================================================= */}
      {/* 1. EXECUTIVE SYSTEM VERIFICATION BANNER                    */}
      {/* "According to your records and our system..."              */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-[#070e1c] via-[#0b1528] to-[#050a14] p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
              <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
              Verified Scholar Performance Report
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              Standing: <strong className="text-cyan-300">{analytics.masteryTier}</strong>
            </span>
          </div>

          {/* Quick Actions: Track Selector & Download Color PDF */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-48 sm:w-56">
              <CustomSelect
                value={selectedTrackKey || defaultResolvedTrack.trackId}
                onChange={(val) => setSelectedTrackKey(val)}
                options={trackOptions}
                searchable={false}
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={generatingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-cyan-400/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 hover:border-cyan-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download your weekly report with concise color summary"
            >
              <FileDown className={`w-3.5 h-3.5 ${generatingPdf ? "animate-bounce" : ""}`} />
              {generatingPdf ? "Generating..." : pdfDownloaded ? "PDF Saved!" : "Download Report (Color PDF)"}
            </button>
          </div>
        </div>

        {/* The Exact "According to your records and our system..." statement */}
        <div className="p-4 sm:p-5 rounded-2xl border border-sky-400/30 bg-sky-500/10 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            System Executive Assessment
          </p>
          <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
            According to your verified study records and our academic system, your cumulative study time is{" "}
            <strong className="text-white font-bold">{analytics.studyTimeAnalysis.totalStudyHours} hours</strong> (
            {analytics.studyTimeAnalysis.totalStudyMinutes} minutes). You are tracking at{" "}
            <strong className="text-cyan-300 font-bold">{analytics.weeklyProgressPct}%</strong> of your{" "}
            {analytics.weeklyTargetHours}-hour weekly target with an active streak of{" "}
            <strong className="text-amber-300 font-bold">{analytics.currentStreakDays} days</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOUR HIGH-CONTRAST LEVEL-COLORED HUD METRICS            */}
      {/* Green (>=75%) / Yellow (50-74%) / Red (<50%)               */}
      {/* ========================================================= */}
      {(() => {
        // Study Time Level
        const timeLevel =
          analytics.weeklyProgressPct >= 75
            ? { text: "text-emerald-400", border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", status: "On Target" }
            : analytics.weeklyProgressPct >= 50
            ? { text: "text-amber-400", border: "border-amber-500/40 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", status: "Moderate Pace" }
            : { text: "text-rose-400", border: "border-rose-500/40 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40", status: "Under Goal" };

        // Reading Speed Ratio
        const speedRatio = Math.round(
          (analytics.readingSpeedWpm / (analytics.trackBenchmark.expectedReadingWpm || 180)) * 100
        );
        const speedLevel =
          speedRatio >= 90
            ? { text: "text-emerald-400", border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", status: "High Velocity" }
            : speedRatio >= 65
            ? { text: "text-amber-400", border: "border-amber-500/40 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", status: "Standard Pace" }
            : { text: "text-rose-400", border: "border-rose-500/40 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40", status: "Pacing Warning" };

        // Question Accuracy Level
        const accuracyLevel =
          analytics.questionAccuracyPct >= 75
            ? { text: "text-emerald-400", border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", status: "Mastery Level" }
            : analytics.questionAccuracyPct >= 50
            ? { text: "text-amber-400", border: "border-amber-500/40 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", status: "Developing" }
            : { text: "text-rose-400", border: "border-rose-500/40 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40", status: "Needs Review" };

        // Streak Level
        const streakLevel =
          analytics.currentStreakDays >= 7
            ? { text: "text-emerald-400", border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" }
            : analytics.currentStreakDays >= 3
            ? { text: "text-amber-400", border: "border-amber-500/40 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" }
            : { text: "text-rose-400", border: "border-rose-500/40 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40" };

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Study Time */}
            <div className={`p-5 rounded-2xl border bg-[#0b1220] shadow-lg flex flex-col justify-between ${timeLevel.border} transition-all`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    Study Time Logged
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${timeLevel.badge}`}>
                    {timeLevel.status}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-black ${timeLevel.text}`}>
                  {analytics.totalStudyHours}
                  <span className="text-base font-normal text-slate-400 ml-1">hrs</span>
                </p>
                <p className="text-xs text-slate-300 font-semibold mt-1">
                  Target: {analytics.weeklyTargetHours} hrs/wk ({analytics.weeklyProgressPct}%)
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
                {analytics.hoursRemainingThisWeek > 0
                  ? `${analytics.hoursRemainingThisWeek} hrs remaining to hit weekly quota.`
                  : "Weekly institutional study quota reached."}
              </div>
            </div>

            {/* Card 2: Reading Speed & Focus */}
            <div className={`p-5 rounded-2xl border bg-[#0b1220] shadow-lg flex flex-col justify-between ${speedLevel.border} transition-all`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    Reading Speed
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${speedLevel.badge}`}>
                    {analytics.readingAnalysis.method.split("/")[0].trim()}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-black ${speedLevel.text}`}>
                  {analytics.readingSpeedWpm}
                  <span className="text-sm font-normal text-slate-400 ml-1">WPM</span>
                </p>
                <p className="text-xs text-slate-300 font-semibold mt-1">
                  Focus Dwell Ratio: <strong className="text-white">{analytics.focusRatioPct}%</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
                Benchmark: {analytics.trackBenchmark.expectedReadingWpm} WPM for {analytics.trackBenchmark.trackName}.
              </div>
            </div>

            {/* Card 3: Question Accuracy */}
            <div className={`p-5 rounded-2xl border bg-[#0b1220] shadow-lg flex flex-col justify-between ${accuracyLevel.border} transition-all`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-sky-400" />
                    Question Accuracy
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${accuracyLevel.badge}`}>
                    {accuracyLevel.status}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-black ${accuracyLevel.text}`}>
                  {analytics.questionAccuracyPct}%
                </p>
                <p className="text-xs text-slate-300 font-semibold mt-1">
                  Solved: {analytics.questionsCorrect} of {analytics.questionsAttempted} drills
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
                Retention Index: <strong className="text-white">{analytics.retentionAnalysis.retentionIndexPct}%</strong>
              </div>
            </div>

            {/* Card 4: Active Streak */}
            <div className={`p-5 rounded-2xl border bg-[#0b1220] shadow-lg flex flex-col justify-between ${streakLevel.border} transition-all`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Active Streak
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${streakLevel.badge}`}>
                    {analytics.currentStreakDays >= 7 ? "Unbroken" : "Active"}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl font-black ${streakLevel.text}`}>
                  {analytics.currentStreakDays}
                  <span className="text-base font-normal text-slate-400 ml-1">days</span>
                </p>
                <p className="text-xs text-slate-300 font-semibold mt-1">
                  Daily active learning recorded
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
                Daily goal: {dailyGoalMinutes} mins / day.
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 3. READING SPEED & READING METHOD IN-DEPTH DIAGNOSTIC       */}
      {/* "Ur reading speed is...,reading method (skimming,... Etc"   */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-white/10 bg-[#080e1c] p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Cognitive Reading Diagnostic
              </span>
              <span className="text-xs text-slate-400">
                Evaluated across syllabus chapters & lecture notes
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black text-white mt-1">
              Your Reading Speed & Method Analysis
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${analytics.readingAnalysis.methodColor}`}>
              Method: {analytics.readingAnalysis.method}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Diagnostic 1: Reading Velocity */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Gauge className="w-4 h-4" />
                Velocity Reading Rate
              </span>
              <span className="font-mono text-white text-sm">{analytics.readingAnalysis.speedWpm} WPM</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Your reading velocity is calculated at <strong>{analytics.readingAnalysis.speedWpm} Words Per Minute</strong>. 
              {analytics.readingAnalysis.speedWpm >= 285
                ? " This falls in the rapid scanning category. You transition through text quickly."
                : analytics.readingAnalysis.speedWpm >= 180
                ? " This is an optimal pace for technical and academic comprehension."
                : " This is a deliberate, step-by-step pace ideal for formulas and derivations."}
            </p>
          </div>

          {/* Diagnostic 2: Reading Method Classification */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Compass className="w-4 h-4" />
                Detected Method
              </span>
              <span className="font-bold text-amber-300">{analytics.readingAnalysis.methodBadge}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {analytics.readingAnalysis.methodDescription}
            </p>
          </div>

          {/* Diagnostic 3: Retention Impact */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Zap className="w-4 h-4" />
                Retention Impact
              </span>
              <span className="font-mono text-emerald-400 font-bold">{analytics.focusRatioPct}% Focus</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {analytics.readingAnalysis.retentionImpact}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RETENTION & ACCURACY DIAGNOSIS                          */}
      {/* "Retainton and accuracy..."                                */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-white/10 bg-[#080e1c] p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Retention & Exam Accuracy
              </span>
              <span className="text-xs text-slate-400">
                Derived from drills, chapter checks, and question sets
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black text-white mt-1">
              Active Recall & Question Precision
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${analytics.retentionAnalysis.ratingColor}`}>
              {analytics.retentionAnalysis.rating}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Accuracy Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Accuracy & Solved Volume
              </span>
              <span className="font-mono text-cyan-300 font-bold text-sm">
                {analytics.retentionAnalysis.accuracyPct}%
              </span>
            </div>

            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
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

            <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1">
              <span>
                Correctly Solved: <strong className="text-white font-mono">{analytics.retentionAnalysis.questionsCorrect}</strong>
              </span>
              <span>
                Total Attempted: <strong className="text-white font-mono">{analytics.retentionAnalysis.questionsAttempted}</strong>
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed pt-1">
              {analytics.retentionAnalysis.explanation}
            </p>
          </div>

          {/* Exam Pacing Diagnostic */}
          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                Exam Solve Pacing
              </span>
              <span className="font-mono text-amber-300 font-bold text-sm">
                {analytics.averageMinutesPerQuestion} min/q
              </span>
            </div>

            <div className="p-3 rounded-xl border border-white/8 bg-black/30 text-[11.5px] text-slate-300 leading-relaxed">
              {analytics.pacingDiagnosis.message}
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
              <span>National Threshold: <strong>{analytics.trackBenchmark.targetMinutesPerQuestion}m</strong></span>
              <span className={analytics.pacingDiagnosis.status === "Optimal" ? "text-emerald-400" : "text-amber-400"}>
                Status: {analytics.pacingDiagnosis.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. RECOMMENDATIONS                                         */}
      {/* "Recommendations...."                                      */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#06101f] via-[#09152b] to-[#050c18] p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                Actionable Directives
              </span>
              <span className="text-xs text-slate-300">
                Personalized study guidance for {studentName}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black text-white mt-1">
              System Recommendations For Your Study Routine
            </h3>
          </div>

          <span className="text-xs font-mono font-bold text-cyan-300 self-start sm:self-center">
            {analytics.recommendations.length} Specific Adjustments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {analytics.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                    {rec.category}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-white">
                  {rec.title}
                </h4>
                <p className="text-slate-300 text-[11.5px] leading-relaxed mt-1">
                  {rec.description}
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] text-[11.5px] text-cyan-200 font-medium">
                <strong className="text-cyan-300 block text-[10px] uppercase tracking-wider mb-0.5">
                  Actionable Step:
                </strong>
                {rec.actionableStep}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. IMMEDIATELY STOP SIGNALS (Critical Warning System)      */}
      {/* "Immediately stop signals (what was wrong recently...)"   */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-rose-500/50 bg-gradient-to-br from-[#1a070a] via-[#140608] to-[#0d0305] p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/25 text-rose-300 border border-rose-500/50 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Critical Warning System
              </span>
              <span className="text-xs text-rose-300/80">
                Real data-detected counter-productive habits
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
              Immediately Stop Signals
            </h3>
          </div>

          <span className="text-xs font-mono font-bold text-rose-300 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 self-start sm:self-center">
            Zero Tolerance Flags
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {analytics.immediatelyStopSignals.map((sig) => (
            <div
              key={sig.id}
              className="p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 hover:border-rose-400/50 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/40">
                    {sig.severity} Alert
                  </span>
                </div>
                <h4 className="font-display text-sm font-extrabold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  {sig.signal}
                </h4>
                <p className="text-rose-200/90 text-[11.5px] leading-relaxed mt-1">
                  <strong className="text-rose-300">Observed Data: </strong>
                  {sig.observedData}
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-[11.5px] text-white font-medium">
                <strong className="text-rose-300 block text-[10px] uppercase tracking-wider mb-0.5">
                  Immediate Corrective Action:
                </strong>
                {sig.immediateAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. REAL ACTIVE SUBJECTS (No Hallucinations) & CADENCE      */}
      {/* Avoid per-subject hallucinations: ONLY real active ones    */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-white/10 bg-[#080e1c] p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              Your Active Enrolled Courses
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Only subjects where you have active logged reading or solved questions. Zero placeholder items.
            </p>
          </div>

          <Link
            href="/learning"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 flex items-center gap-1.5 self-start sm:self-center transition-all"
          >
            Enter Study Hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analytics.realActiveSubjects.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.01] text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
            <h4 className="font-display text-sm font-bold text-white">
              No Course Modules Actively Started Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Open your textbook chapters, flashcard decks, or question banks in the Learning Hub to start building verified per-subject mastery records.
            </p>
            <div className="pt-2">
              <Link
                href="/learning"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-sky-400/50 bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 transition-all"
              >
                Browse Syllabus & Start Studying
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.realActiveSubjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/30 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-display text-sm font-bold text-white truncate">
                      {sub.name}
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20">
                      {sub.studyMinutes}m logged
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Accuracy: <strong className="text-white font-mono">{sub.accuracyPct}%</strong> · Drills: <strong className="text-white font-mono">{sub.questionsSolved}</strong>
                  </p>
                </div>

                <Link
                  href={sub.route}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors pt-2 border-t border-white/6"
                >
                  Continue Course <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Daily Rhythm Chart */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Daily Study Rhythm (Monday – Sunday)
            </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {analytics.totalStudyHours} hrs logged this week
            </span>
          </div>

          <div className="h-36 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-4">
            {analytics.dailyDistribution.map((d) => {
              const max = 120;
              const heightPct = Math.min(100, Math.max(14, Math.round((d.minutes / max) * 100)));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes}m
                  </span>
                  <div className="w-full max-w-[2.5rem] bg-white/5 rounded-t-xl overflow-hidden h-24 flex items-end">
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
      </div>
    </div>
  );
}
