import Link from "next/link";
import { Users, CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { academyPackages, formatEtb } from "@/data/packages";

export const metadata = {
  title: "Packages · Wisdom Tower Academy",
  description: "Academy packages at 500 ETB — Telebirr, CBE, and local bank transfer",
};

export default function PackagesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-2">
            Academy · simple pricing
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Choose your package
          </h1>
          <p className="mt-3 text-wisdom-muted leading-relaxed">
            Every package is{" "}
            <span className="text-amber-300 font-semibold">{formatEtb(500)}</span>. Pay with Telebirr,
            CBE, or a local bank — we verify manually and unlock your access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {academyPackages.map((pkg) => (
            <article
              key={pkg.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card shadow-card-3d"
            >
              <div className="relative h-36 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${pkg.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-white">{pkg.name}</h2>
                  <span className="shrink-0 rounded-lg bg-amber-500 text-wisdom-dark text-sm font-black px-2.5 py-1">
                    {formatEtb(pkg.priceEtb)}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-wisdom-muted leading-relaxed mb-3">{pkg.description}</p>
                <ul className="space-y-1.5 mb-4">
                  {pkg.includes.map((line) => (
                    <li key={line} className="flex gap-2 text-xs text-white/85">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex items-center gap-1.5 text-[11px] text-wisdom-muted mb-4">
                  <Users className="w-3.5 h-3.5" />
                  {pkg.enrolledLabel} enrolled
                </p>
                <Link
                  href={`/checkout/${pkg.id}`}
                  className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold hover:bg-amber-400 transition-colors"
                >
                  Enroll · {formatEtb(pkg.priceEtb)}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-wisdom-dark/50 p-5 flex gap-3 max-w-2xl mx-auto">
          <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-sm text-wisdom-muted leading-relaxed">
            <span className="text-white font-semibold">Manual verification.</span> After you pay,
            submit your transaction ID. Our team confirms the transfer (usually within a few hours),
            then your package appears in{" "}
            <Link href="/learning" className="text-cyan-400 hover:underline">
              My Learning
            </Link>
            . Automated bank APIs will come later — same student experience.
          </p>
        </div>
      </div>
    </div>
  );
}
