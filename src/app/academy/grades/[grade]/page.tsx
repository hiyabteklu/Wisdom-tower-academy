import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrade, grades } from "@/data/academy";
import { packageIdForGrade } from "@/data/packages";
import { streamsForGrade } from "@/data/grade-subjects";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";
import { BadgeCheck } from "lucide-react";

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

  const packageId = packageIdForGrade(grade.id);
  const scopeId = `grade-${grade.id}`;
  const streams = streamsForGrade(grade.id);

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/grades" />

        <div className="max-w-2xl mx-auto mb-8 animate-fade-up">
          <div className="rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
            <div className="relative aspect-video w-full bg-wisdom-navy">
              <SubjectHeroImage src={grade.image} alt={grade.label} />
            </div>
            <div className="px-5 py-4 sm:px-6 sm:py-5 text-center border-t border-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-wisdom-muted mb-2">
                Grade pathway
              </p>
              <h1 className="inline-flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-sky-400" aria-label="Verified" />
                <span className={grade.accent}>{grade.label}</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <PackageOfferBanner packageId={packageId} />
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <BranchLeaderboard branchName={grade.label} scopeId={scopeId} accent={grade.accent} />
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <AcademicResultSaver
            scopeId={scopeId}
            scopeLabel={grade.label}
            accent={grade.accent}
          />
        </div>

        <div className="mb-4 text-center sm:text-left">
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-1">
            Subjects by stream
          </p>
          <p className="text-sm text-wisdom-muted max-w-2xl">
            Ethiopian secondary structure: natural science and social science focus. Icons mark each
            subject — no placeholder photos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {streams.map((stream) => (
            <section
              key={stream.id}
              className={`rounded-3xl border ${stream.border} bg-wisdom-card/90 overflow-hidden shadow-card-3d`}
            >
              <div className="px-5 sm:px-6 py-4 border-b border-white/10">
                <h2 className={`font-display text-xl font-bold ${stream.accent}`}>{stream.label}</h2>
                <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">{stream.blurb}</p>
              </div>
              <ul className="divide-y divide-white/[0.06]">
                {stream.subjects.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex items-start gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-wisdom-dark/50 ${stream.accent}`}
                    >
                      <GradeSubjectIcon name={sub.icon} className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm sm:text-base">{sub.name}</p>
                      {sub.hint && (
                        <p className="text-xs text-wisdom-muted mt-0.5 leading-relaxed">{sub.hint}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-10 border-t border-white/10">
          <p className="text-sm text-wisdom-muted mb-4 font-medium text-center sm:text-left">
            Switch grade
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {grades.map((g) => (
              <Link
                key={g.id}
                href={`/academy/grades/${g.id}`}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
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
