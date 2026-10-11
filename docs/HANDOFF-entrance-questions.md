# Handoff: Home redesign + Entrance Questions

Any agent can pick this up. Tick items as they are finished and keep this file current.

## Request (from the owner)
1. Home page: remove the combined "Grade 9-12" card. Show Grade 9, 10, 11, 12 as separate top-level cards like Freshman / COC.
2. New package "Entrance Questions" (thumbnail `public/images/Entrance questions.jpeg`). Click -> two cards: Natural Science (`public/images/natural.jpeg`) and Social Science (`public/images/social.jpeg`).
   - Natural subjects: English, Mathematics, Scholastic Aptitude Test (SAT), Physics, Chemistry, Biology
   - Social subjects: English, Mathematics, Scholastic Aptitude Test (SAT), Geography, History, Economics
   - Each subject lists years 2014-2019. Exams per year come from Supabase (admin writes them).
3. Grade 9-12 subject cards use the photos in `public/images/Grade 9..12/`.
4. Remove the "Exam tips" subject from Grade 12.
5. Fix every related reference (back navigation, ownership, admin, locks).

Repo: `hiyabteklu/Wisdom-tower-academy`, branch `main` (Next.js 15 app router, Supabase, Appwrite files).

## Design decisions
- Route tree: `/academy/entrance-questions` -> `/[stream]` -> `/[subject]` -> `/[year]`.
- Year page = `HubContentView` with hub `exams`, package id `entrance-questions`.
- Supabase `learning_resources.scope_path` = `entrance/{stream}/{subject}/{year}` (e.g. `entrance/natural/physics/2016`), `package_id` = `entrance-questions`, `hub` = `exams`. No SQL migration needed (no constraint on scope_path).
- Grade routes `/academy/grades/{9..12}` are unchanged. Only the combined `/academy/grades` list page is retired (redirects to `/academy`).
- Entrance package is free for signed-in users (same as grades). It is intentionally NOT added to `academyPackages` so it never appears as a sellable item in catalog/cart.
- Subject image file names differ in extension per grade; see `GRADE_IMAGE_FILES` in `src/data/grade-subjects.ts`.

## Status

### Done (commit ce89c43)
- [x] `src/data/entrance-questions.ts` (streams, subjects, years, scope helper)
- [x] Pages: `src/app/academy/entrance-questions/{page.tsx,[stream]/page.tsx,[stream]/[subject]/page.tsx,[stream]/[subject]/[year]/page.tsx}`
- [x] `src/data/grade-subjects.ts`: subject images + removed `exam-tips`
- [x] `src/components/GradeStreamsPanel.tsx`: shows subject images (icon fallback)
- [x] Empty folders `public/images/Remedial`, `Grade 9..12` (with `.gitkeep`)

### Finishing commit (see git log; tick below once verified)
- [ ] `src/components/home/LandingPathways.tsx`: four grade cards + Entrance Questions card, combined card removed
- [ ] `src/app/academy/page.tsx`: same change
- [ ] `src/lib/ownership.ts`: add `entrance-questions` to `FREE_FOR_REGISTERED_PACKAGE_IDS` and grant free ids in `IS_FREE_MODE` (otherwise year pages show "Sign in to open")
- [ ] `src/data/admin-nav.ts`: Entrance Questions branch (stream > subject > year > exams)
- [ ] `src/lib/nav-parent.ts`: `PARENT_OF` + `parentLabel` for `/academy/entrance-questions`
- [ ] `src/data/content-availability.ts`: unlock/lock rules for `/academy/entrance-questions`
- [ ] `src/app/academy/grades/page.tsx`: redirect to `/academy`
- [ ] `src/app/academy/grades/[grade]/page.tsx`: back fallback `/academy/grades` -> `/learning`

### Not done / ideas
- [ ] Run `npm run build` and click through the flow (nothing here has been build-tested).
- [ ] Upload test exams in Admin > Content library > Entrance Questions and check they appear under the right year.
- [ ] Optional: thumbnails for entrance subjects (currently icons), and an Entrance card in `LearningContent.tsx` `AVAILABLE_COURSES` and `src/lib/academic-levels.ts`.
- [ ] Optional: `src/lib/student-knowledge-base.ts` still describes "Grade 9-12" as one package; update the wording if desired.
- [ ] Old Supabase rows with `scope_path = grade/12/exam-tips` are orphaned (harmless). Delete if wanted.

## Gotchas
- `public/images/Entrance questions.jpeg` has a space and capital E: use `/images/Entrance%20questions.jpeg`. Same for `Grade%209` etc.
- GitHub code search is unreliable for this repo; browse the tree when hunting references.
- Next 15: `params` is a Promise in server pages.
