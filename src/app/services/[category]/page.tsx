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
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="w-8 h-8" />,
  "pen-tool": <PenTool className="w-8 h-8" />,
  "graduation-cap": <GraduationCap className="w-8 h-8" />,
  database: <Database className="w-8 h-8" />,
  globe: <Globe className="w-8 h-8" />,
  briefcase: <Briefcase className="w-8 h-8" />,
  "book-open": <BookOpen className="w-8 h-8" />,
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Link
          href="/digital"
          className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Digital Services
        </Link>

        <div className="flex items-start gap-4 sm:gap-5 mb-10">
          <div className="p-3 sm:p-4 rounded-2xl bg-wisdom-cyan/10 text-wisdom-cyan border border-wisdom-cyan/20 shrink-0">
            {iconMap[category.icon]}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-wisdom-muted text-sm sm:text-lg">{category.tagline}</p>
            <p className="text-sm text-wisdom-cyan mt-2">{category.services.length} services</p>
          </div>
        </div>

        {/* 3 cols phone · 4 tablet · 5 desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-14">
          {category.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={category.name}
            />
          ))}
        </div>

        <div className="text-center p-8 sm:p-10 rounded-2xl bg-wisdom-card border border-white/5">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Need something custom?</h2>
          <p className="text-wisdom-muted mb-6 max-w-md mx-auto text-sm sm:text-base">
            Pricing is custom based on your project. Tell us what you need.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-wisdom-cyan text-wisdom-dark font-medium hover:bg-wisdom-cyan-dark transition-colors"
          >
            Get a Custom Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
