"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Calculator, Trophy, Target } from "lucide-react";
import RichContent from "@/components/learning/RichContent";
import { saveProgress, saveExamAttempt } from "@/lib/content";

type Q = {
  prompt: string;
  choices?: string[];
  correct?: number;
  solution?: string;
};

type Props = {
  meta: Record<string, unknown>;
  isExam?: boolean;
  resourceId: string;
};

export default function QuizExamViewer({ meta, isExam, resourceId }: Props) {
  const questions = (Array.isArray(meta.questions) ? meta.questions : []) as Q[];
  const durationMin = Number(meta.durationMin || 0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showSol, setShowSol] = useState(false);
  const [left, setLeft] = useState(durationMin * 60);
  const [calc, setCalc] = useState("");
  const [ai, setAi] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isExam || !durationMin) return;
    if (left <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, isExam, durationMin]);

  const q = questions[idx];

  const score = useMemo(() => {
    let c = 0;
    questions.forEach((qq, i) => {
      if (answers[i] === qq.correct) c++;
    });
    return c;
  }, [answers, questions]);

  const attempted = Object.keys(answers).length;
  const accuracy =
    attempted > 0 ? Math.round((score / attempted) * 100) : 0;

  // Live progress while answering (practice mode)
  useEffect(() => {
    if (!resourceId || questions.length === 0) return;
    const pct = Math.round((attempted / questions.length) * 100);
    void saveProgress({
      resourceId,
      progressPct: pct,
      meta: {
        quiz: {
          attempted,
          correct: score,
          total: questions.length,
          accuracy,
          submitted,
        },
      },
    });
  }, [attempted, score, accuracy, submitted, resourceId, questions.length]);

  // Persist exam attempt on submit
  useEffect(() => {
    if (!submitted || saved || !resourceId) return;
    setSaved(true);
    void saveExamAttempt({
      resourceId,
      score,
      total: questions.length,
      answers,
    });
    void saveProgress({
      resourceId,
      progressPct: 100,
      meta: {
        quiz: {
          attempted,
          correct: score,
          total: questions.length,
          accuracy: questions.length
            ? Math.round((score / questions.length) * 100)
            : 0,
          submitted: true,
        },
      },
    });
  }, [submitted, saved, resourceId, score, questions.length, answers, attempted]);

  if (!questions.length) {
    return <p className="text-sm text-wisdom-muted">No questions yet.</p>;
  }

  async function explainQ() {
    setAi("…");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: q?.prompt,
          solution: q?.solution,
          resourceId,
          mode: "question",
        }),
      });
      const data = await res.json();
      setAi(data.explanation || data.error || "—");
    } catch {
      setAi("AI unavailable");
    }
  }

  return (
    <div className="space-y-4">
      {/* Live stats bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-wisdom-dark/40 px-4 py-2.5 text-xs">
        <span className="inline-flex items-center gap-1 text-cyan-200">
          <Target className="w-3.5 h-3.5" />
          Attempted {attempted}/{questions.length}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-200">
          <Trophy className="w-3.5 h-3.5" />
          Correct {score}
        </span>
        <span className="text-amber-200 font-semibold">
          Accuracy {accuracy}%
        </span>
        {isExam && durationMin > 0 && (
          <span className="ml-auto font-mono text-emerald-200">
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Nav board */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const answered = answers[i] != null;
          const isCorrect = answered && answers[i] === qq.correct;
          const isWrong = answered && answers[i] !== qq.correct && (submitted || !isExam);
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIdx(i);
                setShowSol(false);
                setAi("");
              }}
              className={`w-8 h-8 rounded-lg text-xs font-bold border ${
                i === idx
                  ? "border-amber-400 bg-amber-500/20 text-amber-200"
                  : isCorrect
                    ? "border-emerald-400/50 text-emerald-300"
                    : isWrong
                      ? "border-rose-400/50 text-rose-300"
                      : answered
                        ? "border-cyan-400/40 text-cyan-300"
                        : "border-white/15 text-wisdom-muted"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5">
        <p className="text-xs text-wisdom-muted mb-2">
          Question {idx + 1} of {questions.length}
        </p>
        <div className="text-white font-medium leading-relaxed mb-4 study-prose">
          <RichContent body={q.prompt} />
        </div>
        <div className="space-y-2">
          {(q.choices || []).map((c, ci) => {
            const selected = answers[idx] === ci;
            const reveal =
              submitted || (!isExam && showSol);
            const isRight = q.correct === ci;
            return (
              <button
                key={ci}
                type="button"
                disabled={submitted}
                onClick={() => setAnswers((a) => ({ ...a, [idx]: ci }))}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  selected
                    ? "border-amber-400/50 bg-amber-500/15 text-white"
                    : "border-white/12 text-white/80 hover:border-white/25"
                } ${
                  reveal && isRight
                    ? "!border-emerald-400/50 !bg-emerald-500/10"
                    : ""
                } ${
                  reveal && selected && !isRight
                    ? "!border-rose-400/40 !bg-rose-500/10"
                    : ""
                }`}
              >
                <span className="font-semibold text-amber-200/90 mr-1.5">
                  {String.fromCharCode(65 + ci)}.
                </span>
                {c}
              </button>
            );
          })}
        </div>

        {!isExam && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowSol(true)}
              className="text-xs font-semibold text-cyan-300"
            >
              Show solution
            </button>
            <button
              type="button"
              onClick={() => void explainQ()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300"
            >
              <Sparkles className="w-3.5 h-3.5" /> Explain with AI
            </button>
          </div>
        )}

        {showSol && q.solution && (
          <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
              Solution
            </p>
            <div className="study-prose text-cyan-50">
              <RichContent body={q.solution} />
            </div>
          </div>
        )}
        {ai && ai !== "…" && (
          <div className="mt-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2">
              AI explanation
            </p>
            <div className="study-prose text-white/90">
              <RichContent body={ai} />
            </div>
          </div>
        )}
        {ai === "…" && (
          <p className="mt-3 text-xs text-violet-300/80">Generating explanation…</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => {
            setIdx((i) => i - 1);
            setShowSol(false);
            setAi("");
          }}
          className="px-4 py-2 rounded-xl border border-white/12 text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={idx >= questions.length - 1}
          onClick={() => {
            setIdx((i) => i + 1);
            setShowSol(false);
            setAi("");
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-40"
        >
          Next
        </button>
        {isExam && !submitted && (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-sm font-semibold"
          >
            Submit exam
          </button>
        )}
      </div>

      <details className="rounded-xl border border-white/10 bg-wisdom-dark/40 p-3">
        <summary className="text-xs font-semibold text-wisdom-muted cursor-pointer flex items-center gap-1">
          <Calculator className="w-3.5 h-3.5" /> Calculator
        </summary>
        <input
          value={calc}
          onChange={(e) => setCalc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              try {
                // eslint-disable-next-line no-new-func
                const v = Function(`"use strict"; return (${calc})`)();
                setCalc(String(v));
              } catch {
                setCalc("Error");
              }
            }
          }}
          placeholder="e.g. 12*3.5"
          className="mt-2 w-full rounded-lg border border-white/15 bg-wisdom-card px-3 py-2 text-sm font-mono"
        />
      </details>

      {submitted && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center">
          <Trophy className="w-7 h-7 text-emerald-300 mx-auto mb-2" />
          <p className="font-display text-lg font-bold text-white">
            Score: {score} / {questions.length}
          </p>
          <p className="text-sm text-emerald-200/90 mt-1">
            Accuracy{" "}
            {questions.length
              ? Math.round((score / questions.length) * 100)
              : 0}
            % · saved to your progress
          </p>
        </div>
      )}
    </div>
  );
}
