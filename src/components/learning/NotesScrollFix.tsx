"use client";

import { useEffect, useRef } from "react";

/**
 * Fixes two mobile scroll bugs in notes:
 * 1) Wide KaTeX / tables trap vertical page scroll when the finger starts on them
 * 2) Horizontal drag rubber-bands back to the start
 *
 * Strategy:
 * - Display math: scale to fit the viewport width (no nested horizontal scroller)
 * - Tables still wider after wrapping: one axis-lock touch handler so vertical
 *   gestures scroll the page and horizontal gestures scroll the table and stay put
 */
export default function NotesScrollFix({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];

    const fitKatex = () => {
      root.querySelectorAll<HTMLElement>(".katex-display").forEach((el) => {
        const katex = el.querySelector<HTMLElement>(".katex");
        if (!katex) return;

        // Reset before measuring
        katex.style.transform = "";
        katex.style.transformOrigin = "";
        el.style.height = "";
        el.style.overflowX = "visible";
        el.style.overflowY = "visible";

        const available = el.clientWidth || root.clientWidth;
        const needed = katex.scrollWidth;
        if (available > 0 && needed > available + 1) {
          const scale = Math.max(0.55, available / needed);
          katex.style.transform = `scale(${scale})`;
          katex.style.transformOrigin = "center top";
          // Reserve layout space so the next content is not covered
          el.style.height = `${Math.ceil(katex.getBoundingClientRect().height)}px`;
        }
      });
    };

    const bindTable = (el: HTMLElement) => {
      if (el.dataset.scrollBound === "1") return;
      el.dataset.scrollBound = "1";

      el.style.overflowX = "auto";
      el.style.overflowY = "hidden";
      (el.style as CSSStyleDeclaration & { webkitOverflowScrolling?: string }).webkitOverflowScrolling =
        "touch";
      el.style.overscrollBehaviorX = "contain";

      let startX = 0;
      let startY = 0;
      let axis: "h" | "v" | null = null;
      let baseScrollLeft = 0;

      const onStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        axis = null;
        baseScrollLeft = el.scrollLeft;
      };

      const onMove = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = x - startX;
        const dy = y - startY;

        if (!axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axis = Math.abs(dx) > Math.abs(dy) * 1.1 ? "h" : "v";
        }

        if (axis === "v") {
          // Vertical intent: do nothing here so the page keeps scrolling.
          // Temporarily disable our overflow so the browser does not steal the gesture.
          el.style.overflowX = "hidden";
          return;
        }

        // Horizontal intent: drive scrollLeft ourselves so it does not rubber-band back.
        const max = Math.max(0, el.scrollWidth - el.clientWidth);
        if (max <= 0) return;

        el.style.overflowX = "auto";
        const next = Math.min(max, Math.max(0, baseScrollLeft - dx));
        if (el.scrollLeft !== next) {
          el.scrollLeft = next;
        }
        // Prevent the page from also panning horizontally
        if (e.cancelable) e.preventDefault();
      };

      const onEnd = () => {
        el.style.overflowX = "auto";
        axis = null;
      };

      el.addEventListener("touchstart", onStart, { passive: true });
      // passive:false so we can preventDefault on horizontal drags
      el.addEventListener("touchmove", onMove, { passive: false });
      el.addEventListener("touchend", onEnd, { passive: true });
      el.addEventListener("touchcancel", onEnd, { passive: true });

      cleanups.push(() => {
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("touchmove", onMove);
        el.removeEventListener("touchend", onEnd);
        el.removeEventListener("touchcancel", onEnd);
        delete el.dataset.scrollBound;
      });
    };

    const scan = () => {
      fitKatex();
      root.querySelectorAll<HTMLElement>(".study-table-wrap").forEach(bindTable);
    };

    scan();

    // KaTeX / tables may appear after hydration or font load
    const mo = new MutationObserver(() => {
      requestAnimationFrame(scan);
    });
    mo.observe(root, { childList: true, subtree: true });

    const onResize = () => fitKatex();
    window.addEventListener("resize", onResize, { passive: true });

    // Fonts can change metrics after load
    document.fonts?.ready?.then(() => fitKatex()).catch(() => {});

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={rootRef} className="notes-scroll-fix w-full max-w-full">
      {children}
    </div>
  );
}
