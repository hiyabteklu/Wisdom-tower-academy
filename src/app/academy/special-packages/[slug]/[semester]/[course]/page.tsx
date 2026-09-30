import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, specialPackages } from "@/data/special-packages";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import { eceScope } from "@/lib/content";

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
  // Must match hub pages + admin Content panel scope_path
  const scopePath = eceScope(sem.id, course.slug);

  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/special-packages/${pkg.slug}/${sem.id}`} />

        <div className="max-w-2xl mx-auto mb-8 text-center animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90 mb-1.5">
            {pkg.name} · {sem.shortLabel}
          </p>
          <p className="font-mono text-xs text-wisdom-muted mb-1">{course.code}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {course.title}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <AcademicResultSaver
            scopeId={`special-${pkg.slug}-${sem.id}-${course.slug}`}
            scopeLabel={`${course.code} · ${course.title}`}
            accent="text-violet-400"
            scopePath={scopePath}
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
