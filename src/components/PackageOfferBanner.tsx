"use client";

import { useEffect, useState } from "react";
import { Users, Gift } from "lucide-react";
import { getPackage, formatEtb } from "@/data/packages";
import { FREE_FOR_REGISTERED_PACKAGE_IDS } from "@/lib/ownership";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FREE_SET = new Set<string>(FREE_FOR_REGISTERED_PACKAGE_IDS);

/** Compact purchase strip for section / grade pages */
export default function PackageOfferBanner({ packageId }: { packageId: string }) {
  const pathname = usePathname();
  const pkg = getPackage(packageId);
  const isFreeForRegistered = FREE_SET.has(packageId);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) setSignedIn(!!session?.user);
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!pkg) return null;

  if (isFreeForRegistered && signedIn) {
    return (
      <div className="card-modern border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-wisdom-card to-wisdom-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              <Gift className="w-3.5 h-3.5" />
              Complimentary Access
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
          {pkg.description ? (
            <p className="text-xs sm:text-sm text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
              {pkg.description}
            </p>
          ) : null}
          <p className="text-xs text-emerald-300/80 mt-1 font-medium">
            Active session · Learning hubs for this pathway are fully unlocked.
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-xs sm:text-sm font-bold text-emerald-200">
            Access Active
          </span>
        </div>
      </div>
    );
  }

  if (isFreeForRegistered && !signedIn) {
    return (
      <div className="card-modern border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-wisdom-card to-wisdom-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              Free with account
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
          {pkg.description ? (
            <p className="text-xs sm:text-sm text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
              {pkg.description}
            </p>
          ) : null}
          <p className="text-xs text-wisdom-muted mt-1">
            Create an account or sign in to explore and unlock all materials at no charge.
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          <Link
            href={`/login?next=${encodeURIComponent(pathname || "/learning")}`}
            className="btn-cyan px-5 py-2.5 text-xs sm:text-sm"
          >
            Sign In to Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-wisdom-card to-wisdom-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/15 text-amber-300 border border-amber-400/30">
            <Users className="w-3.5 h-3.5" />
            {pkg.enrolledLabel || "Official Package"}
          </span>
        </div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
        {pkg.description ? (
          <p className="text-xs sm:text-sm text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>
        ) : null}
        <p className="text-base sm:text-lg font-black text-amber-300 mt-1.5 tracking-tight">
          {formatEtb(pkg.priceEtb)}
        </p>
      </div>
      <div className="shrink-0 w-full sm:w-auto">
        <AddToCartButton packageId={pkg.id} />
      </div>
    </div>
  );
}
