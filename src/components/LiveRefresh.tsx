"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearOwnershipCache } from "@/lib/ownership";

/**
 * Keeps package ownership, progress, and list UIs fresh without a full app restart.
 * - On tab/app focus & visibility
 * - When network returns
 * - Every 45s while the page is visible
 * - Listens for app-shell CustomEvent `wta-refresh`
 */
export default function LiveRefresh() {
  const router = useRouter();
  const lastAt = useRef(0);

  useEffect(() => {
    const run = (source: string, hard = false) => {
      const now = Date.now();
      // Debounce bursts (focus + visibility often fire together)
      if (now - lastAt.current < 2500 && !hard) return;
      lastAt.current = now;

      try {
        clearOwnershipCache();
      } catch {
        /* ignore */
      }

      try {
        window.dispatchEvent(
          new CustomEvent("wta-refresh", { detail: { source, at: now } })
        );
      } catch {
        /* ignore */
      }

      // Refresh Next.js server/client payloads for the active route
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") run("visibility");
    };
    const onFocus = () => run("focus");
    const onOnline = () => run("online", true);
    const onApp = (e: Event) => {
      const detail = (e as CustomEvent).detail as { source?: string } | undefined;
      run(detail?.source || "wta-refresh", true);
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("wta-refresh", onApp as EventListener);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") run("interval");
    }, 45_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("wta-refresh", onApp as EventListener);
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
