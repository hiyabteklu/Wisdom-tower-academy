/**
 * Ethiopian secondary curriculum subjects.
 * Grades 9–10 share one subject set.
 * Grades 11–12 share one subject set.
 */

export type GradeSubject = {
  id: string;
  name: string;
  /** Lucide icon name key used by GradeSubjectIcon */
  icon: string;
  hint?: string;
  /** Optional cover image under public/images */
  image?: string;
};

const G9_G10_SUBJECTS: GradeSubject[] = [
  { id: "physics", name: "Physics", icon: "atom", hint: "Motion, forces, energy" },
  { id: "mathematics", name: "Mathematics", icon: "calculator", hint: "Algebra, geometry, number work" },
  { id: "information-technology", name: "Information Technology", icon: "monitor", hint: "Digital skills and tools" },
  { id: "history", name: "History", icon: "scroll", hint: "Past societies and change" },
  {
    id: "health-physical-education",
    name: "Health and Physical Education",
    icon: "heart",
    hint: "Health, fitness, and wellness",
  },
  { id: "geography", name: "Geography", icon: "globe", hint: "Earth systems and places" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Resources, markets, choices" },
  {
    id: "english-for-ethiopia",
    name: "English for Ethiopia",
    icon: "book",
    hint: "Reading, writing, communication",
  },
  {
    id: "citizenship-education",
    name: "Citizenship Education",
    icon: "scale",
    hint: "Rights, ethics, civic life",
  },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Matter, atoms, reactions" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Cells, organisms, life processes" },
  { id: "amharic", name: "Amharic", icon: "languages", hint: "Language and culture" },
];

const G11_G12_SUBJECTS: GradeSubject[] = [
  { id: "physics", name: "Physics", icon: "atom", hint: "Mechanics, energy, fields" },
  { id: "mathematics", name: "Mathematics", icon: "calculator", hint: "Advanced algebra and exam math" },
  {
    id: "information-technology",
    name: "Information Technology",
    icon: "monitor",
    hint: "Computing and digital skills",
  },
  { id: "history", name: "History", icon: "scroll", hint: "Ethiopia and global history" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Population, development, systems" },
  {
    id: "english-for-ethiopia",
    name: "English for Ethiopia",
    icon: "book",
    hint: "Academic English",
  },
  { id: "economics", name: "Economics", icon: "coins", hint: "Markets, macro, development" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Structure, reactions, equilibrium" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Genetics, physiology, ecology" },
  { id: "amharic", name: "Amharic", icon: "languages", hint: "Language and culture" },
  { id: "agriculture", name: "Agriculture", icon: "sprout", hint: "Crops, soil, and production" },
];

export function subjectsForGrade(gradeId: string): GradeSubject[] {
  if (gradeId === "9" || gradeId === "10") return G9_G10_SUBJECTS;
  if (gradeId === "11" || gradeId === "12") return G11_G12_SUBJECTS;
  return [];
}

export function getGradeSubject(
  gradeId: string,
  subjectId: string
): GradeSubject | undefined {
  return subjectsForGrade(gradeId).find((s) => s.id === subjectId);
}

/** @deprecated Streams removed — kept for any leftover imports during transition */
export type GradeStream = {
  id: "natural" | "social";
  label: string;
  blurb: string;
  accent: string;
  border: string;
  subjects: GradeSubject[];
};

/** @deprecated Use subjectsForGrade instead */
export function streamsForGrade(gradeId: string): GradeStream[] {
  const subjects = subjectsForGrade(gradeId);
  return [
    {
      id: "natural",
      label: "Subjects",
      blurb: "All subjects for this grade",
      accent: "text-emerald-300",
      border: "border-emerald-400/30",
      subjects,
    },
  ];
}
