"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";

type Props = {
  href: string;
  name: string;
  description?: string;
  image: string;
  /** Optional highlight styling for primary subject */
  ready?: boolean;
};

export default function SubjectCard({ href, name, description, image, ready = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Link
      href={href}
      prefetch={true}
      className={`card-modern group flex flex-col shadow-md shadow-black/25 ${
        ready
          ? "border-emerald-400/40 hover:border-emerald-400/60"
          : "border-white/10 hover:border-purple-400/40"
      }`}
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
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
        <h3 className="text-base sm:text-lg font-bold leading-snug text-white group-hover:text-purple-200 transition-colors">
          {name}
        </h3>

        {description && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDetails((v) => !v);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-wisdom-muted hover:text-white transition-colors"
            >
              <span>{showDetails ? "Hide course scope" : "Course scope & topics"}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
            </button>
            {showDetails && (
              <p className="mt-2 text-xs text-slate-300/90 leading-relaxed bg-white/[0.04] p-2.5 rounded-lg border border-white/8">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs font-semibold">
          <span
            className={
              ready
                ? "text-emerald-400 group-hover:text-emerald-300"
                : "text-purple-300 group-hover:text-purple-200"
            }
          >
            Explore materials
          </span>
          <ChevronRight className="w-4 h-4 text-wisdom-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>
    </Link>
  );
}
