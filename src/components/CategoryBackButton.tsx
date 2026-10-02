"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parentLabel, structuralParent } from "@/lib/nav-parent";

/**
 * Structural back: always one level up the site tree.
 * Never uses browser history (avoids long, confusing paths).
 *
 * Pass `fallback` when the parent is not the path's previous segment
 * (e.g. grades list → academy is already in the map).
 */
export default function CategoryBackButton({
  fallback,
  label,
}: {
  /** Explicit parent path. If omitted, computed from current URL. */
  fallback?: string;
  label?: string;
}) {
  const pathname = usePathname() || "/";
  const href = structuralParent(pathname, fallback);
  const text = label || (href === "/" ? "Home" : parentLabel(href) === "Back" ? "Back" : `Back to ${parentLabel(href)}`);

  // Don't render a self-loop on home
  if (href === pathname || (pathname === "/" && href === "/")) {
    return null;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 mb-6 sm:mb-8 rounded-full border border-white/10 bg-[#0c1328]/70 hover:bg-[#0f1833]/85 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm active:scale-95"
    >
      <ArrowLeft className="w-4 h-4" />
      {text}
    </Link>
  );
}
