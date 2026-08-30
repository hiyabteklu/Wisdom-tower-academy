import PackagesCatalog from "@/components/PackagesCatalog";

export const metadata = {
  title: "Packages · Wisdom Tower Academy",
  description:
    "Grade 9–12 and branch packages; special tracks — Telebirr, CBE, local banks",
};

export default function PackagesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-2">
            Academy packages
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Choose your track
          </h1>
          <p className="mt-3 text-wisdom-muted leading-relaxed">
            Pay with Telebirr, CBE, or a local bank — we verify manually and unlock access.
          </p>
        </div>

        <PackagesCatalog />
      </div>
    </div>
  );
}
