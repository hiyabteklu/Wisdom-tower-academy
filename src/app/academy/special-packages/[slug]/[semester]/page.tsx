import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import AddToCartButton from "@/components/AddToCartButton";
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
        <p className="text-wisdom-muted text-sm mb-6 max-w-xl">
          Complete course materials for {pkg.name}, {sem.label}. Master course notes, question banks, flashcards, and official solved exams.
        </p>

        <div className="mb-8 max-w-md">
          <AddToCartButton packageId={sem.packageId} />
        </div>

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
                className="card-modern group flex flex-col hover:border-violet-400/40 shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                  <SafeCoverImage src={c.image} alt="" />
                </div>
                <div className="p-4 sm:p-5 border-t border-white/8 flex flex-col flex-1">
                  <span className="text-[11px] font-mono text-violet-300/80 mb-1">{c.code}</span>
                  <h2 className="font-display text-base font-bold text-white group-hover:text-violet-200 leading-snug line-clamp-2">
                    {c.title}
                  </h2>
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5 text-xs font-bold text-violet-300">
                    <span>View course hubs</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
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
