import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { getCourse, specialPackages } from "@/data/special-packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";

export function generateStaticParams() {
  const params: { slug: string; semester: string; course: string }[] = [];
  for (const pkg of specialPackages) {
    for (const sem of pkg.semesters) {
      for (const c of sem.courses) {
        params.push({ slug: pkg.slug, semester: sem.id, course: c.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; semester: string; course: string }>;
}) {
  const { slug, semester, course } = await params;
  const found = getCourse(slug, semester, course);
  if (!found) return { title: "Course" };
  return {
    title: `${found.course.code} · ${found.course.title}`,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string; semester: string; course: string }>;
}) {
  const { slug, semester, course: courseSlug } = await params;
  const found = getCourse(slug, semester, courseSlug);
  if (!found) notFound();
  const { pkg, sem, course } = found;

  const basePath = `/academy/special-packages/${pkg.slug}/${sem.id}/${course.slug}`;

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/special-packages/${pkg.slug}/${sem.id}`} />

        <div className="max-w-2xl mx-auto mb-8 animate-fade-up">
          <div className="rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
            <div className="relative aspect-video w-full bg-wisdom-navy">
              <SubjectHeroImage src={course.image} alt={course.title} />
            </div>
            <div className="px-5 py-4 sm:px-6 sm:py-5 text-center border-t border-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/90 mb-2">
                {pkg.name} · {sem.shortLabel}
              </p>
              <p className="font-mono text-xs text-wisdom-muted mb-1">{course.code}</p>
              <h1 className="inline-flex items-center justify-center gap-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                <BadgeCheck className="w-6 h-6 shrink-0 text-sky-400" aria-label="Verified" />
                {course.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <AcademicResultSaver
            scopeId={`special-${pkg.slug}-${sem.id}-${course.slug}`}
            scopeLabel={`${course.code} · ${course.title}`}
            accent="text-violet-400"
          />
        </div>

        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-4 text-center sm:text-left">
          Learning hubs
        </p>

        <ResourceHubGrid basePath={basePath} />

        <div className="mt-14 pt-10 border-t border-white/10">
          <p className="text-sm text-wisdom-muted mb-4 font-medium">Other courses this semester</p>
          <div className="flex flex-wrap gap-2">
            {sem.courses.map((c) => (
              <Link
                key={c.slug}
                href={`/academy/special-packages/${pkg.slug}/${sem.id}/${c.slug}`}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  c.slug === course.slug
                    ? "text-violet-300 border-violet-400/50 bg-violet-500/10"
                    : "border-white/10 text-wisdom-muted hover:border-white/25 hover:text-white"
                }`}
              >
                {c.code}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
