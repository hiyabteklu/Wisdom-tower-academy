import { notFound } from "next/navigation";
import { remedialSubjects, getRemedialSubject } from "@/data/remedial";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import CollapsibleSubjectOverview from "@/components/CollapsibleSubjectOverview";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";

export function generateStaticParams() {
  return remedialSubjects.map((s) => ({ subject: s.id }));
}

export default async function RemedialSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;
  const subject = getRemedialSubject(subjectId);
  if (!subject) notFound();

  const scopePath = `remedial/${subject.id}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/remedial" />

        <div className="max-w-2xl mx-auto mb-8 animate-fade-up">
          <div className="card-modern shadow-xl shadow-black/30">
            <div className="relative aspect-video w-full bg-wisdom-navy">
              <SubjectHeroImage src={subject.image} alt={subject.name} />
            </div>
            <div className="p-5 sm:p-6 text-center border-t border-white/8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300 mb-1.5">
                Remedial Subject
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {subject.name}
              </h1>
              {subject.description && (
                <div className="max-w-md mx-auto">
                  <CollapsibleSubjectOverview description={subject.description} accent="text-amber-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <AcademicResultSaver
            scopeId={`remedial-${subject.id}`}
            scopeLabel={`Remedial · ${subject.name}`}
            accent="text-amber-400"
            scopePath={scopePath}
          />
        </div>

        <ResourceHubGrid
          basePath={`/academy/remedial/${subject.id}`}
          packageId="remedial"
          scopePath={scopePath}
        />
      </div>
    </div>
  );
}
