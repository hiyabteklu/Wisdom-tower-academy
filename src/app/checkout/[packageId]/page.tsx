"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPackage, formatEtb } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { isPackagePurchasable } from "@/data/content-availability";
import { CloudUpload, ArrowLeft } from "lucide-react";

/**
 * Thin gate: undeveloped packages cannot reach payment UI.
 * Full checkout lives in the previous implementation — we re-export by
 * dynamically loading only when purchasable.
 */
import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = use(params);
  const router = useRouter();
  const pkg = getPackageResolved(packageId) || getPackage(packageId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-wisdom-muted text-sm">
        Loading…
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-white font-semibold mb-2">Package not found</p>
        <Link href="/packages" className="text-amber-300 text-sm hover:underline">
          Back to packages
        </Link>
      </div>
    );
  }

  if (!isPackagePurchasable(packageId)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl border border-amber-400/25 bg-wisdom-card p-8 shadow-card-3d">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <CloudUpload className="w-7 h-7" />
          </div>
          <h1 className="font-display text-xl font-bold text-white mb-2">Not available yet</h1>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-2">{pkg.name}</p>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-6">
            Resources for this track are still being uploaded. Checkout is locked until materials
            are ready. You can still explore the pathway on Academy.
          </p>
          <p className="text-xs text-wisdom-muted mb-6">{formatEtb(pkg.priceEtb)} · coming soon</p>
          <div className="flex flex-col gap-2">
            <Link
              href={pkg.href}
              className="inline-flex justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400"
            >
              Explore pathway
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center justify-center gap-1 text-sm text-wisdom-muted hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              All packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <CheckoutForm packageId={packageId} />;
}
