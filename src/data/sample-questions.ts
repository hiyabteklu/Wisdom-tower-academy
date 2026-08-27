/**
 * Pilot quiz bank for development.
 * Replace / extend with real content or load from Supabase later.
 */

export type QuizQuestion = {
  id: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  choices: string[];
  /** Index into choices */
  correctIndex: number;
};

export const sampleQuestions: QuizQuestion[] = [
  {
    id: "logic-001",
    subject: "Logic",
    difficulty: "easy",
    question: "If all A are B, and all B are C, which conclusion is valid?",
    choices: [
      "Some C are not A",
      "All A are C",
      "No A are C",
      "All C are A",
    ],
    correctIndex: 1,
  },
  {
    id: "math-001",
    subject: "Mathematics",
    difficulty: "easy",
    question: "What is the value of 2³ × 3²?",
    choices: ["36", "72", "18", "24"],
    correctIndex: 1,
  },
  {
    id: "physics-001",
    subject: "Physics",
    difficulty: "medium",
    question:
      "A car travels 60 km in 1.5 hours. What is its average speed in km/h?",
    choices: ["30", "40", "45", "90"],
    correctIndex: 1,
  },
  {
    id: "civics-001",
    subject: "Civics",
    difficulty: "easy",
    question: "In a democratic system, the primary source of political authority is:",
    choices: [
      "The military",
      "The people",
      "A single ruling party only",
      "Foreign governments",
    ],
    correctIndex: 1,
  },
  {
    id: "bio-001",
    subject: "Biology",
    difficulty: "medium",
    question: "Which organelle is primarily responsible for producing ATP in eukaryotic cells?",
    choices: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"],
    correctIndex: 2,
  },
];

export function getSampleQuestions(subject?: string): QuizQuestion[] {
  if (!subject) return sampleQuestions;
  const key = subject.toLowerCase();
  return sampleQuestions.filter((q) => q.subject.toLowerCase() === key);
}
