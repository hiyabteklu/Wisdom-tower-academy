"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  Calculator,
  Trophy,
  Target,
  BadgeCheck,
  Clock,
  Flag,
  FlagOff,
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

type ReviewFilter = "all" | "missed";

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
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showSol, setShowSol] = useState(false);
  const [lockedBySolution, setLockedBySolution] = useState<Record<number, boolean>>({});
  const [left, setLeft] = useState(durationMin > 0 ? durationMin * 60 : 0);
  const [calc, setCalc] = useState("");
  const [ai, setAi] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [startedAt] = useState(() => Date.now());

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
  const flaggedCount = useMemo(
    () => Object.values(flagged).filter(Boolean).length,
    [flagged]
  );
  const wrong = useMemo(() => {
    let w = 0;
    questions.forEach((qq, i) => {
      if (answers[i] != null && answers[i] !== qq.correct) w++;
    });
    return w;
  }, [answers, questions]);

  const accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
  const elapsedSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

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

  function goTo(i: number) {
    setIdx(i);
    setShowSol(Boolean(lockedBySolution[i]));
    setAi("");
  }

  function toggleFlag() {
    setFlagged((f) => ({ ...f, [idx]: !f[idx] }));
  }

  function requestSubmit() {
    setConfirmOpen(true);
  }

  function confirmSubmit() {
    setConfirmOpen(false);
    setSubmitted(true);
    setReviewFilter("all");
  }

  const reviewQuestions = useMemo(() => {
    if (!isExam || !submitted) return [];
    return questions
      .map((qq, i) => ({ qq, i }))
      .filter(({ qq, i }) => {
        if (reviewFilter === "missed") {
          return answers[i] == null || answers[i] !== qq.correct;
        }
        return true;
      });
  }, [isExam, submitted, questions, answers, reviewFilter]);

  return (
    <div className="space-y-4">
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
            {flaggedCount > 0 ? ` · ${flaggedCount} flagged` : ""}
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-wisdom-muted">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400/80" /> Answered
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-white/20" /> Skipped
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-400/90" /> Flagged
        </span>
        {revealCorrectness && (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/90" /> Correct
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400/90" /> Wrong
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const answered = answers[i] != null;
          const isFlagged = Boolean(flagged[i]);
          const isCorrect = revealCorrectness && answered && answers[i] === qq.correct;
          const isWrong = revealCorrectness && answered && answers[i] !== qq.correct;
          const isSkippedAfter = revealCorrectness && !answered;

          let cls = "border-white/15 text-wisdom-muted bg-transparent";
          if (i === idx) {
            cls = "border-amber-400 bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40";
          } else if (isCorrect) {
            cls = "border-emerald-400/60 bg-emerald-500/15 text-emerald-200";
          } else if (isWrong) {
            cls = "border-rose-400/60 bg-rose-500/15 text-rose-200";
          } else if (isSkippedAfter) {
            cls = "border-white/20 bg-white/5 text-white/40";
          } else if (isFlagged && answered) {
            cls = "border-orange-400/70 bg-orange-500/15 text-orange-100";
          } else if (isFlagged) {
            cls = "border-orange-400/50 bg-orange-500/10 text-orange-200";
          } else if (answered) {
            cls = "border-cyan-400/50 bg-cyan-500/10 text-cyan-200";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              title={
                isFlagged
                  ? `Q${i + 1} · flagged`
                  : answered
                    ? `Q${i + 1} · answered`
                    : `Q${i + 1} · skipped`
              }
              className={`relative w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${cls}`}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400 ring-1 ring-[#0b1220]" />
              )}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-xs text-wisdom-muted">
              Question {idx + 1} of {questions.length}
              {answersLocked && !submitted && (
                <span className="ml-2 text-amber-300/80">· Answer locked (solution viewed)</span>
              )}
            </p>
            <button
              type="button"
              onClick={toggleFlag}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                flagged[idx]
                  ? "border-orange-400/50 bg-orange-500/15 text-orange-200"
                  : "border-white/12 text-wisdom-muted hover:text-orange-200 hover:border-orange-400/30"
              }`}
            >
              {flagged[idx] ? (
                <>
                  <Flag className="w-3.5 h-3.5 fill-current" /> Flagged
                </>
              ) : (
                <>
                  <FlagOff className="w-3.5 h-3.5" /> Flag
                </>
              )}
            </button>
          </div>

          <div className="text-white font-medium leading-relaxed mb-4 study-prose">
            <RichContent body={q.prompt} />
          </div>
          <div className="space-y-2">
            {(q.choices || []).map((c, ci) => {
              const selected = answers[idx] === ci;
              const isRight = q.correct === ci;
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
                  <span className="study-prose inline text-inherit">
                    <RichContent body={c} />
                  </span>
                </button>
              );
            })}
          </div>

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
      )}

      {!submitted && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => goTo(idx - 1)}
            className="px-4 py-2 rounded-xl border border-white/12 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={idx >= questions.length - 1}
            onClick={() => goTo(idx + 1)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={requestSubmit}
            className="px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-sm font-semibold"
          >
            {isExam ? "Submit exam" : "Finish practice"}
          </button>
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-confirm-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0d1526] p-5 shadow-2xl">
            <h3 id="submit-confirm-title" className="font-display text-lg font-bold text-white mb-2">
              {isExam ? "Submit this exam?" : "Finish this practice?"}
            </h3>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
              Answered <span className="text-cyan-200 font-semibold">{attempted}</span> ·{" "}
              Skipped <span className="text-amber-200 font-semibold">{skipped}</span>
              {flaggedCount > 0 && (
                <>
                  {" "}· Flagged{" "}
                  <span className="text-orange-200 font-semibold">{flaggedCount}</span>
                </>
              )}
              {isExam && (
                <span className="block mt-2 text-white/70">
                  You won’t be able to change answers after submitting.
                </span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-sm font-semibold text-white/80 hover:bg-white/5"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-wisdom-dark text-sm font-bold"
              >
                {isExam ? "Yes, submit" : "Yes, finish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!submitted && (
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
                  const v = Function(`\"use strict\"; return (${calc})`)();
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
      )}

      {submitted && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 space-y-4">
          <div>
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
          </div>

          {isExam && (
            <div className="text-left space-y-3 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Review your exam
                </p>
                <div className="inline-flex rounded-xl border border-white/12 overflow-hidden text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setReviewFilter("all")}
                    className={`px-3 py-1.5 transition-colors ${
                      reviewFilter === "all"
                        ? "bg-amber-500 text-wisdom-dark"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter("missed")}
                    className={`px-3 py-1.5 transition-colors ${
                      reviewFilter === "missed"
                        ? "bg-rose-500 text-white"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    Missed only
                  </button>
                </div>
              </div>

              {reviewQuestions.length === 0 && (
                <p className="text-sm text-emerald-200/90 text-center py-4">
                  {reviewFilter === "missed"
                    ? "Nothing missed — great work!"
                    : "No questions to review."}
                </p>
              )}

              {reviewQuestions.map(({ qq, i }) => {
                const ans = answers[i];
                const correct = ans != null && ans === qq.correct;
                const missed = ans == null || ans !== qq.correct;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 text-sm ${
                      correct
                        ? "border-emerald-400/25 bg-emerald-500/5"
                        : "border-rose-400/25 bg-rose-500/5"
                    }`}
                  >
                    <div className="text-white/90 mb-2 leading-relaxed study-prose">
                      <span className="text-wisdom-muted font-semibold">Q{i + 1}. </span>
                      <RichContent body={qq.prompt} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className={correct ? "text-emerald-300" : "text-rose-300"}>
                        <span className="font-medium">Your answer: </span>
                        {ans != null ? (
                          <span className="study-prose inline">
                            {String.fromCharCode(65 + ans)}.{" "}
                            <RichContent body={String(qq.choices?.[ans] ?? ans)} />
                          </span>
                        ) : (
                          "Skipped"
                        )}
                      </div>
                      {missed && (
                        <div className="text-emerald-200">
                          <span className="font-medium">Correct: </span>
                          {qq.correct != null ? (
                            <span className="study-prose inline">
                              {String.fromCharCode(65 + qq.correct)}.{" "}
                              <RichContent
                                body={String(qq.choices?.[qq.correct] ?? qq.correct)}
                              />
                            </span>
                          ) : (
                            "—"
                          )}
                        </div>
                      )}
                      {qq.solution && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-wisdom-muted hover:text-white/80">
                            Solution
                          </summary>
                          <div className="mt-1 study-prose text-white/80">
                            <RichContent body={qq.solution} />
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
