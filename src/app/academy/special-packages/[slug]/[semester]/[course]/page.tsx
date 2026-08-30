import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getCourse, specialPackages } from "@/data/special-packages";

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

  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card mb-8">
          <div className="relative aspect-video w-full bg-gradient-to-br from-violet-900/80 via-wisdom-navy to-amber-900/40 flex items-center justify-center">
            <span className="font-mono text-2xl md:text-3xl font-bold text-white tracking-wide">
              {course.code}
            </span>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">
              {pkg.name} · {sem.label}
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">
              {course.title}
            </h1>
            <p className="font-mono text-sm text-amber-400/90 mb-6">{course.code}</p>
            <div className="rounded-xl border border-white/10 bg-wisdom-dark/50 p-5 flex gap-3">
              <BookOpen className="w-5 h-5 text-violet-300 shrink-0 mt-0.5" />
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Course materials, quizzes, and notes will appear here. Content can be added course by
                course without changing this structure.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-wisdom-muted">
          <Link
            href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
            className="text-amber-400 hover:underline"
          >
            ← {sem.label} courses
          </Link>
        </p>
      </div>
    </div>
  );
}
