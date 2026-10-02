"use client";

import { CheckCircle2, Zap, Clock, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";

type Props = {
  isOpen: boolean;
  selectedMode: "immediate" | "completion";
  onSelectMode: (mode: "immediate" | "completion") => void;
  onConfirm: () => void;
};

export default function AnswerCheckingModeModal({
  isOpen,
  selectedMode,
  onSelectMode,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#090f22] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden my-auto text-left">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30 bg-cyan-500 pointer-events-none" />

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Practice Setup</span>
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight">
          How do you want to check answers?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
          Select your answer checking mode before beginning this question bank.
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Option 1: Right away */}
          <button
            type="button"
            onClick={() => {
              onSelectMode("immediate");
            }}
            className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.99] flex items-start gap-3.5 cursor-pointer ${
              selectedMode === "immediate"
                ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50"
                : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                selectedMode === "immediate"
                  ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm sm:text-base font-bold text-white">
                  Show Right Away
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  Instant Feedback
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                See correct answers and explanations immediately after tapping.{" "}
                <span className="text-cyan-200 font-semibold">
                  Your first click is locked in
                </span>{" "}
                to keep your accuracy score true.
              </p>
            </div>
          </button>

          {/* Option 2: After completion */}
          <button
            type="button"
            onClick={() => {
              onSelectMode("completion");
            }}
            className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.99] flex items-start gap-3.5 cursor-pointer ${
              selectedMode === "completion"
                ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50"
                : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                selectedMode === "completion"
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm sm:text-base font-bold text-white">
                  After Completion
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Test Simulation
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Answer all questions at your own speed with no spoilers. You can change your
                answers anytime until you finish practice.
              </p>
            </div>
          </button>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Start Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
