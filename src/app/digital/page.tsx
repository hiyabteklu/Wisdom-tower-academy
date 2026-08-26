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
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {totalServices}+ Professional Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg">
              Seven powerful categories. One integrated partner for all your digital, creative and professional needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/services/${category.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-wisdom-card hover:border-wisdom-cyan/30 transition-all duration-300 hover:shadow-xl hover:shadow-wisdom-cyan/5 hover:-translate-y-1"
              >
                <div className="relative h-40 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${imageMap[category.id]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/70 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientMap[category.id]} border border-white/10 text-wisdom-cyan`}>
                      {iconMap[category.icon]}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-wisdom-cyan transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-wisdom-muted line-clamp-2 mb-3">
                    {category.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-wisdom-cyan">
                      {category.services.length} services
                    </span>
                    <ArrowRight className="w-4 h-4 text-wisdom-muted group-hover:text-wisdom-cyan group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
