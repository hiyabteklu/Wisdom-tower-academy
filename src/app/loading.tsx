import BrandLoader from "@/components/BrandLoader";

/**
 * Shown by Next.js during route transitions.
 * Normal browsers: Renders the BrandLoader circular indicator.
 * Native Android WebView: Suppressed via CSS and BrandLoader so only the native GIF plays.
 */
export default function Loading() {
  return (
    <div
      className="wta-route-loader min-h-[60vh] flex items-center justify-center py-16"
      data-wta-spinner="true"
      data-nextjs-loading="true"
    >
      <BrandLoader size="lg" label="Loading…" />
    </div>
  );
}
