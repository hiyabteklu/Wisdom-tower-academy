"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";

type Props = {
  href: string;
  name: string;
  /** unused on card — kept optional for call-site compatibility */
  description?: string;
  image: string;
};

export default function SubjectCard({ href, name, image }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={href}
      className="card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card shadow-lg shadow-black/20 transition-all duration-300 hover:border-purple-400/35 hover:shadow-purple-500/10 hover:-translate-y-0.5"
    >
      {/* Full 16:9 cover — no gradient overlays; whole card is clickable */}
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-wisdom-card p-4">
            <span className="text-center text-sm font-semibold text-white/80 leading-snug">
              {name}
            </span>
          </div>
        )}
      </div>

      <div className="relative px-3.5 py-3.5 sm:px-4 sm:py-4 flex flex-col border-t border-white/8">
        <h3 className="flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold leading-snug text-white group-hover:text-purple-200 transition-colors">
          <BadgeCheck
            className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 text-sky-400"
            aria-label="Verified"
          />
          <span className="line-clamp-1">{name}</span>
        </h3>
        <div className="mt-3 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-purple-400/90 group-hover:text-purple-300 transition-colors">
          Open
          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
