"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import {
  getCartPackages,
  removeFromCart,
  cartTotalEtb,
  CART_EVENT,
} from "@/lib/cart";
import { formatEtb, type AcademyPackage } from "@/data/packages";

export default function CartPage() {
  const [items, setItems] = useState<AcademyPackage[]>([]);
  const [ready, setReady] = useState(false);

  function sync() {
    setItems(getCartPackages());
    setReady(true);
  }

  useEffect(() => {
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const total = cartTotalEtb();

  return (
    <div className="relative min-h-[70vh]">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-1">
              Cart
            </p>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              Your cart
            </h1>
            <p className="mt-1 text-sm text-wisdom-muted">
              {!ready
                ? "…"
                : items.length === 0
                  ? "Empty"
                  : `${items.length} package${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link
            href="/learning"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            <BookOpen className="w-4 h-4" />
            My Learning
          </Link>
        </div>

        {!ready ? null : items.length === 0 ? (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card p-10 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-semibold text-white mb-2">Cart is empty</p>
            <p className="text-sm text-wisdom-muted mb-6">
              Add a package from Academy — each is {formatEtb(500)}.
            </p>
            <Link
              href="/packages"
              className="inline-flex px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold"
            >
              Browse packages
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-6">
              {items.map((pkg) => (
                <li
                  key={pkg.id}
                  className="flex gap-3 rounded-2xl border border-white/12 bg-wisdom-card p-3 sm:p-4"
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
                    style={{ backgroundImage: `url(${pkg.image})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{pkg.name}</p>
                    <p className="text-xs text-wisdom-muted truncate">{pkg.shortName}</p>
                    <p className="text-sm font-bold text-amber-300 mt-1">
                      {formatEtb(pkg.priceEtb)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={() => removeFromCart(pkg.id)}
                      className="p-2 rounded-lg text-wisdom-muted hover:text-rose-400 hover:bg-rose-500/10"
                      aria-label={`Remove ${pkg.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/checkout/${pkg.id}`}
                      className="text-xs font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                    >
                      Pay
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-wisdom-muted">Total</span>
                <span className="font-black text-amber-300 text-lg">{formatEtb(total)}</span>
              </div>
              <p className="text-xs text-wisdom-muted mb-4 leading-relaxed">
                Pay one package at a time (Telebirr / CBE / bank). After verification, it appears in
                My Learning.
              </p>
              {items.length === 1 ? (
                <Link
                  href={`/checkout/${items[0].id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400"
                >
                  Checkout · {formatEtb(items[0].priceEtb)}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <p className="text-xs text-center text-wisdom-muted">
                  Use <strong className="text-white/80">Pay</strong> on each row to checkout that
                  package.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
