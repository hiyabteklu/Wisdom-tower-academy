"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ResourceHub } from "@/data/academy";
import type { HubLockMode } from "@/data/content-availability";
import ComingSoonModal from "@/components/ComingSoonModal";
import PurchaseRequiredModal from "@/components/PurchaseRequiredModal";

type Props = {
  hub: ResourceHub;
  href: string;
  /** If true, user owns the package: navigate freely */
  owned?: boolean;
  lockMode?: HubLockMode;
  /** Package to buy when lockMode is require_purchase */
  purchasePackageId?: string;
  /** Number of published items in this hub */
  itemCount?: number;
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
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1 border-t border-white/8">
        <h2 className="font-display text-xs sm:text-base md:text-lg font-bold tracking-tight text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
          {hub.name}
        </h2>

        {hub.description && (
          <p className="hidden sm:block text-xs text-wisdom-muted leading-relaxed line-clamp-2 mt-1 mb-2">
            {hub.description}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-white/5">
          <span className="text-[11px] sm:text-xs font-semibold flex items-center gap-1 text-cyan-300">
            {owned || lockMode === "open"
              ? "Open"
              : lockMode === "require_purchase"
                ? "Unlock"
                : "Preview"}
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
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
          className="card-modern group flex flex-col text-left w-full cursor-pointer hover:border-cyan-400/40 shadow-lg overflow-hidden"
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
      prefetch={true}
      className="card-modern group flex flex-col shadow-lg hover:border-cyan-400/30 transition-all overflow-hidden"
    >
      {body}
    </Link>
  );
}
