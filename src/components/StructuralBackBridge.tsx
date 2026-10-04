"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { structuralParent, normalizePath } from "@/lib/nav-parent";
import { isAndroidWebView } from "@/lib/native-app";

declare global {
  interface Window {
    __wtaStructuralBack?: () => boolean;
    __wtaHardRefresh?: () => void;
    __wtaInPageBack?: () => boolean;
  }
}

/**
 * Exposes structural back for the Android WebView and website navigation.
 * Back goes up one site layer: ALWAYS structural parent only, NEVER full chronological history.
 * __wtaStructuralBack returns false ONLY at true root ("/").
 */
export default function StructuralBackBridge() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    isAndroidWebView();

    window.__wtaStructuralBack = () => {
      try {
        // 1. If an opened note/flashcard/item is active in-page, step back to the list level first
        if (typeof window !== "undefined" && window.__wtaInPageBack) {
          const handled = window.__wtaInPageBack();
          if (handled) return true;
        }

        const fullPath =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : pathname || "/";

        const path = normalizePath(pathname || window.location.pathname || "/");

        // Return false ONLY at true root ("/")
        if (path === "/" || path === "") {
          return false;
        }

        // Structural parent evaluation
        const parent = structuralParent(fullPath);
        if (!parent || parent === fullPath || parent === path) {
          if (path !== "/") {
            const upOne = structuralParent(path);
            if (upOne && upOne !== path) {
              router.push(upOne);
              return true;
            }
            router.push("/");
            return true;
          }
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
