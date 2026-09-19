"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

/** Manual soft-refresh — dispatches wta-refresh for LiveRefresh listeners. */
export default function RefreshButton({ className = "" }: { className?: string }) {
  const [spin, setSpin] = useState(false);

  function onClick() {
    setSpin(true);
    try {
      window.dispatchEvent(
        new CustomEvent("wta-refresh", { detail: { source: "button", at: Date.now() } })
      );
    } catch {
      /* ignore */
    }
    window.setTimeout(() => setSpin(false), 900);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title="Refresh"
      aria-label="Refresh"
      className={`inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/5 p-2 text-wisdom-muted hover:text-cyan-200 hover:border-cyan-400/40 transition-colors ${className}`}
    >
      <RefreshCw className={`w-4 h-4 ${spin ? "animate-spin" : ""}`} />
    </button>
  );
}
