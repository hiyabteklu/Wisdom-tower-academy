"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearOwnershipCache } from "@/lib/ownership";

function isAuthPath(path: string | null): boolean {
  if (!path) return false;
  return (
    path.startsWith("/auth") ||
    path.includes("/login") ||
    path.includes("/signup") ||
    path.includes("/register") ||
    path.includes("/forgot") ||
    path.includes("/reset-password")
  );
}

function hasFocusedFormField(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest("form"));
}

/**
 * Soft-refresh ownership/progress without full reload.
 * Does NOT run on focus/visibility (that caused awkward jumps).
 * Triggers: back online, or user tapping the Refresh button (wta-refresh).
 */
export default function LiveRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const lastAt = useRef(0);

  useEffect(() => {
    const run = (source: string, hard = false) => {
      if (isAuthPath(pathname)) return;
      if (hasFocusedFormField()) return;

      const now = Date.now();
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

      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    };

    const onOnline = () => run("online", true);
    const onApp = (e: Event) => {
      const detail = (e as CustomEvent).detail as { source?: string } | undefined;
      run(detail?.source || "wta-refresh", true);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("wta-refresh", onApp as EventListener);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("wta-refresh", onApp as EventListener);
    };
  }, [router, pathname]);

  return null;
}
