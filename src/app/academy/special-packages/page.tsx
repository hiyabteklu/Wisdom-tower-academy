import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { specialPackages } from "@/data/special-packages";

export const metadata = {
  title: "Special Packages · Wisdom Tower Academy",
  description: "Department track packages — Electrical & Computer Engineering and more",
};

export default function SpecialPackagesPage() {
  return (
    <div className="relative min-h-[70vh] py-14 md:py-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300/90 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Special packages
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Department tracks
          </h1>
          <p className="mt-3 text-wisdom-muted max-w-xl mx-auto leading-relaxed">
            Focused course packs by field and year — open a department, pick a semester, then each
            course.
          </p>
        </div>

        <div className="space-y-6">
          {specialPackages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/academy/special-packages/${pkg.slug}`}
              className="group block overflow-hidden rounded-3xl border border-violet-400/25 bg-wisdom-card shadow-card-3d hover:border-violet-300/50 transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070c16] via-[#070c16]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    {pkg.yearLabel}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                    {pkg.name}
                  </h2>
                  <p className="text-sm text-wisdom-muted max-w-lg mb-4">{pkg.blurb}</p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold">
                    Open track
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
        </p>
      </div>
    </div>
  );
}
