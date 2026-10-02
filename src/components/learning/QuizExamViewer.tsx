"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  Trophy,
  Target,
  BadgeCheck,
  Clock,
  Flag,
  FlagOff,
  Calculator,
  Lock,
  RotateCcw,
  ListChecks,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import RichContent from "@/components/learning/RichContent";
import { saveProgress, saveExamAttempt } from "@/lib/contentWithOffline";
import { triggerHaptic } from "@/lib/sound-haptics";
import { triggerCorrectConfetti } from "@/lib/confetti";
import ScientificCalculator from "@/components/learning/ScientificCalculator";
import QuizResultModal from "@/components/learning/QuizResultModal";
import AnswerCheckingModeModal from "@/components/learning/AnswerCheckingModeModal";

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
  const questions = useMemo(() => (Array.isArray(meta.questions) ? meta.questions : []) as Q[], [meta.questions]);
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
  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "completion">("immediate");
  const [wrongShakeOption, setWrongShakeOption] = useState<{ idx: number; choice: number } | null>(null);

  // New states for interactive enhancements
  const [calcOpen, setCalcOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  // Show answer checking popup when user opens Question Bank before starting
  const [modeModalOpen, setModeModalOpen] = useState(!isExam);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wta_qb_feedback_mode");
      if (saved === "completion" || saved === "immediate") {
        setFeedbackMode(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isExam || durationMin <= 0 || submitted) return;
    if (left <= 0) {
      setSubmitted(true);
      setResultModalOpen(true);
      return;
    }
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

  const reviewQuestions = useMemo(() => {
    if (!submitted) return [];
    return questions.map((qq, i) => ({ qq, i })).filter(({ qq, i }) => {
      if (reviewFilter === "missed") return answers[i] == null || answers[i] !== qq.correct;
      return true;
    });
  }, [submitted, questions, answers, reviewFilter]);

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

  const isImmediate = !isExam && feedbackMode === "immediate";
  const revealCorrectness = isExam ? submitted : (isImmediate ? true : submitted);

  // In Right Away mode, once the student picks an answer, that question is locked
  const isQuestionAnswered = answers[idx] != null;
  const isLockedInImmediate = isImmediate && isQuestionAnswered;
  const answersLocked = submitted || Boolean(lockedBySolution[idx]) || isLockedInImmediate;

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
    if (submitted) {
      if (reviewFilter === "missed") {
        const qq = questions[i];
        const missed = answers[i] == null || answers[i] !== qq?.correct;
        if (!missed) setReviewFilter("all");
      }
      requestAnimationFrame(() => {
        document.getElementById(`review-q-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function handleRetake() {
    setSubmitted(false);
    setSaved(false);
    setAnswers({});
    setFlagged({});
    setIdx(0);
    setShowSol(false);
    setLockedBySolution({});
    setReviewSolOpen({});
    setReviewAi({});
    setLeft(durationMin > 0 ? durationMin * 60 : 0);
    setResultModalOpen(false);
  }

  return (
    <div className="space-y-2.5">
      {/* Answer Checking Mode Picker Modal (pops up on opening Question Bank) */}
      {!isExam && (
        <AnswerCheckingModeModal
          isOpen={modeModalOpen}
          selectedMode={feedbackMode}
          onSelectMode={(mode) => {
            setFeedbackMode(mode);
            try {
              localStorage.setItem("wta_qb_feedback_mode", mode);
            } catch {}
          }}
          onConfirm={() => {
            setModeModalOpen(false);
          }}
        />
      )}

      {/* Advanced Scientific Calculator Modal/Drawer */}
      <ScientificCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />

      {/* Results Pop-up Modal (Radial gauge, Correct, Missed, Skipped, Retake & Review buttons) */}
      <QuizResultModal
        isOpen={resultModalOpen}
        score={score}
        total={questions.length}
        wrong={wrong}
        skipped={skipped}
        elapsedSec={elapsedSec}
        isExam={isExam}
        title={title}
        onReviewAll={() => {
          setReviewFilter("all");
          setResultModalOpen(false);
        }}
        onReviewMissed={() => {
          setReviewFilter("missed");
          setResultModalOpen(false);
        }}
        onRetake={handleRetake}
        onClose={() => setResultModalOpen(false)}
      />

      {/* Question Bank Practice Mode Switcher & Calculator Bar */}
      {!isExam && !submitted && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-wisdom-card/90 px-3.5 py-2 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Answer Checking:</span>
            <span className="text-[11px] text-wisdom-muted hidden sm:inline">
              {feedbackMode === "immediate"
                ? "Instant check (first click locked)"
                : "Grade after completion"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl p-0.5 bg-slate-950/80 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setFeedbackMode("immediate");
                  try {
                    localStorage.setItem("wta_qb_feedback_mode", "immediate");
                  } catch {}
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  feedbackMode === "immediate"
                    ? "bg-cyan-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Show Right Away
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackMode("completion");
                  try {
                    localStorage.setItem("wta_qb_feedback_mode", "completion");
                  } catch {}
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  feedbackMode === "completion"
                    ? "bg-cyan-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                After Completion
              </button>
            </div>

            {/* Clean Working Calculator Button */}
            <button
              type="button"
              onClick={() => setCalcOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                calcOpen
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/50"
                  : "border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200"
              }`}
              title="Open Scientific Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-300" />
              <span>Calculator</span>
            </button>
          </div>
        </div>
      )}

      {/* Status & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-wisdom-dark/40 px-3.5 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {!isExam && (
            <>
              <span className="inline-flex items-center gap-1 text-cyan-200 font-semibold">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> {attempted}/{questions.length}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-200 font-semibold">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" /> {score} Correct
              </span>
              <span className="text-amber-300 font-bold">{accuracy}%</span>
            </>
          )}

          {isExam && !submitted && (
            <span className="inline-flex items-center gap-1 text-white/80 font-medium">
              {attempted}/{questions.length} Answered
              {skipped > 0 ? ` · ${skipped} left` : ""}
              {flaggedCount > 0 ? ` · ${flaggedCount} flagged` : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Working Calculator button on Exams as well */}
          {isExam && !submitted && (
            <button
              type="button"
              onClick={() => setCalcOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                calcOpen
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/50"
                  : "border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200"
              }`}
              title="Open Scientific Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-300" />
              <span>Calculator</span>
            </button>
          )}

          {isExam && durationMin > 0 && !submitted && (
            <span className={`font-mono font-bold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 ${left < 60 ? "text-rose-300 animate-pulse border-rose-400/40" : "text-emerald-200"}`}>
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      {/* Question Number Pills */}
      <div className="flex flex-wrap gap-1">
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
              className={`relative w-7 h-7 rounded-md text-[11px] font-bold border transition-colors ${cls}`}>
              {i + 1}
              {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-orange-400 ring-1 ring-[#0b1220]" />}
            </button>
          );
        })}
      </div>

      {!submitted && q && (
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-wisdom-muted font-semibold">
                Question {idx + 1} of {questions.length}
              </p>
              {isLockedInImmediate && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>
            <button type="button" onClick={() => setFlagged((f) => ({ ...f, [idx]: !f[idx] }))}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold transition-colors ${
                flagged[idx] ? "border-orange-400/50 bg-orange-500/15 text-orange-200" : "border-white/12 text-wisdom-muted hover:text-white"
              }`}>
              {flagged[idx] ? <><Flag className="w-3 h-3 fill-current" /> Flagged</> : <><FlagOff className="w-3 h-3" /> Flag</>}
            </button>
          </div>
          <div className="text-white font-bold leading-snug mb-4 study-prose text-base sm:text-lg">
            <RichContent body={q.prompt} />
          </div>

          {/* Answer Choices */}
          <div className="space-y-2.5">
            {(q.choices || []).map((c, ci) => {
              const selected = answers[idx] === ci;
              const isRight = q.correct === ci;
              const isAnswered = answers[idx] != null;
              const showMark = isExam ? submitted : (isImmediate ? isAnswered : (showSol || submitted));
              const isShaking = wrongShakeOption?.idx === idx && wrongShakeOption?.choice === ci;

              let choiceCls = "border-white/15 bg-white/[0.03] text-white/90 hover:border-white/30 hover:bg-white/[0.06]";
              if (showMark && isRight) {
                choiceCls = "!border-emerald-400 !bg-emerald-500/20 !text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold";
              } else if (showMark && selected && !isRight) {
                choiceCls = "!border-rose-500 !bg-rose-500/20 !text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.25)] font-bold";
              } else if (selected) {
                choiceCls = "border-cyan-400 bg-cyan-500/20 text-white ring-2 ring-cyan-400/50 font-bold";
              }

              if (isShaking) {
                choiceCls += " animate-shake-wrong !ring-2 !ring-rose-500";
              }

              return (
                <button
                  key={ci}
                  type="button"
                  disabled={answersLocked}
                  onClick={(e) => {
                    if (answersLocked) return;
                    // In immediate mode, first click is locked
                    if (isImmediate && answers[idx] != null) return;

                    setAnswers((a) => ({ ...a, [idx]: ci }));
                    if (!isExam && q.correct !== undefined) {
                      if (feedbackMode === "immediate") {
                        if (ci === q.correct) {
                          triggerCorrectConfetti(e.currentTarget);
                        } else {
                          triggerHaptic("wrong");
                          setWrongShakeOption({ idx, choice: ci });
                          setTimeout(() => setWrongShakeOption(null), 500);
                        }
                      }
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl border text-sm sm:text-base leading-snug font-semibold transition-all ${choiceCls} ${
                    answersLocked ? "opacity-95 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <span className="font-extrabold text-amber-300 mr-2.5">{String.fromCharCode(65 + ci)}.</span>
                  <span className="study-prose inline"><RichContent body={c} /></span>
                </button>
              );
            })}
          </div>

          {!isExam && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={openOfficialSolution}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-400/45 bg-emerald-500/15 text-emerald-50 text-xs font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer">
                <BadgeCheck className="w-4 h-4" />
                {showSol ? "Hide official solution" : "Official solution"}
              </button>
            </div>
          )}

          {!isExam && showSol && q.solution && (
            <div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm sm:text-base">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-300 mb-2 inline-flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" /> Official solution
              </p>
              <div className="study-prose text-emerald-50 text-sm sm:text-base leading-relaxed italic font-serif font-normal explanation-text font-['Times_New_Roman',Times,serif]">
                <RichContent body={q.solution} />
              </div>
            </div>
          )}

          {!isExam && (
            <div className={`flex flex-col gap-2 ${showSol ? "mt-3" : "mt-3.5"}`}>
              <button type="button" onClick={() => void explainQ()} disabled={aiLoading}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-violet-400/45 bg-violet-500/15 text-violet-50 text-xs font-bold disabled:opacity-60 w-full sm:w-auto hover:bg-violet-500/25 transition-colors cursor-pointer">
                <Lightbulb className="w-4 h-4" />
                {aiLoading ? "Generating…" : "Explain with AI"}
              </button>
              {ai && (
                <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm sm:text-base">
                  <p className="text-xs font-black uppercase tracking-wider text-violet-300 mb-2 inline-flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> AI explanation
                  </p>
                  <div className="study-prose text-white/95 text-sm sm:text-base leading-relaxed italic font-serif font-normal explanation-text font-['Times_New_Roman',Times,serif]">
                    <RichContent body={ai} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation & Submit Controls */}
      {!submitted && (
        <div className="flex flex-wrap gap-2.5 pt-1">
          <button type="button" disabled={idx === 0} onClick={() => goTo(idx - 1)}
            className="px-4 py-2 rounded-xl border border-white/12 text-xs font-semibold disabled:opacity-40 hover:bg-white/5 transition-colors">
            Prev
          </button>
          <button type="button" disabled={idx >= questions.length - 1} onClick={() => goTo(idx + 1)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-wisdom-dark text-xs font-bold disabled:opacity-40 transition-colors shadow-sm">
            Next
          </button>
          <button type="button" onClick={() => setConfirmOpen(true)}
            className="ml-auto px-4 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-xs font-bold transition-colors">
            {isExam ? "Submit Exam" : "Finish Practice"}
          </button>
        </div>
      )}

      {/* Confirmation Dialog before Final Submission */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#0d1526] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display text-lg font-bold text-white mb-2">
              {isExam ? "Submit this exam?" : "Finish this practice?"}
            </h3>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-5">
              Answered <span className="text-cyan-200 font-semibold">{attempted}</span> of{" "}
              <span className="text-white font-semibold">{questions.length}</span> ·{" "}
              Skipped <span className="text-amber-200 font-semibold">{skipped}</span>
              {flaggedCount > 0 && <> · Flagged <span className="text-orange-200 font-semibold">{flaggedCount}</span></>}
            </p>
            <div className="flex gap-2.5 justify-end">
              <button type="button" onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold text-white/80 hover:bg-white/5 transition-colors">
                Keep Going
              </button>
              <button type="button" onClick={() => {
                setConfirmOpen(false);
                setSubmitted(true);
                setResultModalOpen(true);
                setReviewFilter("all");
              }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-wisdom-dark text-xs font-bold shadow-md shadow-emerald-900/30 transition-colors">
                Submit & View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Submission Review Mode */}
      {submitted && (
        <div className="space-y-4">
          {/* Review Control Header Banner */}
          <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display text-lg sm:text-xl font-bold text-white">
                  Score: {score}/{questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {questions.length ? Math.round((score / questions.length) * 100) : 0}% Accuracy
                </span>
              </div>
              <p className="text-xs text-wisdom-muted">
                {score} Correct · {wrong} Missed · {skipped} Skipped
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Reopen Results Card Button */}
              <button
                type="button"
                onClick={() => setResultModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/20 cursor-pointer transition-all"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>View Score Card</span>
              </button>

              {/* Filter Tabs */}
              <div className="inline-flex rounded-xl p-0.5 bg-slate-950/80 border border-white/10">
                <button
                  type="button"
                  onClick={() => setReviewFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === "all"
                      ? "bg-cyan-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("missed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === "missed"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Missed ({wrong + skipped})
                </button>
              </div>

              {/* Retake Button */}
              <button
                type="button"
                onClick={handleRetake}
                className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
          </div>

          {/* Review Questions List */}
          {reviewQuestions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-wisdom-card p-8 text-center text-wisdom-muted text-sm">
              {reviewFilter === "missed"
                ? "No missed questions — perfect score on this set!"
                : "No questions to review."}
            </div>
          ) : (
            <div className="space-y-3.5">
              {reviewQuestions.map(({ qq, i }) => {
                const selected = answers[i];
                const isCorrect = selected != null && selected === qq.correct;
                const isSkipped = selected == null;
                const solOpen = Boolean(reviewSolOpen[i]);
                return (
                  <div
                    key={i}
                    id={`review-q-${i}`}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                      isCorrect
                        ? "border-emerald-400/30 bg-emerald-500/[0.04]"
                        : isSkipped
                        ? "border-white/12 bg-wisdom-card"
                        : "border-rose-400/30 bg-rose-500/[0.04]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="text-xs font-bold text-wisdom-muted">Question {i + 1}</span>
                      {isCorrect && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                          Correct
                        </span>
                      )}
                      {!isCorrect && !isSkipped && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-rose-300 bg-rose-500/20 border border-rose-400/30 px-2 py-0.5 rounded-full">
                          Wrong
                        </span>
                      )}
                      {isSkipped && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          Skipped
                        </span>
                      )}
                    </div>

                    <div className="text-white font-bold leading-snug mb-3.5 study-prose text-base sm:text-lg">
                      <RichContent body={qq.prompt} />
                    </div>

                    <div className="space-y-2">
                      {(qq.choices || []).map((c, ci) => {
                        const isRight = qq.correct === ci;
                        const isUser = selected === ci;
                        return (
                          <div
                            key={ci}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm sm:text-base leading-snug font-semibold ${
                              isRight
                                ? "border-emerald-400/60 bg-emerald-500/15 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                                : isUser
                                ? "border-rose-400/60 bg-rose-500/15 text-white font-bold"
                                : "border-white/10 text-white/70 bg-white/[0.02]"
                            }`}
                          >
                            <span className="font-extrabold text-amber-300 mr-2.5">
                              {String.fromCharCode(65 + ci)}.
                            </span>
                            <span className="study-prose inline">
                              <RichContent body={c} />
                            </span>
                            {isRight && (
                              <span className="ml-2.5 text-xs font-bold text-emerald-300">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isUser && !isRight && (
                              <span className="ml-2.5 text-xs font-bold text-rose-300">
                                ✗ Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {qq.solution && (
                      <div className="mt-3.5">
                        <button
                          type="button"
                          onClick={() => setReviewSolOpen((m) => ({ ...m, [i]: !m[i] }))}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 text-xs font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {solOpen ? "Hide solution" : "Official solution"}
                        </button>
                        {solOpen && (
                          <div className="mt-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm sm:text-base">
                            <div className="study-prose text-emerald-50 text-sm sm:text-base leading-relaxed italic font-serif font-normal explanation-text font-['Times_New_Roman',Times,serif]">
                              <RichContent body={qq.solution} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => void explainReview(i)}
                        disabled={Boolean(reviewAiLoading[i])}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-100 text-xs font-bold disabled:opacity-60 hover:bg-violet-500/20 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        {reviewAiLoading[i] ? "Generating…" : "Explain with AI"}
                      </button>
                      {reviewAi[i] && (
                        <div className="mt-2.5 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm sm:text-base">
                          <div className="study-prose text-white/95 text-sm sm:text-base leading-relaxed italic font-serif font-normal explanation-text font-['Times_New_Roman',Times,serif]">
                            <RichContent body={reviewAi[i]} />
                          </div>
                        </div>
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
