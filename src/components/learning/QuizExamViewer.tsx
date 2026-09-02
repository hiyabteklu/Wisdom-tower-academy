"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  Calculator,
  Trophy,
  Target,
  BadgeCheck,
  Clock,
} from "lucide-react";
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
  title?: string;
  trackerScopeId?: string;
};

export default function QuizExamViewer({
  meta,
  isExam,
  resourceId,
  title,
  trackerScopeId,
}: Props) {
  const questions = (Array.isArray(meta.questions) ? meta.questions : []) as Q[];
  const durationMin = Number(meta.durationMin || 0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showSol, setShowSol] = useState(false);
  /** Once solution is revealed for a question, lock that answer (practice mode). */
  const [lockedBySolution, setLockedBySolution] = useState<Record<number, boolean>>({});
  const [left, setLeft] = useState(durationMin > 0 ? durationMin * 60 : 0);
  const [calc, setCalc] = useState("");
  const [ai, setAi] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [startedAt] = useState(() => Date.now());

  // Exam countdown only
  useEffect(() => {
    if (!isExam || durationMin <= 0 || submitted) return;
    if (left <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, isExam, durationMin, submitted]);

  const q = questions[idx];

  const score = useMemo(() => {
    let c = 0;
    questions.forEach((qq, i) => {
      if (answers[i] === qq.correct) c++;
    });
    return c;
  }, [answers, questions]);

  const attempted = Object.keys(answers).length;
  const skipped = questions.length - attempted;
  const wrong = useMemo(() => {
    let w = 0;
    questions.forEach((qq, i) => {
      if (answers[i] != null && answers[i] !== qq.correct) w++;
    });
    return w;
  }, [answers, questions]);

  const accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
  const elapsedSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

  // Practice quiz: live progress. Exam: only after submit.
  useEffect(() => {
    if (!resourceId || questions.length === 0) return;
    if (isExam && !submitted) return;
    const pct = Math.round((attempted / questions.length) * 100);
    void saveProgress({
      resourceId,
      progressPct: submitted ? 100 : pct,
      meta: {
        quiz: {
          attempted,
          correct: score,
          total: questions.length,
          accuracy: submitted
            ? questions.length
              ? Math.round((score / questions.length) * 100)
              : 0
            : accuracy,
          submitted: Boolean(submitted),
          wrong,
          skipped,
          elapsedSec,
        },
      },
    });
  }, [
    attempted,
    score,
    accuracy,
    submitted,
    resourceId,
    questions.length,
    isExam,
    wrong,
    skipped,
    elapsedSec,
  ]);

  useEffect(() => {
    if (!submitted || saved || !resourceId) return;
    setSaved(true);
    if (isExam) {
      void saveExamAttempt({
        resourceId,
        score,
        total: questions.length,
        answers,
        title: title || "Exam",
        scopeId: trackerScopeId,
      });
    }
  }, [
    submitted,
    saved,
    resourceId,
    score,
    questions.length,
    answers,
    title,
    trackerScopeId,
    isExam,
  ]);

  if (!questions.length) {
    return <p className="text-sm text-wisdom-muted">No questions yet.</p>;
  }

  async function explainQ() {
    if (!q) return;
    setAiLoading(true);
    setAi("");
    try {
      const student =
        answers[idx] != null
          ? q.choices?.[answers[idx]] || String(answers[idx])
          : "(not answered)";
      const correct =
        q.correct != null ? q.choices?.[q.correct] || String(q.correct) : "";
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "question",
          text: q.prompt,
          question: q.prompt,
          choices: q.choices || [],
          studentAnswer: student,
          correctAnswer: correct,
          solution: q.solution || "",
          resourceId,
        }),
      });
      const data = await res.json();
      setAi(data.explanation || data.error || "—");
    } catch {
      setAi("AI unavailable");
    }
    setAiLoading(false);
  }

  const revealCorrectness = !isExam || submitted;
  /** Cannot change answer after exam submit, or after opening solution on this question (practice). */
  const answersLocked = submitted || Boolean(lockedBySolution[idx]);

  function openOfficialSolution() {
    setShowSol((v) => {
      const next = !v;
      if (next) {
        setLockedBySolution((prev) => ({ ...prev, [idx]: true }));
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Tracker — exam hides live score until submit */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-wisdom-dark/40 px-4 py-2.5 text-xs">
        {!isExam && (
          <>
            <span className="inline-flex items-center gap-1 text-cyan-200">
              <Target className="w-3.5 h-3.5" />
              Attempted {attempted}/{questions.length}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-200">
              <Trophy className="w-3.5 h-3.5" />
              Correct {score}
            </span>
            <span className="text-amber-200 font-semibold">Accuracy {accuracy}%</span>
          </>
        )}
        {isExam && !submitted && (
          <span className="inline-flex items-center gap-1 text-white/70">
            Answered {attempted}/{questions.length}
            {skipped > 0 ? ` · ${skipped} left` : ""}
          </span>
        )}
        {isExam && durationMin > 0 && (
          <span
            className={`ml-auto font-mono font-bold inline-flex items-center gap-1 ${
              left < 60 ? "text-rose-300" : "text-emerald-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const answered = answers[i] != null;
          const isCorrect = revealCorrectness && answered && answers[i] === qq.correct;
          const isWrong = revealCorrectness && answered && answers[i] !== qq.correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIdx(i);
                setShowSol(Boolean(lockedBySolution[i]));
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
          {answersLocked && !submitted && (
            <span className="ml-2 text-amber-300/80">· Answer locked (solution viewed)</span>
          )}
        </p>
        <div className="text-white font-medium leading-relaxed mb-4 study-prose">
          <RichContent body={q.prompt} />
        </div>
        <div className="space-y-2">
          {(q.choices || []).map((c, ci) => {
            const selected = answers[idx] === ci;
            const isRight = q.correct === ci;
            // Practice: show right/wrong after selecting + opening solution, or always after pick if showSol
            const showMark = isExam ? submitted : showSol || submitted;
            return (
              <button
                key={ci}
                type="button"
                disabled={answersLocked}
                onClick={() => {
                  if (answersLocked) return;
                  setAnswers((a) => ({ ...a, [idx]: ci }));
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  selected
                    ? "border-amber-400/50 bg-amber-500/15 text-white"
                    : "border-white/12 text-white/80 hover:border-white/25"
                } ${
                  showMark && isRight ? "!border-emerald-400/50 !bg-emerald-500/10" : ""
                } ${
                  showMark && selected && !isRight
                    ? "!border-rose-400/40 !bg-rose-500/10"
                    : ""
                } ${answersLocked ? "opacity-90 cursor-not-allowed" : ""}`}
              >
                <span className="font-semibold text-amber-200/90 mr-1.5">
                  {String.fromCharCode(65 + ci)}.
                </span>
                {c}
              </button>
            );
          })}
        </div>

        {/* Practice only: Official solution + AI explain */}
        {!isExam && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openOfficialSolution}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-400/35 bg-emerald-500/10 text-emerald-200 text-xs font-bold"
            >
              <BadgeCheck className="w-4 h-4" />
              {showSol ? "Hide official solution" : "Official solution"}
            </button>
            <button
              type="button"
              onClick={() => void explainQ()}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-400/35 bg-violet-500/10 text-violet-200 text-xs font-bold disabled:opacity-60"
            >
              <Lightbulb className="w-4 h-4" />
              {aiLoading ? "Generating…" : "Explain with AI"}
            </button>
          </div>
        )}

        {!isExam && showSol && q.solution && (
          <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2 inline-flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> Official solution
            </p>
            <div className="study-prose text-emerald-50">
              <RichContent body={q.solution} />
            </div>
          </div>
        )}
        {!isExam && ai && (
          <div className="mt-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2 inline-flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> AI explanation
            </p>
            <div className="study-prose text-white/90">
              <RichContent body={ai} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => {
            setIdx((i) => i - 1);
            setShowSol(Boolean(lockedBySolution[idx - 1]));
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
            setShowSol(Boolean(lockedBySolution[idx + 1]));
            setAi("");
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-40"
        >
          Next
        </button>
        {!submitted && (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-sm font-semibold"
          >
            {isExam ? "Submit exam" : "Finish practice"}
          </button>
        )}
      </div>

      {/* Calculator — especially for exams */}
      <details className="rounded-xl border border-white/10 bg-wisdom-dark/40 p-3" open={isExam}>
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
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
          <Trophy className="w-7 h-7 text-emerald-300 mx-auto mb-2" />
          <p className="font-display text-lg font-bold text-white text-center">
            Score: {score} / {questions.length}
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg bg-wisdom-dark/40 py-2">
              <p className="text-emerald-300 font-bold text-base">{score}</p>
              <p className="text-wisdom-muted">Correct</p>
            </div>
            <div className="rounded-lg bg-wisdom-dark/40 py-2">
              <p className="text-rose-300 font-bold text-base">{wrong}</p>
              <p className="text-wisdom-muted">Wrong</p>
            </div>
            <div className="rounded-lg bg-wisdom-dark/40 py-2">
              <p className="text-amber-200 font-bold text-base">{skipped}</p>
              <p className="text-wisdom-muted">Skipped</p>
            </div>
            <div className="rounded-lg bg-wisdom-dark/40 py-2">
              <p className="text-cyan-200 font-bold text-base">
                {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s
              </p>
              <p className="text-wisdom-muted">Time</p>
            </div>
          </div>
          <p className="text-sm text-emerald-200/90 mt-3 text-center">
            Accuracy{" "}
            {questions.length ? Math.round((score / questions.length) * 100) : 0}% · saved
          </p>

          {/* After exam: show solutions for review */}
          {isExam && (
            <div className="mt-4 text-left space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                Review answers
              </p>
              {questions.map((qq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-wisdom-dark/30 p-3 text-sm"
                >
                  <p className="text-white/80 mb-1">
                    <span className="text-wisdom-muted">Q{i + 1}.</span>{" "}
                    {qq.prompt.slice(0, 120)}
                    {qq.prompt.length > 120 ? "…" : ""}
                  </p>
                  <p
                    className={
                      answers[i] === qq.correct
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    Your: {answers[i] != null ? qq.choices?.[answers[i]] : "—"} ·
                    Correct: {qq.correct != null ? qq.choices?.[qq.correct] : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
