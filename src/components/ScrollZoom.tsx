"use client";

import { useEffect } from "react";

/**
 * Site-wide scroll reveal: elements zoom into place as they enter the viewport.
 * Targets cards, sections, and explicit [data-scroll-zoom] markers.
 */
const SELECTOR = [
  "[data-scroll-zoom]",
  "main .card-3d",
  "main .surface-card",
  "main .stat-card",
  "main .infinity-card",
  "main section",
  "main .rounded-2xl.border",
  "main .rounded-3xl.border",
  "main .stagger-children > *",
].join(", ");

const SKIP = "a[href]\header, footer, nav, [data-scroll-zoom-skip]";

function shouldSkip(el: Element): boolean {
  if (el.closest("[data-scroll-zoom-skip]")) return true;
  if (el.closest("header, footer, nav")) return true;
  // Avoid animating tiny utility rows / pure wrappers without content weight
  const tag = el.tagName.toLowerCase();
  if (tag === "script" || tag === "style" || tag === "link") return true;
  return false;
}

function markAndObserve(root: ParentNode, observer: IntersectionObserver) {
  const nodes = root.querySelectorAll?.(SELECTOR);
  if (!nodes) return;
  nodes.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (shouldSkip(el)) return;
    if (el.dataset.szReady === "1") return;
    // Nested card inside already-observed section: still OK, observe both
    el.classList.add("sz-item");
    el.dataset.szReady = "1";
    observer.observe(el);
  });
}

export default function ScrollZoom() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        el.classList.add("sz-item", "sz-in");
      });
      return;
    }

    // Smooth page scroll (native)
    document.documentElement.classList.add("sz-smooth");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Stagger siblings in the same parent grid
          const parent = el.parentElement;
          if (parent) {
            const siblings = [...parent.children].filter(
              (c) => c.classList.contains("sz-item") && !c.classList.contains("sz-in")
            ) as HTMLElement[];
            const idx = siblings.indexOf(el);
            if (idx >= 0) {
              el.style.transitionDelay = `${Math.min(idx * 70, 420)}ms`;
            }
          }
          el.classList.add("sz-in");
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    markAndObserve(document, observer);

    // SPA navigations / late content
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            markAndObserve(node, observer);
            if (node.matches?.(SELECTOR) && !shouldSkip(node) && node.dataset.szReady !== "1") {
              node.classList.add("sz-item");
              node.dataset.szReady = "1";
              observer.observe(node);
            }
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      document.documentElement.classList.remove("sz-smooth");
    };
  }, []);

  return null;
}
