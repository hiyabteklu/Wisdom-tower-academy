"use client";

import { useState } from "react";
import Link from "next/link";

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
      className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-wisdom-navy">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-110"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/40 via-wisdom-card to-wisdom-dark p-3">
            <span className="text-center text-xs sm:text-sm font-semibold text-purple-200/90 leading-tight line-clamp-4">
              {name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/25 to-transparent pointer-events-none" />
      </div>

      <div className="relative p-3 sm:p-3.5 flex-1 flex flex-col border-t border-white/8">
        <h3 className="text-[11px] sm:text-sm font-semibold leading-snug text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
          {name}
        </h3>
        {description && (
          <p className="mt-1 text-[10px] sm:text-xs text-wisdom-muted line-clamp-2 hidden sm:block">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
