import { notFound } from "next/navigation";
import { remedialSubjects, getRemedialSubject } from "@/data/remedial";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import { BadgeCheck } from "lucide-react";

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
          <div className="rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
            <div className="relative aspect-video w-full bg-wisdom-navy">
              <SubjectHeroImage src={subject.image} alt={subject.name} />
            </div>
            <div className="px-5 py-4 sm:px-6 sm:py-5 text-center border-t border-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-2">
                Remedial · Subject
              </p>
              <h1 className="inline-flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                <BadgeCheck
                  className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-sky-400"
                  aria-label="Verified"
                />
                {subject.name}
              </h1>
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
