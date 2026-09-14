"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

export default function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`mb-8 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-3.5 text-left hover:border-white/20 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon ? (
            <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-wisdom-dark/40">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-base sm:text-lg">{title}</p>
            {subtitle ? (
              <p className="text-xs text-wisdom-muted mt-0.5 truncate">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-wisdom-muted shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
