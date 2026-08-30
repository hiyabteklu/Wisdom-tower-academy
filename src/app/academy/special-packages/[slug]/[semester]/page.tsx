import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSemester, specialPackages } from "@/data/special-packages";

export function generateStaticParams() {
  const params: { slug: string; semester: string }[] = [];
  for (const pkg of specialPackages) {
    for (const sem of pkg.semesters) {
      params.push({ slug: pkg.slug, semester: sem.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; semester: string }>;
}) {
  const { slug, semester } = await params;
  const found = getSemester(slug, semester);
  if (!found) return { title: "Semester" };
  return {
    title: `${found.sem.label} · ${found.pkg.name}`,
  };
}

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ slug: string; semester: string }>;
}) {
  const { slug, semester } = await params;
  const found = getSemester(slug, semester);
  if (!found) notFound();
  const { pkg, sem } = found;

  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">
          {pkg.name} · {pkg.yearLabel}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
          {sem.label}
        </h1>
        <p className="text-wisdom-muted mb-10">
          {sem.courses.length > 0
            ? "Select a course to open its materials."
            : "Course list for this semester will appear here when published."}
        </p>

        {sem.courses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 p-8 text-center text-wisdom-muted">
            Second semester courses are not listed yet. Send the official table and we'll add
            them here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sem.courses.map((course) => (
              <Link
                key={course.code}
                href={`/academy/special-packages/${pkg.slug}/${sem.id}/${course.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card hover:border-amber-400/40 transition-all"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-violet-900/80 via-wisdom-navy to-amber-900/40">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="font-mono text-lg md:text-xl font-bold text-white/90 tracking-wide">
                      {course.code}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070c16] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-4 border-t border-white/8">
                  <p className="text-[11px] font-mono text-violet-300/90 mb-1">{course.code}</p>
                  <h2 className="font-display text-base font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {course.title}
                  </h2>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-400/90">
                    Open course
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-10 text-sm text-wisdom-muted">
          <Link
            href={`/academy/special-packages/${pkg.slug}`}
            className="text-amber-400 hover:underline"
          >
            ← {pkg.name}
          </Link>
        </p>
      </div>
    </div>
  );
}
