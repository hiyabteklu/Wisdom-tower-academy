"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { addToCart, isInCart, CART_EVENT } from "@/lib/cart";
import { formatEtb, getPackage, PACKAGE_PRICE_ETB } from "@/data/packages";

type Props = {
  packageId: string;
  /** primary = amber enroll style; ghost = outline */
  variant?: "primary" | "ghost" | "compact";
  className?: string;
};

export default function AddToCartButton({
  packageId,
  variant = "primary",
  className = "",
}: Props) {
  const [inCart, setInCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const pkg = getPackage(packageId);
  const price = pkg?.priceEtb ?? PACKAGE_PRICE_ETB;

  useEffect(() => {
    const sync = () => setInCart(isInCart(packageId));
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [packageId]);

  function onAdd() {
    addToCart(packageId);
    setInCart(true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
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
