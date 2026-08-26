import Link from "next/link";
import { grades } from "@/data/academy";
import { ChevronRight } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

export default function GradesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-12 md:mb-16 animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-sky-400/90 mb-3">
            Secondary path
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Grade <span className="text-sky-400">9–12</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-xl leading-relaxed">
            Choose your grade. Each level opens the same resource hubs — books, references, videos,
            flashcards, question banks, and exams.
          </p>
        </div>

        <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 stagger-children">
          {grades.map((grade) => (
            <Link
              key={grade.id}
              href={`/academy/grades/${grade.id}`}
              className={`card-3d group relative overflow-hidden rounded-3xl border bg-wisdom-card ${grade.ring} p-0`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${grade.gradient} opacity-80`} />
              <div className="relative p-7 md:p-8 flex items-center gap-5">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-wisdom-dark/50 font-display text-2xl font-extrabold ${grade.accent}`}
                >
                  {grade.short}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={`font-display text-2xl font-bold mb-1 ${grade.accent}`}>
                    {grade.label}
                  </h2>
                  <p className="text-sm text-wisdom-muted leading-relaxed">{grade.subtitle}</p>
                </div>
                <ChevronRight
                  className={`w-6 h-6 shrink-0 text-wisdom-muted transition-all duration-300 group-hover:translate-x-1 ${grade.accent}`}
                />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-wisdom-muted">
          Same structure in every grade — only the content depth changes.
        </p>
      </div>
    </div>
  );
}
