import {
  Users,
  Brain,
  BookOpen,
  Building2,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import PageNotes from "@/components/academy/PageNotes";
import {
  CampusFriends,
  CampusMind,
  CampusLectures,
  CampusPlaces,
  CampusChecklist,
  CampusFooter,
} from "@/components/academy/CampusLifeSections";

const navSections = [
  {
    id: "friends",
    title: "Friends & social life",
    blurb: "Staying close to people without losing your focus",
    accent: "text-rose-300",
    border: "border-rose-400/30",
    bg: "from-rose-500/12",
    icon: Users,
  },
  {
    id: "mind",
    title: "Energy & pressure",
    blurb: "Motivation dips, burnout signs, and real rest",
    accent: "text-violet-300",
    border: "border-violet-400/30",
    bg: "from-violet-500/12",
    icon: Brain,
  },
  {
    id: "lectures",
    title: "Lectures & class time",
    blurb: "Getting something useful out of every session",
    accent: "text-sky-300",
    border: "border-sky-400/30",
    bg: "from-sky-500/12",
    icon: BookOpen,
  },
  {
    id: "places",
    title: "Places, groups & staff",
    blurb: "Libraries, group work, and talking to instructors",
    accent: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "from-emerald-500/12",
    icon: Building2,
  },
];

export default function CampusLifePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-48 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-12 md:mb-14">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-teal-300/90 mb-3">
            Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            <span className="text-white">Campus </span>
            <span className="text-teal-300">life</span>
          </h1>
          <div className="space-y-4 text-wisdom-muted text-base sm:text-lg leading-relaxed">
            <p>
              Most of what decides your grades does not happen only at a desk with a highlighter.
              It happens in the hours between classes: who you sit with, how late you stay online,
              whether you recover after a hard week, and whether a weak lecture still leaves you with
              something you can revise.
            </p>
            <p>
              This page is a practical guide to that side of university: friendships, pressure,
              classrooms, and the buildings and people around you. Nothing here is a personality
              test. It is ordinary advice that works when you apply it imperfectly but consistently.
            </p>
          </div>
        </header>

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-14">
          {navSections.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.bg} to-transparent bg-wisdom-card/80 p-4 hover:bg-wisdom-card transition-colors`}
              >
                <div className={`mb-2 inline-flex p-2 rounded-lg bg-wisdom-dark/50 border border-white/10 ${s.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`font-display font-bold text-sm ${s.accent}`}>{s.title}</p>
                <p className="text-xs text-wisdom-muted mt-1 leading-snug">{s.blurb}</p>
              </a>
            );
          })}
        </nav>

        <CampusFriends />
        <CampusMind />
        <CampusLectures />
        <CampusPlaces />
        <CampusChecklist />
        <CampusFooter />
        <PageNotes pageSlug="campus-life" />
      </div>
    </div>
  );
}
