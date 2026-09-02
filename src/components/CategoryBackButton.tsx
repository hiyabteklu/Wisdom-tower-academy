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
      className="inline-flex items-center gap-2 text-sm font-semibold text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-8"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}
