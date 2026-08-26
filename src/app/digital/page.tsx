"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/data/services";
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
  ListOrdered,
  Send,
  Target,
  Eye,
  Laptop,
  Shield,
  Clock,
  MessageSquare,
  FileText,
  Award,
  Handshake,
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
    body: "You can show real work — portfolio, samples, or verifiable experience in the area you apply for.",
  },
  {
    icon: Eye,
    title: "Attention to detail",
    body: "Clean delivery, accurate brief-reading, and zero tolerance for sloppy handoffs.",
  },
  {
    icon: Laptop,
    title: "Digital literacy",
    body: "Comfortable with the tools of your craft and with remote collaboration platforms.",
  },
  {
    icon: Shield,
    title: "Discipline & reliability",
    body: "Deadlines are commitments. We build for clients who depend on predictable quality.",
  },
  {
    icon: MessageSquare,
    title: "Clear communication",
    body: "You can explain progress, ask precise questions, and escalate blockers early.",
  },
  {
    icon: Clock,
    title: "Ownership mindset",
    body: "You treat every assignment as if your name is on the final deliverable.",
  },
];

const steps = [
  {
    n: "01",
    title: "Choose your focus",
    body: "Select the category and specific service line that matches your strength.",
  },
  {
    n: "02",
    title: "Submit a letter of interest",
    body: "Short note: who you are, why this track, and how you work under pressure.",
  },
  {
    n: "03",
    title: "Share previous work",
    body: "Portfolio links, files, or case notes — quality over quantity.",
  },
  {
    n: "04",
    title: "Skills assessment",
    body: "A practical task or timed exercise in your declared area.",
  },
  {
    n: "05",
    title: "Interview",
    body: "Conversation on standards, availability, and how you handle feedback.",
  },
  {
    n: "06",
    title: "Onboarding training",
    body: "Briefing on workflows, quality bars, and client communication norms.",
  },
  {
    n: "07",
    title: "Paid internship",
    body: "Real assignments with supervision. Performance is measured, not assumed.",
  },
  {
    n: "08",
    title: "Join the team",
    body: "Strong performers move into ongoing contributor roles with clearer scope and pay.",
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
          {/* Hero */}
          <div className="text-center mb-14 md:mb-16 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Our Services
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Seven focused categories — plus custom work when your project doesn't fit a list.
              One partner for digital, creative, and professional needs.
            </p>
          </div>

          {/* Equal 8-card grid — 4 columns on large screens so custom sits as card 8 */}
          <div className="perspective-scene grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 stagger-children">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/services/${category.id}`}
                className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-wisdom-card hover:border-wisdom-cyan/35 h-full"
              >
                <div className="relative h-36 sm:h-40 overflow-hidden shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${imageMap[category.id]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/70 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientMap[category.id]} border border-white/10 text-wisdom-cyan`}
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
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/80 to-wisdom-cyan/10" />
                <div className="absolute bottom-3 left-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-wisdom-cyan/30 to-cyan-600/15 border border-wisdom-cyan/30 text-wisdom-cyan">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-wisdom-cyan transition-colors leading-snug">
                  Custom order
                </h3>
                <p className="text-sm text-wisdom-muted line-clamp-2 mb-3 flex-1">
                  Tell us who you are and what you need. We'll shape a package that isn't on the
                  standard list.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-wisdom-cyan font-medium">Submit a request</span>
                  <ArrowRight className="w-4 h-4 text-wisdom-muted group-hover:text-wisdom-cyan group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>

          {/* Work with us */}
          <section className="mt-24 md:mt-32" id="work-with-us">
            <div className="text-center mb-12 md:mb-14">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-wisdom-cyan/90 mb-3">
                Contributors & talent
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Work with us?
              </h2>
              <p className="text-wisdom-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                Wisdom Tower Digital is built by people who ship. We hire and develop contributors who
                meet a clear bar — not a vague “passion for design.” Read the requirements, follow the
                path, then apply to a specific service line below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
              {/* Requirements */}
              <article className="rounded-3xl border border-white/12 bg-wisdom-card p-6 sm:p-7 shadow-card-3d flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">What we require</h3>
                    <p className="text-xs text-wisdom-muted">Non-negotiables before you apply</p>
                  </div>
                </div>
                <ul className="space-y-4 flex-1">
                  {requirements.map((r) => {
                    const Icon = r.icon;
                    return (
                      <li key={r.title} className="flex gap-3">
                        <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/8 text-emerald-300/90">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/95">{r.title}</p>
                          <p className="text-xs text-wisdom-muted leading-relaxed mt-0.5">{r.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-6 pt-4 border-t border-white/8 text-xs text-wisdom-muted leading-relaxed">
                  If you cannot demonstrate these yet, build them first — then return. We invest in
                  people who already take their craft seriously.
                </p>
              </article>

              {/* Steps */}
              <article className="rounded-3xl border border-white/12 bg-wisdom-card p-6 sm:p-7 shadow-card-3d flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-300">
                    <ListOrdered className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">How it works</h3>
                    <p className="text-xs text-wisdom-muted">From interest to paid contribution</p>
                  </div>
                </div>
                <ol className="space-y-3.5 flex-1">
                  {steps.map((s) => (
                    <li key={s.n} className="flex gap-3">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-300 text-[11px] font-black flex items-center justify-center tabular-nums">
                        {s.n}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-white/95">{s.title}</p>
                        <p className="text-xs text-wisdom-muted leading-relaxed mt-0.5">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 pt-4 border-t border-white/8 flex items-start gap-2">
                  <Handshake className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-wisdom-muted leading-relaxed">
                    Internships are <span className="text-amber-200/90 font-medium">paid</span> when
                    you are on live client or internal work. Progression depends on delivery, not
                    tenure alone.
                  </p>
                </div>
              </article>

              {/* Start application */}
              <article className="rounded-3xl border border-wisdom-cyan/25 bg-wisdom-card p-6 sm:p-7 shadow-card-3d flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-wisdom-cyan/15 border border-wisdom-cyan/30 text-wisdom-cyan">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">Start application</h3>
                    <p className="text-xs text-wisdom-muted">Pick exact category → service</p>
                  </div>
                </div>
                <p className="text-xs text-wisdom-muted leading-relaxed mb-5">
                  Expand a category, then choose the service line you are applying for. You will go to
                  a request form pre-filled with that focus so we know exactly where you fit.
                </p>

                <div className="space-y-2 flex-1 max-h-[28rem] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const open = openCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className={`rounded-xl border transition-colors ${
                          open
                            ? "border-wisdom-cyan/40 bg-wisdom-cyan/5"
                            : "border-white/10 bg-wisdom-dark/40 hover:border-white/20"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenCategory(open ? null : cat.id)}
                          className="w-full flex items-center gap-3 px-3.5 py-3 text-left"
                          aria-expanded={open}
                        >
                          <span className="text-wisdom-cyan shrink-0 scale-75 origin-left">
                            {iconMap[cat.icon]}
                          </span>
                          <span className="flex-1 text-sm font-semibold text-white/95 leading-snug">
                            {cat.name}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-wisdom-muted shrink-0 transition-transform duration-300 ${
                              open ? "rotate-180 text-wisdom-cyan" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`grid transition-all duration-300 ease-out ${
                            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <ul className="px-2 pb-3 space-y-1 border-t border-white/8 pt-2">
                              {cat.services.map((svc) => (
                                <li key={svc.id}>
                                  <Link
                                    href={`/request?service=${encodeURIComponent(svc.name)}&category=${encodeURIComponent(cat.name)}&intent=apply`}
                                    className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-wisdom-muted hover:text-white hover:bg-white/5 transition-colors group/svc"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-wisdom-cyan/50 group-hover/svc:text-wisdom-cyan" />
                                    <span className="leading-snug">{svc.name}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                  <p className="text-[11px] text-wisdom-muted leading-relaxed flex gap-2">
                    <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-wisdom-cyan/70" />
                    After you select a service, describe your experience and attach or link previous
                    work in the form. Incomplete applications are not reviewed.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-wisdom-cyan hover:underline"
                  >
                    Questions before applying?
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-wisdom-cyan/10 via-wisdom-card to-wisdom-card px-6 py-6 sm:px-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
              <div className="max-w-xl">
                <p className="font-display font-bold text-lg mb-1">We review for fit, not volume</p>
                <p className="text-sm text-wisdom-muted leading-relaxed">
                  Applying to many lines at once does not help. Choose the one service you can defend
                  with samples. Quality of match beats quantity of applications.
                </p>
              </div>
              <a
                href="#work-with-us"
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-wisdom-cyan/30 bg-wisdom-cyan/10 text-wisdom-cyan text-sm font-semibold hover:bg-wisdom-cyan/20 transition-colors shrink-0"
              >
                <Target className="w-4 h-4" />
                Apply above
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
