"use client";

import { useState } from "react";
import { BookOpen, Lightbulb, Loader2 } from "lucide-react";
import MathText from "@/components/MathText";

type Props = {
  /** Premade solution written/uploaded by you (no AI) */
  solution?: string;
  /** When true, show optional "Explain with AI" */
  enableAi?: boolean;
  questionId: string;
  question: string;
  choices: string[];
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  difficulty: string;
};

type ExplainResponse = {
  explanation?: string;
  cached?: boolean;
  fallback?: boolean;
  error?: string;
  detail?: string;
};

/**
 * Two paths after an answer is revealed:
 * 1) Solution — your premade text (free, instant)
 * 2) Explain with AI — optional extra tutoring (uses API + cache)
 */
export default function SolutionPanel({
  solution,
  enableAi = true,
  questionId,
  question,
  choices,
  studentAnswer,
  correctAnswer,
  subject,
  difficulty,
}: Props) {
  const [showSolution, setShowSolution] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<{ cached?: boolean; fallback?: boolean } | null>(
    null
  );
  const [aiError, setAiError] = useState("");

  const hasPremade = Boolean(solution?.trim());

  async function handleAiExplain() {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          question,
          choices,
          studentAnswer,
          correctAnswer,
          subject,
          difficulty,
        }),
      });
      const data = (await res.json()) as ExplainResponse;
      if (data.explanation) {
        setAiText(data.explanation);
        setAiMeta({ cached: data.cached, fallback: data.fallback });
      } else {
        setAiError(data.error || data.detail || "Could not load AI explanation.");
      }
    } catch {
      setAiError("Network error. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  if (!hasPremade && !enableAi) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {hasPremade && (
          <button
            type="button"
            onClick={() => setShowSolution((v) => !v)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              showSolution
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/15 bg-white/5 text-white/90 hover:border-emerald-400/30 hover:text-emerald-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {showSolution ? "Hide solution" : "Solution"}
          </button>
        )}

        {enableAi && (
          <button
            type="button"
            onClick={handleAiExplain}
            disabled={aiLoading || Boolean(aiText && !aiMeta?.fallback)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/20 disabled:opacity-60 transition-colors"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            {aiLoading
              ? "Generating…"
              : aiText && !aiMeta?.fallback
                ? "AI explanation ready"
                : "Explain with AI"}
          </button>
        )}
      </div>

      {showSolution && hasPremade && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">
              Solution
            </span>
            <span className="text-[10px] text-wisdom-muted ml-auto">official</span>
          </div>
          <div className="text-sm text-white/85 leading-relaxed">
            <MathText text={solution || ""} />
          </div>
        </div>
      )}

      {aiError && <p className="text-xs text-amber-300/90">{aiError}</p>}

      {aiText && (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300/90">
              AI explanation
            </span>
            {aiMeta?.cached && (
              <span className="text-[10px] text-wisdom-muted ml-auto">cached</span>
            )}
            {aiMeta?.fallback && (
              <span className="text-[10px] text-amber-400/80 ml-auto">offline tip</span>
            )}
          </div>
          <div className="text-sm text-white/85 leading-relaxed">
            <MathText text={aiText} />
          </div>
        </div>
      )}
    </div>
  );
}
