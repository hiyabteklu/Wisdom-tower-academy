import { categories } from "@/data/services";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Palette,
  PenTool,
  GraduationCap,
  Database,
  Globe,
  Briefcase,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="w-7 h-7" />,
  "pen-tool": <PenTool className="w-7 h-7" />,
  "graduation-cap": <GraduationCap className="w-7 h-7" />,
  database: <Database className="w-7 h-7" />,
  globe: <Globe className="w-7 h-7" />,
  briefcase: <Briefcase className="w-7 h-7" />,
  "book-open": <BookOpen className="w-7 h-7" />,
};

export function generateStaticParams() {
  return categories.map((cat) => ({
    category: cat.id,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryId } = await params;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryBackButton fallback="/digital" />

        {/* Category header */}
        <div className="mb-10 md:mb-12 animate-fade-up">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="p-3.5 rounded-2xl bg-wisdom-cyan/10 text-wisdom-cyan border border-wisdom-cyan/25 shrink-0">
              {iconMap[category.icon]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wisdom-cyan mb-1.5">
                {category.services.length} services
              </p>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {category.name}
              </h1>
              <p className="mt-2 text-wisdom-muted text-sm sm:text-base leading-relaxed">
                {category.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Clean ordered list — no image cards */}
        <div className="rounded-2xl border border-white/12 bg-wisdom-card/80 overflow-hidden shadow-card-3d">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white/90">Choose a service</p>
            <p className="text-xs text-wisdom-muted">Opens the request form</p>
          </div>

          <ol className="divide-y divide-white/8">
            {category.services.map((service, index) => (
              <li key={service.id}>
                <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-white/[0.03] transition-colors group">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-wisdom-dark/60 text-xs font-bold tabular-nums text-wisdom-muted group-hover:border-wisdom-cyan/30 group-hover:text-wisdom-cyan transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-white leading-snug group-hover:text-wisdom-cyan transition-colors">
                      {service.name}
                    </p>
                  </div>

                  <Link
                    href={`/request?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(category.name)}`}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-wisdom-cyan/35 bg-wisdom-cyan/10 px-3.5 py-2 text-xs sm:text-sm font-bold text-wisdom-cyan hover:bg-wisdom-cyan hover:text-wisdom-dark hover:border-wisdom-cyan transition-all duration-200"
                  >
                    Order
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-4 text-center text-xs text-wisdom-muted">
          Same request form for every service — describe scope, deadline, and files after you Order.
        </p>

        {/* Custom CTA */}
        <div className="mt-12 text-center p-8 sm:p-10 rounded-3xl bg-wisdom-card border border-white/12 shadow-card-3d">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">Need something custom?</h2>
          <p className="text-wisdom-muted mb-7 max-w-md mx-auto text-sm sm:text-base">
            Pricing is custom based on your project. Tell us what you need.
          </p>
          <Link
            href="/services/custom"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark hover:shadow-glow transition-all duration-300"
          >
            Custom request
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
