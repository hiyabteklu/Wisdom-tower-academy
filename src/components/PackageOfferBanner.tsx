"use client";

import { useEffect, useState } from "react";
import { Users, Gift } from "lucide-react";
import { getPackage, formatEtb } from "@/data/packages";
import { FREE_FOR_REGISTERED_PACKAGE_IDS } from "@/lib/ownership";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";

const FREE_SET = new Set<string>(FREE_FOR_REGISTERED_PACKAGE_IDS);

/** Compact purchase strip for section / grade pages */
export default function PackageOfferBanner({ packageId }: { packageId: string }) {
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
      <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-wisdom-card to-wisdom-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/90 mb-1 inline-flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            Free for registered students
          </p>
          <p className="font-display font-bold text-white">{pkg.name}</p>
          <p className="text-xs text-wisdom-muted mt-1 line-clamp-2">
            You’re signed in — all learning hubs for this package are open. No payment needed.
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-200">
          Unlocked
        </span>
      </div>
    );
  }

  if (isFreeForRegistered && !signedIn) {
    return (
      <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-wisdom-card to-wisdom-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90 mb-1 inline-flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            Free when you sign in
          </p>
          <p className="font-display font-bold text-white">{pkg.name}</p>
          <p className="text-xs text-wisdom-muted mt-1 line-clamp-2">
            Create a free account to unlock every subject and learning hub — no payment required.
          </p>
        </div>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-cyan-400 transition-colors sm:min-w-[11rem]"
        >
          Sign in free
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-wisdom-card to-wisdom-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-1">
          Package · {formatEtb(pkg.priceEtb)}
        </p>
        <p className="font-display font-bold text-white">{pkg.name}</p>
        <p className="text-xs text-wisdom-muted mt-1 line-clamp-2">{pkg.description}</p>
        <p className="flex items-center gap-1 text-[11px] text-wisdom-muted mt-2">
          <Users className="w-3.5 h-3.5" />
          {pkg.enrolledLabel}
        </p>
      </div>
      <AddToCartButton packageId={packageId} className="sm:w-auto sm:min-w-[11rem]" />
    </div>
  );
}
