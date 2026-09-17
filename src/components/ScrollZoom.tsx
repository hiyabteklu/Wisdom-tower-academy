"use client";

import { useEffect } from "react";

/**
 * Site-wide scroll zoom — works scrolling down and up.
 * GPU-friendly: transform + opacity only (no blur).
 * Disabled entirely inside the native app WebView (wta-native-app).
 */
const SELECTOR = [
  "[data-scroll-zoom]",
  "main .card-3d",
  "main .surface-card",
  "main .stat-card",
  "main .infinity-card",
  "main section",
  "main .stagger-children > *",
].join(", ");

function isNativeApp(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("wta-native-app") ||
    document.body.classList.contains("wta-native-app") ||
    /WisdomTowerApp/i.test(navigator.userAgent)
  );
}

function shouldSkip(el: Element): boolean {
  if (el.closest("[data-scroll-zoom-skip]")) return true;
  if (
    el.closest(
      ".notes-reading-surface, .study-prose, [data-learning-content], .formatted-body"
    )
  ) {
    return true;
  }
  if (el.closest("header, footer, nav")) return true;
  if (el.closest('main [class*="learning"], main article.study-prose')) return true;
  const tag = el.tagName.toLowerCase();
  return tag === "script" || tag === "style" || tag === "link";
}

function markAndObserve(root: ParentNode, observer: IntersectionObserver) {
  const nodes = root.querySelectorAll?.(SELECTOR);
  if (!nodes) return;
  nodes.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (shouldSkip(el)) return;
    if (el.dataset.szReady === "1") return;
    el.classList.add("sz-item");
    el.dataset.szReady = "1";
    observer.observe(el);
  });
}

export default function ScrollZoom() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Native app: never attach opacity traps (UA + class)
    if (isNativeApp()) {
      document.documentElement.classList.add("wta-native-app");
      document.body?.classList.add("wta-native-app");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        el.classList.add("sz-item", "sz-in");
      });
      return;
    }

    document.documentElement.classList.add("sz-smooth");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            const parent = el.parentElement;
            if (parent && parent.classList.contains("stagger-children")) {
              const kids = parent.children;
              let idx = 0;
              for (let i = 0; i < kids.length; i++) {
                if (kids[i] === el) break;
                if ((kids[i] as HTMLElement).classList?.contains("sz-item")) idx++;
              }
              el.style.transitionDelay = `${Math.min(idx * 55, 280)}ms`;
            } else {
              el.style.transitionDelay = "0ms";
            }
            el.classList.add("sz-in");
          } else {
            el.style.transitionDelay = "0ms";
            el.classList.remove("sz-in");
          }
        }
      },
      {
        threshold: [0, 0.08, 0.15],
        rootMargin: "-6% 0px -6% 0px",
      }
    );

    markAndObserve(document, observer);

    let moTimer: ReturnType<typeof setTimeout> | null = null;
    const mo = new MutationObserver(() => {
      if (moTimer) clearTimeout(moTimer);
      moTimer = setTimeout(() => markAndObserve(document, observer), 80);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      if (moTimer) clearTimeout(moTimer);
      document.documentElement.classList.remove("sz-smooth");
    };
  }, []);

  return null;
}
