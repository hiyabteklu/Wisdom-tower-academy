import { remedialSubjects } from "@/data/remedial";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectCard from "@/components/SubjectCard";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import { Target } from "lucide-react";

export default function RemedialPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-10 md:mb-12 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-wisdom-card text-amber-400">
              <Target className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Catch-up pathway
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-amber-400">Remedial</span> subjects
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            {remedialSubjects.length} core subjects with the same learning hubs used everywhere —
            books, short notes, flashcards, question banks and exams.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <PackageOfferBanner packageId="remedial" />
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <BranchLeaderboard branchName="Remedial" accent="text-amber-400" />
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted">
            Subjects
          </p>
        </div>

        <div className="perspective-scene grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7 stagger-children">
          {remedialSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              href={`/academy/remedial/${subject.id}`}
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
