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
  Target,
  CheckCircle2,
  Sparkles,
  BookOpen,
  PenLine,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

const coreTechniques = [
  {
    id: "recall",
    number: "01",
    title: "Active recall",
    model: "Retrieval strengthens memory",
    accent: "text-amber-300",
    border: "hover:border-amber-400/40",
    iconBg: "bg-amber-500/15 border-amber-400/25 text-amber-300",
    icon: Brain,
    lead: "Learning is not what goes in. It is what you can pull out without looking.",
    body: "Recognition feels like knowing. Closing the book and writing what remains is harder — and that difficulty is the point. Each successful retrieval stabilizes the pathway. Failed attempts still show you where the structure is weak.",
    doThis: [
      "After a section, close materials and write everything you remember",
      "Explain a lecture aloud without notes",
      "Solve a problem before watching the solution",
    ],
    avoid: "Rereading until it feels familiar, then stopping",
  },
  {
    id: "spacing",
    number: "02",
    title: "Spaced repetition",
    model: "Controlled forgetting",
    accent: "text-orange-300",
    border: "hover:border-orange-400/40",
    iconBg: "bg-orange-500/15 border-orange-400/25 text-orange-300",
    icon: Clock,
    lead: "Memory fades on a curve. Spacing turns that fade into a signal to strengthen what still matters.",
    body: "Massed practice creates fluency that collapses days later. Returning after some forgetting forces effortful recall, which embeds the material more deeply than another pass in the same sitting. Keep sessions short. Protect the schedule more than the volume.",
    doThis: [
      "Revisit core ideas days and weeks later, not only the night before",
      "Ten minutes of last week’s material before today’s new work",
      "Space formulas and definitions; let minor detail fade until needed",
    ],
    avoid: "Cramming an entire chapter in one evening and calling it done",
  },
  {
    id: "testing",
    number: "03",
    title: "Practice testing",
    model: "Retrieval under constraint",
    accent: "text-rose-300",
    border: "hover:border-rose-400/40",
    iconBg: "bg-rose-500/15 border-rose-400/25 text-rose-300",
    icon: ClipboardCheck,
    lead: "Tests are not only measurement. Used early and often, they are training.",
    body: "Waiting until you ‘feel ready’ wastes the diagnostic power of mistakes. Low-stakes quizzes, past papers, and self-made questions expose gaps while correction is still cheap. Analyze why an answer failed — memory, concept, or careless reading — then repair that layer.",
    doThis: [
      "Attempt questions before confidence arrives",
      "Keep an error log: context, wrong move, corrected logic",
      "Occasionally time a section under exam-like conditions",
    ],
    avoid: "Checking the answer key and nodding without rebuilding the path",
  },
  {
    id: "interleave",
    number: "04",
    title: "Interleaving",
    model: "Discrimination, not comfort",
    accent: "text-violet-300",
    border: "hover:border-violet-400/40",
    iconBg: "bg-violet-500/15 border-violet-400/25 text-violet-300",
    icon: Shuffle,
    lead: "Blocked practice feels smooth. Mixed practice feels messy. Exams are mixed.",
    body: "When every problem is the same type, the brain never has to choose a method. Interleaving related topics forces selection and comparison. Performance may dip in the short term. Flexibility rises over time. Mix similar problem types — not random unrelated subjects.",
    doThis: [
      "After basic competence, mix problem types in one session",
      "Revise related chapters in short alternating bursts",
      "Block early when learning a method; interleave once it is familiar",
    ],
    avoid: "Doing twenty identical exercises, then moving on forever",
  },
];

const supportMethods = [
  {
    title: "Blurting",
    icon: PenLine,
    body: "Empty the page from memory under a time limit. Compare. Repair gaps. Blurt again later. Fast diagnosis without the comfort of notes.",
  },
  {
    title: "Explain simply",
    icon: MessageCircle,
    body: "If you cannot teach a concept in plain language without looking, the model is incomplete. Gaps surface immediately when jargon is stripped away.",
  },
  {
    title: "Convert notes",
    icon: FileText,
    body: "Revision assets trigger recall; they do not re-explain. Strip full notes into cues, questions, and diagrams you can expand from memory in seconds.",
  },
  {
    title: "Match the demand",
    icon: Layers,
    body: "Concepts need explanation and models. Procedures need varied practice. Facts need spaced recall. One technique for every subject wastes effort.",
  },
];

const dropList = [
  {
    title: "Rereading as the main method",
    why: "Builds familiarity, not retrieval. Fluency masquerades as mastery until the exam asks you to produce.",
  },
  {
    title: "Highlighting paragraphs",
    why: "Marks the page; rarely trains the mind. If you highlight, keep it to structural anchors you will later recall from blank paper.",
  },
  {
    title: "Passive video bingeing",
    why: "Smooth explanations create the feeling of understanding. Pause, predict, and reconstruct — or the hour evaporates.",
  },
  {
    title: "Studying only when deadlines loom",
    why: "Ignores spacing and sleep consolidation. Short-term access is not long-term structure.",
  },
];

const subjectMatch = [
  {
    kind: "Concept-heavy",
    examples: "Theory, economics, core engineering ideas",
    focus: "Mental models, explanation, diagrams, ‘why’ questions",
  },
  {
    kind: "Procedure-heavy",
    examples: "Math drills, code syntax, lab steps",
    focus: "Varied practice, timed runs, interleaving similar problem types",
  },
  {
    kind: "Fact-heavy",
    examples: "Terms, constants, vocabulary, definitions",
    focus: "Spaced recall, atomic flashcards, use-in-context",
  },
];

export default function StudyTechniquesPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-rose-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-12 md:mb-16 animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">
            Wisdom Tower Academy · Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Study </span>
            <span className="text-amber-300">Techniques</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            Exposure is easy. Construction is not. The methods below align effort with how memory
            actually forms — retrieval, timing, and honest testing — instead of hours that feel
            productive and leave little behind.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              High-utility methods first
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Target className="w-3.5 h-3.5 text-orange-300" />
              Practical campus moves
            </span>
          </div>
        </header>

        {/* Opening frame */}
        <section className="mb-14 md:mb-16 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-wisdom-card to-wisdom-card p-6 sm:p-8 animate-fade-up">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/25 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-2">Why familiar study often fails</h2>
              <p className="text-wisdom-muted leading-relaxed max-w-3xl">
                Rereading, highlighting, and watching smooth explanations reduce anxiety. They
                rarely force the brain to generate. Without retrieval, struggle, and spacing, the
                system stores little that survives a closed-book exam. The shift is simple to state
                and hard to keep: measure study by what you can produce, not by pages covered.
              </p>
            </div>
          </div>
        </section>

        {/* Core four */}
        <section className="mb-16 md:mb-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-wisdom-muted">
              Core techniques
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          <div className="space-y-6 stagger-children">
            {coreTechniques.map((t) => {
              const Icon = t.icon;
              return (
                <article
                  key={t.id}
                  id={t.id}
                  className={`group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card/95 p-6 sm:p-8 transition-all duration-400 ${t.border}`}
                >
                  <div className="absolute top-6 right-6 sm:top-8 sm:right-8 font-display text-5xl sm:text-6xl font-extrabold text-white/[0.04] select-none">
                    {t.number}
                  </div>
                  <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className={`shrink-0 p-3 rounded-2xl border ${t.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${t.accent}`}>
                        {t.model}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-white mb-2">{t.title}</h3>
                      <p className="text-white/90 font-medium leading-relaxed mb-3">{t.lead}</p>
                      <p className="text-sm text-wisdom-muted leading-relaxed mb-5 max-w-3xl">{t.body}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-wisdom-dark/50 border border-white/8 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                            Do this
                          </p>
                          <ul className="space-y-2">
                            {t.doThis.map((item) => (
                              <li key={item} className="flex gap-2 text-sm text-wisdom-muted">
                                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${t.accent}`} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-wisdom-dark/50 border border-white/8 p-4 flex flex-col justify-center">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-2">
                            <Ban className="w-3.5 h-3.5 text-rose-400/80" />
                            Common trap
                          </p>
                          <p className="text-sm text-wisdom-muted leading-relaxed">{t.avoid}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Support methods */}
        <section className="mb-16 md:mb-20">
          <div className="mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Supporting moves</h2>
            <p className="text-wisdom-muted text-sm max-w-xl">
              Smaller practices that sharpen the core four without replacing them.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {supportMethods.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className="rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 hover:border-amber-400/30 transition-colors duration-300"
                >
                  <div className="mb-3 inline-flex p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-wisdom-muted leading-relaxed">{m.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Drop list */}
        <section className="mb-16 md:mb-20">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">What to stop prioritizing</h2>
              <p className="text-sm text-wisdom-muted">Low return for the comfort they provide</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dropList.map((d) => (
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

        {/* Subject matching */}
        <section className="mb-16 md:mb-20">
          <div className="mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Match technique to demand</h2>
            <p className="text-wisdom-muted text-sm max-w-xl">
              Audits beat generic advice. Ask what the exam actually requires, then train that action.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            {subjectMatch.map((s) => (
              <div
                key={s.kind}
                className="rounded-2xl border border-white/12 bg-gradient-to-b from-amber-500/[0.07] to-wisdom-card p-5 sm:p-6"
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

        {/* Weekly rhythm */}
        <section className="mb-14 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-wisdom-card to-wisdom-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="font-display text-xl md:text-2xl font-bold">A workable weekly rhythm</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              "New material in focused blocks with retrieval at the end of each block",
              "Short spaced recall of last week’s core ideas before starting new work",
              "At least one mixed problem or question set (interleave when ready)",
              "One blurting or blank-page session on a high-stakes topic",
              "Error log updated after practice tests — fix causes, not only answers",
              "Notes compressed into cue sheets only after understanding exists",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 items-start rounded-xl bg-wisdom-dark/50 border border-white/8 px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span className="text-wisdom-muted">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="rounded-3xl border border-white/10 bg-wisdom-card p-8 md:p-10 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-3">
            Technique without context still stalls
          </h2>
          <p className="text-wisdom-muted max-w-lg mx-auto mb-6 leading-relaxed">
            Friends, sleep, and campus noise shape whether these methods stick. Pair this page with
            campus systems when life, not content, is the bottleneck.
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
