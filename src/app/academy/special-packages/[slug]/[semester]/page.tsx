import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
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
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-8">
          {sem.label}
        </h1>

        {sem.courses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 p-8 text-center text-wisdom-muted">
            Courses for this semester will appear here when published.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sem.courses.map((c) => (
              <Link
                key={c.code}
                href={`/academy/special-packages/${pkg.slug}/${sem.id}/${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card hover:border-violet-400/40 transition-all"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                  <SafeCoverImage src={c.image} alt="" />
                </div>
                <div className="px-4 py-3.5 border-t border-white/8">
                  <p className="text-[10px] font-mono text-violet-300/80 mb-0.5">{c.code}</p>
                  <h2 className="flex items-start gap-1.5 font-display text-sm sm:text-base font-bold text-white group-hover:text-violet-200 leading-snug">
                    <BadgeCheck className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" aria-hidden />
                    <span className="line-clamp-2">{c.title}</span>
                  </h2>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-400/90">
                    Open
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
