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
    <div className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/digital"
          className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Digital Services
        </Link>

        <div className="flex items-start gap-5 mb-12">
          <div className="p-4 rounded-2xl bg-wisdom-cyan/10 text-wisdom-cyan border border-wisdom-cyan/20">
            {iconMap[category.icon]}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-wisdom-muted text-lg">{category.tagline}</p>
            <p className="text-sm text-wisdom-cyan mt-2">{category.services.length} services in this category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {category.services.map((service, idx) => (
            <Link
              key={service.id}
              href={`/request?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(category.name)}`}
              className="group p-5 rounded-2xl bg-wisdom-card border border-white/5 hover:border-wisdom-cyan/40 transition-all duration-300 hover:shadow-lg hover:shadow-wisdom-cyan/5 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-wisdom-cyan/10 text-wisdom-cyan text-sm font-semibold flex items-center justify-center group-hover:bg-wisdom-cyan group-hover:text-wisdom-dark transition-colors">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium leading-snug pt-1.5 group-hover:text-wisdom-cyan transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Request this service →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center p-10 rounded-2xl bg-wisdom-card border border-white/5">
          <h2 className="text-2xl font-bold mb-3">Need something custom?</h2>
          <p className="text-wisdom-muted mb-6 max-w-md mx-auto">
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
