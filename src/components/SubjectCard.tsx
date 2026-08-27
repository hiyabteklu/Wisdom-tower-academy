"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  href: string;
  name: string;
  description?: string;
  image: string;
};

export default function SubjectCard({ href, name, description, image }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={href}
      className="card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card shadow-lg shadow-black/20 transition-all duration-300 hover:border-purple-400/35 hover:shadow-purple-500/10 hover:-translate-y-0.5"
    >
      {/* Image / hero */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-wisdom-navy">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-950/80 via-wisdom-card to-wisdom-dark p-4">
            <span className="text-center text-sm sm:text-base font-semibold text-purple-100/90 leading-snug line-clamp-3 tracking-tight">
              {name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Body */}
      <div className="relative px-3.5 py-3.5 sm:px-4 sm:py-4 flex-1 flex flex-col border-t border-white/8">
        <h3 className="text-sm sm:text-[15px] font-semibold leading-snug text-white group-hover:text-purple-200 transition-colors duration-300 line-clamp-2">
          {name}
        </h3>
        {description && (
          <p className="mt-1.5 text-[11px] sm:text-xs text-wisdom-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-purple-400/80 group-hover:text-purple-300 transition-colors">
          Open
          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
