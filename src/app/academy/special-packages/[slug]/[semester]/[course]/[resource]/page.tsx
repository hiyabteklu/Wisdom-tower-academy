import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourse, specialPackages } from "@/data/special-packages";
import { getResource, resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import { BookOpen, Construction } from "lucide-react";

export function generateStaticParams() {
  const params: { slug: string; semester: string; course: string; resource: string }[] = [];
  for (const pkg of specialPackages) {
    for (const sem of pkg.semesters) {
      for (const c of sem.courses) {
        for (const r of resourceHubs) {
          params.push({
            slug: pkg.slug,
            semester: sem.id,
            course: c.slug,
            resource: r.id,
          });
        }
      }
    }
  }
  return params;
}

export default async function SpecialCourseResourcePage({
  params,
}: {
  params: Promise<{ slug: string; semester: string; course: string; resource: string }>;
}) {
  const { slug, semester, course: courseSlug, resource: resourceId } = await params;
  const found = getCourse(slug, semester, courseSlug);
  const resource = getResource(resourceId);

  if (!found || !resource) notFound();
  const { pkg, sem, course } = found;
  const courseBase = `/academy/special-packages/${pkg.slug}/${sem.id}/${course.slug}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={courseBase} />

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            {course.code} · Learning hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={`special-${pkg.slug}-${sem.id}-${course.slug}-${resource.id}`}
            scopeLabel={`${course.code} · ${resource.name}`}
            accent={resource.accent}
          />
        </div>

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden">
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Content coming soon</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-8">
              Materials for {resource.name.toLowerCase()} in {course.title} will appear here. Track
              progress above in the meantime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={courseBase}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium hover:border-violet-400/40 hover:text-violet-300 transition-colors"
              >
                All hubs for {course.code}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Request materials
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`${courseBase}/${h.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                h.id === resource.id
                  ? `${h.accent} border-current bg-white/5`
                  : "border-white/10 text-wisdom-muted hover:border-white/20"
              }`}
            >
              {h.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
