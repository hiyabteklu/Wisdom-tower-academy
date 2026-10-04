"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  structuralParent,
  normalizePath,
  canPreferHistory,
  recordNavigation,
} from "@/lib/nav-parent";
import { isAndroidWebView } from "@/lib/native-app";

declare global {
  interface Window {
    __wtaStructuralBack?: () => boolean;
    __wtaHardRefresh?: () => void;
  }
}

/**
 * Exposes structural back for the Android WebView and browser environment.
 * Back goes up one site layer: prefer history when valid, else structural parent.
 * __wtaStructuralBack returns false ONLY at true root ("/").
 */
export default function StructuralBackBridge() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    isAndroidWebView();

    const current = pathname || (typeof window !== "undefined" ? window.location.pathname : "/");
    recordNavigation(current);

    window.__wtaStructuralBack = () => {
      try {
        const path = normalizePath(pathname || window.location.pathname || "/");
        // Must return false ONLY at true root ("/")
        if (path === "/" || path === "") {
          return false;
        }

        const parent = structuralParent(path);
        if (!parent || parent === path) {
          if (path !== "/") {
            router.push("/");
            return true;
          }
          return false;
        }

        // Prefer history when possible (previous entry in history was the parent)
        if (canPreferHistory(parent)) {
          window.history.back();
          return true;
        }

        router.push(parent);
        return true;
      } catch {
        return false;
      }
    };

    window.__wtaHardRefresh = () => {
      try {
        window.dispatchEvent(
          new CustomEvent("wta-refresh", {
            detail: { source: "hard", hard: true, at: Date.now() },
          })
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

    return () => {
      try {
        delete window.__wtaStructuralBack;
        delete window.__wtaHardRefresh;
      } catch {
        /* ignore */
      }
    };
  }, [pathname, router]);

  return null;
}
