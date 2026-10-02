"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Shield, ChevronDown, Check, BookOpen, LogIn } from "lucide-react";
import { formatEtb, type AcademyPackage } from "@/data/packages";
import { listSellablePackages } from "@/lib/catalog";
import { isPackageOwned, IS_FREE_MODE } from "@/lib/ownership";
import { addToCart } from "@/lib/cart";

function PackageCatalogCard({ pkg }: { pkg: AcademyPackage }) {
  const [expanded, setExpanded] = useState(false);
  const [owned, setOwned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    isPackageOwned(pkg.id).then((has) => {
      if (!cancelled) setOwned(has);
    });
    return () => {
      cancelled = true;
    };
  }, [pkg.id]);

  const handlePurchase = () => {
    addToCart(pkg.id);
    router.push("/cart");
  };

  return (
    <article className="card-modern group flex flex-col shadow-lg shadow-black/25 transition-all">
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 border-t border-white/8 space-y-3">
        {/* Title with price */}
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-white leading-snug truncate">
            {pkg.name}
          </h2>
          {!IS_FREE_MODE && (
            <span className="shrink-0 font-display font-bold text-cyan-300 text-base">
              {formatEtb(pkg.priceEtb)}
            </span>
          )}
        </div>

        {/* Two clean buttons side by side */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-pointer"
          >
            <span>What&apos;s included</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                expanded ? "rotate-180 text-cyan-300" : ""
              }`}
            />
          </button>

          {IS_FREE_MODE ? (
            owned ? (
              <Link
                href={pkg.href || "/learning"}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm transition-all text-center active:scale-[0.98]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Start Learning</span>
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pkg.href || "/packages")}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm transition-all text-center active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )
          ) : owned ? (
            <Link
              href={pkg.href || "/learning"}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] text-white border border-white/15 hover:bg-white/[0.14] transition-all text-center"
            >
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span>Owned</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handlePurchase}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>Purchase</span>
            </button>
          )}
        </div>

        {/* In What's included: collapsed bullets only */}
        {expanded && pkg.includes.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
            <ul className="space-y-1.5">
              {pkg.includes.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-xs text-slate-300 leading-snug"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function PackageGrid({ list }: { list: AcademyPackage[] }) {
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((pkg) => (
        <PackageCatalogCard key={pkg.id} pkg={pkg} />
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
          Submit your transaction ID to confirm enrollment. Access appears in{" "}
          <Link href="/learning" className="text-cyan-400 hover:underline">
            My Learning
          </Link>{" "}
          once confirmed.
        </p>
      </div>
    </>
  );
}
