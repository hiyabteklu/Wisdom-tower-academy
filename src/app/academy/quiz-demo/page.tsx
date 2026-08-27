import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import { sampleQuestions } from "@/data/sample-questions";

export const metadata = {
  title: "Quiz demo | Wisdom Tower Academy",
  description: "Pilot quiz with AI explanations",
};

export default function QuizDemoPage() {
  return (
    <div className="relative min-h-[75vh]">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80 mb-2">
            Academy · Pilot
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Quiz demo
          </h1>
          <p className="text-wisdom-muted text-sm leading-relaxed max-w-lg">
            Practice a few sample questions. After you answer, use{" "}
            <span className="text-cyan-300/90 font-medium">Explain</span> to get a concise tutor-style
            explanation (cached so we do not call AI for the same question twice).
          </p>
        </div>

        <QuizPlayer questions={sampleQuestions} title="Sample bank" enableExplain />

        <p className="mt-8 text-center text-xs text-wisdom-muted">
          Real subject banks will replace this demo.{" "}
          <Link href="/academy" className="text-cyan-400 hover:underline">
            Back to Academy
          </Link>
        </p>
      </div>
    </div>
  );
}
