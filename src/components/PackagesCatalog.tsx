"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CheckCircle2, Shield } from "lucide-react";
import { formatEtb, type AcademyPackage } from "@/data/packages";
import { listSellablePackages } from "@/lib/catalog";
import AddToCartButton from "@/components/AddToCartButton";

function PackageGrid({ list }: { list: AcademyPackage[] }) {
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map((pkg) => (
        <article
          key={pkg.id}
          className="flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card shadow-card-3d"
        >
          <div className="relative h-32 overflow-hidden">
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
            <ul className="space-y-1.5 mb-3">
              {pkg.includes.map((line) => (
                <li key={line} className="flex gap-2 text-xs text-white/85">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  {line}
                </li>
              ))}
            </ul>
            {pkg.enrolledLabel && (
              <p className="flex items-center gap-1.5 text-[11px] text-wisdom-muted mb-4">
                <Users className="w-3.5 h-3.5" />
                {pkg.enrolledLabel}
              </p>
            )}
            <div className="mt-auto space-y-2">
              <AddToCartButton packageId={pkg.id} />
              <Link
                href={pkg.href}
                className="block text-center text-xs font-semibold text-wisdom-muted hover:text-cyan-300"
              >
                Preview section
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
          <p className="text-sm text-wisdom-muted mb-6">Each grade is its own package.</p>
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
          <p className="text-sm text-wisdom-muted mb-6">Department tracks and semester options.</p>
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
          <span className="text-white font-semibold">Manual verification.</span> After payment,
          submit your transaction ID. Access appears in{" "}
          <Link href="/learning" className="text-cyan-400 hover:underline">
            My Learning
          </Link>{" "}
          once we confirm.
        </p>
      </div>
    </>
  );
}
