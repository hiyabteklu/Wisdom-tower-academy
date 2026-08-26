import Link from "next/link";
import {
  ArrowRight,
  Users,
  Heart,
  Brain,
  Flame,
  Shield,
  Coffee,
  BookOpen,
  MapPin,
  UsersRound,
  MessageSquare,
  Library,
  Building2,
  AlertTriangle,
  Target,
  ListChecks,
  CheckCircle2,
  Trees,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

const pillars = [
  {
    id: "social",
    title: "Social architecture",
    subtitle: "Friends, peer norms, and focus",
    accent: "text-rose-300",
    border: "border-rose-400/25",
    glow: "from-rose-500/15 to-transparent",
    icon: Users,
  },
  {
    id: "mental",
    title: "Mental operating system",
    subtitle: "Motivation, burnout, discipline",
    accent: "text-violet-300",
    border: "border-violet-400/25",
    glow: "from-violet-500/15 to-transparent",
    icon: Brain,
  },
  {
    id: "class",
    title: "Class & lecture mastery",
    subtitle: "Seats, attendance, poor teaching",
    accent: "text-sky-300",
    border: "border-sky-400/25",
    glow: "from-sky-500/15 to-transparent",
    icon: BookOpen,
  },
  {
    id: "campus",
    title: "Campus infrastructure",
    subtitle: "Facilities, groups, teachers",
    accent: "text-emerald-300",
    border: "border-emerald-400/25",
    glow: "from-emerald-500/15 to-transparent",
    icon: Building2,
  },
];

const socialCards = [
  {
    title: "Friends vs focus",
    model: "Attention leakage",
    body: "Every interaction leaves residue. Constant availability means study never gets a clean channel. Boundaries are not walls — they are scheduled presence.",
    actions: [
      "Protect focus blocks; social time after, not during",
      "Say no without a long explanation during study windows",
      "Be fully present when you are off-duty so FOMO drops",
    ],
  },
  {
    title: "Peer pressure as norms",
    model: "Social defaulting",
    body: "Pressure rarely arrives as commands. It arrives as what ‘everyone does’. Selective exposure beats constant resistance.",
    actions: [
      "Pre-decide attendance and study standards before social moments",
      "Sit and study near people whose habits match your goals",
      "Decline activities that clash with academic anchors without apology",
    ],
  },
  {
    title: "Loneliness is a signal",
    model: "Social nourishment",
    body: "Isolation is not discipline. Shallow constant chat is not connection. One or two steady relationships outperform a crowded feed.",
    actions: [
      "Schedule connection intentionally each week",
      "Prefer structured presence (study alongside, short check-ins)",
      "Treat meaningful contact as part of the system, not a reward",
    ],
  },
];

const mentalCards = [
  {
    title: "Motivation cycles",
    icon: Flame,
    body: "Motivation peaks and drops. Systems built only for high-energy days collapse. Design minimums for low days and invest spikes in hard foundational work.",
    tips: ["Tiny recall sessions on low days", "Hard problems only when energy is high", "Never zero — shrink the system, don’t abandon it"],
  },
  {
    title: "Burnout detection",
    icon: AlertTriangle,
    body: "Burnout is cumulative overload, not a sudden failure of character. Early signals: tiredness after rest, numb interest, rising avoidance, cynicism.",
    tips: ["Cut volume before collapse", "Simplify systems instead of quitting", "Protect sleep and ask for support early"],
  },
  {
    title: "Discipline over motivation",
    icon: Shield,
    body: "Discipline is consistency under low effort — same time, same place, same opening action. Intensity is optional; continuity is not.",
    tips: ["Daily recall anchor", "Weekly review ritual", "Remove choice: fixed start cue"],
  },
  {
    title: "Rest is infrastructure",
    icon: Coffee,
    body: "Rest is not the opposite of studying. It restores attention, memory consolidation, and emotional regulation. Unstructured scrolling is not recovery.",
    tips: ["Short breaks between deep blocks", "Walk / quiet / sleep over doom-scroll", "Stop before exhaustion, not after"],
  },
];

const classCards = [
  {
    title: "Ideal class environment",
    body: "Signal optimization: clear sightlines, low foot traffic, devices intentional. Comfort with friends in the back row often costs engagement.",
  },
  {
    title: "Attendance as leverage",
    body: "Show up for high-value sessions (hard material, exam cues). When you skip, compensate the same day — notes, reconstruction, no backlog.",
  },
  {
    title: "Managing disturbances",
    body: "Focus is recoverable. Respond procedurally (silence phone, re-anchor notes) instead of emotionally abandoning the session.",
  },
  {
    title: "Poor teaching quality",
    body: "Extract syllabus boundaries, emphasis, and exam surface from weak lectures. Build understanding after class with targeted sources mapped to the course.",
  },
];

const campusCards = [
  {
    title: "Use facilities as force multipliers",
    icon: Library,
    points: [
      "Library / quiet zones for deep work",
      "Labs and computer rooms for reliable tools",
      "Match room type to task (whiteboard vs silence)",
    ],
  },
  {
    title: "Group work survival",
    icon: UsersRound,
    points: [
      "Define roles and internal deadlines early",
      "Everyone understands the full project",
      "Document agreements; fix imbalance early",
    ],
  },
  {
    title: "Student–teacher dynamics",
    icon: MessageSquare,
    points: [
      "Ask precise questions early, not only in crisis",
      "Watch what instructors emphasize and repeat",
      "Treat feedback as information, not identity",
    ],
  },
];

export default function CampusLifePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-48 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-12 md:mb-16 animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-teal-300/90 mb-3">
            Wisdom Tower Academy · Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Campus </span>
            <span className="text-teal-300">Life</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            Grades are not only study methods. They are also how you protect attention among friends,
            recover from pressure, extract value from imperfect lectures, and use the campus as a
            system — not a backdrop.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Trees className="w-3.5 h-3.5 text-teal-300" />
              Social · Mental · Class · Facilities
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Target className="w-3.5 h-3.5 text-emerald-300" />
              Actionable systems, not slogans
            </span>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14 stagger-children">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.id}
                href={`#${p.id}`}
                className={`group rounded-2xl border ${p.border} bg-gradient-to-b ${p.glow} bg-wisdom-card/80 p-4 hover:bg-wisdom-card transition-all`}
              >
                <div className={`mb-3 inline-flex p-2.5 rounded-xl bg-wisdom-dark/60 border border-white/10 ${p.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`font-display font-bold text-sm sm:text-base ${p.accent}`}>{p.title}</p>
                <p className="text-xs text-wisdom-muted mt-1 leading-snug">{p.subtitle}</p>
              </a>
            );
          })}
        </div>

        <section id="social" className="mb-16 md:mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Social architecture</h2>
              <p className="text-sm text-wisdom-muted">Structure connection so focus survives</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {socialCards.map((c) => (
              <article
                key={c.title}
                className="rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-6 hover:border-rose-400/30 transition-colors"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300/90 mb-1">{c.model}</p>
                <h3 className="font-display text-lg font-bold text-white mb-2">{c.title}</h3>
                <p className="text-sm text-wisdom-muted leading-relaxed mb-4">{c.body}</p>
                <ul className="space-y-2">
                  {c.actions.map((a) => (
                    <li key={a} className="flex gap-2 text-sm text-wisdom-muted/95">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-rose-300/80 mt-0.5" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="mental" className="mb-16 md:mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-400/25 text-violet-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Mental operating system</h2>
              <p className="text-sm text-wisdom-muted">Ride motivation cycles; detect burnout early</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {mentalCards.map((c) => {
              const Icon = c.icon;
              return (
                <article
                  key={c.title}
                  className="rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-6 hover:border-violet-400/30 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-400/20 text-violet-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white pt-0.5">{c.title}</h3>
                  </div>
                  <p className="text-sm text-wisdom-muted leading-relaxed mb-4">{c.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.tips.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-wisdom-dark/70 border border-white/10 text-wisdom-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="class" className="mb-16 md:mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Class & lecture mastery</h2>
              <p className="text-sm text-wisdom-muted">Extract signal even when delivery is weak</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classCards.map((c, i) => (
              <div key={c.title} className="relative rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 overflow-hidden">
                <span className="absolute top-4 right-4 text-4xl font-display font-extrabold text-white/[0.04]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base font-bold text-sky-200 mb-2">{c.title}</h3>
                <p className="text-sm text-wisdom-muted leading-relaxed relative z-10">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/[0.06] p-5 flex gap-4">
            <MapPin className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
            <p className="text-sm text-wisdom-muted leading-relaxed">
              <span className="text-sky-200 font-semibold">Same-day consolidation:</span> after class,
              spend 10–20 minutes reconstructing the lecture from memory, then check notes. That window
              is when structure sticks — postponing review is how confusion compounds.
            </p>
          </div>
        </section>

        <section id="campus" className="mb-16 md:mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Campus infrastructure</h2>
              <p className="text-sm text-wisdom-muted">Let buildings, groups, and staff carry load</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {campusCards.map((c) => {
              const Icon = c.icon;
              return (
                <article
                  key={c.title}
                  className="rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-6 hover:border-emerald-400/30 transition-colors"
                >
                  <div className="mb-3 inline-flex p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-3">{c.title}</h3>
                  <ul className="space-y-2">
                    {c.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-wisdom-muted">
                        <span className="text-emerald-400 mt-1.5 shrink-0">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mb-14 rounded-3xl border border-teal-400/20 bg-gradient-to-br from-teal-500/10 via-wisdom-card to-wisdom-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-teal-300" />
            <h2 className="font-display text-xl md:text-2xl font-bold">Weekly campus checklist</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              "At least one protected deep-focus block away from social defaults",
              "One meaningful check-in (not infinite messaging)",
              "Same-day reconstruction after hard lectures",
              "One facility used on purpose (library, lab, quiet room)",
              "Burnout scan: energy, interest, avoidance — adjust load if needed",
              "Group or assignment roles clarified before pressure peaks",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 items-start rounded-xl bg-wisdom-dark/50 border border-white/8 px-4 py-3"
              >
                <Heart className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <span className="text-wisdom-muted">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-3xl border border-white/10 bg-wisdom-card p-8 md:p-10 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-3">Pair campus systems with study skill</h2>
          <p className="text-wisdom-muted max-w-lg mx-auto mb-6 leading-relaxed">
            Environment and relationships set the ceiling. Study techniques raise what you can do inside
            that ceiling. Use both.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/academy/study-techniques"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-400 text-wisdom-dark font-semibold hover:bg-teal-300 transition-colors"
            >
              Study techniques
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/academy/universities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium hover:border-white/30 transition-colors"
            >
              Universities guide
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium hover:border-white/30 transition-colors"
            >
              Back to Academy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
