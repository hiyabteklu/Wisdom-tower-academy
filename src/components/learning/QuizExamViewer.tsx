"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Calculator } from "lucide-react";

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
      {isExam && durationMin > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm">
          <span className="font-mono text-emerald-200">
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
          <span className="text-xs text-wisdom-muted">
            {submitted ? "Time up / submitted" : "Exam timer"}
          </span>
        </div>
      )}

      {/* Nav board */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((_, i) => (
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
                : answers[i] != null
                  ? "border-emerald-400/40 text-emerald-300"
                  : "border-white/15 text-wisdom-muted"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5">
        <p className="text-xs text-wisdom-muted mb-2">
          Question {idx + 1} of {questions.length}
        </p>
        <p className="text-white font-medium leading-relaxed mb-4">{q.prompt}</p>
        <div className="space-y-2">
          {(q.choices || []).map((c, ci) => (
            <button
              key={ci}
              type="button"
              disabled={submitted}
              onClick={() => setAnswers((a) => ({ ...a, [idx]: ci }))}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm ${
                answers[idx] === ci
                  ? "border-amber-400/50 bg-amber-500/15 text-white"
                  : "border-white/12 text-white/80 hover:border-white/25"
              }`}
            >
              {String.fromCharCode(65 + ci)}. {c}
            </button>
          ))}
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
          <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3 text-sm text-cyan-50">
            {q.solution}
          </div>
        )}
        {ai && (
          <div className="mt-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 text-sm whitespace-pre-wrap">
            {ai}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => setIdx((i) => i - 1)}
          className="px-4 py-2 rounded-xl border border-white/12 text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={idx >= questions.length - 1}
          onClick={() => setIdx((i) => i + 1)}
          className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-40"
        >
          Next
        </button>
        {isExam && (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-sm font-semibold"
          >
            Submit · score {score}/{questions.length}
          </button>
        )}
      </div>

      {/* Mini calculator */}
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

      {submitted && isExam && (
        <p className="text-center text-emerald-300 font-semibold">
          Score: {score} / {questions.length}
        </p>
      )}
    </div>
  );
}
