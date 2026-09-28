import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  freshmanSubjects,
  getFreshmanSubject,
  FRESHMAN_SUBJECT_ALIASES,
} from "@/data/freshman";
import { getResource, resourceHubs } from "@/data/academy";
import FreshmanPackageGate from "@/components/FreshmanPackageGate";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import CollapsibleSubjectOverview from "@/components/CollapsibleSubjectOverview";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";

export function generateStaticParams() {
  const params: { subject: string }[] = [];
  for (const s of freshmanSubjects) {
    params.push({ subject: s.id });
  }
  for (const r of resourceHubs) {
    params.push({ subject: r.id });
  }
  return params;
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

  // If user navigated to /academy/freshman/books, /academy/freshman/flashcards, etc.
  const resource = getResource(subjectId);
  if (resource) {
    return (
      <FreshmanPackageGate>
        <div className="relative min-h-[80vh]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-purple-500/25 via-pink-500/10 to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <CategoryBackButton fallback="/academy/freshman" />

            <div className="max-w-2xl mx-auto mb-10 text-center animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 mb-2">
                Freshman Program
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                <span className={resource.accent}>{resource.name}</span>
              </h1>
              <p className="text-sm text-wisdom-muted max-w-lg mx-auto">
                {resource.description}. Choose any freshman course below to open official {resource.name.toLowerCase()}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {freshmanSubjects.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/academy/freshman/${sub.id}/${resource.id}`}
                  className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-white/10 bg-wisdom-card hover:border-purple-400/40 hover:bg-white/[0.04] transition-all shadow-lg"
                >
                  <div className="min-w-0 pr-3">
                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-wisdom-muted capitalize">Freshman course</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20 group-hover:bg-purple-400/20 shrink-0 transition-colors">
                    Open →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </FreshmanPackageGate>
    );
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
                  <div className="max-w-md mx-auto">
                    <CollapsibleSubjectOverview description={subject.description} accent="text-purple-300" />
                  </div>
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
