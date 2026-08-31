"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock, ShoppingBag, X, Sparkles } from "lucide-react";
import { formatEtb, getPackage } from "@/data/packages";
import { PURCHASE_TITLE, PURCHASE_BODY_FRESHMAN } from "@/data/content-availability";

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
  const packagesHref = "/packages";

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

  const body =
    packageId === "freshman"
      ? PURCHASE_BODY_FRESHMAN
      : `Unlock ${name} to open books, flashcards, videos, and the rest of the learning hubs. After your payment is verified, access appears in My Learning.`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: "wt-fade-in 0.2s ease-out" }}
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#121a2e] to-[#0a0f1a] shadow-2xl shadow-amber-500/15"
        style={{ animation: "wt-modal-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/10 p-2 text-wisdom-muted hover:text-white hover:bg-white/5"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative px-6 pt-10 pb-8 text-center sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <Lock className="w-8 h-8" />
          </div>

          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="w-3 h-3" />
            Unlock content
          </p>

          <h2
            id="purchase-required-title"
            className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-3"
          >
            {PURCHASE_TITLE}
          </h2>

          {hubName && (
            <p className="text-sm font-semibold text-cyan-300/90 mb-2">{hubName}</p>
          )}

          <p className="text-sm text-wisdom-muted leading-relaxed max-w-sm mx-auto mb-2">{body}</p>
          <p className="text-lg font-bold text-amber-300 mb-7">{formatEtb(price)}</p>

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
              href={packagesHref}
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

      <style jsx global>{`
        @keyframes wt-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes wt-modal-pop {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
