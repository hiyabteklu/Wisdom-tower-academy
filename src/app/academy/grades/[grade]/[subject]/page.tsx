import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrade, getResource, grades, resourceHubs } from "@/data/academy";
import { subjectsForGrade, getGradeSubject } from "@/data/grade-subjects";
import { packageIdForGrade } from "@/data/packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";

export function generateStaticParams() {
  const params: { grade: string; subject: string }[] = [];
  for (const g of grades) {
    for (const s of subjectsForGrade(g.id)) {
      params.push({ grade: g.id, subject: s.id });
    }
    for (const r of resourceHubs) {
      params.push({ grade: g.id, subject: r.id });
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
  if (!grade) notFound();

  // If user requested a resource hub (e.g. /academy/grades/9/books)
  const resource = getResource(subjectId);
  if (resource) {
    const subjects = subjectsForGrade(grade.id);
    return (
      <div className="relative min-h-[80vh]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <CategoryBackButton fallback={`/academy/grades/${grade.id}`} />

          <div className="max-w-2xl mx-auto mb-10 text-center animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
              {grade.label} Curriculum
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              <span className={resource.accent}>{resource.name}</span>
            </h1>
            <p className="text-sm text-wisdom-muted max-w-lg mx-auto">
              {resource.description}. Select a subject below to access the full {resource.name.toLowerCase()} catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/academy/grades/${grade.id}/${sub.id}/${resource.id}`}
                className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-white/10 bg-wisdom-card hover:border-sky-400/40 hover:bg-white/[0.04] transition-all shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
                    <GradeSubjectIcon name={sub.icon} className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-wisdom-muted">Open {resource.name}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/20 group-hover:bg-sky-400/20 transition-colors">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const subject = getGradeSubject(gradeId, subjectId);
  if (!subject) notFound();

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
          <div className="card-modern shadow-xl shadow-black/30">
            <div className="px-5 py-6 sm:px-8 sm:py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300">
                <GradeSubjectIcon name={subject.icon} className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-2">
                {grade.label} Curriculum
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {subject.name}
              </h1>
              {subject.hint ? (
                <p className="mt-2.5 text-sm text-wisdom-muted max-w-md mx-auto">{subject.hint}</p>
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
