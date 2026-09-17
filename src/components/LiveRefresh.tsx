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
 * Keeps package ownership, progress, and list UIs fresh without a full app restart.
 * Never runs on auth pages or while a form field is focused (protects autofill login).
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
  }, [router, pathname]);

  return null;
}
