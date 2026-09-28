"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CheckCircle2, Shield, FileText } from "lucide-react";
import { formatEtb, type AcademyPackage } from "@/data/packages";
import { listSellablePackages } from "@/lib/catalog";
import AddToCartButton from "@/components/AddToCartButton";

function PackageGrid({ list }: { list: AcademyPackage[] }) {
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((pkg) => (
        <article
          key={pkg.id}
          className="card-modern group flex flex-col shadow-lg shadow-black/25"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pkg.image}
              alt={pkg.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>

          <div className="p-5 sm:p-6 flex flex-col flex-1 border-t border-white/8">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                {pkg.name}
              </h2>
              <span className="shrink-0 font-display font-black text-amber-300 text-base sm:text-lg">
                {formatEtb(pkg.priceEtb)}
              </span>
            </div>

            {pkg.description ? (
              <p className="text-xs sm:text-sm text-wisdom-muted leading-relaxed line-clamp-3 mb-4">
                {pkg.description}
              </p>
            ) : null}

            {pkg.includes.length > 0 && (
              <ul className="space-y-2 mb-6 pt-3 border-t border-white/6">
                {pkg.includes.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300/90 leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto pt-2 space-y-2.5">
              <AddToCartButton packageId={pkg.id} />
              <Link
                href={pkg.href}
                className="btn-secondary w-full text-center text-xs py-2"
              >
                Preview curriculum
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function PackagesCatalog() {
  const [list, setList] = useState<AcademyPackage[] | null>(null);

  useEffect(() => {
    listSellablePackages().then(setList);
  }, []);

  if (!list) {
    return (
      <div className="py-20 text-center text-wisdom-muted text-sm">Loading packages…</div>
    );
  }

  const grades = list.filter((p) => p.group === "grades");
  const branches = list.filter((p) => p.group === "branch");
  const specials = list.filter((p) => p.group === "special");
  const other = list.filter(
    (p) => !["grades", "branch", "special"].includes(p.group)
  );

  return (
    <>
      {grades.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mb-4">Grades 9–12</h2>
          <PackageGrid list={grades} />
        </>
      )}

      {branches.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mt-14 mb-4">Other branches</h2>
          <PackageGrid list={branches} />
        </>
      )}

      {specials.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mt-14 mb-2">Special packages</h2>
          <PackageGrid list={specials} />
        </>
      )}

      {other.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white mt-14 mb-4">More</h2>
          <PackageGrid list={other} />
        </>
      )}

      <div className="mt-12 rounded-2xl border border-white/10 bg-wisdom-dark/50 p-5 flex gap-3 max-w-2xl mx-auto">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-sm text-wisdom-muted leading-relaxed">
          After payment, submit your transaction ID. Access appears in{" "}
          <Link href="/learning" className="text-cyan-400 hover:underline">
            My Learning
          </Link>{" "}
          once confirmed.
        </p>
      </div>
    </>
  );
}
