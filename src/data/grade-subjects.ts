/**
 * Ethiopian secondary curriculum — Natural vs Social focus by grade.
 * Grades 9–10: general secondary (broad subject set, stream orientation).
 * Grades 11–12: preparatory streams (Natural Science / Social Science).
 */

export type GradeSubject = {
  id: string;
  name: string;
  /** Lucide icon name key used by GradeSubjectIcon */
  icon: string;
  hint?: string;
};

export type GradeStream = {
  id: "natural" | "social";
  label: string;
  blurb: string;
  accent: string;
  border: string;
  subjects: GradeSubject[];
};

const G9_NATURAL: GradeSubject[] = [
  { id: "math", name: "Mathematics", icon: "calculator", hint: "Algebra, geometry, number work" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Motion, forces, energy intro" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Matter, atoms, reactions" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Cells, organisms, life processes" },
  { id: "it", name: "Information Technology", icon: "monitor", hint: "Digital skills and tools" },
];

const G9_SOCIAL: GradeSubject[] = [
  { id: "english", name: "English", icon: "book", hint: "Reading, writing, communication" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Earth systems and places" },
  { id: "history", name: "History", icon: "scroll", hint: "Past societies and change" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Resources, markets, choices" },
  { id: "citizenship", name: "Citizenship Education", icon: "scale", hint: "Rights, ethics, civic life" },
  { id: "amharic", name: "Mother tongue / Amharic", icon: "languages", hint: "Language and culture" },
];

const G10_NATURAL: GradeSubject[] = [
  { id: "math", name: "Mathematics", icon: "calculator", hint: "Functions, geometry, statistics" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Waves, electricity foundations" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Bonding, stoichiometry intro" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Systems, ecology, health" },
  { id: "it", name: "Information Technology", icon: "monitor", hint: "Applications and problem solving" },
];

const G10_SOCIAL: GradeSubject[] = [
  { id: "english", name: "English", icon: "book", hint: "Comprehension and composition" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Human and physical geography" },
  { id: "history", name: "History", icon: "scroll", hint: "Regional and world contexts" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Production and national economy" },
  { id: "citizenship", name: "Citizenship Education", icon: "scale", hint: "Democracy and constitution" },
  { id: "amharic", name: "Mother tongue / Amharic", icon: "languages", hint: "Advanced language skills" },
];

const G11_NATURAL: GradeSubject[] = [
  { id: "math", name: "Mathematics", icon: "calculator", hint: "Advanced algebra and calculus path" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Mechanics, energy, fields" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Structure, reactions, equilibrium" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Genetics, physiology, ecology" },
  { id: "td", name: "Technical Drawing", icon: "ruler", hint: "Projection and technical graphics" },
  { id: "english", name: "English", icon: "book", hint: "Academic English" },
  { id: "it", name: "ICT", icon: "monitor", hint: "Computing for science pathways" },
];

const G11_SOCIAL: GradeSubject[] = [
  { id: "math", name: "Mathematics", icon: "calculator", hint: "Quantitative skills for social sciences" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Population, development, Ethiopia" },
  { id: "history", name: "History", icon: "scroll", hint: "Ethiopia and global history" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Markets, macro, development" },
  { id: "business", name: "General Business", icon: "briefcase", hint: "Enterprise and commerce basics" },
  { id: "english", name: "English", icon: "book", hint: "Academic English" },
  { id: "it", name: "ICT", icon: "monitor", hint: "Computing for social pathways" },
];

const G12_NATURAL: GradeSubject[] = [
  { id: "math", name: "Mathematics", icon: "calculator", hint: "Exam-ready pure and applied math" },
  { id: "physics", name: "Physics", icon: "atom", hint: "Electromagnetism, modern physics" },
  { id: "chemistry", name: "Chemistry", icon: "flask", hint: "Organic and physical chemistry" },
  { id: "biology", name: "Biology", icon: "leaf", hint: "Exam depth across life sciences" },
  { id: "td", name: "Technical Drawing", icon: "ruler", hint: "Advanced technical graphics" },
  { id: "english", name: "English", icon: "book", hint: "Leaving-exam English" },
  { id: "it", name: "ICT", icon: "monitor", hint: "Applied digital skills" },
];

const G12_SOCIAL: GradeSubject[] = [
  { id: "math", name: "Mathematics", icon: "calculator", hint: "Exam-ready quantitative skills" },
  { id: "geography", name: "Geography", icon: "globe", hint: "Exam depth in geo systems" },
  { id: "history", name: "History", icon: "scroll", hint: "Exam depth in historical analysis" },
  { id: "economics", name: "Economics", icon: "coins", hint: "Exam depth in economic theory" },
  { id: "business", name: "General Business", icon: "briefcase", hint: "Business and commerce" },
  { id: "english", name: "English", icon: "book", hint: "Leaving-exam English" },
  { id: "it", name: "ICT", icon: "monitor", hint: "Applied digital skills" },
];

export function streamsForGrade(gradeId: string): GradeStream[] {
  const naturalSubjects =
    gradeId === "9"
      ? G9_NATURAL
      : gradeId === "10"
        ? G10_NATURAL
        : gradeId === "11"
          ? G11_NATURAL
          : G12_NATURAL;
  const socialSubjects =
    gradeId === "9"
      ? G9_SOCIAL
      : gradeId === "10"
        ? G10_SOCIAL
        : gradeId === "11"
          ? G11_SOCIAL
          : G12_SOCIAL;

  const isPrep = gradeId === "11" || gradeId === "12";

  return [
    {
      id: "natural",
      label: isPrep ? "Natural science stream" : "Natural science focus",
      blurb: isPrep
        ? "University-prep natural track: sciences, math, and technical drawing."
        : "Science-heavy subjects that build toward a natural science stream in grades 11–12.",
      accent: "text-emerald-300",
      border: "border-emerald-400/30",
      subjects: naturalSubjects,
    },
    {
      id: "social",
      label: isPrep ? "Social science stream" : "Social science focus",
      blurb: isPrep
        ? "University-prep social track: geography, history, economics, and business."
        : "Humanities and social subjects that build toward a social science stream in grades 11–12.",
      accent: "text-sky-300",
      border: "border-sky-400/30",
      subjects: socialSubjects,
    },
  ];
}
