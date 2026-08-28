"use client";

import Link from "next/link";
import { categories } from "@/data/services";
import TalentPath from "@/components/TalentPath";
import WelcomeVideoCard from "@/components/WelcomeVideoCard";
import BusinessRegisterSection from "@/components/BusinessRegisterSection";
import {
  Palette,
  PenTool,
  GraduationCap,
  Database,
  Globe,
  Briefcase,
  BookOpen,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

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
  "graphic-print-design": "from-pink-500/30 to-purple-500/10",
  "writing-editorial": "from-blue-500/30 to-cyan-500/10",
  "academic-research": "from-amber-500/30 to-orange-500/10",
  "data-tech": "from-emerald-500/30 to-teal-500/10",
  "web-digital-marketing": "from-violet-500/30 to-indigo-500/10",
  "business-strategy": "from-rose-500/30 to-red-500/10",
  "education-multimedia": "from-sky-500/30 to-blue-500/10",
};

const imageMap: Record<string, string> = {
  "graphic-print-design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
  "writing-editorial": "https://images.unsplash.com/photo-1455390580379-a91bf48e9372?w=600&q=80",
  "academic-research": "https://images.unsplash.com/photo-1481627834876-b7833e1d2af8?w=600&q=80",
  "data-tech": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "web-digital-marketing": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  "business-strategy": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
  "education-multimedia": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
};

export default function DigitalPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wisdom-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-14 animate-fade-up">
            <p className="section-eyebrow mb-4 justify-center">Digital services</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 tracking-tight text-balance">
              Our Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-balance">
              Seven focused categories — plus custom work when your project doesn't fit a list.
              One partner for digital, creative, and professional needs.
            </p>
          </div>

          <div className="mb-14 md:mb-16">
            <WelcomeVideoCard
              variant="digital"
              title="How we work with you"
              subtitle="A short intro to our service lines, custom work, and what to expect when you start a project."
            />
          </div>

          <div className="perspective-scene grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 stagger-children">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/services/${category.id}`}
                className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card hover:border-wisdom-cyan/40 h-full"
              >
                <div className="relative h-40 sm:h-44 overflow-hidden shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${imageMap[category.id]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/40 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientMap[category.id]} border border-white/20 text-wisdom-cyan shadow-md backdrop-blur-sm`}
                    >
                      {iconMap[category.icon]}
                    </div>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h3 className="font-display text-lg sm:text-xl font-bold mb-2 group-hover:text-wisdom-cyan transition-colors leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-base text-wisdom-muted line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {category.tagline}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-wisdom-cyan">
                      {category.services.length} services
                    </span>
                    <ArrowRight className="w-5 h-5 text-wisdom-muted group-hover:text-wisdom-cyan group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}

            <Link
              href="/services/custom"
              className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-wisdom-cyan/35 bg-wisdom-card hover:border-wisdom-cyan/60 h-full"
            >
              <div className="relative h-40 sm:h-44 overflow-hidden shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-wisdom-cyan/35 to-cyan-600/20 border border-wisdom-cyan/35 text-wisdom-cyan shadow-md backdrop-blur-sm">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2 group-hover:text-wisdom-cyan transition-colors leading-snug">
                  Custom order
                </h3>
                <p className="text-base text-wisdom-muted line-clamp-2 mb-4 flex-1 leading-relaxed">
                  Tell us who you are and what you need. We'll shape a package that isn't on the
                  standard list.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold text-wisdom-cyan">Submit a request</span>
                  <ArrowRight className="w-5 h-5 text-wisdom-muted group-hover:text-wisdom-cyan group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>

          <BusinessRegisterSection />

          {/* Work with us — cover card (like Academy partnership) + path expands on click */}
          <section className="mt-24 md:mt-32" id="work-with-us">
            <TalentPath />
          </section>
        </div>
      </div>
    </div>
  );
}
