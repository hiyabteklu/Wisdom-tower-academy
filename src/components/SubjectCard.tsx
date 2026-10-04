"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  href: string;
  name: string;
  description?: string;
  image: string;
  /** Optional highlight styling for primary subject */
  ready?: boolean;
};

export default function SubjectCard({ href, name, image, ready = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={href}
      prefetch={true}
      className="card-modern group flex flex-col shadow-md shadow-black/20 hover:border-cyan-400/35 transition-all overflow-hidden"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-wisdom-card p-3">
            <span className="text-center text-xs sm:text-sm font-semibold text-white/80 leading-snug">
              {name}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-side title and Open button to prevent vertical space waste */}
      <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-2 border-t border-white/8">
        <h3 className="text-xs sm:text-sm md:text-base font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors line-clamp-2 min-w-0 flex-1">
          {name}
        </h3>

        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 px-2 py-1 rounded-lg group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all">
          <span>Open</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
