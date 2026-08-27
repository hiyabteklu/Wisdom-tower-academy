"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/data/services";
import TalentPath from "@/components/TalentPath";
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
  CheckCircle2,
  ChevronDown,
  Users,
  Send,
  Target,
  Eye,
  Laptop,
  Shield,
  Clock,
  MessageSquare,
  FileText,
  Award,
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

const requirements = [
  {
    icon: Award,
    title: "Proven skill",
    body: "Portfolio, samples, or verifiable experience in the line you apply for.",
    accent: "from-amber-500/20 to-orange-500/5 border-amber-400/30 text-amber-300",
  },
  {
    icon: Eye,
    title: "Attention to detail",
    body: "Clean delivery and zero tolerance for sloppy handoffs.",
    accent: "from-sky-500/20 to-cyan-500/5 border-sky-400/30 text-sky-300",
  },
  {
    icon: Laptop,
    title: "Digital literacy",
    body: "Tools of your craft plus remote collaboration platforms.",
    accent: "from-violet-500/20 to-purple-500/5 border-violet-400/30 text-violet-300",
  },
  {
    icon: Shield,
    title: "Discipline",
    body: "Deadlines are commitments clients can depend on.",
    accent: "from-emerald-500/20 to-teal-500/5 border-emerald-400/30 text-emerald-300",
  },
  {
    icon: MessageSquare,
    title: "Clear communication",
    body: "Progress updates, precise questions, early escalation.",
    accent: "from-rose-500/20 to-pink-500/5 border-rose-400/30 text-rose-300",
  },
  {
    icon: Clock,
    title: "Ownership",
    body: "Treat every assignment as if your name is on the deliverable.",
    accent: "from-cyan-500/20 to-blue-500/5 border-cyan-400/30 text-cyan-300",
  },
];

export default function DigitalPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wisdom-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-16 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Our Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Seven focused categories — plus custom work when your project doesn&apos;t fit a list.
              One partner for digital, creative, and professional needs.
            </p>
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

          {/* ═══════ Work with us ═══════ */}
          <section className="mt-24 md:mt-32" id="work-with-us">
            <div className="text-center mb-10 md:mb-12">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-wisdom-cyan/90 mb-3">
                Contributors & talent
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Work with us?
              </h2>
              <p className="text-wisdom-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                Built by people who ship. Walk the path stage by stage, meet the bar, then apply to
                one service line — not a client order form.
              </p>
            </div>

            <div className="mb-12 md:mb-16">
              <TalentPath />
            </div>

            {/* Requirements grid */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">What we require</h3>
                  <p className="text-xs text-wisdom-muted">Non-negotiables before you apply</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 perspective-scene">
                {requirements.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.title}
                      className={`card-3d rounded-2xl border bg-gradient-to-br p-5 ${r.accent}`}
                    >
                      <div className="inline-flex p-2.5 rounded-xl bg-wisdom-dark/50 border border-white/10 mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-white mb-1">{r.title}</h4>
                      <p className="text-sm text-wisdom-muted leading-relaxed">{r.body}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-wisdom-muted text-center sm:text-left">
                Can&apos;t show these yet? Build them first — then return.
              </p>
            </div>

            {/* Start application picker */}
            <div
              id="start-application"
              className="rounded-3xl border border-wisdom-cyan/25 bg-wisdom-card p-6 sm:p-8 shadow-card-3d scroll-mt-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-wisdom-cyan/15 border border-wisdom-cyan/30 text-wisdom-cyan shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">Start application</h3>
                    <p className="text-sm text-wisdom-muted mt-1 max-w-lg leading-relaxed">
                      Expand a category, then pick the exact service line. You&apos;ll open the{" "}
                      <strong className="text-white/90">talent application form</strong> (not a client
                      quote request).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const open = openCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`rounded-2xl border transition-all ${
                        open
                          ? "border-wisdom-cyan/45 bg-wisdom-cyan/5 shadow-lg shadow-cyan-500/5"
                          : "border-white/10 bg-wisdom-dark/50 hover:border-white/20"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenCategory(open ? null : cat.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                        aria-expanded={open}
                      >
                        <span className="text-wisdom-cyan shrink-0 scale-90">{iconMap[cat.icon]}</span>
                        <span className="flex-1 text-sm font-semibold text-white/95">{cat.name}</span>
                        <span className="text-[10px] text-wisdom-muted hidden sm:inline">
                          {cat.services.length} roles
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-wisdom-muted transition-transform duration-300 ${
                            open ? "rotate-180 text-wisdom-cyan" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ${
                          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 border-t border-white/8 pt-2">
                            {cat.services.map((svc) => (
                              <Link
                                key={svc.id}
                                href={`/apply?service=${encodeURIComponent(svc.name)}&category=${encodeURIComponent(cat.name)}`}
                                className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-wisdom-muted hover:text-white hover:bg-wisdom-cyan/10 border border-transparent hover:border-wisdom-cyan/25 transition-all group/svc"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-wisdom-cyan/40 group-hover/svc:text-wisdom-cyan" />
                                <span className="leading-snug">{svc.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 text-[11px] text-wisdom-muted flex gap-2 leading-relaxed">
                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-wisdom-cyan/70" />
                On the form: letter of interest, portfolio link, experience, availability, and
                requirement confirmations.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-wisdom-cyan/10 via-wisdom-card to-wisdom-card px-6 py-5 sm:flex sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-wisdom-muted leading-relaxed max-w-xl">
                <span className="font-semibold text-white">We review for fit, not volume.</span>{" "}
                One strong application beats many weak ones.
              </p>
              <a
                href="#start-application"
                className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-wisdom-cyan/30 bg-wisdom-cyan/10 text-wisdom-cyan text-sm font-semibold hover:bg-wisdom-cyan/20 transition-colors shrink-0"
              >
                <Target className="w-4 h-4" />
                Pick a role above
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
