"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  GraduationCap,
  Monitor,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { demoCart, type CartItem } from "@/data/learning";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(demoCart);

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="relative min-h-[70vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-1">
              Before you pay
            </p>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              Your cart
            </h1>
            <p className="mt-1 text-sm text-wisdom-muted">
              {items.length === 0
                ? "No items yet"
                : `${items.length} item${items.length === 1 ? "" : "s"} · checkout per package`}
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

        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card p-10 text-center shadow-card-3d">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-semibold text-white mb-2">Cart is empty</p>
            <p className="text-sm text-wisdom-muted mb-6 max-w-xs mx-auto">
              Academy packages are 500 ETB each — Telebirr, CBE, or local bank.
            </p>
            <Link
              href="/packages"
              className="inline-flex px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold"
            >
              View packages
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isAcademy = item.space === "academy";
              const checkoutHref = item.packageId
                ? `/checkout/${item.packageId}`
                : item.href;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-white/12 bg-wisdom-card p-3 sm:p-4 shadow-card-3d"
                >
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span
                      className={`inline-flex items-center gap-1 self-start rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1 ${
                        isAcademy
                          ? "border-amber-400/35 text-amber-300 bg-amber-500/10"
                          : "border-cyan-400/35 text-cyan-300 bg-cyan-500/10"
                      }`}
                    >
                      {isAcademy ? (
                        <GraduationCap className="w-3 h-3" />
                      ) : (
                        <Monitor className="w-3 h-3" />
                      )}
                      {item.space}
                    </span>
                    <h2 className="font-semibold text-white truncate">{item.title}</h2>
                    <p className="text-xs text-wisdom-muted truncate">{item.subtitle}</p>
                    <p className="text-sm font-semibold text-amber-300 mt-1">{item.priceLabel}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="p-2 rounded-lg text-wisdom-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={checkoutHref}
                      className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                    >
                      Pay
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-white/10 bg-wisdom-dark/50 p-5 mt-6">
              <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
                Checkout is{