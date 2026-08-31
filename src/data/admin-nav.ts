/** Step-by-step admin navigation mirroring the public Academy structure. */

import { freshmanSubjects } from "@/data/freshman";
import { resourceHubs } from "@/data/academy";
import { specialPackages } from "@/data/special-packages";

export type AdminNavNode = {
  id: string;
  label: string;
  packageId?: string;
  scopePath?: string;
  children?: AdminNavNode[];
};

export const ADMIN_CONTENT_TREE: AdminNavNode[] = [
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
    hint: "Upload a PDF. Students open it in the web reader and can download.",
  },
  references: {
    contentType: "markdown",
    hint: "Chapter notes in Markdown. Supports headings, lists, bold.",
  },
  videos: {
    contentType: "video_url",
    hint: "Paste a YouTube/Vimeo URL or storage path later.",
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
