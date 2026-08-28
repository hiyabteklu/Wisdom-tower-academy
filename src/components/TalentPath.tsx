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
  Send,
  Lock,
} from "lucide-react";

const PATH_COMPLETE_KEY = "wt_talent_path_complete";

/** Cover image — same pattern as Academy partnership.jpg */
const COVER = "/images/digital/talent-cover.jpg";

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
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  const allRead = maxReached >= stages.length - 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (allRead) sessionStorage.setItem(PATH_COMPLETE_KEY, "1");
  }, [allRead]);

  const tryOpen = useCallback(
    (i: number) => {
      if (i > maxReached) return;
      setOpen(i);
    },
    [maxReached]
  );

  const goNext = useCallback(() => {
    if (open < stages.length - 1) {
      const next = open + 1;
      setMaxReached((m) => Math.max(m, next));
      setOpen(next);
    }
  }, [open]);

  const goPrev = useCallback(() => {
    if (open === 0) return;
    setOpen(open - 1);
  }, [open]);

  const stage = stages[open];
  const Icon = stage.icon;

  return (
    <div className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
      {/* 16:9 cover — same pattern as Academy partnership card */}
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="relative block w-full aspect-video overflow-hidden bg-wisdom-navy text-left group"
        aria-expanded={started}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COVER}
          alt="Work with us — talent path"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0";
          }}
        />
        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-wisdom-cyan/95 mb-2">
            Contributors &amp; talent
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-xl">
            Work with us?
          </h2>
          <p className="mt-3 text-sm text-white/80 max-w-md">
            {started
              ? "Path open below — walk every stage in order"
              : "Tap to explore the talent path"}
          </p>
          {!started && (
            <span className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold shadow-lg shadow-cyan-500/30">
              Open path
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </button>

      {started && (
        <div className="relative p-6 sm:p-8 md:p-10 border-t border-white/10">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-cyan-400/30 to-transparent" />
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/12 text-wisdom-cyan">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
                  Your path
                </h3>
                <p className="text-base text-wisdom-muted mt-1">
                  Read every stage in order — Apply unlocks after step 7
                </p>
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums text-wisdom-muted">
              Progress{" "}
              <span className="text-wisdom-cyan text-base">
                {Math.min(maxReached + 1, stages.length)}/{stages.length}
              </span>
            </div>
          </div>

          <div className="relative mb-2">
            <div className="hidden md:block absolute top-8 left-[4%] right-[12%] h-0.5 bg-white/10 rounded-full" />
            <div
              className="hidden md:block absolute top-8 left-[4%] h-0.5 rounded-full bg-wisdom-cyan transition-all duration-500"
              style={{ width: `calc(${(maxReached / (stages.length - 1)) * 76}% )` }}
            />

            <div className="flex gap-2 md:gap-0 overflow-x-auto md:overflow-visible pb-3 -mx-1 px-1 snap-x snap-mandatory md:snap-none">
              {stages.map((s, i) => {
                const SIcon = s.icon;
                const isOpen = open === i;
                const locked = i > maxReached;
                const done = i < maxReached || (allRead && i <= maxReached);
                return (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => tryOpen(i)}
                    disabled={locked}
                    className={`relative flex flex-col items-center text-center shrink-0 snap-center md:flex-1 min-w-[4.75rem] md:min-w-0 group outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/50 rounded-xl ${
                      locked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    aria-expanded={isOpen}
                    aria-disabled={locked}
                  >
                    <div
                      className={`relative z-10 w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                        locked
                          ? "bg-wisdom-dark/60 border-white/8 text-white/25"
                          : isOpen
                            ? `bg-gradient-to-br ${s.bg} ${s.border} ${s.text} scale-110 -translate-y-0.5 shadow-lg ${s.glow} ring-2 ${s.ring}`
                            : done
                              ? "bg-white/10 border-white/25 text-white/80"
                              : "bg-wisdom-dark/80 border-white/12 text-wisdom-muted group-hover:border-white/30 group-hover:text-white/90"
                      }`}
                    >
                      {locked ? <Lock className="w-5 h-5" /> : <SIcon className="w-6 h-6" />}
                      <span
                        className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center border ${
                          isOpen
                            ? "bg-white text-wisdom-dark border-white"
                            : "bg-wisdom-dark border-white/20 text-white/70"
                        }`}
                      >
                        {s.n}
                      </span>
                    </div>
                    <p
                      className={`mt-2.5 text-sm font-bold transition-colors ${
                        isOpen ? "text-white" : locked ? "text-white/30" : "text-wisdom-muted"
                      }`}
                    >
                      {s.title}
                    </p>
                  </button>
                );
              })}

              {allRead ? (
                <Link
                  href="/apply"
                  className="relative flex flex-col items-center text-center shrink-0 snap-center md:flex-1 min-w-[4.75rem] md:min-w-0 group"
                >
                  <div className="relative z-10 w-14 h-14 rounded-2xl border-2 border-wisdom-cyan/50 bg-gradient-to-br from-wisdom-cyan/25 to-cyan-600/10 text-wisdom-cyan flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/30 ring-2 ring-wisdom-cyan/30">
                    <Send className="w-6 h-6" />
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center border bg-wisdom-cyan text-wisdom-dark border-wisdom-cyan">
                      8
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm font-bold text-wisdom-cyan">Apply now</p>
                </Link>
              ) : (
                <div
                  className="relative flex flex-col items-center text-center shrink-0 snap-center md:flex-1 min-w-[4.75rem] md:min-w-0 opacity-40 cursor-not-allowed"
                  title="Finish all 7 stages to unlock"
                >
                  <div className="relative z-10 w-14 h-14 rounded-2xl border-2 border-white/10 bg-wisdom-dark/60 text-white/30 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center border bg-wisdom-dark border-white/15 text-white/40">
                      8
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm font-bold text-white/35">Apply now</p>
                </div>
              )}
            </div>
          </div>

          {stage && Icon && (
            <div
              key={stage.n}
              className={`mt-6 rounded-2xl border ${stage.border} bg-gradient-to-br ${stage.bg} p-5 sm:p-6`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl border ${stage.border} bg-wisdom-dark/40 flex items-center justify-center ${stage.text} shrink-0`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.16em] ${stage.text}`}>
                    Stage {stage.n}
                  </p>
                  <h4 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {stage.title}
                  </h4>
                </div>
              </div>

              <p className="text-base text-white/90 leading-relaxed mb-4">{stage.detail}</p>

              <div className="rounded-xl border border-white/10 bg-black/25 p-4 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                  What you do
                </p>
                <ul className="space-y-2.5">
                  {stage.youDo.map((item) => (
                    <li key={item} className="flex gap-2.5 text-base text-white/90 leading-snug">
                      <ArrowRight className={`w-4 h-4 shrink-0 mt-1 ${stage.text}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/30 px-4 py-3 mb-5">
                <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${stage.text}`} />
                <p className="text-sm text-wisdom-muted leading-relaxed">{stage.tip}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={open === 0}
                  className="btn-ghost disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {open < stages.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold min-h-[3rem] ${stage.border} ${stage.text} bg-white/10 hover:bg-white/15 transition`}
                  >
                    Next stage
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <Link
                    href="/apply"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(PATH_COMPLETE_KEY, "1");
                      }
                    }}
                    className="btn-primary"
                  >
                    Apply now
                    <Send className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {!allRead && (
            <p className="mt-5 text-center text-sm text-wisdom-muted">
              Use <strong className="text-white/90">Next stage</strong> to unlock the rest. Apply stays
              locked until you finish all seven.
            </p>
          )}

          {allRead && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-wisdom-cyan/30 bg-wisdom-cyan/10 px-5 py-4">
              <p className="text-sm text-wisdom-muted leading-relaxed">
                <Handshake className="w-4 h-4 text-emerald-400 inline mr-1.5 align-text-bottom" />
                Path complete. Internships are{" "}
                <span className="text-emerald-300 font-semibold">paid</span> on live work.
              </p>
              <Link href="/apply" className="btn-primary shrink-0">
                Apply now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
