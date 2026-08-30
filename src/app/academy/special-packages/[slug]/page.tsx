import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import AddToCartButton from "@/components/AddToCartButton";
import { formatEtb } from "@/data/packages";
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
        <p className="text-wisdom-muted text-sm mb-6 max-w-xl">{pkg.blurb}</p>

        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 sm:p-5 mb-10 max-w-xl">
          <p className="text-sm font-semibold text-amber-200 mb-1">Pricing</p>
          <p className="text-white text-sm">
            Full year (both semesters):{" "}
            <span className="font-bold text-amber-300">{formatEtb(pkg.fullPriceEtb)}</span>
          </p>
          <p className="text-white text-sm mt-1">
            One semester:{" "}
            <span className="font-bold text-amber-300">{formatEtb(pkg.semesterPriceEtb)}</span> each
          </p>
          <div className="mt-4">
            <AddToCartButton packageId={pkg.fullPackageId} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {pkg.semesters.map((sem) => (
            <div
              key={sem.id}
              className="flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card"
            >
              <Link
                href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
                className="group flex flex-col flex-1"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                  <SafeCoverImage src={sem.image} alt="" />
                </div>
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8">
                  <h2 className="flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-white group-hover:text-violet-200">
                    <BadgeCheck className="w-4 h-4 shrink-0 text-sky-400" aria-hidden />
                    {sem.label}
                  </h2>
                  <p className="mt-1 text-xs text-wisdom-muted">
                    {sem.courses.length > 0
                      ? `${sem.courses.length} courses · ${formatEtb(sem.priceEtb)}`
                      : "Coming soon"}
                  </p>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-violet-400/90">
                    Open semester
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
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
