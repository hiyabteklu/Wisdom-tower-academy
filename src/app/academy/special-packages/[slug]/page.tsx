import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSpecialPackage, specialPackages } from "@/data/special-packages";

export function generateStaticParams() {
  return specialPackages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getSpecialPackage(slug);
  return {
    title: pkg ? `${pkg.name} · Special Packages` : "Special Package",
  };
}

export default async function SpecialPackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getSpecialPackage(slug);
  if (!pkg) notFound();

  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">
          Special packages · {pkg.yearLabel}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3">
          {pkg.name}
        </h1>
        <p className="text-wisdom-muted mb-10 max-w-2xl">{pkg.blurb}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pkg.semesters.map((sem) => (
            <Link
              key={sem.id}
              href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
              className="group block overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card hover:border-violet-400/40 transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sem.image}
                  alt={sem.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070c16]/95 via-[#070c16]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-1">
                    {sem.label}
                  </h2>
                  <p className="text-sm text-wisdom-muted mb-3">
                    {sem.courses.length > 0
                      ? `${sem.courses.length} courses`
                      : "Course list coming soon"}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300">
                    Open semester
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-wisdom-muted">
          <Link href="/academy/special-packages" className="text-amber-400 hover:underline">
            ← All special packages
          </Link>
        </p>
      </div>
    </div>
  );
}
