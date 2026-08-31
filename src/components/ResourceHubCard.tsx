"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronRight, Lock } from "lucide-react";
import type { ResourceHub } from "@/data/academy";
import type { HubLockMode } from "@/data/content-availability";
import ComingSoonModal from "@/components/ComingSoonModal";
import PurchaseRequiredModal from "@/components/PurchaseRequiredModal";

type Props = {
  hub: ResourceHub;
  href: string;
  /** If true, user owns the package — navigate freely */
  owned?: boolean;
  lockMode?: HubLockMode;
  /** Package to buy when lockMode is require_purchase */
  purchasePackageId?: string;
};

export default function ResourceHubCard({
  hub,
  href,
  owned = false,
  lockMode = "open",
  purchasePackageId = "freshman",
}: Props) {
  const [soonOpen, setSoonOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);

  const blocked = !owned && lockMode !== "open";

  const body = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hub.image}
          alt={hub.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {blocked && (
          <div className="absolute inset-0 bg-wisdom-dark/25 flex items-start justify-end p-2.5">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
              <Lock className="w-3 h-3" />
              {lockMode === "require_purchase" ? "Unlock" : "Soon"}
            </span>
          </div>
        )}
      </div>
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8">
        <h2
          className={`flex items-center gap-1.5 font-display text-base sm:text-lg font-bold ${hub.accent}`}
        >
          <BadgeCheck className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 text-sky-400" aria-label="Verified" />
          {hub.name}
        </h2>
        <div className={`mt-2.5 flex items-center gap-1 text-xs sm:text-sm font-semibold ${hub.accent}`}>
          {owned || lockMode === "open"
            ? "Open"
            : lockMode === "require_purchase"
              ? "Unlock"
              : "Preview"}
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </>
  );

  if (blocked) {
    return (
      <>
        <button
          type="button"
          onClick={() =>
            lockMode === "require_purchase" ? setBuyOpen(true) : setSoonOpen(true)
          }
          className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card hover:border-amber-400/30 shadow-lg text-left w-full ${hub.glow}`}
        >
          {body}
        </button>
        <ComingSoonModal open={soonOpen} onClose={() => setSoonOpen(false)} hubName={hub.name} />
        <PurchaseRequiredModal
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          packageId={purchasePackageId}
          hubName={hub.name}
        />
      </>
    );
  }

  return (
    <Link
      href={href}
      className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card hover:border-white/25 shadow-lg ${hub.glow}`}
    >
      {body}
    </Link>
  );
}
