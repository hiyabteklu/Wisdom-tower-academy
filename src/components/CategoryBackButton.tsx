"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Reliable one-step back: always goes to the explicit parent path.
 * Avoids router.back() which can jump multiple steps or to unrelated pages.
 */
export default function CategoryBackButton({
  fallback = "/academy",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  return (
    <Link
      href={fallback}
      className="inline-flex items-center gap-2 mb-6 sm:mb-8 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm font-semibold text-white/85 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}
