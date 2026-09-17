# Agent / Developer notes — Wisdom Tower Academy

> **Read this before changing UI, flashcards, free resources, or the Android shell.**  
> Prevents the same regressions across different agents.

**Last updated:** 2026-09-17

---

## Repos

| Repo | Role |
|------|------|
| `hiyabteklu/Wisdom-tower-academy` | Website (Next.js 15). **Source of truth** for content, auth, packages, flashcards, quizzes, PDFs, free resources. |
| `hiyabteklu/Wisdom-tower-academy-app` | Android production app = native Compose chrome + full-screen WebView of the live site. |

Full architecture (must read):  
→ https://github.com/hiyabteklu/Wisdom-tower-academy-app/blob/main/ARCHITECTURE.md

---

## Free resources — required behaviour

| Page | Implementation |
|------|----------------|
| Success Stories | DB-driven (`free_resource_items`, kind `success_story`) |
| **Scholarship Info** | DB-driven (`page_slug = scholarships`, kind `scholarship`). **Never** leave as `AcademyComingSoon` if items exist in admin. |
| Universities | Hard-coded data + optional admin notes (`meta.universityId`) |
| Departments | Hard-coded + optional notes |
| Campus Life | Hard-coded sections in `CampusLifePage.tsx` + `PageNotes` |
| Study Techniques | Hard-coded sections in `StudyTechniquesPage.tsx` + `PageNotes` |

### Do not

- Replace Campus Life / Study Techniques / Universities with a single "PLACEHOLDER" string.
- Convert entire hard-coded guides into raw DB markdown (design quality drops).
- Leave Scholarships as Coming Soon after admin has published content.

Lib: `src/lib/free-resources.ts`

---

## Flashcards — required behaviour

**File:** `src/components/learning/FlashcardViewer.tsx`  
**CSS:** `src/app/ui-polish.css` (classes `.fc-scene`, `.fc-card`, `.fc-face`, `.fc-front`, `.fc-back`)

### Must have

1. **3D flip animation** on tap (not a plain content swap).
2. **Distinct back-side colour** (cyan-tinted gradient) so the flip is obvious.
3. **Swipe left** → next card with slide-out animation.
4. **Swipe right** → previous card.
5. Chevron buttons use the same animated transition.
6. Respect `prefers-reduced-motion` (and keep `.animate-fade-up` visible when reduced motion is on).

### Do not

- Revert to a single `bg-wisdom-card` div that only toggles text.
- Apply global `.card-3d` / `.perspective-scene` rules to the flashcard (those were intentionally flattened elsewhere to avoid skew; flashcards use isolated `.fc-*` classes).

---

## Android shell — required behaviour

**File (app repo):** `app/src/main/java/com/example/MainActivity.kt`

### Must have

1. **Status bar clean** — solid navy behind system icons; no app icons overlapping clock/battery.
2. **Fixed native top bar** — never disappears when the WebView content scrolls.
3. **Top-left hamburger menu** with: About, Contact us, FAQ, Privacy, Terms, My account.
4. **Branding:** logo mark + text **"Wisdom Tower Academy"**.
5. **Top-right notification icon** → opens **`/notifications` only** (not Settings).
6. Bottom nav: Home / Learning / Packages / Account only; `/notifications` must not reset the selected tab.
7. Website header/footer remain hidden via the injected `wta-app-chrome` style.

### Why builds must stay reliable

- Website content changes deploy automatically (WebView always loads live URL).
- Only native chrome / OfflineVault / FLAG_SECURE changes require a new APK.
- Always update app `ARCHITECTURE.md` and this file when chrome behaviour changes.

---

## Agent workflow hygiene

1. Prefer **small, focused commits** over rewriting entire pages.
2. Never overwrite a full page with `PLACEHOLDER` or a stub "Coming soon" if content already exists in git history or Supabase.
3. After UI changes, check reduced-motion and mobile width.
4. Stale Copilot branches (`copilot/*`) should be deleted after the PR is closed; do not re-merge obsolete WIP PRs onto main.

---

## Quick verification checklist

**Website**

- [ ] `/academy/scholarships` loads from Supabase (or shows intro + empty state — not permanent Coming soon)
- [ ] Campus Life / Study Techniques show full guides
- [ ] Flashcards: 3D flip + swipe
- [ ] `/notifications` exists for package status

**Android app**

- [ ] Clock / battery never overlap logo or icons
- [ ] Scrolling does **not** hide the native top bar
- [ ] Bell opens `/notifications` only
- [ ] Title reads "Wisdom Tower Academy"

---

## Related docs

- `docs/NATIVE-ANDROID.md` — long-term pure-Compose vision (not current production)
- `docs/MOBILE-APP.md` — **deprecated** Capacitor notes
- App repo `ARCHITECTURE.md` — living production architecture
- App repo `README.md` — how to download CI APK
