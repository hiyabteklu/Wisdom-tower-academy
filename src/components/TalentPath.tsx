"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  FileText,
  FileCheck,
  MessageCircle,
  GraduationCap,
  Handshake,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Route,
  Clock,
  CheckCircle2,
  Send,
  X,
} from "lucide-react";

const stages = [
  {
    n: 1,
    title: "Focus",
    short: "Pick category + service",
    icon: Target,
    ring: "ring-cyan-400/50",
    glow: "shadow-cyan-500/25",
    bg: "from-cyan-500/25 to-cyan-600/5",
    border: "border-cyan-400/40",
    text: "text-cyan-300",
    bar: "bg-cyan-400",
    detail:
      "Choose one service line you can actually deliver. Depth beats breadth — we hire for a lane, not a résumé dump.",
    youDo: [
      "Browse categories and pick one role",
      "Check that your samples match that lane",
      "Decide if you can commit to paid live work",
    ],
    tip: "If you can't name the service in one sentence, you're not ready to apply yet.",
  },
  {
    n: 2,
    title: "Apply",
    short: "Letter + portfolio",
    icon: FileText,
    ring: "ring-sky-400/50",
    glow: "shadow-sky-500/25",
    bg: "from-sky-500/25 to-sky-600/5",
    border: "border-sky-400/40",
    text: "text-sky-300",
    bar: "bg-sky-400",
    detail:
      "Submit a focused letter of interest and a portfolio that proves the Focus step. One strong application beats five weak ones.",
    youDo: [
      "Write why this line — not generic cover text",
      "Link 3–6 best samples relevant to the role",
      "State availability and tools you use daily",
    ],
    tip: "Your portfolio should answer: “Can this person ship our next client job?”",
  },
  {
    n: 3,
    title: "Assess",
    short: "Practical task",
    icon: FileCheck,
    ring: "ring-violet-400/50",
    glow: "shadow-violet-500/25",
    bg: "from-violet-500/25 to-violet-600/5",
    border: "border-violet-400/40",
    text: "text-violet-300",
    bar: "bg-violet-400",
    detail:
      "A short, real-world task in your lane. Same standards we use with clients — quality, speed, and judgment under a deadline.",
    youDo: [
      "Complete the brief within the stated window",
      "Show process, not only a polished final",
      "Ask one clarifying question if the brief is ambiguous",
    ],
    tip: "We score how you think as much as how it looks.",
  },
  {
    n: 4,
    title: "Interview",
    short: "Fit & standards",
    icon: MessageCircle,
    ring: "ring-amber-400/50",
    glow: "shadow-amber-500/25",
    bg: "from-amber-500/25 to-amber-600/5",
    border: "border-amber-400/40",
    text: "text-amber-300",
    bar: "bg-amber-400",
    detail:
      "A conversation about how you work: communication, ownership, and whether our pace and ethics match yours.",
    youDo: [
      "Walk through your assessment honestly",
      "Share how you handle feedback and missed deadlines",
      "Ask what success looks like in the first 30 days",
    ],
    tip: "We're not looking for perfection — we're looking for reliability.",
  },
  {
    n: 5,
    title: "Train",
    short: "Workflows & quality",
    icon: GraduationCap,
    ring: "ring-orange-400/50",
    glow: "shadow-orange-500/25",
    bg: "from-orange-500/25 to-orange-600/5",
    border: "border-orange-400/40",
    text: "text-orange-300",
    bar: "bg-orange-400",
    detail:
      "Onboarding into our tools, handoff rules, quality checklist, and how client work moves from brief to delivery.",
    youDo: [
      "Complete workflow walkthroughs",
      "Shadow one live pipeline",
      "Pass the quality checklist dry-run",
    ],
    tip: "Training is short on purpose — we move people who absorb systems quickly.",
  },
  {
    n: 6,
    title: "Intern",
    short: "Paid live work",
    icon: Handshake,
    ring: "ring-emerald-400/50",
    glow: "shadow-emerald-500/25",
    bg: "from-emerald-500/25 to-emerald-600/5",
    border: "border-emerald-400/40",
    text: "text-emerald-300",
    bar: "bg-emerald-400",
    detail:
      "Paid contribution on real client work under review. You earn while proving you can ship under pressure.",
    youDo: [
      "Take assigned live tickets",
      "Hit deadlines with visible progress updates",
      "Absorb revision notes without ego",
    ],
    tip: "Internships are paid on live work. Progression follows delivery — not tenure alone.",
  },
  {
    n: 7,
    title: "Join",
    short: "Contributor role",
    icon: BadgeCheck,
    ring: "ring-teal-400/50",
    glow: "shadow-teal-500/25",
    bg: "from-teal-500/25 to-teal-600/5",
    border: "border-teal-400/40",
    text: "text-teal-300",
    bar: "bg-teal-400",
    detail:
      "Full contributor status: steadier pipeline, more ownership, and a seat in how we raise the bar for the next cohort.",
    youDo: [
      "Own a recurring service lane",
      "Mentor newer interns when asked",
      "Protect quality as if your name is on every file",
    ],
    tip: "This is the goal of the path — not a participation trophy.",
  },
] as const;

export default function TalentPath() {
  /** null = all steps collapsed; number = that step's detail open */
  const [open, setOpen] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const toggle = useCallback((i: number) => {
    setOpen((prev) => (prev === i ? null : i));
  }, []);

  const stage = open !== null ? stages[open] : null;
  const Icon = stage?.icon;

  return (
    <div
      className={`rounded-3xl border border-white/12 bg-wisdom-card/95 overflow-hidden relative shadow-card-3d transition-opacity duration-700 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-cyan-500/20 to-transparent" />
      </div>

      <div className="relative p-5 sm:p-7 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/12 text-wisdom-muted">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight">Your path</h3>
              <p className="text-sm text-wisdom-muted mt-0.5">
                Seven stages · interest → paid contribution · tap a step for details
              </p>
            </div>
          </div>
        </div>

        {/* Compact step rail + Apply now as 8th */}
        <div className="relative mb-2">
          <div className="hidden md:block absolute top-7 left-[4%] right-[12%] h-0.5 bg-white/10 rounded-full" />

          <div className="flex gap-2 md:gap-0 overflow-x-auto md:overflow-visible pb-2 -mx-1 px-1 snap-x snap-mandatory md:snap-none">
            {stages.map((s, i) => {
              const SIcon = s.icon;
              const isOpen = open === i;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => toggle(i)}
                  className="relative flex flex-col items-center text-center shrink-0 snap-center md:flex-1 min-w-[4.25rem] md:min-w-0 group outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/50 rounded-xl"
                  aria-expanded={isOpen}
                >
                  <div
                    className={`relative z-10 w-12 h-12 md:w-13 md:h-13 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? `bg-gradient-to-br ${s.bg} ${s.border} ${s.text} scale-110 -translate-y-0.5 shadow-lg ${s.glow} ring-2 ${s.ring}`
                        : "bg-wisdom-dark/80 border-white/12 text-wisdom-muted group-hover:border-white/30 group-hover:text-white/90 group-hover:scale-105"
                    }`}
                  >
                    <SIcon className="w-5 h-5" />
                    <span
                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border ${
                        isOpen
                          ? "bg-white text-wisdom-dark border-white"
                          : "bg-wisdom-dark border-white/20 text-white/70"
                      }`}
                    >
                      {s.n}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-xs md:text-sm font-bold transition-colors ${
                      isOpen ? "text-white" : "text-wisdom-muted"
                    }`}
                  >
                    {s.title}
                  </p>
                </button>
              );
            })}

            {/* 8th — Apply now */}
            <Link
              href="/apply"
              className="relative flex flex-col items-center text-center shrink-0 snap-center md:flex-1 min-w-[4.25rem] md:min-w-0 group outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/50 rounded-xl"
            >
              <div className="relative z-10 w-12 h-12 rounded-2xl border-2 border-wisdom-cyan/50 bg-gradient-to-br from-wisdom-cyan/25 to-cyan-600/10 text-wisdom-cyan flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/30 ring-2 ring-wisdom-cyan/30">
                <Send className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border bg-wisdom-cyan text-wisdom-dark border-wisdom-cyan">
                  8
                </span>
              </div>
              <p className="mt-2 text-xs md:text-sm font-bold text-wisdom-cyan">Apply now</p>
            </Link>
          </div>
        </div>

        {/* Collapsed detail panel — only when a step is selected */}
        {stage && Icon && (
          <div
            key={stage.n}
            className={`mt-5 rounded-2xl border ${stage.border} bg-gradient-to-br ${stage.bg} p-4 sm:p-5 animate-in fade-in duration-200`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border ${stage.border} bg-wisdom-dark/40 flex items-center justify-center ${stage.text} shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${stage.text}`}>
                    Stage {stage.n}
                  </p>
                  <h4 className="font-display text-lg font-extrabold text-white tracking-tight">
                    {stage.title}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="p-1.5 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/10 transition"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-white/85 leading-relaxed mb-3">{stage.detail}</p>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3.5 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                What you do
              </p>
              <ul className="space-y-2">
                {stage.youDo.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-white/85 leading-snug">
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${stage.text}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 mb-4">
              <Clock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${stage.text}`} />
              <p className="text-xs text-wisdom-muted leading-relaxed">{stage.tip}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setOpen(open! > 0 ? open! - 1 : null)}
                disabled={open === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-wisdom-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              {open! < stages.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setOpen(open! + 1)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold ${stage.border} ${stage.text} bg-white/5 hover:bg-white/10`}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-xs font-bold hover:bg-wisdom-cyan-dark transition"
                >
                  Apply now
                  <Send className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {!stage && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/10 bg-wisdom-dark/40 px-4 py-3.5">
            <p className="text-xs text-wisdom-muted leading-relaxed">
              <Handshake className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5 align-text-bottom" />
              Internships are <span className="text-emerald-300 font-semibold">paid</span> on live
              work. Tap any step above for details — or go straight to apply.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-1.5 shrink-0 px-4 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold hover:bg-wisdom-cyan-dark transition"
            >
              Apply now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
