import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrade, grades, resourceHubs } from "@/data/academy";
import { packageIdForGrade } from "@/data/packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import {
  BookOpen,
  Library,
  Video,
  Layers,
  ListChecks,
  ClipboardList,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen className="w-7 h-7" />,
  library: <Library className="w-7 h-7" />,
  video: <Video className="w-7 h-7" />,
  layers: <Layers className="w-7 h-7" />,
  list: <ListChecks className="w-7 h-7" />,
  clipboard: <ClipboardList className="w-7 h-7" />,
};

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

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/grades" />

        {/* Centered 16:9 hero — same pattern as freshman subjects */}
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

        <div className="max-w-2xl mx-auto mb-12">
          <AcademicResultSaver
            scopeId={`grade-${grade.id}`}
            scopeLabel={grade.label}
            accent={grade.accent}
          />
        </div>

        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-4 text-center sm:text-left">
          Learning hubs
        </p>

        <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
          {resourceHubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/academy/grades/${grade.id}/${hub.id}`}
              className={`card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card p-6 md:p-7 hover:border-white/25 shadow-lg ${hub.glow}`}
            >
              <div
                className={`mb-5 inline-flex p-3.5 rounded-2xl border border-white/10 bg-wisdom-dark/60 ${hub.accent}`}
              >
                {iconMap[hub.icon]}
              </div>
              <h2 className="font-display text-xl font-bold mb-2 group-hover:text-white transition-colors">
                {hub.name}
              </h2>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-5">{hub.description}</p>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${hub.accent}`}>
                Open
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 pt-10 border-t border-white/10">
          <p className="text-sm text-wisdom-muted mb-4 font-medium text-center sm:text-left">Switch grade</p>
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
