import { notFound } from "next/navigation";
import { getGrade, grades } from "@/data/academy";
import { subjectsForGrade, getGradeSubject } from "@/data/grade-subjects";
import { packageIdForGrade } from "@/data/packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";
import { BadgeCheck } from "lucide-react";

export function generateStaticParams() {
  const params: { grade: string; subject: string }[] = [];
  for (const g of grades) {
    for (const s of subjectsForGrade(g.id)) {
      params.push({ grade: g.id, subject: s.id });
    }
  }
  return params;
}

export default async function GradeSubjectPage({
  params,
}: {
  params: Promise<{ grade: string; subject: string }>;
}) {
  const { grade: gradeId, subject: subjectId } = await params;
  const grade = getGrade(gradeId);
  const subject = getGradeSubject(gradeId, subjectId);

  if (!grade || !subject) notFound();

  const packageId = packageIdForGrade(grade.id);
  const scopePath = `grade/${grade.id}/${subject.id}`;
  const basePath = `/academy/grades/${grade.id}/${subject.id}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/grades/${grade.id}`} />

        <div className="max-w-2xl mx-auto mb-8 animate-fade-up">
          <div className="rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
            <div className="px-5 py-6 sm:px-8 sm:py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300">
                <GradeSubjectIcon name={subject.icon} className="w-7 h-7" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-2">
                {grade.label} · Subject
              </p>
              <h1 className="inline-flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                <BadgeCheck
                  className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-sky-400"
                  aria-label="Verified"
                />
                {subject.name}
              </h1>
              {subject.hint ? (
                <p className="mt-2 text-sm text-wisdom-muted">{subject.hint}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <AcademicResultSaver
            scopeId={`grade-${grade.id}-${subject.id}`}
            scopeLabel={`${grade.label} · ${subject.name}`}
            accent={grade.accent}
            scopePath={scopePath}
          />
        </div>

        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-4 text-center sm:text-left">
          Learning hubs
        </p>

        <ResourceHubGrid
          basePath={basePath}
          packageId={packageId}
          scopePath={scopePath}
        />
      </div>
    </div>
  );
}
