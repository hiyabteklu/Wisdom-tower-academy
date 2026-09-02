import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import { formatEtb, isPackageFreeForLoggedIn } from "@/data/packages";
import { specialPackages } from "@/data/special-packages";

export const metadata = {
  title: "Special Packages · Wisdom Tower Academy",
  description:
    "Department track packages — Electrical & Computer Engineering by semester",
};

export default function SpecialPackagesPage() {
  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category header — outside any card */}
        <header className="text-center mb-8 md:mb-10">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300/90 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Department tracks
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Special packages
          </h1>
          <p className="mt-3 text-wisdom-muted max-w-lg mx-auto leading-relaxed text-sm md:text-base">
            Open a department, then choose a semester. Each semester is purchased separately.
          </p>
        </header>

        {/* Department cards only — 16:9 cover */}
        <div className="space-y-6">
          {specialPackages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/academy/special-packages/${pkg.slug}`}
              className="group block overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card hover:border-violet-400/40 transition-all shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                <SafeCoverImage src={pkg.image} alt="" />
              </div>
              <div className="px-4 py-4 sm:px-5 sm:py-5 border-t border-white/8">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80 mb-1">
                  {pkg.yearLabel}
                </p>
                <h2 className="flex items-center gap-1.5 font-display text-lg sm:text-xl font-bold text-white group-hover:text-violet-200 transition-colors">
                  <BadgeCheck className="w-5 h-5 shrink-0 text-sky-400" aria-hidden />
                  <span>{pkg.name}</span>
                </h2>
                <p className="mt-2 text-sm text-wisdom-muted leading-relaxed">{pkg.blurb}</p>
                <p className="mt-2 text-sm font-semibold text-amber-300">
                  {pkg.semesters.some((s) => isPackageFreeForLoggedIn(s.packageId))
                    ? "Free for signed-in users"
                    : `${formatEtb(pkg.semesterPriceEtb)} per semester`}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-400/90">
                  View semesters
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
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
