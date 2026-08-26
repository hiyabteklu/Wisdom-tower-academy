import { freshmanSubjects } from "@/data/freshman";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectCard from "@/components/SubjectCard";
import { GraduationCap } from "lucide-react";

export default function FreshmanPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-purple-500/25 via-pink-500/10 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-10 md:mb-14 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/30 bg-wisdom-card text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              First-year pathway
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-purple-400">Freshman</span> subjects
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            Core first-year courses. Open any subject for materials and support.
          </p>
          <p className="mt-2 text-sm text-purple-400/90 font-medium">
            {freshmanSubjects.length} subjects
          </p>
        </div>

        <div className="perspective-scene grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 stagger-children">
          {freshmanSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              href={`/academy/freshman/${subject.id}`}
              name={subject.name}
              description={subject.description}
              image={subject.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
