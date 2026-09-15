/** Step-by-step admin navigation mirroring the public Academy structure. */

import { freshmanSubjects } from "@/data/freshman";
import { grades, resourceHubs } from "@/data/academy";
import { subjectsForGrade } from "@/data/grade-subjects";
import { specialPackages } from "@/data/special-packages";
import { packageIdForGrade } from "@/data/packages";

export type AdminNavNode = {
  id: string;
  label: string;
  packageId?: string;
  scopePath?: string;
  /** When true, file uploads for this branch go to Appwrite instead of Supabase storage */
  useAppwrite?: boolean;
  children?: AdminNavNode[];
};

const gradeNodes: AdminNavNode[] = grades.map((g) => {
  const subjects = subjectsForGrade(g.id);
  const packageId = packageIdForGrade(g.id);

  return {
    id: `grade-${g.id}`,
    label: g.label,
    packageId,
    useAppwrite: true,
    children: subjects.map((sub) => ({
      id: sub.id,
      label: sub.name,
      packageId,
      scopePath: `grade/${g.id}/${sub.id}`,
      useAppwrite: true,
      children: resourceHubs.map((h) => ({
        id: h.id,
        label: h.name,
        packageId,
        scopePath: `grade/${g.id}/${sub.id}`,
        useAppwrite: true,
      })),
    })),
  };
});

export const ADMIN_CONTENT_TREE: AdminNavNode[] = [
  {
    id: "grades",
    label: "Grades 9–12",
    useAppwrite: true,
    children: gradeNodes,
  },
  {
    id: "freshman",
    label: "Freshman",
    packageId: "freshman",
    children: freshmanSubjects.map((s) => ({
      id: s.id,
      label: s.name,
      packageId: "freshman",
      scopePath: `freshman/${s.id}`,
      children: resourceHubs.map((h) => ({
        id: h.id,
        label: h.name,
        packageId: "freshman",
        scopePath: `freshman/${s.id}`,
      })),
    })),
  },
  {
    id: "special",
    label: "Special packages",
    children: specialPackages.flatMap((pkg) =>
      pkg.semesters.map((sem) => ({
        id: `${pkg.slug}-${sem.id}`,
        label: `${pkg.name} · ${sem.shortLabel}`,
        packageId: sem.packageId,
        children: sem.courses.map((c) => ({
          id: c.slug,
          label: `${c.code} · ${c.title}`,
          packageId: sem.packageId,
          scopePath: `ece/${sem.id}/${c.slug}`,
          children: resourceHubs.map((h) => ({
            id: h.id,
            label: h.name,
            packageId: sem.packageId,
            scopePath: `ece/${sem.id}/${c.slug}`,
          })),
        })),
      }))
    ),
  },
];

export const HUB_CONTENT_DEFAULTS: Record<
  string,
  { contentType: string; hint: string }
> = {
  books: {
    contentType: "pdf",
    hint: "Upload a PDF. Students open it in the in-app reader.",
  },
  "short-notes": {
    contentType: "markdown",
    hint: "Short notes in Markdown. Supports headings, lists, [[terms]], ==highlights==.",
  },
  videos: {
    contentType: "video_url",
    hint: "Paste a YouTube/Vimeo URL or upload a video file (grades use Appwrite).",
  },
  flashcards: {
    contentType: "flashcard_deck",
    hint: "JSON in meta: { cards: [{front, back}] }.",
  },
  "question-banks": {
    contentType: "quiz",
    hint: "JSON in meta: { questions: [{prompt, choices, correct, solution}] }.",
  },
  exams: {
    contentType: "exam",
    hint: "JSON in meta: { durationMin, questions: [...] }.",
  },
};

/** Whether this scope should store files on Appwrite */
export function scopeUsesAppwrite(scopePath?: string | null): boolean {
  if (!scopePath) return false;
  return scopePath.startsWith("grade/");
}
