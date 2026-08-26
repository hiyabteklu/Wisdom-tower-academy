import Link from "next/link";
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
  CheckCircle2,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="w-6 h-6" />,
  "pen-tool": <PenTool className="w-6 h-6" />,
  "graduation-cap": <GraduationCap className="w-6 h-6" />,
  database: <Database className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  "book-open": <BookOpen className="w-6 h-6" />,
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wisdom-cyan/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wisdom-cyan/10 border border-wisdom-cyan/20 text-wisdom-cyan text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-wisdom-cyan animate-pulse" />
            {totalServices}+ Professional Services
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Wisdom</span>{" "}
            <span className="text-wisdom-cyan">Tower</span>
          </h1>

          <p className="text-lg md:text-xl text-wisdom-muted max-w-2xl mx-auto mb-4">
            Comprehensive Service Portfolio
          </p>
          <p className="text-base md:text-lg text-wisdom-muted max-w-2xl mx-auto mb-10">
            Empowering your ideas with end-to-end digital, creative, and professional solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-wisdom-cyan text-wisdom-dark font-medium hover:bg-wisdom-cyan-dark transition-colors"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Let&apos;s Build Together
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-wisdom-navy/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-wisdom-cyan">{totalServices}+</div>
              <div className="text-sm text-wisdom-muted mt-1">Services</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-wisdom-cyan">7</div>
              <div className="text-sm text-wisdom-muted mt-1">Categories</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-wisdom-cyan">1</div>
              <div className="text-sm text-wisdom-muted mt-1">Integrated Partner</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-wisdom-cyan">∞</div>
              <div className="text-sm text-wisdom-muted mt-1">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Service Categories</h2>
            <p className="text-wisdom-muted max-w-2xl mx-auto">
              From creative design to academic rigor, data analysis to digital growth — everything under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/services#${category.id}`}
                className="group relative p-6 rounded-2xl bg-wisdom-card border border-white/5 hover:border-wisdom-cyan/30 transition-all duration-300 hover:shadow-lg hover:shadow-wisdom-cyan/5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-wisdom-cyan/10 text-wisdom-cyan group-hover:bg-wisdom-cyan group-hover:text-wisdom-dark transition-colors">
                    {iconMap[category.icon]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-wisdom-cyan transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-wisdom-muted line-clamp-2">
                      {category.tagline}
                    </p>
                    <div className="mt-3 text-xs text-wisdom-cyan">
                      {category.services.length} services →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-20 bg-wisdom-navy/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                70+ Services.{" "}
                <span className="text-wisdom-cyan">1 Integrated Partner.</span>
              </h2>
              <p className="text-wisdom-muted mb-8">
                From the first draft of your pitch deck to the final line of code on your website, Wisdom Tower provides the architectural framework for your success.
              </p>
              <ul className="space-y-3">
                {[
                  "End-to-end digital & creative solutions",
                  "Academic & research excellence",
                  "Data-driven insights & tech support",
                  "Business strategy that scales",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-wisdom-cyan shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-wisdom-cyan/20 via-wisdom-card to-wisdom-navy border border-white/5 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl font-bold text-wisdom-cyan mb-2">{totalServices}+</div>
                  <div className="text-wisdom-muted">Services under one roof</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build something great?</h2>
          <p className="text-wisdom-muted mb-8">
            Tell us about your project. We&apos;ll help you turn ideas into reality.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-wisdom-cyan text-wisdom-dark font-medium text-lg hover:bg-wisdom-cyan-dark transition-colors"
          >
            Let&apos;s Build Together
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
