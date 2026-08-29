"use client";

import Link from "next/link";
import { useState } from "react";
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
  palette: <Palette className="w-5 h-5" />,
  "pen-tool": <PenTool className="w-5 h-5" />,
  "graduation-cap": <GraduationCap className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  "book-open": <BookOpen className="w-5 h-5" />,
};

/** Category covers live at public/images/digital/{id}.jpg */
const categoryCover = (id: string) => `/images/digital/${id}.jpg`;

function CategoryCoverCard({
  href,
  title,
  tagline,
  meta,
  icon,
  imageSrc,
  accent = "cyan",
}: {
  href: string;
  title: string;
  tagline: string;
  meta: string;
  icon: React.ReactNode;
  imageSrc: string;
  accent?: "cyan" | "violet";
}) {
  const [failed, setFailed] = useState(false);
  const border =
    accent === "violet"
      ? "border-wisdom-cyan/35 hover:border-wisdom-cyan/60"
      : "border-white/12 hover:border-wisdom-cyan/40";

  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-wisdom-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(34,224,255,0.25)] ${border}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-wisdom-navy via-[#152238] to-wisdom-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a101c] via-[#0a101c]/40 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/35 text-wisdom-cyan backdrop-blur-md shadow-lg">
            {icon}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-wisdom-cyan transition-colors">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm sm:text-base text-wisdom-muted leading-relaxed line-clamp-2">
          {tagline}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
          <span className="text-sm font-semibold text-wisdom-cyan">{meta}</span>
          <span className="inline-flex items-center gap-1 text-sm text-wisdom-muted group-hover:text-wisdom-cyan transition-colors">
            Explore
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

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
              Pick a category, then order the exact service you need.
            </p>
          </div>

          <div className="mb-14 md:mb-16">
            <WelcomeVideoCard
              variant="digital"
              title="How we work with you"
              subtitle="A short intro to our service lines, custom work, and what to expect when you start a project."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {categories.map((category) => (
              <CategoryCoverCard
                key={category.id}
                href={`/services/${category.id}`}
                title={category.name}
                tagline={category.tagline}
                meta={`${category.services.length} services`}
                icon={iconMap[category.icon]}
                imageSrc={categoryCover(category.id)}
              />
            ))}

            <CategoryCoverCard
              href="/services/custom"
              title="Custom order"
              tagline="Tell us who you are and what you need. We'll shape a package that isn't on the standard list."
              meta="Submit a request"
              icon={<ClipboardList className="w-5 h-5" />}
              imageSrc="/images/digital/custom-order.jpg"
              accent="violet"
            />
          </div>

          <BusinessRegisterSection />

          <section className="mt-24 md:mt-32" id="work-with-us">
            <TalentPath />
          </section>
        </div>
      </div>
    </div>
  );
}
