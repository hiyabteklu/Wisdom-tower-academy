"use client";

import { useState } from "react";
import Link from "next/link";
import type { Service } from "@/data/services";

type Props = {
  service: Service;
  categoryName: string;
};

export default function ServiceCard({ service, categoryName }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={`/request?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(categoryName)}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-wisdom-card hover:border-wisdom-cyan/40 transition-all duration-300 hover:shadow-lg hover:shadow-wisdom-cyan/10 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-wisdom-navy">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-wisdom-navy via-wisdom-card to-wisdom-dark p-2">
            <span className="text-center text-[10px] sm:text-xs text-wisdom-muted leading-tight line-clamp-4">
              {service.name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
        <h3 className="text-[11px] sm:text-sm font-medium leading-snug text-white group-hover:text-wisdom-cyan transition-colors line-clamp-3">
          {service.name}
        </h3>
      </div>
    </Link>
  );
}
