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
      className="inline-flex items-center gap-2 mb-6 sm:mb-8 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm font-semibold text-white/85 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {text}
    </Link>
  );
}
