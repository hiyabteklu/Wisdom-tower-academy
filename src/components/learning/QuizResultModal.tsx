"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ListChecks,
  AlertTriangle,
  X,
  Flag,
} from "lucide-react";

type Props = {
  isOpen: boolean;
  score: number;
  total: number;
  wrong: number;
  skipped: number;
  flagged?: number;
  elapsedSec: number;
  isExam?: boolean;
  title?: string;
  onReviewAll: () => void;
  onReviewMissed: () => void;
  onReviewFlagged?: () => void;
  onRetake: () => void;
  onClose: () => void;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function QuizResultModal({
  isOpen,
  score,
  total,
  wrong,
  skipped,
  flagged = 0,
  elapsedSec,
  isExam = false,
  title,
  onReviewAll,
  onReviewMissed,
  onReviewFlagged,
  onRetake,
  onClose,
}: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const [displayPct, setDisplayPct] = useState(0);

  // Animated radial score count-up
  useEffect(() => {
    if (!isOpen) {
      setDisplayPct(0);
      return;
    }
    const end = pct;
    const duration = 800;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    const req = requestAnimationFrame(step);
    return () => cancelAnimationFrame(req);
  }, [isOpen, pct]);

  // Tier info
  const tier = useMemo(() => {
    if (pct >= 90) {
      return {
        label: "Mastery Level 🌟",
        tone: "text-emerald-400",
        border: "border-emerald-400/40",
        bg: "from-emerald-500/20 via-teal-500/10 to-transparent",
        gaugeStroke: "#10b981",
        caption: "Outstanding! You demonstrated rock-solid mastery of these concepts.",
      };
    }
    if (pct >= 75) {
      return {
        label: "Strong Performance 🎯",
        tone: "text-cyan-400",
        border: "border-cyan-400/40",
        bg: "from-cyan-500/20 via-blue-500/10 to-transparent",
        gaugeStroke: "#06b6d4",
        caption: "Great effort! A few targeted reviews will get you to top scores.",
      };
    }
    if (pct >= 50) {
      return {
        label: "Good Progress 📚",
        tone: "text-amber-400",
        border: "border-amber-400/40",
        bg: "from-amber-500/20 via-orange-500/10 to-transparent",
        gaugeStroke: "#f59e0b",
        caption: "Solid start. Reviewing the missed questions will quickly boost your score.",
      };
    }
    return {
      label: "Needs Reinforcement 💡",
      tone: "text-rose-400",
      border: "border-rose-400/40",
      bg: "from-rose-500/20 via-red-500/10 to-transparent",
      gaugeStroke: "#f43f5e",
      caption: "Don't worry! Use the step-by-step solutions below to master these questions.",
    };
  }, [pct]);

  if (!isOpen) return null;

  // Gauge calculation
  const radius = 62;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPct / 100) * circumference;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#090f22] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-center my-auto select-none">
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-3xl opacity-40 bg-gradient-to-b ${tier.bg} pointer-events-none`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
          title="Close result modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/[0.06] border border-white/10 text-slate-300 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          {isExam ? "Exam Result" : "Practice Completed"}
        </div>

        {title && (
          <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4 line-clamp-1">
            {title}
          </h2>
        )}

        {/* Score Radial Gauge with Animated Counter */}
        <div className="relative my-4 flex items-center justify-center">
          <svg className="w-40 h-40 sm:w-44 sm:h-44 -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={tier.gaugeStroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
              style={{
                filter: `drop-shadow(0 0 10px ${tier.gaugeStroke}60)`,
              }}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
              {displayPct}%
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
              {score} of {total} Correct
            </span>
          </div>
        </div>

        {/* Tier Label & Caption */}
        <div className="mb-6">
          <p className={`font-display text-base sm:text-lg font-bold ${tier.tone}`}>
            {tier.label}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
            {tier.caption}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-6 text-left">
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Correct</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{score}</p>
          </div>

          <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-bold">
              <XCircle className="w-3.5 h-3.5" />
              <span>Missed</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{wrong}</p>
          </div>

          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Skipped</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{skipped}</p>
          </div>

          <div className="col-span-3 sm:col-span-1 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-300" />
              <span>Time</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white mt-1">
              {formatTime(elapsedSec)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Review Missed Only Button */}
            <button
              type="button"
              onClick={onReviewMissed}
              disabled={wrong === 0 && skipped === 0}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                wrong === 0 && skipped === 0
                  ? "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-500/90 to-red-600/90 hover:from-rose-500 hover:to-red-600 text-white border border-rose-400/30 shadow-rose-900/30 cursor-pointer"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Review Missed ({wrong + skipped})</span>
            </button>

            {/* Review All Button */}
            <button
              type="button"
              onClick={onReviewAll}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-cyan-900/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ListChecks className="w-4 h-4" />
              <span>Review All ({total})</span>
            </button>
          </div>

          {/* Optional Review Flagged Button */}
          {flagged > 0 && onReviewFlagged && (
            <button
              type="button"
              onClick={onReviewFlagged}
              className="w-full py-2.5 px-4 rounded-2xl border border-orange-400/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-orange-400" />
              <span>Review Flagged Questions ({flagged})</span>
            </button>
          )}

          {/* Retake Practice Button */}
          <button
            type="button"
            onClick={onRetake}
            className="w-full py-2.5 px-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake {isExam ? "Exam" : "Practice"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
