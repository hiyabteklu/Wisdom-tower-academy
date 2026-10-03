import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrade, grades } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import GradeStreamsPanel from "@/components/GradeStreamsPanel";
import CollapsibleProgress from "@/components/CollapsibleProgress";

export function generateStaticParams() {
  return grades.map((g) => ({ grade: g.id }));
}

export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade: gradeId } = await params;
  const grade = getGrade(gradeId);

  if (!grade) notFound();

  const scopeId = `grade-${grade.id}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <CategoryBackButton fallback="/academy/grades" />

        <div className="mb-4 sm:mb-5 animate-fade-up">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-wisdom-muted mb-0.5">
                Secondary Curriculum
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                <span className={grade.accent}>{grade.label}</span>
              </h1>
            </div>
            <p className="text-xs text-wisdom-muted hidden sm:block">
              Official syllabus subjects, question banks, flashcards & exams
            </p>
          </div>
        </div>

        <div className="w-full mb-5">
          <BranchLeaderboard branchName={grade.label} scopeId={scopeId} accent={grade.accent} />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-wisdom-muted">
            Subjects
          </p>
          <span className="text-[11px] text-wisdom-muted">Select a subject</span>
        </div>

        <GradeStreamsPanel gradeId={grade.id} />

        <div className="w-full mt-6 sm:mt-8">
          <CollapsibleProgress
            scopeId={scopeId}
            scopeLabel={grade.label}
            accent={grade.accent}
            defaultOpen={false}
          />
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
          <p className="text-xs sm:text-sm text-wisdom-muted mb-3 font-medium text-center sm:text-left">
            Switch grade
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {grades.map((g) => (
              <Link
                key={g.id}
                href={`/academy/grades/${g.id}`}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  g.id === grade.id
                    ? `${g.accent} border-current bg-white/5`
                    : "border-white/10 text-wisdom-muted hover:border-white/25 hover:text-white"
                }`}
              >
                {g.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
