"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb, Trophy, Target, BadgeCheck, Clock, Flag, FlagOff,
} from "lucide-react";
import RichContent from "@/components/learning/RichContent";
import { saveProgress, saveExamAttempt } from "@/lib/content";

type Q = { prompt: string; choices?: string[]; correct?: number; solution?: string };
type Props = {
  meta: Record<string, unknown>;
  isExam?: boolean;
  resourceId: string;
  title?: string;
  trackerScopeId?: string;
};
type ReviewFilter = "all" | "missed";

export default function QuizExamViewer({ meta, isExam, resourceId, title, trackerScopeId }: Props) {
  const questions = (Array.isArray(meta.questions) ? meta.questions : []) as Q[];
  const durationMin = Number(meta.durationMin || 0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showSol, setShowSol] = useState(false);
  const [lockedBySolution, setLockedBySolution] = useState<Record<number, boolean>>({});
  const [left, setLeft] = useState(durationMin > 0 ? durationMin * 60 : 0);
  const [ai, setAi] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [reviewSolOpen, setReviewSolOpen] = useState<Record<number, boolean>>({});
  const [reviewAi, setReviewAi] = useState<Record<number, string>>({});
  const [reviewAiLoading, setReviewAiLoading] = useState<Record<number, boolean>>({});
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!isExam || durationMin <= 0 || submitted) return;
    if (left <= 0) { setSubmitted(true); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, isExam, durationMin, submitted]);

  const q = questions[idx];
  const score = useMemo(() => {
    let c = 0;
    questions.forEach((qq, i) => { if (answers[i] === qq.correct) c++; });
    return c;
  }, [answers, questions]);
  const attempted = Object.keys(answers).length;
  const skipped = questions.length - attempted;
  const flaggedCount = useMemo(() => Object.values(flagged).filter(Boolean).length, [flagged]);
  const wrong = useMemo(() => {
    let w = 0;
    questions.forEach((qq, i) => { if (answers[i] != null && answers[i] !== qq.correct) w++; });
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
          attempted, correct: score, total: questions.length,
          accuracy: submitted ? (questions.length ? Math.round((score / questions.length) * 100) : 0) : accuracy,
          submitted: Boolean(submitted), wrong, skipped, elapsedSec,
        },
      },
    });
  }, [attempted, score, accuracy, submitted, resourceId, questions.length, isExam, wrong, skipped, elapsedSec]);

  useEffect(() => {
    if (!submitted || saved || !resourceId) return;
    setSaved(true);
    if (isExam) {
      void saveExamAttempt({
        resourceId, score, total: questions.length, answers,
        title: title || "Exam", scopeId: trackerScopeId,
      });
    }
  }, [submitted, saved, resourceId, score, questions.length, answers, title, trackerScopeId, isExam]);

  if (!questions.length) {
    return <p className="text-sm text-wisdom-muted">No questions yet.</p>;
  }

  async function explainQ() {
    if (!q) return;
    setAiLoading(true); setAi("");
    try {
      const student = answers[idx] != null ? q.choices?.[answers[idx]] || String(answers[idx]) : "(not answered)";
      const correct = q.correct != null ? q.choices?.[q.correct] || String(q.correct) : "";
      const res = await fetch("/api/ai/explain", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "question", text: q.prompt, question: q.prompt, choices: q.choices || [],
          studentAnswer: student, correctAnswer: correct, solution: q.solution || "", resourceId,
        }),
      });
      const data = await res.json();
      setAi(data.explanation || data.error || "—");
    } catch { setAi("AI unavailable"); }
    setAiLoading(false);
  }

  async function explainReview(qi: number) {
    const qq = questions[qi];
    if (!qq) return;
    setReviewAiLoading((m) => ({ ...m, [qi]: true }));
    try {
      const student = answers[qi] != null ? qq.choices?.[answers[qi]] || String(answers[qi]) : "(not answered)";
      const correct = qq.correct != null ? qq.choices?.[qq.correct] || String(qq.correct) : "";
      const res = await fetch("/api/ai/explain", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "question", text: qq.prompt, question: qq.prompt, choices: qq.choices || [],
          studentAnswer: student, correctAnswer: correct, solution: qq.solution || "", resourceId,
        }),
      });
      const data = await res.json();
      setReviewAi((m) => ({ ...m, [qi]: data.explanation || data.error || "—" }));
    } catch { setReviewAi((m) => ({ ...m, [qi]: "AI unavailable" })); }
    setReviewAiLoading((m) => ({ ...m, [qi]: false }));
  }

  const revealCorrectness = !isExam || submitted;
  const answersLocked = submitted || Boolean(lockedBySolution[idx]);

  function openOfficialSolution() {
    setShowSol((v) => {
      const next = !v;
      if (next) setLockedBySolution((prev) => ({ ...prev, [idx]: true }));
      return next;
    });
  }

  function goTo(i: number) {
    setIdx(i);
    setShowSol(Boolean(lockedBySolution[i]));
    setAi("");
  }

  const reviewQuestions = useMemo(() => {
    if (!isExam || !submitted) return [];
    return questions.map((qq, i) => ({ qq, i })).filter(({ qq, i }) => {
      if (reviewFilter === "missed") return answers[i] == null || answers[i] !== qq.correct;
      return true;
    });
  }, [isExam, submitted, questions, answers, reviewFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-wisdom-dark/40 px-4 py-2.5 text-xs">
        {!isExam && (
          <>
            <span className="inline-flex items-center gap-1 text-cyan-200">
              <Target className="w-3.5 h-3.5" /> Attempted {attempted}/{questions.length}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-200">
              <Trophy className="w-3.5 h-3.5" /> Correct {score}
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
          <span className={`ml-auto font-mono font-bold inline-flex items-center gap-1 ${left < 60 ? "text-rose-300" : "text-emerald-200"}`}>
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const answered = answers[i] != null;
          const isFlagged = Boolean(flagged[i]);
          const isCorrect = revealCorrectness && answered && answers[i] === qq.correct;
          const isWrong = revealCorrectness && answered && answers[i] !== qq.correct;
          let cls = "border-white/15 text-wisdom-muted bg-transparent";
          if (i === idx) cls = "border-amber-400 bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40";
          else if (isCorrect) cls = "border-emerald-400/60 bg-emerald-500/15 text-emerald-200";
          else if (isWrong) cls = "border-rose-400/60 bg-rose-500/15 text-rose-200";
          else if (revealCorrectness && !answered) cls = "border-white/20 bg-white/5 text-white/40";
          else if (isFlagged) cls = "border-orange-400/50 bg-orange-500/10 text-orange-200";
          else if (answered) cls = "border-cyan-400/50 bg-cyan-500/10 text-cyan-200";
          return (
            <button key={i} type="button" onClick={() => goTo(i)}
              className={`relative w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${cls}`}>
              {i + 1}
              {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400 ring-1 ring-[#0b1220]" />}
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
            <button type="button" onClick={() => setFlagged((f) => ({ ...f, [idx]: !f[idx] }))}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
                flagged[idx] ? "border-orange-400/50 bg-orange-500/15 text-orange-200" : "border-white/12 text-wisdom-muted"
              }`}>
              {flagged[idx] ? <><Flag className="w-3.5 h-3.5 fill-current" /> Flagged</> : <><FlagOff className="w-3.5 h-3.5" /> Flag</>}
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
                <button key={ci} type="button" disabled={answersLocked}
                  onClick={() => { if (!answersLocked) setAnswers((a) => ({ ...a, [idx]: ci })); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    selected ? "border-amber-400/50 bg-amber-500/15 text-white" : "border-white/12 text-white/80"
                  } ${showMark && isRight ? "!border-emerald-400/50 !bg-emerald-500/10" : ""} ${
                    showMark && selected && !isRight ? "!border-rose-400/40 !bg-rose-500/10" : ""
                  } ${answersLocked ? "opacity-90 cursor-not-allowed" : ""}`}>
                  <span className="font-semibold text-amber-200/90 mr-1.5">{String.fromCharCode(65 + ci)}.</span>
                  <span className="study-prose inline"><RichContent body={c} /></span>
                </button>
              );
            })}
          </div>
          {!isExam && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={openOfficialSolution}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-400/50 bg-emerald-500/20 text-emerald-50 text-sm font-bold shadow-md">
                <BadgeCheck className="w-5 h-5" />
                {showSol ? "Hide official solution" : "Official solution"}
              </button>
              <button type="button" onClick={() => void explainQ()} disabled={aiLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-violet-400/50 bg-violet-500/20 text-violet-50 text-sm font-bold shadow-md disabled:opacity-60">
                <Lightbulb className="w-5 h-5" />
                {aiLoading ? "Generating…" : "Explain with AI"}
              </button>
            </div>
          )}
          {!isExam && showSol && q.solution && (
            <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2 inline-flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Official solution
              </p>
              <div className="study-prose text-emerald-50"><RichContent body={q.solution} /></div>
            </div>
          )}
          {!isExam && ai && (
            <div className="mt-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2 inline-flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" /> AI explanation
              </p>
              <div className="study-prose text-white/90"><RichContent body={ai} /></div>
            </div>
          )}
        </div>
      )}

      {!submitted && (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={idx === 0} onClick={() => goTo(idx - 1)}
            className="px-4 py-2 rounded-xl border border-white/12 text-sm disabled:opacity-40">Prev</button>
          <button type="button" disabled={idx >= questions.length - 1} onClick={() => goTo(idx + 1)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-40">Next</button>
          <button type="button" onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-200 text-sm font-semibold">
            {isExam ? "Submit exam" : "Finish practice"}
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0d1526] p-5 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-2">
              {isExam ? "Submit this exam?" : "Finish this practice?"}
            </h3>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
              Answered <span className="text-cyan-200 font-semibold">{attempted}</span> ·{" "}
              Skipped <span className="text-amber-200 font-semibold">{skipped}</span>
              {flaggedCount > 0 && <> · Flagged <span className="text-orange-200 font-semibold">{flaggedCount}</span></>}
              {isExam && <span className="block mt-2 text-white/70">You won't be able to change answers after submitting.</span>}
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-sm font-semibold text-white/80">Keep going</button>
              <button type="button" onClick={() => { setConfirmOpen(false); setSubmitted(true); setReviewFilter("all"); }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-wisdom-dark text-sm font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5 space-y-4">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-white">
              {score}/{questions.length}{" "}
              <span className="text-wisdom-muted text-base font-semibold">
                ({questions.length ? Math.round((score / questions.length) * 100) : 0}%)
              </span>
            </p>
            <p className="text-sm text-wisdom-muted mt-1">Correct · Wrong {wrong} · Skipped {skipped}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button type="button" onClick={() => setReviewFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${reviewFilter === "all" ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100" : "border-white/12 text-wisdom-muted"}`}>
              All
            </button>
            <button type="button" onClick={() => setReviewFilter("missed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${reviewFilter === "missed" ? "border-rose-400/50 bg-rose-500/15 text-rose-100" : "border-white/12 text-wisdom-muted"}`}>
              Missed
            </button>
          </div>
          <div className="space-y-3">
            {reviewQuestions.map(({ qq, i }) => {
              const ans = answers[i];
              const correct = ans != null && ans === qq.correct;
              const missed = ans == null || ans !== qq.correct;
              return (
                <div key={i} className={`rounded-xl border p-4 ${correct ? "border-emerald-400/25 bg-emerald-500/5" : "border-rose-400/25 bg-rose-500/5"}`}>
                  <p className="text-sm text-white font-medium mb-2 study-prose">
                    <span className="text-wisdom-muted mr-1">Q{i + 1}.</span>
                    <RichContent body={qq.prompt} />
                  </p>
                  <div className="space-y-1 text-xs mb-2">
                    <p className={correct ? "text-emerald-300" : "text-rose-300"}>
                      Your answer:{" "}
                      {ans != null ? (
                        <span className="study-prose inline">
                          {String.fromCharCode(65 + ans)}. <RichContent body={String(qq.choices?.[ans] ?? ans)} />
                        </span>
                      ) : "Skipped"}
                    </p>
                    {missed && (
                      <p className="text-emerald-200">
                        Correct:{" "}
                        {qq.correct != null ? (
                          <span className="study-prose inline">
                            {String.fromCharCode(65 + qq.correct)}. <RichContent body={String(qq.choices?.[qq.correct] ?? qq.correct)} />
                          </span>
                        ) : "—"}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {qq.solution && (
                      <button type="button"
                        onClick={() => setReviewSolOpen((m) => ({ ...m, [i]: !m[i] }))}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-400/50 bg-emerald-500/20 text-emerald-50 text-sm font-bold shadow-md">
                        <BadgeCheck className="w-5 h-5" />
                        {reviewSolOpen[i] ? "Hide solution" : "View official solution"}
                      </button>
                    )}
                    <button type="button" onClick={() => void explainReview(i)} disabled={Boolean(reviewAiLoading[i])}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-violet-400/50 bg-violet-500/20 text-violet-50 text-sm font-bold shadow-md disabled:opacity-60">
                      <Lightbulb className="w-5 h-5" />
                      {reviewAiLoading[i] ? "Generating…" : "Explain with AI"}
                    </button>
                  </div>
                  {qq.solution && reviewSolOpen[i] && (
                    <div className="mt-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 study-prose text-emerald-50">
                      <RichContent body={qq.solution} />
                    </div>
                  )}
                  {reviewAi[i] && (
                    <div className="mt-2 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 study-prose text-white/90">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-1 inline-flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" /> AI explanation
                      </p>
                      <RichContent body={reviewAi[i]} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
