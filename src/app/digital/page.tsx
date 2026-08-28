"use client";

import Link from "next/link";
import { categories } from "@/data/services";
import TalentPath from "@/components/TalentPath";
import WelcomeVideoCard from "@/components/WelcomeVideoCard";
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
  Users,
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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wisdom-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Our Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Seven focused categories — plus custom work when your project doesn&apos;t fit a list.
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
                className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-wisdom-card hover:border-wisdom-cyan/35 h-full"
              >
                <div className="relative h-36 sm:h-40 overflow-hidden shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${imageMap[category.id]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/30 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientMap[category.id]} border border-white/15 text-wisdom-cyan shadow-md backdrop-blur-sm`}
                    >
                      {iconMap[category.icon]}
                    </div>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-wisdom-cyan transition-colors leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-sm text-wisdom-muted line-clamp-2 mb-3 flex-1">{category.tagline}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-wisdom-cyan">{category.services.length} services</span>
                    <ArrowRight className="w-4 h-4 text-wisdom-muted group-hover:text-wisdom-cyan group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}

            <Link
              href="/services/custom"
              className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-wisdom-cyan/30 bg-wisdom-card hover:border-wisdom-cyan/55 h-full"
            >
              <div className="relative h-36 sm:h-40 overflow-hidden shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/35 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-wisdom-cyan/30 to-cyan-600/15 border border-wisdom-cyan/30 text-wisdom-cyan shadow-md backdrop-blur-sm">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-wisdom-cyan transition-colors leading-snug">
                  Custom order
                </h3>
                <p className="text-sm text-wisdom-muted line-clamp-2 mb-3 flex-1">
                  Tell us who you are and what you need. We&apos;ll shape a package that isn&apos;t on the
                  standard list.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-wisdom-cyan font-medium">Submit a request</span>
                  <ArrowRight className="w-4 h-4 text-wisdom-muted group-hover:text-wisdom-cyan group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>

          {/* Work with us — compact path only */}
          <section className="mt-20 md:mt-24" id="work-with-us">
            <div className="text-center mb-8 md:mb-10">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-wisdom-cyan/90 mb-3">
                Contributors & talent
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Work with us?
              </h2>
              <p className="text-wisdom-muted max-w-xl mx-auto text-base leading-relaxed">
                Walk the path stage by stage, then apply. Requirements live inside each step — no
                extra checklist.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs text-wisdom-muted justify-center sm:justify-start">
              <Users className="w-3.5 h-3.5 text-wisdom-cyan" />
              Built by people who ship · paid internships on live work
            </div>

            <TalentPath />
          </section>
        </div>
      </div>
    </div>
  );
}
