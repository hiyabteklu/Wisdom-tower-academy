import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Target, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/90 mb-3">
          About
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
          Wisdom Tower Academy
        </h1>

        <div className="space-y-6 text-wisdom-muted leading-relaxed">
          <p className="text-lg text-white/85">
            Wisdom Tower Academy is a structured learning platform built for Ethiopian students
            preparing for high-stakes exams and the early years of university. We focus on clear
            pathways, solid materials, and steady practice—not noise.
          </p>

          <p>
            Whether you are in Grades 9–12, sitting for GAT, UAT, COC, or the Exit Exam, or starting
            freshman year, the Academy organizes what you need by path: courses, short notes, books,
            flashcards, question banks, and timed exams in one place. You progress through packages
            you unlock, track how much you have studied, and come back to where you left off.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">What we stand for</h2>
          <p>
            Good learning is deliberate. We design hubs so you can read, drill, and test without
            jumping between random files and chat groups. Materials are grouped by subject and
            semester where it matters, with progress that actually reflects time spent and questions
            attempted—not vanity metrics.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <Feature
              icon={GraduationCap}
              title="Exam pathways"
              text="GAT, UAT, COC, Exit Exam, Grades 9–12, and freshman tracks with a clear route in."
            />
            <Feature
              icon={BookOpen}
              title="Study materials"
              text="Notes, books, videos, and flashcards published under the courses you unlock."
            />
            <Feature
              icon={Target}
              title="Practice & exams"
              text="Question banks and timed exams with review, flags, and scores you can return to."
            />
            <Feature
              icon={Layers}
              title="Your progress"
              text="Reading time, focus quality, streaks, and completion kept per course and hub."
            />
          </div>

          <h2 className="text-xl font-semibold text-white pt-4">Who it is for</h2>
          <p>
            Students who want a serious study environment: secondary school learners aiming for
            national and university entrance exams, and first-year students who need structured
            course support. Teachers and parents can treat it as a reliable place for syllabus-aligned
            practice rather than scattered PDFs.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">How it works</h2>
          <p>
            Browse Academy pathways, choose a package that matches your level or program, unlock it,
            and work through the hubs—books, short notes, flashcards, question banks, and exams.
            New chapters and sets appear with a short “New” label until you open them once. Your
            account keeps progress so study sessions stay continuous across devices when you are signed in.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">Part of Wisdom Tower</h2>
          <p>
            Wisdom Tower Academy is the education arm of Wisdom Tower. Creative and digital services
            live separately under Wisdom Digital; this site is dedicated to learning and exam readiness.
            If you need design or web work, that is a different door—and we keep it that way so
            students are not sold the wrong story on this page.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-wisdom-dark font-semibold hover:bg-amber-400 transition-colors"
          >
            Explore pathways
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white/85 font-semibold hover:border-cyan-400/40 hover:text-cyan-200 transition-colors"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpen;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-wisdom-card/60 p-4">
      <div className="flex items-center gap-2 text-amber-300 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="text-sm text-wisdom-muted leading-relaxed">{text}</p>
    </div>
  );
}
