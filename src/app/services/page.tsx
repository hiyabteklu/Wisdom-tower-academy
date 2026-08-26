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
import ServiceCard from "@/components/ServiceCard";

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="w-6 h-6" />,
  "pen-tool": <PenTool className="w-6 h-6" />,
  "graduation-cap": <GraduationCap className="w-6 h-6" />,
  database: <Database className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  "book-open": <BookOpen className="w-6 h-6" />,
};

export default function ServicesPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wisdom-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-14 md:py-22">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-18 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              Our Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Explore our full portfolio. Tap any service to request it.
            </p>
            <p className="mt-3 text-sm text-wisdom-cyan font-semibold tracking-wide">
              {totalServices}+ professional services
            </p>
          </div>

          <div className="space-y-20 md:space-y-24">
            {categories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <div className="flex items-center gap-3.5 mb-6 md:mb-8">
                  <div className="p-2.5 rounded-xl bg-wisdom-cyan/10 text-wisdom-cyan border border-white/10">
                    {iconMap[category.icon]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold truncate">
                      {category.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-wisdom-muted line-clamp-1">{category.tagline}</p>
                  </div>
                  <Link
                    href={`/services/${category.id}`}
                    className="hidden sm:inline-flex items-center gap-1 text-sm text-wisdom-cyan hover:underline shrink-0 font-medium"
                  >
                    View all
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="perspective-scene grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 stagger-children">
                  {category.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      categoryName={category.name}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-24 relative overflow-hidden rounded-3xl border border-white/12 shadow-card-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-wisdom-cyan/12 via-wisdom-card to-purple-500/10" />
            <div className="relative px-6 py-14 md:py-18 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Need something custom?</h2>
              <p className="text-wisdom-muted mb-8 max-w-lg mx-auto">
                Don&apos;t see exactly what you need? We create tailored packages for unique projects.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-105 transition-all duration-300"
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
