import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Target,
} from "lucide-react";

const programs = [
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    description:
      "Complete secondary pathways. Open a grade, then access books, videos, flashcards, question banks, and exams.",
    icon: <BookOpen className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    gradient: "from-sky-500/30 to-cyan-500/10",
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    cta: "Open grades",
    featured: true,
  },
  {
    id: "remedial",
    href: "/academy/remedial",
    name: "Remedial Programs",
    description:
      "Catch-up learning hubs — books, references, videos, flashcards, question banks, and exams. No grade selection.",
    icon: <Target className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    gradient: "from-amber-500/30 to-orange-500/10",
    accent: "text-amber-400",
    border: "hover:border-amber-400/40",
    cta: "Open resources",
    featured: false,
  },
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    description:
      "Nineteen first-year subjects — math, sciences, languages, civics, tech, and more — each with its own hub.",
    icon: <GraduationCap className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    gradient: "from-purple-500/30 to-pink-500/10",
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    cta: "Open subjects",
    featured: false,
  },
  {
    id: "uat",
    href: "/contact?topic=UAT",
    name: "UAT",
    description:
      "University Admission Test preparation with focused practice, mock exams, and expert strategies.",
    icon: <Award className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    gradient: "from-emerald-500/30 to-teal-500/10",
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    cta: "Learn more",
    featured: false,
  },
  {
    id: "gat",
    href: "/contact?topic=GAT",
    name: "GAT",
    description:
      "Graduate Admission Test coaching covering quantitative, verbal, and analytical sections.",
    icon: <Users className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    gradient: "from-rose-500/30 to-red-500/10",
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    cta: "Learn more",
    featured: false,
  },
];

export default function AcademyPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-18 animate-fade-up">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">
              Wisdom Tower Academy
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              Academic Excellence Pathways
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              From secondary school to university admission — structured programs designed for real
              results.
            </p>
          </div>

          <div className="perspective-scene grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={program.href}
                className={`card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card ${program.border} ${
                  program.featured ? "md:col-span-2 lg:col-span-1 ring-1 ring-sky-400/20" : ""
                }`}
              >
                <div className="relative h-44 md:h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${program.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/60 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${program.gradient} border border-white/15 ${program.accent}`}
                    >
                      {program.icon}
                    </div>
                  </div>
                  {program.featured && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300">
                      Expandable path
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-7">
                  <h3 className={`font-display text-xl font-bold mb-2 ${program.accent}`}>
                    {program.name}
                  </h3>
                  <p className="text-sm text-wisdom-muted leading-relaxed mb-5">{program.description}</p>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${program.accent}`}>
                    {program.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 relative overflow-hidden rounded-3xl border border-white/12 shadow-card-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/12 via-wisdom-card to-orange-500/8" />
            <div className="relative px-8 py-14 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Ready to start learning?</h2>
              <p className="text-wisdom-muted mb-8 max-w-lg mx-auto">
                Contact us to enroll or get a personalized study plan.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 text-wisdom-dark font-semibold hover:bg-amber-400 hover:scale-105 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
