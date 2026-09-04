"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock, ShoppingBag, X, LogIn } from "lucide-react";
import { formatEtb, getPackage } from "@/data/packages";
import { PURCHASE_TITLE, PURCHASE_BODY_FRESHMAN } from "@/data/content-availability";
import { FREE_FOR_REGISTERED_PACKAGE_IDS } from "@/lib/ownership";

const FREE_SET = new Set<string>(FREE_FOR_REGISTERED_PACKAGE_IDS);

type Props = {
  open: boolean;
  onClose: () => void;
  packageId: string;
  hubName?: string;
};

export default function PurchaseRequiredModal({
  open,
  onClose,
  packageId,
  hubName,
}: Props) {
  const pkg = getPackage(packageId);
  const price = pkg?.priceEtb ?? 300;
  const name = pkg?.name ?? "this package";
  const checkoutHref = `/checkout/${packageId}`;
  const isFreeForRegistered = FREE_SET.has(packageId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  if (isFreeForRegistered) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-required-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          aria-label="Close"
          onClick={onClose}
        />

        <div className="relative w-full max-w-[min(24rem,calc(100vw-2rem))] max-h-[min(90dvh,36rem)] overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-gradient-to-b from-[#121a2e] to-[#0a0f1a] shadow-2xl shadow-cyan-500/15">
          <div className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full border border-white/10 p-2 text-wisdom-muted hover:text-white hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative px-5 pt-9 pb-7 text-center sm:px-8 sm:pt-10 sm:pb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
              <LogIn className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Free access
            </p>

            <h2
              id="purchase-required-title"
              className="font-display text-lg sm:text-2xl font-extrabold text-white tracking-tight mb-2 sm:mb-3"
            >
              Sign in to open
            </h2>

            {hubName && (
              <p className="text-sm font-semibold text-cyan-300/90 mb-2">{hubName}</p>
            )}

            <p className="text-sm text-wisdom-muted leading-relaxed max-w-sm mx-auto mb-6">
              {packageId === "freshman"
                ? PURCHASE_BODY_FRESHMAN
                : `Sign in with a free account to open ${name} — books, flashcards, videos, and more. No payment required.`}
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/auth"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-cyan-400"
              >
                <LogIn className="w-4 h-4" />
                Sign in free
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-wisdom-muted hover:text-white pt-1"
              >
                Keep exploring
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const body = `Unlock ${name} to open books, flashcards, videos, and the rest of the learning hubs. After payment is verified, access appears in My Learning.`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[min(24rem,calc(100vw-2rem))] max-h-[min(90dvh,36rem)] overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-gradient-to-b from-[#121a2e] to-[#0a0f1a] shadow-2xl shadow-amber-500/15">
        <div className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/10 p-2 text-wisdom-muted hover:text-white hover:bg-white/5"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative px-5 pt-9 pb-7 text-center sm:px-8 sm:pt-10 sm:pb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Unlock content
          </p>

          <h2
            id="purchase-required-title"
            className="font-display text-lg sm:text-2xl font-extrabold text-white tracking-tight mb-2 sm:mb-3"
          >
            {PURCHASE_TITLE}
          </h2>

          {hubName && (
            <p className="text-sm font-semibold text-cyan-300/90 mb-2">{hubName}</p>
          )}

          <p className="text-sm text-wisdom-muted leading-relaxed max-w-sm mx-auto mb-2">{body}</p>
          <p className="text-lg font-bold text-amber-300 mb-6">{formatEtb(price)}</p>

          <div className="flex flex-col gap-2.5">
            <Link
              href={checkoutHref}
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400"
            >
              <ShoppingBag className="w-4 h-4" />
              Buy {name}
            </Link>
            <Link
              href="/packages"
              onClick={onClose}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-white/90 hover:border-cyan-400/40"
            >
              View packages
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-wisdom-muted hover:text-white pt-1"
            >
              Keep exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
