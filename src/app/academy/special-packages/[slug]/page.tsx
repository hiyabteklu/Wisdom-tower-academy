import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryBackButton from "@/components/CategoryBackButton";
import SpecialSemesterCard from "@/components/SpecialSemesterCard";
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
        <CategoryBackButton fallback="/academy/special-packages" />

        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">
          Special packages · {pkg.yearLabel}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
          {pkg.name}
        </h1>
        <p className="text-wisdom-muted text-sm mb-8 max-w-xl">{pkg.blurb}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {pkg.semesters.map((sem) => (
            <SpecialSemesterCard key={sem.id} pkg={pkg} sem={sem} />
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
