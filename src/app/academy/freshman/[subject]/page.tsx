import { notFound } from "next/navigation";
import Link from "next/link";
import { freshmanSubjects, getFreshmanSubject } from "@/data/freshman";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import { BadgeCheck } from "lucide-react";

export function generateStaticParams() {
  return freshmanSubjects.map((s) => ({ subject: s.id }));
}

export default async function FreshmanSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;
  const subject = getFreshmanSubject(subjectId);

  if (!subject) notFound();

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/freshman" />

        <div className="max-w-2xl mx-auto mb-8 animate-fade-up">
          <div className="rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
            <div className="relative aspect-video w-full bg-wisdom-navy">
              <SubjectHeroImage src={subject.image} alt={subject.name} />
            </div>
            <div className="px-5 py-4 sm:px-6 sm:py-5 text-center border-t border-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-2">
                Freshman · Subject
              </p>
              <h1 className="inline-flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-sky-400" aria-label="Verified" />
                {subject.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <AcademicResultSaver
            scopeId={`freshman-${subject.id}`}
            scopeLabel={`Freshman · ${subject.name}`}
            accent="text-purple-400"
          />
        </div>

        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-4 text-center sm:text-left">
          Learning hubs
        </p>

        <ResourceHubGrid basePath={`/academy/freshman/${subject.id}`} />

        <div className="mt-14 pt-10 border-t border-white/10">
          <p className="text-sm text-wisdom-muted mb-4 font-medium text-center sm:text-left">
            Other freshman subjects
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {freshmanSubjects.map((s) => (
              <Link
                key={s.id}
                href={`/academy/freshman/${s.id}`}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  s.id === subject.id
                    ? "text-purple-400 border-purple-400/50 bg-purple-500/10"
                    : "border-white/10 text-wisdom-muted hover:border-white/25 hover:text-white"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
