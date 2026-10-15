import type { ReactNode } from "react";

/*
 * Admin-only layout (slice A2 of docs/ADMIN_MOBILE_PLAN.md).
 * Wraps /admin and /admin/payments only; student pages are untouched.
 * It is a SAFETY NET for sideways overflow and WebView gesture/tap quirks,
 * not the fix: the real overflow causes were removed panel by panel (A5 to A16).
 * - overflow-x: clip (not hidden): clips sideways overflow WITHOUT making a scroll
 *   container, so position: sticky headers keep working.
 * - overscroll-behavior-y: contain on the page: no rubber-band chaining into the app.
 * - no tap-highlight flash, long words/ids wrap instead of widening the page.
 * - touch-action: pan-y (added after A16, 2026-10-15): the page only pans vertically, so a
 *   sideways drag cannot fight the app's own gestures. Safe now because a fresh clone shows
 *   no overflow-x-auto, min-w-max or <table> left in src/app/admin or src/components/admin.
 *   If a future panel needs a sideways scroller, it must opt in with its own touch-action.
 */
const GUARD_CSS = `
html { overscroll-behavior-y: contain; -webkit-tap-highlight-color: transparent; }
.wta-admin-root { max-width: 100vw; overflow-x: clip; overflow-wrap: anywhere; touch-action: pan-y; -webkit-tap-highlight-color: transparent; }
`;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wta-admin-root">
      <style>{GUARD_CSS}</style>
      {children}
    </div>
  );
}
