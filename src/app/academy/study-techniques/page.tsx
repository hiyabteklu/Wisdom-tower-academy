import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Clock,
  ClipboardCheck,
  Shuffle,
  FileText,
  MessageCircle,
  Ban,
  Layers,
  Lightbulb,
  CheckCircle2,
  ListChecks,
  BookOpen,
  PenLine,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

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

        {/* Active recall */}
        <section id="recall" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">01</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Active recall</h2>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
            <p className="text-white/90 font-medium">
              Learning is not only what goes in. It is what you can pull back out without the page
              in front of you.
            </p>
            <p>
              Recognition is easy. You open the notes, see a formula, and think “I know this.”
              Closing the book and writing that formula from scratch is harder. That hardness is
              useful. Each time you retrieve something successfully, the path gets a little more
              stable. When you fail, you learn exactly where the gap is, which is information
              rereading almost never gives you.
            </p>
            <p>
              You can practice this after a lecture, after a reading section, or before you look up
              a solution. The pattern is the same: hide the material, try to produce it, then check
              and repair.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                  Try this
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "After a section, close everything and write what you remember.",
                    "Explain a lecture out loud without looking at notes.",
                    "Attempt a problem before you watch or read the solution.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-rose-400/80" />
                  Common trap
                </p>
                <p className="text-sm">
                  Rereading until the text feels familiar, then stopping. Familiarity is not the
                  same as being able to produce the idea on a blank page.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section id="spacing" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-400/25 text-orange-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-300/90">02</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Spacing your review
              </h2>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
            <p className="text-white/90 font-medium">
              Memory fades. Returning after a little forgetting is how you strengthen what still
              matters.
            </p>
            <p>
              Cramming an entire chapter in one evening can make you fluent for a short while. A few
              days later much of that fluency is gone. Spreading the same total time across several
              shorter sessions usually leaves more behind, because each return forces effortful
              recall instead of passive recognition.
            </p>
            <p>
              You do not need a complicated app to start. Keep sessions short. Put last week’s core
              ideas at the front of today’s study block for ten minutes. Protect the calendar more
              than the urge to finish everything in one heroic night.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                  Try this
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Revisit important ideas days and weeks later, not only the night before.",
                    "Spend ten minutes on last week’s material before new work.",
                    "Space formulas and definitions; let minor detail wait until you need it.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-orange-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-rose-400/80" />
                  Common trap
                </p>
                <p className="text-sm">
                  Treating a single long night as “done” for a whole chapter. Fluency that night is
                  not the same as structure that survives until the exam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Practice testing */}
        <section id="testing" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300/90">03</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Practice testing
              </h2>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
            <p className="text-white/90 font-medium">
              Tests are not only for grades. Used early, they are training.
            </p>
            <p>
              Waiting until you “feel ready” wastes the value of mistakes. A low-stakes quiz, a past
              paper, or questions you write yourself will show gaps while there is still time to
              fix them. The useful part is not the score. It is noticing whether you failed because
              you forgot a fact, misunderstood a concept, or misread the question.
            </p>
            <p>
              After each attempt, rebuild the correct path in writing. Looking at the answer key and
              nodding is almost the same as rereading. You want the corrected reasoning in your own
              head, not only on the page.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                  Try this
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Attempt questions before confidence arrives.",
                    "Keep a short error log: what you tried, what went wrong, what is correct.",
                    "Now and then, time a section the way the real exam will feel.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-rose-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-rose-400/80" />
                  Common trap
                </p>
                <p className="text-sm">
                  Checking the key, feeling relieved, and moving on without rebuilding the steps
                  that would have produced the right answer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interleaving */}
        <section id="interleave" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-400/25 text-violet-300">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300/90">04</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Mixing related topics
              </h2>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
            <p className="text-white/90 font-medium">
              Doing twenty of the same problem feels smooth. Real exams mix types. Practice should
              eventually look like that mix.
            </p>
            <p>
              When every exercise is the same kind, you never have to choose a method. Mixing
              related problem types forces you to discriminate: which tool fits this question?
              Performance may dip a little at first. Flexibility usually rises over time.
            </p>
            <p>
              This is not a call to randomize everything. Learn a method in a focused block first.
              Once you can do it, weave it with neighboring topics so the choice becomes part of
              the skill.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                  Try this
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "After basic competence, mix problem types in one sitting.",
                    "Revise related chapters in short alternating bursts.",
                    "Stay blocked early; interleave once the method is familiar.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-violet-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-rose-400/80" />
                  Common trap
                </p>
                <p className="text-sm">
                  Finishing a long run of identical exercises and never returning to that skill
                  beside other skills, so the exam’s mix feels new.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Everyday habits */}
        <section id="habits" className="mb-14 scroll-mt-24">
          <div className="mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
              Everyday habits that support the core four
            </h2>
            <p className="text-wisdom-muted text-sm sm:text-base leading-relaxed">
              These do not replace recall, spacing, testing, or mixing. They make those methods
              easier to keep.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Blurting",
                icon: PenLine,
                body: "Set a short timer. Write everything you know about a topic on a blank page. Compare with your notes. Fill the gaps. Come back later and try again. It is a fast way to see what is actually available in memory.",
              },
              {
                title: "Explain it simply",
                icon: MessageCircle,
                body: "If you cannot teach an idea in plain language without looking, the model is still incomplete. Strip the jargon and try again. The places where you stall are the places that need another pass.",
              },
              {
                title: "Turn notes into cues",
                icon: FileText,
                body: "Full notes are for first understanding. For revision, shrink them into questions, prompts, and small diagrams you can expand from memory. If the sheet still reads like a textbook, it will tempt you to reread instead of retrieve.",
              },
              {
                title: "Match method to the subject",
                icon: Layers,
                body: "Concept-heavy courses need explanation and models. Procedure-heavy work needs varied practice. Fact-heavy lists need spaced recall. Using one technique for every course wastes time you could spend on the action the exam actually demands.",
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <article
                  key={m.title}
                  className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 hover:border-amber-400/30 transition-colors"
                >
                  <div className="mb-3 inline-flex p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-wisdom-muted leading-relaxed">{m.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Match demand */}
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
              Match the technique to the demand
            </h2>
            <p className="text-wisdom-muted text-sm sm:text-base leading-relaxed max-w-xl">
              Ask what the exam actually requires, then train that action. Generic advice is less
              useful than a short audit of the course.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                kind: "Concept-heavy",
                examples: "Theory, economics, core engineering ideas",
                focus:
                  "Build mental models. Explain in your own words. Draw diagrams. Keep asking why a step is true.",
              },
              {
                kind: "Procedure-heavy",
                examples: "Math drills, code patterns, lab steps",
                focus:
                  "Practice with variety. Time yourself sometimes. Mix similar problem types once the method is familiar.",
              },
              {
                kind: "Fact-heavy",
                examples: "Terms, constants, vocabulary, definitions",
                focus:
                  "Use spaced recall and small flashcards. Put each fact into a short context so it is not only a floating word.",
              },
            ].map((s) => (
              <div
                key={s.kind}
                className="rounded-2xl border border-white/12 bg-gradient-to-b from-amber-500/[0.07] to-wisdom-card p-5"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                  {s.kind}
                </p>
                <p className="text-xs text-wisdom-muted mb-3">{s.examples}</p>
                <p className="text-sm text-white/90 leading-relaxed">{s.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Traps */}
        <section id="traps" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                What to stop prioritizing
              </h2>
              <p className="text-sm text-wisdom-muted">Comfortable habits with a low return</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Rereading as the main method",
                why: "It builds familiarity, not retrieval. The text feels known until the exam asks you to produce it from nothing.",
              },
              {
                title: "Highlighting whole paragraphs",
                why: "Color on the page is not training for the mind. If you mark anything, mark only anchors you will later try to recall on blank paper.",
              },
              {
                title: "Passive video watching",
                why: "Clear explanations feel like understanding. Pause, predict the next step, and reconstruct the argument, or the hour disappears with little to show.",
              },
              {
                title: "Studying only when deadlines loom",
                why: "Cramming ignores spacing and sleep. You may access material for a short window and still lack structure that lasts.",
              },
            ].map((d) => (
              <div
                key={d.title}
                className="rounded-2xl border border-white/10 bg-wisdom-card/80 p-5 border-l-2 border-l-rose-400/40"
              >
                <h3 className="font-display font-bold text-white mb-1.5">{d.title}</h3>
                <p className="text-sm text-wisdom-muted leading-relaxed">{d.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly rhythm */}
        <section className="mb-14 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-wisdom-card to-wisdom-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-5 h-5 text-amber-300" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-white">
              A workable weekly rhythm
            </h2>
          </div>
          <p className="text-sm text-wisdom-muted mb-5 leading-relaxed">
            You will not hit every item every week. Use the list as a check when study starts to
            drift back into passive hours.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              "New material in focused blocks, with a short recall attempt at the end of each block",
              "A little spaced review of last week’s core ideas before you start new work",
              "At least one mixed set of questions once the methods are familiar",
              "One blank-page or blurting session on a high-stakes topic",
              "An error log after practice tests, focused on causes, not only correct answers",
              "Notes compressed into cue sheets only after you already understand the material",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 items-start rounded-xl bg-wisdom-dark/50 border border-white/8 px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span className="text-wisdom-muted leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-3xl border border-white/10 bg-wisdom-card p-8 md:p-10 text-center">
          <div className="inline-flex mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-300">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold mb-3 text-white">
            Technique still needs a livable week
          </h2>
          <p className="text-wisdom-muted max-w-md mx-auto mb-6 leading-relaxed text-sm sm:text-base">
            Friends, sleep, and noise shape whether these methods stick. When life, not content, is
            the bottleneck, pair this page with the campus life guide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/academy/campus-life"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-wisdom-dark font-semibold hover:bg-amber-300 transition-colors"
            >
              Campus life
              <ArrowRight className="w-4 h-4" />
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
