"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, BookOpen } from "lucide-react";
import { formatEtb, type AcademyPackage } from "@/data/packages";
import { listSellablePackages } from "@/lib/catalog";
import { isPackageOwned, IS_FREE_MODE } from "@/lib/ownership";
import { addToCart } from "@/lib/cart";

function PackageCatalogCard({ pkg }: { pkg: AcademyPackage }) {
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
    <article className="card-modern group flex flex-col h-full justify-between shadow-lg shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl">
      <div className="card-media-wrap aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1 border-t border-white/8 space-y-2 sm:space-y-3 justify-between">
        <div>
          {/* Title with price */}
          <div className="flex items-baseline justify-between gap-1.5 sm:gap-3">
            <h2 className="font-display text-xs sm:text-base md:text-lg font-bold text-white leading-snug truncate flex-1">
              {pkg.name}
            </h2>
            {!IS_FREE_MODE && (
              <span className="shrink-0 font-display font-bold text-cyan-300 text-xs sm:text-sm md:text-base">
                {formatEtb(pkg.priceEtb)}
              </span>
            )}
          </div>
        </div>

        {/* Single clear action to start learning (full label, not truncated) */}
        <div className="pt-1">
          {IS_FREE_MODE || owned ? (
            <Link
              href={pkg.href || "/learning"}
              className="btn-open w-full text-center py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
              <span>Start Learning</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handlePurchase}
              className="btn-open w-full text-center py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Purchase ({formatEtb(pkg.priceEtb)})</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function PackageGrid({ list }: { list: AcademyPackage[] }) {
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
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
