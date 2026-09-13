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
  Lightbulb,
  CheckCircle2,
  PenLine,
} from "lucide-react";

export function StudyRecall() {
  return (
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
          Recognition is easy. You open the notes, see a formula, and think you know this.
          Closing the book and writing that formula from scratch is harder. That hardness is
          useful. Each time you retrieve something successfully, the path gets a little more
          stable.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">Try this</p>
            <ul className="space-y-2 text-sm">
              {["After a section, close everything and write what you remember.", "Explain a lecture out loud without looking at notes.", "Attempt a problem before you watch or read the solution."].map((item) => (
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
  );
}

export function StudySpacing() {
  return (
    <section id="spacing" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-400/25 text-orange-300">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-300/90">02</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Spacing your review</h2>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
        <p className="text-white/90 font-medium">
          Memory fades. Returning after a little forgetting is how you strengthen what still matters.
        </p>
        <p>
          Cramming an entire chapter in one evening can make you fluent for a short while. A few
          days later much of that fluency is gone. Spreading the same total time across several
          shorter sessions usually leaves more behind.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">Try this</p>
            <ul className="space-y-2 text-sm">
              {["Revisit important ideas days and weeks later, not only the night before.", "Spend ten minutes on last week's material before new work.", "Space formulas and definitions; let minor detail wait until you need it."].map((item) => (
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
              Treating a single long night as done for a whole chapter. Fluency that night is
              not the same as structure that survives until the exam.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudyTesting() {
  return (
    <section id="testing" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300/90">03</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Practice testing</h2>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
        <p className="text-white/90 font-medium">Tests are not only for grades. Used early, they are training.</p>
        <p>
          Waiting until you feel ready wastes the value of mistakes. A low-stakes quiz or past
          paper will show gaps while there is still time to fix them. After each attempt, rebuild
          the correct path in writing.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">Try this</p>
            <ul className="space-y-2 text-sm">
              {["Attempt questions before confidence arrives.", "Keep a short error log: what you tried, what went wrong, what is correct.", "Now and then, time a section the way the real exam will feel."].map((item) => (
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
  );
}

export function StudyInterleave() {
  return (
    <section id="interleave" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-400/25 text-violet-300">
          <Shuffle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300/90">04</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Mixing related topics</h2>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-4 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
        <p className="text-white/90 font-medium">
          Doing twenty of the same problem feels smooth. Real exams mix types. Practice should
          eventually look like that mix.
        </p>
        <p>
          Learn a method in a focused block first. Once you can do it, weave it with neighboring
          topics so choosing the right tool becomes part of the skill.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">Try this</p>
            <ul className="space-y-2 text-sm">
              {["After basic competence, mix problem types in one sitting.", "Revise related chapters in short alternating bursts.", "Stay blocked early; interleave once the method is familiar."].map((item) => (
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
              beside other skills, so the exam mix feels new.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudyHabits() {
  return (
    <section id="habits" className="mb-14 scroll-mt-24">
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
          Everyday habits that support the core four
        </h2>
        <p className="text-wisdom-muted text-sm sm:text-base leading-relaxed">
          These do not replace recall, spacing, testing, or mixing. They make those methods easier to keep.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: "Blurting", icon: PenLine, body: "Set a short timer. Write everything you know about a topic on a blank page. Compare with your notes. Fill the gaps. Come back later and try again." },
          { title: "Explain it simply", icon: MessageCircle, body: "If you cannot teach an idea in plain language without looking, the model is still incomplete. The places where you stall are the places that need another pass." },
          { title: "Turn notes into cues", icon: FileText, body: "Full notes are for first understanding. For revision, shrink them into questions, prompts, and small diagrams you can expand from memory." },
          { title: "Protect sleep and focus blocks", icon: Lightbulb, body: "Late nights that steal sleep cost more than they give. A short, protected focus block beats a long distracted evening." },
        ].map((h) => {
          const Icon = h.icon;
          return (
            <article key={h.title} className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 space-y-3">
              <div className="inline-flex p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">{h.title}</h3>
              <p className="text-sm text-wisdom-muted leading-relaxed">{h.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function StudyTraps() {
  return (
    <section id="traps" className="mb-14 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-200">
          <Ban className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white">What to drop</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3 text-[15px] text-wisdom-muted leading-relaxed">
        <p>These habits feel productive and usually are not:</p>
        <ul className="space-y-2">
          {[
            "Rereading highlighted pages until they look familiar",
            "Watching videos without pausing to solve anything",
            "Copying notes from friends without reconstructing the argument",
            "Cramming only the night before and calling it a plan",
            "Avoiding timed practice because it feels uncomfortable",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Ban className="w-4 h-4 shrink-0 mt-0.5 text-rose-400/80" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function StudyFooter() {
  return (
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
  );
}
