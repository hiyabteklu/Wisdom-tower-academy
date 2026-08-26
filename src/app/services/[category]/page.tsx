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
import ServiceCard from "@/components/ServiceCard";
import CategoryBackButton from "@/components/CategoryBackButton";

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
        <CategoryBackButton fallback="/digital" />

        <div className="flex items-start gap-4 sm:gap-5 mb-10 md:mb-12 animate-fade-up">
          <div className="p-3 sm:p-4 rounded-2xl bg-wisdom-cyan/10 text-wisdom-cyan border border-wisdom-cyan/25 shrink-0">
            {iconMap[category.icon]}
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
              {category.name}
            </h1>
            <p className="text-wisdom-muted text-sm sm:text-lg">{category.tagline}</p>
            <p className="text-sm text-wisdom-cyan mt-2 font-medium">{category.services.length} services</p>
          </div>
        </div>

        <div className="perspective-scene grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-16 stagger-children">
          {category.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={category.name}
            />
          ))}
        </div>

        <div className="text-center p-8 sm:p-11 rounded-3xl bg-wisdom-card border border-white/12 shadow-card-3d">
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">Need something custom?</h2>
          <p className="text-wisdom-muted mb-7 max-w-md mx-auto text-sm sm:text-base">
            Pricing is custom based on your project. Tell us what you need.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark hover:shadow-glow transition-all duration-300"
          >
            Get a Custom Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
