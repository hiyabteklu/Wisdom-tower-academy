import {
  BookOpen,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import PageNotes from "@/components/academy/PageNotes";
import {
  StudyRecall,
  StudySpacing,
  StudyTesting,
  StudyInterleave,
  StudyHabits,
  StudyTraps,
  StudyFooter,
} from "@/components/academy/StudyTechniquesSections";

const navItems = [
  { id: "recall", label: "Active recall", accent: "text-amber-300" },
  { id: "spacing", label: "Spacing", accent: "text-orange-300" },
  { id: "testing", label: "Practice tests", accent: "text-rose-300" },
  { id: "interleave", label: "Mixing topics", accent: "text-violet-300" },
  { id: "habits", label: "Everyday habits", accent: "text-cyan-300" },
  { id: "traps", label: "What to drop", accent: "text-rose-200" },
];

export default function StudyTechniquesPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/3 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-rose-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-12">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-amber-400/90 mb-3">
            Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            <span className="text-white">Study </span>
            <span className="text-amber-300">techniques</span>
          </h1>
          <div className="space-y-4 text-wisdom-muted text-base sm:text-lg leading-relaxed">
            <p>
              Covering pages and highlighting lines can feel like work. Often it is only exposure.
              What tends to stick is what you can bring back without looking: a definition in your
              own words, a method you can choose under time pressure, a problem you solve from a
              blank page.
            </p>
            <p>
              This guide walks through methods that match how memory actually forms. None of them
              require a perfect personality. They require a bit of structure, honest feedback, and
              the willingness to feel slightly uncomfortable while you practice.
            </p>
          </div>
        </header>

        <nav className="mb-12 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-xl border border-white/12 bg-wisdom-card/80 px-3 py-1.5 text-xs font-semibold text-wisdom-muted hover:border-amber-400/30 hover:text-white transition-colors"
            >
              <span className={item.accent}>·</span> {item.label}
            </a>
          ))}
        </nav>

        <section className="mb-12 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-wisdom-card to-wisdom-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/25 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-3 text-sm sm:text-base text-wisdom-muted leading-relaxed">
              <h2 className="font-display text-xl md:text-2xl font-bold text-white">
                Why the usual routine disappoints
              </h2>
              <p>
                Rereading a chapter until it feels familiar is calming. Watching a clear video is
                pleasant. Neither one forces your mind to generate the answer. On exam day the
                question is closed book, timed, and mixed with other topics. If your only practice
                was open book and smooth, the gap shows up late.
              </p>
              <p>
                A better measure of a study session is simple: what can you produce from memory
                afterward? If the answer is thin, the session taught less than the hours suggest.
              </p>
            </div>
          </div>
        </section>

        <StudyRecall />
        <StudySpacing />
        <StudyTesting />
        <StudyInterleave />
        <StudyHabits />
        <StudyTraps />
        <StudyFooter />
        <PageNotes pageSlug="study-techniques" />
      </div>
    </div>
  );
}
