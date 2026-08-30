import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { SPECIAL_PACKAGES_HUB_IMAGE, specialPackages } from "@/data/special-packages";

export const metadata = {
  title: "Special Packages · Wisdom Tower Academy",
  description: "Department track packages — Electrical & Computer Engineering and more",
};

export default function SpecialPackagesPage() {
  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300/90 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Special packages
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Department tracks
          </h1>
          <p className="mt-3 text-wisdom-muted max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Open a department, pick a semester, then each course.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
          {specialPackages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/academy/special-packages/${pkg.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card hover:border-violet-400/40 transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pkg.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0";
                  }}
                />
              </div>
              <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80 mb-1">
                  {pkg.yearLabel}
                </p>
                <h2 className="flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-white group-hover:text-violet-200 transition-colors">
                  <BadgeCheck className="w-4 h-4 shrink-0 text-sky-400" aria-hidden />
                  <span className="line-clamp-2">{pkg.name}</span>
                </h2>
                <span className="mt-2.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-violet-400/90">
                  Open
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Optional: keep hub image asset documented; used from Academy page */}
        <span className="sr-only" aria-hidden data-hub-image={SPECIAL_PACKAGES_HUB_IMAGE} />

        <p className="mt-10 text-center text-sm text-wisdom-muted">
          <Link href="/academy" className="text-amber-400 hover:underline">
            ← Back to Academy
          </Link>
        </p>
      </div>
    </div>
  );
}
