import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import type { ResourceHub } from "@/data/academy";

type Props = {
  hub: ResourceHub;
  href: string;
};

/** Shared 16:9 learning-hub card — no gradient, no description. */
export default function ResourceHubCard({ hub, href }: Props) {
  return (
    <Link
      href={href}
      className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card hover:border-white/25 shadow-lg ${hub.glow}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hub.image}
          alt={hub.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8">
        <h2
          className={`flex items-center gap-1.5 font-display text-base sm:text-lg font-bold ${hub.accent}`}
        >
          <BadgeCheck className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 text-sky-400" aria-label="Verified" />
          {hub.name}
        </h2>
        <div className={`mt-2.5 flex items-center gap-1 text-xs sm:text-sm font-semibold ${hub.accent}`}>
          Open
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
