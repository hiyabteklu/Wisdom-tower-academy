"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { structuralParent } from "@/lib/nav-parent";

declare global {
  interface Window {
    __wtaStructuralBack?: () => boolean;
    __wtaHardRefresh?: () => void;
  }
}

/**
 * Exposes structural back for the Android WebView and hard-refresh helper.
 * Back goes up one site layer — never chronological browser history.
 */
export default function StructuralBackBridge() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    window.__wtaStructuralBack = () => {
      try {
        const path = pathname || window.location.pathname || "/";
        const parent = structuralParent(path);
        if (!parent || parent === path) {
          // At root — let the app exit
          return false;
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
