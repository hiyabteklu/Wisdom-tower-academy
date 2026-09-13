"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPackage, formatEtb } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { isPackagePurchasable } from "@/data/content-availability";
import CheckoutForm from "@/components/CheckoutForm";
import { ArrowLeft, ShoppingBag } from "lucide-react";

function MultiCheckoutInner() {
  const search = useSearchParams();
  const raw = search.get("ids") || "";
  const ids = useMemo(
    () =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((id, i, arr) => arr.indexOf(id) === i),
    [raw]
  );

  const packages = ids
    .map((id) => getPackageResolved(id) || getPackage(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const sellable = packages.filter((p) => isPackagePurchasable(p.id));
  const total = sellable.reduce((s, p) => s + p.priceEtb, 0);

  if (ids.length === 0 || sellable.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white font-semibold mb-2">Nothing to checkout</p>
        <p className="text-sm text-wisdom-muted mb-6">
          Select packages in your cart, then proceed to payment.
        </p>
        <Link href="/cart" className="text-amber-300 text-sm font-semibold hover:underline">
          Back to cart
        </Link>
      </div>
    );
  }

  if (sellable.length === 1) {
    return <CheckoutForm packageId={sellable[0].id} />;
  }

  return (
    <div>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm text-wisdom-muted hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Cart
        </Link>
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-2">
            Paying for {sellable.length} packages
          </p>
          <ul className="space-y-1.5 mb-3">
            {sellable.map((p) => (
              <li key={p.id} className="flex justify-between text-sm gap-2">
                <span className="text-white/90 truncate">{p.name}</span>
                <span className="text-amber-300 font-semibold shrink-0">{formatEtb(p.priceEtb)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
            <span className="text-wisdom-muted">Total due</span>
            <span className="font-black text-amber-300">{formatEtb(total)}</span>
          </div>
        </div>
      </div>
      <CheckoutForm packageIds={sellable.map((p) => p.id)} />
    </div>
  );
}

export default function MultiCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-wisdom-muted text-sm">
          Loading…
        </div>
      }
    >
      <MultiCheckoutInner />
    </Suspense>
  );
}
