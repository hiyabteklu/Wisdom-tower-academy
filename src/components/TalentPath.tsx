"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";

const stages = [
  {
    n: 1,
    title: "Focus",
    short: "Pick category + service",
    icon: Target,
    accent: "cyan",
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
    weLook: ["Clear focus", "Honest self-assessment", "One primary skill path"],
    tip: "If you can't name the service in one sentence, you're not ready to apply yet.",
  },
  {
    n: 2,
    title: "Apply",
    short: "Letter + portfolio",
    icon: FileText,
    accent: "sky",
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
    weLook: ["Relevance", "Clarity", "Proof over claims"],
    tip: "Your portfolio should answer: “Can this person ship our next client job?”",
  },
  {
    n: 3,
    title: "Assess",
    short: "Practical task",
    icon: FileCheck,
    accent: "violet",
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
    weLook: ["Craft quality", "Time sense", "Professional judgment"],
    tip: "We score how you think as much as how it looks.",
  },
  {
    n: 4,
    title: "Interview",
    short: "Fit & standards",
    icon: MessageCircle,
    accent: "amber",
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
    weLook: ["Integrity", "Coachability", "Cultural fit"],
    tip: "We're not looking for perfection — we're looking for reliability.",
  },
  {
    n: 5,
    title: "Train",
    short: "Workflows & quality",
    icon: GraduationCap,
    accent: "orange",
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
    weLook: ["Attention to process", "Fast learning", "Zero-sloppy habits"],
    tip: "Training is short on purpose — we move people who absorb systems quickly.",
  },
  {
    n: 6,
    title: "Intern",
    short: "Paid live work",
    icon: Handshake,
    accent: "emerald",
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
    weLook: ["Consistent delivery", "Client-ready output", "Team reliability"],
    tip: "Internships are paid on live work. Progression follows delivery — not tenure alone.",
  },
  {
    n: 7,
    title: "Join",
    short: "Contributor role",
    icon: BadgeCheck,
    accent: "teal",
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
    weLook: ["Leadership in craft", "Trust", "Long-term partnership"],
    tip: "This is the goal of the path — not a participation trophy.",
  },
] as const;

export default function TalentPath() {
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const stage = stages[active];
  const Icon = stage.icon;
  const progress = ((active + 1) / stages.length) * 100;

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const go = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(stages.length - 1, i)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  return (
    <div
      className={`rounded-3xl border border-white/12 bg-wisdom-card/95 overflow-hidden relative shadow-card-3d transition-opacity duration-700 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${stage.bg} transition-all duration-700`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative p-5 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/12 text-wisdom-muted">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight">Your path</h3>
              <p className="text-sm text-wisdom-muted mt-0.5">
                Seven stages · interest → paid contribution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tabular-nums text-wisdom-muted">
              Step <span className={stage.text}>{active + 1}</span> of {stages.length}
            </span>
            <div className="w-28 sm:w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${stage.bar} transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative mb-8 md:mb-10">
          <div className="hidden md:block absolute top-7 left-[6%] right-[6%] h-0.5 bg-white/10 rounded-full" />
          <div
            className={`hidden md:block absolute top-7 left-[6%] h-0.5 rounded-full ${stage.bar} transition-all duration-500`}
            style={{ width: `calc(${(active / (stages.length - 1)) * 88}% )` }}
          />

          <div className="flex gap-2 md:gap-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x snap-mandatory md:snap-none -mx-1 px-1">
            {stages.map((s, i) => {
              const SIcon = s.icon;
              const isActive = i === active;
              const isPast = i < active;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => go(i)}
                  className="relative flex flex-col items-center text-center shrink-0 snap-center md:flex-1 min-w-[4.5rem] md:min-w-0 group outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/50 rounded-xl"
                  aria-current={isActive ? "step" : undefined}
                >
                  <div
                    className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `${s.bg.replace("from-", "bg-gradient-to-br from-")} ${s.border} ${s.text} scale-110 -translate-y-1 shadow-lg ${s.glow} ring-2 ${s.ring}`
                        : isPast
                          ? "bg-white/10 border-white/25 text-white/80"
                          : "bg-wisdom-dark/80 border-white/12 text-wisdom-muted group-hover:border-white/30 group-hover:text-white/90 group-hover:scale-105"
                    }`}
                  >
                    {isPast && !isActive ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <SIcon className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                    <span
                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border ${
                        isActive
                          ? "bg-white text-wisdom-dark border-white"
                          : "bg-wisdom-dark border-white/20 text-white/70"
                      }`}
                    >
                      {s.n}
                    </span>
                  </div>
                  <p
                    className={`mt-2.5 text-xs md:text-sm font-bold transition-colors ${
                      isActive ? "text-white" : isPast ? "text-white/70" : "text-wisdom-muted"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="hidden lg:block text-[10px] text-wisdom-muted mt-0.5 leading-tight px-1 max-w-[5.5rem]">
                    {s.short}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={stage.n}
          className={`rounded-2xl border ${stage.border} bg-gradient-to-br ${stage.bg} p-5 sm:p-7 transition-all duration-300`}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            <div className="lg:w-[42%] shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl border-2 ${stage.border} bg-wisdom-dark/40 flex items-center justify-center ${stage.text}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${stage.text}`}>
                    Stage {stage.n}
                  </p>
                  <h4 className="font-display text-2xl font-extrabold text-white tracking-tight">
                    {stage.title}
                  </h4>
                </div>
              </div>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-4">{stage.detail}</p>
              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/25 px-3.5 py-3">
                <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${stage.text}`} />
                <p className="text-xs text-wisdom-muted leading-relaxed">{stage.tip}</p>
              </div>
            </div>

            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3">
                  What you do
                </p>
                <ul className="space-y-2.5">
                  {stage.youDo.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-white/85 leading-snug">
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 mt-1 ${stage.text}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3">
                  What we look for
                </p>
                <ul className="space-y-2.5">
                  {stage.weLook.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-white/85 leading-snug">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-1 ${stage.text}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/12 text-sm font-semibold text-wisdom-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              {stages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to stage ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? `w-6 ${stage.bar}` : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {active < stages.length - 1 ? (
              <button
                type="button"
                onClick={() => go(active + 1)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition ${stage.border} ${stage.text} bg-white/5 hover:bg-white/10`}
              >
                Next stage
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <a
                href="#start-application"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold hover:bg-wisdom-cyan-dark transition"
              >
                Start application
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-wisdom-muted flex flex-wrap items-center justify-center gap-1.5">
          <Handshake className="w-3.5 h-3.5 text-emerald-400" />
          Internships are <span className="text-emerald-300 font-semibold">paid</span> on live work.
          Progression follows delivery, not tenure alone.
          <span className="hidden sm:inline text-white/20">·</span>
          <span className="hidden sm:inline">Use ← → keys to walk the path</span>
        </p>
      </div>
    </div>
  );
}
