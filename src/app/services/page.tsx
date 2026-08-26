import { categories } from "@/data/services";
import {
  Palette,
  PenTool,
  GraduationCap,
  Database,
  Globe,
  Briefcase,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="w-7 h-7" />,
  "pen-tool": <PenTool className="w-7 h-7" />,
  "graduation-cap": <GraduationCap className="w-7 h-7" />,
  database: <Database className="w-7 h-7" />,
  globe: <Globe className="w-7 h-7" />,
  briefcase: <Briefcase className="w-7 h-7" />,
  "book-open": <BookOpen className="w-7 h-7" />,
};

export default function ServicesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-wisdom-muted max-w-2xl mx-auto text-lg">
            Explore our comprehensive portfolio of professional services across seven powerful categories.
          </p>
        </div>

        <div className="space-y-16">
          {categories.map((category) => (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-24"
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 rounded-xl bg-wisdom-cyan/10 text-wisdom-cyan">
                  {iconMap[category.icon]}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
                  <p className="text-wisdom-muted mt-1">{category.tagline}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 rounded-xl bg-wisdom-card border border-white/5 hover:border-wisdom-cyan/20 transition-colors"
                  >
                    <h3 className="font-medium text-sm leading-snug">
                      {service.name}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 text-center p-10 rounded-2xl bg-wisdom-card border border-white/5">
          <h2 className="text-2xl font-bold mb-3">Need a custom solution?</h2>
          <p className="text-wisdom-muted mb-6 max-w-lg mx-auto">
            Don&apos;t see exactly what you need? We create tailored packages for unique projects.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-wisdom-cyan text-wisdom-dark font-medium hover:bg-wisdom-cyan-dark transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
