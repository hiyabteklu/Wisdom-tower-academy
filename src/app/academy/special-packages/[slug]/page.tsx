import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import AddToCartButton from "@/components/AddToCartButton";
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
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
          {pkg.name}
        </h1>
        <p className="text-wisdom-muted text-sm mb-8 max-w-xl">{pkg.blurb}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {pkg.semesters.map((sem) => (
            <div
              key={sem.id}
              className="card-modern flex flex-col shadow-xl"
            >
              <Link
                href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
                className="group flex flex-col flex-1"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                  <SafeCoverImage src={sem.image} alt={sem.label} />
                </div>
                <div className="p-5 border-t border-white/8 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-violet-300 mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{sem.courses.length} courses</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-violet-200 transition-colors">
                    {sem.label}
                  </h2>
                  <div className="mt-5 pt-3 border-t border-white/6">
                    <span className="btn-primary w-full text-center">
                      <span>Open {sem.label}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
              <div className="px-5 pb-5 pt-1">
                <AddToCartButton packageId={sem.packageId} variant="ghost" />
              </div>
            </div>
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
