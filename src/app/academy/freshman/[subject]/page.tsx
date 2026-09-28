import { notFound, redirect } from "next/navigation";
import {
  freshmanSubjects,
  getFreshmanSubject,
  FRESHMAN_SUBJECT_ALIASES,
} from "@/data/freshman";
import FreshmanPackageGate from "@/components/FreshmanPackageGate";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";

export function generateStaticParams() {
  return freshmanSubjects.map((s) => ({ subject: s.id }));
}

export default async function FreshmanSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;

  if (FRESHMAN_SUBJECT_ALIASES[subjectId]) {
    redirect(`/academy/freshman/${FRESHMAN_SUBJECT_ALIASES[subjectId]}`);
  }

  const subject = getFreshmanSubject(subjectId);
  if (!subject) notFound();

  const scopePath = `freshman/${subject.id}`;

  return (
    <FreshmanPackageGate>
      <div className="relative min-h-[80vh]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <CategoryBackButton fallback="/academy/freshman" />

          <div className="max-w-2xl mx-auto mb-8 animate-fade-up">
            <div className="card-modern shadow-xl shadow-black/30">
              <div className="relative aspect-video w-full bg-wisdom-navy">
                <SubjectHeroImage src={subject.image} alt={subject.name} />
              </div>
              <div className="p-5 sm:p-6 text-center border-t border-white/8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300 mb-1.5">
                  Freshman Subject
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {subject.name}
                </h1>
                {subject.description && (
                  <p className="mt-2 text-xs sm:text-sm text-wisdom-muted max-w-md mx-auto">
                    {subject.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-10">
            <AcademicResultSaver
              scopeId={`freshman-${subject.id}`}
              scopeLabel={`Freshman · ${subject.name}`}
              accent="text-purple-400"
              scopePath={scopePath}
            />
          </div>

          <ResourceHubGrid
            basePath={`/academy/freshman/${subject.id}`}
            packageId="freshman"
            scopePath={scopePath}
          />
        </div>
      </div>
    </FreshmanPackageGate>
  );
}
