export type ResourceType =
  | "books"
  | "references"
  | "videos"
  | "flashcards"
  | "question-banks"
  | "exams";

export interface ResourceHub {
  id: ResourceType;
  name: string;
  description: string;
  accent: string;
  glow: string;
  icon: string;
}

export interface Grade {
  id: string;
  label: string;
  short: string;
  subtitle: string;
  accent: string;
  ring: string;
  gradient: string;
}

export const grades: Grade[] = [
  {
    id: "9",
    label: "Grade 9",
    short: "G9",
    subtitle: "Foundation year — core subjects & study habits",
    accent: "text-sky-400",
    ring: "border-sky-400/40 hover:border-sky-400/70",
    gradient: "from-sky-500/25 via-sky-500/5 to-transparent",
  },
  {
    id: "10",
    label: "Grade 10",
    short: "G10",
    subtitle: "Build depth — practice & concept mastery",
    accent: "text-violet-400",
    ring: "border-violet-400/40 hover:border-violet-400/70",
    gradient: "from-violet-500/25 via-violet-500/5 to-transparent",
  },
  {
    id: "11",
    label: "Grade 11",
    short: "G11",
    subtitle: "Advance — exam readiness & application",
    accent: "text-amber-400",
    ring: "border-amber-400/40 hover:border-amber-400/70",
    gradient: "from-amber-500/25 via-amber-500/5 to-transparent",
  },
  {
    id: "12",
    label: "Grade 12",
    short: "G12",
    subtitle: "Peak year — finals, entrance & polish",
    accent: "text-emerald-400",
    ring: "border-emerald-400/40 hover:border-emerald-400/70",
    gradient: "from-emerald-500/25 via-emerald-500/5 to-transparent",
  },
];

export const resourceHubs: ResourceHub[] = [
  {
    id: "books",
    name: "Books",
    description: "Core textbooks and curated reading lists",
    accent: "text-sky-400",
    glow: "group-hover:shadow-sky-500/20",
    icon: "book",
  },
  {
    id: "references",
    name: "References",
    description: "Notes, summaries, and study guides",
    accent: "text-violet-400",
    glow: "group-hover:shadow-violet-500/20",
    icon: "library",
  },
  {
    id: "videos",
    name: "Videos",
    description: "Lesson explainers and walkthroughs",
    accent: "text-rose-400",
    glow: "group-hover:shadow-rose-500/20",
    icon: "video",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Quick recall decks for key concepts",
    accent: "text-amber-400",
    glow: "group-hover:shadow-amber-500/20",
    icon: "layers",
  },
  {
    id: "question-banks",
    name: "Question Banks",
    description: "Practice sets by topic and difficulty",
    accent: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/20",
    icon: "list",
  },
  {
    id: "exams",
    name: "Exams",
    description: "Past papers, mocks, and timed drills",
    accent: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/20",
    icon: "clipboard",
  },
];

export function getGrade(id: string) {
  return grades.find((g) => g.id === id);
}

export function getResource(id: string) {
  return resourceHubs.find((r) => r.id === id);
}
