import { categories, totalServices } from "@/data/services";
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

const gradientMap: Record<string, string> = {
  "graphic-print-design": "from-pink-500/20 to-purple-500/10",
  "writing-editorial": "from-blue-500/20 to-cyan-500/10",
  "academic-research": "from-amber-500/20 to-orange-500/10",
  "data-tech": "from-emerald-500/20 to-teal-500/10",
  "web-digital-marketing": "from-violet-500/20 to-indigo-500/10",
  "business-strategy": "from-rose-500/20 to-red-500/10",
  "education-multimedia": "from-sky-500/20 to-blue-500/10",
};

export default function ServicesPage() {
  return (
    <div className="relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wisdom-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
              Our Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Explore our comprehensive portfolio across seven powerful categories. One partner for everything you need.
            </p>
            <p className="mt-3 text-sm text-wisdom-cyan font-medium">
              {totalServices}+ professional services
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-24">
            {categories.map((category, idx) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-28"
              >
                {/* Category Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientMap[category.id]} border border-white/5 text-wisdom-cyan`}>
                      {iconMap[category.icon]}
                    </div>
                    <div>
                      <div className="text-sm text-wisdom-cyan font-medium mb-1">
                        Category {String(idx + 1).padStart(2, "0")}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
                      <p className="text-wisdom-muted mt-1.5 max-w-xl">{category.tagline}</p>
                    </div>
                  </div>
                  <div className="text-sm text-wisdom-muted md:text-right">
                    <span className="text-2xl font-bold text-white">{category.services.length}</span> services
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.services.map((service, sIdx) => (
                    <div
                      key={service.id}
                      className="group relative p-5 rounded-2xl bg-wisdom-card/80 border border-white/5 hover:border-wisdom-cyan/30 hover:bg-wisdom-card transition-all duration-300 hover:shadow-lg hover:shadow-wisdom-cyan/5 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-wisdom-cyan/10 text-wisdom-cyan text-xs font-semibold flex items-center justify-center group-hover:bg-wisdom-cyan group-hover:text-wisdom-dark transition-colors">
                          {sIdx + 1}
                        </span>
                        <h3 className="font-medium text-sm leading-snug pt-1 group-hover:text-wisdom-cyan transition-colors">
                          {service.name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-28 relative overflow-hidden rounded-3xl border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-wisdom-cyan/10 via-wisdom-card to-purple-500/10" />
            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Need something custom?
              </h2>
              <p className="text-wisdom-muted mb-8 max-w-lg mx-auto text-lg">
                Don&apos;t see exactly what you need? We create tailored packages for unique projects.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold text-lg hover:bg-wisdom-cyan-dark transition-all hover:scale-105"
              >
                Let&apos;s Build Together
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
