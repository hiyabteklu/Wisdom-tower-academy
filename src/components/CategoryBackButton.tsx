"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parentLabel, structuralParent, canPreferHistory } from "@/lib/nav-parent";

/**
 * Structural back: always one level up the site tree.
 * Prefers browser history when the user arrived from the parent,
 * else navigates structurally (ensures deep routes never jump to Home).
 *
 * Pass `fallback` when the parent is not the path's previous segment.
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
  const router = useRouter();
  const href = structuralParent(pathname, fallback);
  const text =
    label ||
    (href === "/" ? "Home" : parentLabel(href) === "Back" ? "Back" : `Back to ${parentLabel(href)}`);

  // Don't render a self-loop on home
  if (href === pathname || (pathname === "/" && href === "/")) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    // Preserve standard browser actions for modified clicks (e.g. Cmd/Ctrl+Click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (canPreferHistory(href)) {
      window.history.back();
    } else {
      router.push(href);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="inline-flex items-center gap-2 mb-6 sm:mb-8 rounded-full border border-white/10 bg-[#0c1328]/70 hover:bg-[#0f1833]/85 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm active:scale-95"
    >
      <ArrowLeft className="w-4 h-4" />
      {text}
    </Link>
  );
}
