import { notFound } from "next/navigation";
import Link from "next/link";
import { remedialSubjects, getRemedialSubject } from "@/data/remedial";
import { getResource, resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import CollapsibleSubjectOverview from "@/components/CollapsibleSubjectOverview";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";

export function generateStaticParams() {
  const params: { subject: string }[] = [];
  for (const s of remedialSubjects) {
    params.push({ subject: s.id });
  }
  for (const r of resourceHubs) {
    params.push({ subject: r.id });
  }
  return params;
}

export default async function RemedialSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;

  // If user navigated to /academy/remedial/books, /academy/remedial/short-notes, etc.
  const resource = getResource(subjectId);
  if (resource) {
    return (
      <div className="relative min-h-[80vh]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <CategoryBackButton fallback="/academy/remedial" />

          <div className="max-w-2xl mx-auto mb-10 text-center animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              Remedial Program
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              <span className={resource.accent}>{resource.name}</span>
            </h1>
            <p className="text-sm text-wisdom-muted max-w-lg mx-auto">
              {resource.description}. Choose any remedial subject below to open official {resource.name.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {remedialSubjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/academy/remedial/${sub.id}/${resource.id}`}
                className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-white/10 bg-wisdom-card hover:border-amber-400/40 hover:bg-white/[0.04] transition-all shadow-lg"
              >
                <div className="min-w-0 pr-3">
                  <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-wisdom-muted">Remedial Curriculum</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 group-hover:bg-amber-400/20 shrink-0 transition-colors">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
