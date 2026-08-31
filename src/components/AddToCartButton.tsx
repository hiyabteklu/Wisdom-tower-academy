"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, BookOpen, CloudUpload } from "lucide-react";
import { addToCart, isInCart, CART_EVENT } from "@/lib/cart";
import { formatEtb, PACKAGE_PRICE_ETB, getPackage } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { isPackageOwned, clearOwnershipCache } from "@/lib/ownership";
import { isPackagePurchasable } from "@/data/content-availability";
import { supabase } from "@/lib/supabase";
import ComingSoonModal from "@/components/ComingSoonModal";

type Props = {
  packageId: string;
  variant?: "primary" | "ghost" | "compact";
  className?: string;
};

export default function AddToCartButton({
  packageId,
  variant = "primary",
  className = "",
}: Props) {
  const [inCart, setInCart] = useState(false);
  const [owned, setOwned] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [soonOpen, setSoonOpen] = useState(false);
  const pkg = getPackageResolved(packageId) || getPackage(packageId);
  const price = pkg?.priceEtb ?? PACKAGE_PRICE_ETB;
  const openHref = pkg?.href || "/learning";
  const purchasable = isPackagePurchasable(packageId);

  useEffect(() => {
    const syncCart = () => setInCart(isInCart(packageId));
    syncCart();

    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) setOwned(false);
        return;
      }
      const has = await isPackageOwned(packageId);
      if (!cancelled) setOwned(has);
    })();

    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      clearOwnershipCache();
      void isPackageOwned(packageId).then((has) => {
        if (!cancelled) setOwned(has);
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
      subscription.unsubscribe();
    };
  }, [packageId]);

  function onAdd() {
    if (!purchasable) {
      setSoonOpen(true);
      return;
    }
    if (owned) return;
    addToCart(packageId);
    setInCart(true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (owned) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 text-sm font-semibold">
          <Check className="w-4 h-4" />
          Owned
        </span>
        <Link
          href={openHref}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400"
        >
          <BookOpen className="w-4 h-4" />
          Open content
        </Link>
      </div>
    );
  }

  if (!purchasable) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSoonOpen(true)}
          className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-amber-400/35 bg-amber-500/10 text-amber-200 text-sm font-semibold hover:bg-amber-500/15 ${className}`}
        >
          <CloudUpload className="w-4 h-4" />
          Coming soon · not for sale yet
        </button>
        <ComingSoonModal open={soonOpen} onClose={() => setSoonOpen(false)} hubName={pkg?.name} />
      </>
    );
  }

  if (inCart) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-400/35 bg-emerald-500/10 text-emerald-300 text-sm font-semibold">
          <Check className="w-4 h-4" />
          {justAdded ? "Added" : "In cart"}
        </span>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/90 hover:border-cyan-400/40 hover:text-cyan-300"
        >
          View cart
        </Link>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-wisdom-dark text-xs font-bold hover:bg-amber-400 ${className}`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        {formatEtb(price)}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-amber-400/40 text-amber-200 text-sm font-semibold hover:bg-amber-500/10 ${className}`}
      >
        <ShoppingBag className="w-4 h-4" />
        Add to cart · {formatEtb(price)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold hover:bg-amber-400 transition-colors ${className}`}
    >
      <ShoppingBag className="w-4 h-4" />
      Add to cart · {formatEtb(price)}
    </button>
  );
}
