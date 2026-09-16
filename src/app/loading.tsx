import BrandLoader from "@/components/BrandLoader";

/** Shown by Next.js during route transitions */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <BrandLoader size="lg" label="Loading…" />
    </div>
  );
}
