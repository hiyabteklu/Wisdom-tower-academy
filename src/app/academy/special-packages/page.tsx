import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import CategoryBackButton from "@/components/CategoryBackButton";
import { specialPackages } from "@/data/special-packages";

export const metadata = {
  title: "Special Packages · Wisdom Tower Academy",
  description:
    "Department track packages: Electrical & Computer Engineering by semester",
};

export default function SpecialPackagesPage() {
  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryBackButton fallback="/learning" />

        <header className="text-center mb-8 md:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/90 mb-3">
            Department tracks
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Special packages
          </h1>
        </header>

        <div className="space-y-6">
          {specialPackages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/academy/special-packages/${pkg.slug}`}
              className="card-modern group block hover:border-violet-400/40 shadow-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                <SafeCoverImage src={pkg.image} alt={pkg.name} />
              </div>
              <div className="p-5 sm:p-6 border-t border-white/8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300">
                    <Layers className="w-3.5 h-3.5" />
                    {pkg.yearLabel}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-violet-200 transition-colors">
                  {pkg.name}
                </h2>
                <div className="mt-5 pt-4 border-t border-white/8">
                  <span className="btn-primary w-full text-center">
                    <span>Open Department Track</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-wisdom-muted">
          <Link href="/academy" className="text-amber-400 hover:underline">
            ← Back to Academy
          </Link>
          {" · "}
          <Link href="/packages" className="text-cyan-400 hover:underline">
            All packages
          </Link>
        </p>
      </div>
    </div>
  );
}
