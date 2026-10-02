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
  /** If true, user owns the package — navigate freely */
  owned?: boolean;
  lockMode?: HubLockMode;
  /** Package to buy when lockMode is require_purchase */
  purchasePackageId?: string;
  /** Number of published items in this hub */
  itemCount?: number;
};

function formatHubCountCaption(hubId: string, count: number): string {
  switch (hubId) {
    case "books":
      return `${count} ${count === 1 ? "book" : "books"}`;
    case "short-notes":
      return `${count} ${count === 1 ? "note" : "notes"}`;
    case "flashcards":
      return `${count} ${count === 1 ? "flashcard set" : "flashcard sets"}`;
    case "question-banks":
      return `${count} ${count === 1 ? "question set" : "question sets"}`;
    case "exams":
      return `${count} ${count === 1 ? "exam" : "exams"}`;
    case "videos":
      return `${count} ${count === 1 ? "video" : "videos"}`;
    default:
      return `${count} ${count === 1 ? "item" : "items"}`;
  }
}

export default function ResourceHubCard({
  hub,
  href,
  owned = false,
  lockMode = "open",
  purchasePackageId = "freshman",
  itemCount,
}: Props) {
  const [soonOpen, setSoonOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);

  const blocked = !owned && lockMode !== "open";
  const countCaption = itemCount !== undefined ? formatHubCountCaption(hub.id, itemCount) : null;

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
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Item count badge on image top-right */}
        {countCaption && (
          <div className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-lg">
            {countCaption}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 border-t border-white/8">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h2 className={`font-display text-lg sm:text-xl font-bold tracking-tight ${hub.accent}`}>
            {hub.name}
          </h2>
          {countCaption && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/[0.08] text-white/90 border border-white/10 shadow-sm">
              {countCaption}
            </span>
          )}
        </div>

        {hub.description && (
          <p className="text-xs sm:text-sm text-wisdom-muted leading-relaxed line-clamp-2 mb-3">
            {hub.description}
          </p>
        )}

        {/* Item count in caption */}
        {countCaption && (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span>{countCaption} available</span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
          <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${hub.accent}`}>
            {owned || lockMode === "open"
              ? "Open hub"
              : lockMode === "require_purchase"
                ? "Unlock hub"
                : "Preview"}
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
          {countCaption && (
            <span className="text-xs text-white/40 font-medium">
              {countCaption}
            </span>
          )}
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
          className={`card-modern group flex flex-col text-left w-full cursor-pointer hover:border-amber-400/40 shadow-lg ${hub.glow}`}
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
      className={`card-modern group flex flex-col shadow-lg hover:border-white/25 ${hub.glow}`}
    >
      {body}
    </Link>
  );
}
