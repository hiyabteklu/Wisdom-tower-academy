import type { ReactNode } from "react";

/*
 * Admin-only layout (slice A2 of docs/ADMIN_MOBILE_PLAN.md).
 * Wraps /admin and /admin/payments only; student pages are untouched.
 * It is a SAFETY NET for sideways overflow and WebView gesture/tap quirks,
 * not the fix: the real overflow causes are removed panel by panel (A5 to A16).
 * - overflow-x: clip (not hidden): clips sideways overflow WITHOUT making a scroll
 *   container, so position: sticky headers keep working.
 * - overscroll-behavior-y: contain on the page: no rubber-band chaining into the app.
 * - no tap-highlight flash, long words/ids wrap instead of widening the page.
 * touch-action: pan-y is NOT set yet on purpose: wide panels (tables) would become
 * unreachable before they are converted to cards. Add it after A16.
 */
const GUARD_CSS = `
html { overscroll-behavior-y: contain; -webkit-tap-highlight-color: transparent; }
.wta-admin-root { max-width: 100vw; overflow-x: clip; overflow-wrap: anywhere; -webkit-tap-highlight-color: transparent; }
`;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wta-admin-root">
      <style>{GUARD_CSS}</style>
      {children}
    </div>
  );
}
