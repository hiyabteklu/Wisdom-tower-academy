import Link from "next/link";
import { grades } from "@/data/academy";
import { ArrowRight } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

const gradeDescriptions: Record<string, string> = {
  "grade-9": "Secondary foundation year. Core sciences, mathematics, language, and foundational problem-solving strategies.",
  "grade-10": "National assessment milestone. Comprehensive curriculum review, practice banks, and preparation for stream transition.",
  "grade-11": "Specialized branch studies. In-depth Natural Science and Social Science subject tracks with advanced conceptual depth.",
  "grade-12": "University entrance exam intensive. Matriculation drills, full-length timed mock exams, and complete syllabus mastery.",
};

export default function GradesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-10 animate-fade-up text-center sm:text-left">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-sky-400/90 mb-3">
            Secondary Curriculum
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Grade <span className="text-sky-400">9–12</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-xl leading-relaxed mx-auto sm:mx-0">
            Choose your academic grade. Each level features complete course books, chapter short notes, practice question banks, and timed exams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {grades.map((grade) => (
            <article
              key={grade.id}
              className={`card-modern group flex flex-col ${grade.ring} shadow-lg shadow-black/25`}
            >
              <Link href={`/academy/grades/${grade.id}`} className="relative aspect-video w-full overflow-hidden bg-wisdom-navy block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={grade.image}
                  alt={grade.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </Link>
              <div className="p-5 sm:p-6 flex flex-col flex-1 border-t border-white/8">
                <h2
                  className={`font-display text-xl sm:text-2xl font-bold mb-2 ${grade.accent}`}
                >
                  {grade.label}
                </h2>
                <p className="text-sm text-slate-300/90 leading-relaxed mb-5 flex-1">
                  {gradeDescriptions[grade.id] || "Complete syllabus learning hubs, question banks, and timed exams."}
                </p>
                <div className="mt-auto pt-2">
                  <Link
                    href={`/academy/grades/${grade.id}`}
                    className="btn-primary w-full text-center"
                  >
                    <span>Enter {grade.label}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-wisdom-muted">
          Leaderboards and academic performance tracking live inside each specific grade hub.
        </p>
      </div>
    </div>
  );
}
