"use client";

import { Users } from "lucide-react";
import { getPackage, formatEtb } from "@/data/packages";
import AddToCartButton from "@/components/AddToCartButton";

/** Compact purchase strip for section / grade pages */
export default function PackageOfferBanner({ packageId }: { packageId: string }) {
  const pkg = getPackage(packageId);
  if (!pkg) return null;

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
