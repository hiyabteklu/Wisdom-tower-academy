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
      className="card-modern group flex flex-col shadow-md shadow-black/20 hover:border-cyan-400/35 transition-all"
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
          <div className="absolute inset-0 flex items-center justify-center bg-wisdom-card p-4">
            <span className="text-center text-sm font-semibold text-white/80 leading-snug">
              {name}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 border-t border-white/8">
        <h3 className="text-base sm:text-lg font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors">
          {name}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs font-semibold">
          <span className="text-cyan-300 group-hover:text-cyan-200 transition-colors">
            Explore
          </span>
          <ChevronRight className="w-4 h-4 text-wisdom-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>
    </Link>
  );
}
