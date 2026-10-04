/**
 * Academic Level Options and Default My Learning Packages
 *
 * Configured according to Wisdom Tower Academy requirements:
 * - Grade 9 -> ["grade-9"]
 * - Grade 10 -> ["grade-10"]
 * - Grade 11 -> ["grade-11"]
 * - Grade 12 -> ["grade-12"]
 * - Remedial -> ["remedial"]
 * - Freshman -> ["freshman", "coc"] (both relevant to freshman students)
 * - 3rd Year (ECE) -> ["ece"] (Electrical and Computer Engineering)
 * - Other -> [] (kept empty until user specifies later from Settings)
 */

export const ACADEMIC_LEVEL_OPTIONS = [
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Remedial",
  "Freshman",
  "3rd Year (ECE)",
  "Other",
] as const;

export type AcademicLevel = (typeof ACADEMIC_LEVEL_OPTIONS)[number];

export const STORAGE_ENROLLED_COURSES = "wt_enrolled_courses_v2";

/**
 * Returns default course package IDs for My Learning based on Academic Level.
 */
export function getDefaultPackagesForAcademicLevel(level?: string | null): string[] {
  if (!level) return [];
  const normalized = level.trim().toLowerCase();

  if (normalized === "grade 9" || normalized.startsWith("grade 9") || normalized === "g9") {
    return ["grade-9"];
  }
  if (normalized === "grade 10" || normalized.startsWith("grade 10") || normalized === "g10") {
    return ["grade-10"];
  }
  if (normalized === "grade 11" || normalized.startsWith("grade 11") || normalized === "g11") {
    return ["grade-11"];
  }
  if (normalized === "grade 12" || normalized.startsWith("grade 12") || normalized === "g12") {
    return ["grade-12"];
  }
  if (normalized.includes("remedial")) {
    return ["remedial"];
  }
  if (normalized.includes("freshman")) {
    return ["freshman", "coc"];
  }
  if (
    normalized.includes("3rd year") ||
    normalized.includes("ece") ||
    normalized.includes("electrical")
  ) {
    return ["ece"];
  }

  // "Other" or unspecified custom level: Keep My Learning empty until user specifies later from Settings
  return [];
}
