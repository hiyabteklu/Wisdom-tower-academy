# Games Roadmap — Wisdom Tower Academy

## Live / In progress
### 1. Tower Defense of Knowledge
- **Status**: Live / MVP Phase 1 & 2
- **Location**: Website (Next.js App Router: `/games/tower-defense` & `/academy/exit-exam/tower-defense`)
- **Question source**: Exams section only (`hub: "exams"`, past matriculation papers, model exit exams, and timed drills). **Never question banks**.
- **Goal**: Survival / wave defense study game. Academic questions transform into marching adversaries advancing toward the Knowledge Citadel. Correct responses eliminate enemies with combo multipliers and particle bursts. Timeouts and misses inflict core damage while displaying complete pedagogical step-by-step mathematical solutions.
- **Key rules**:
  - Starting Tower Health: 5
  - Base Time Per Question: 25s (scaling tighter on later waves)
  - Wave Progression: Exponentially advancing waves with Scout (Fast), Standard (Basic), and Armored Boss enemies.
  - Multiplier Combos: 2x at 3 in a row, 3x at 5, 4x at 8.
  - Power-Ups: Chronos Stasis (Freeze timer/march for 12s), Logic Filter (50/50 removes 2 wrong options), Fortify Core (+1 Heart), Tactical Deflection (Skip).
  - Choice Fair Shuffle: Runtime choice permutation with correct index remapping, except when choices include "all of the above", "none of the above", "both A and B", etc.
  - Missed Questions Review: Complete breakdown list populated after each run with full KaTeX LaTeX derivations.
- **Offline**: Fully offline-capable once the page or exam track has loaded or cached (powered by client-side WebCache / `offlineStore.ts`).
- **Next steps after MVP**:
  - Global academic branch leaderboards.
  - Multi-part composite questions for End-of-Grade grand bosses.
  - Sound effects customization presets.

---

## Planned
### 2. Tower Climb
- **Status**: Planned (not started)
- **Location**: Website (Next.js) — decided to keep both games on web to avoid native complexity and ensure seamless offline parity across desktop, tablet, and mobile.
- **Question source**: Question Banks only (`hub: "question-banks"`, chapter quizzes). **Never Exams**.
- **Concept**: Vertical tower climb, one floor = one chapter, owl mascot, stars, zones, Review Attic, Daily Climb, etc.
- **Architecture Note**: Original native Compose ideas were intentionally moved to web so the Android app stays a thin shell WebView with native chrome.
- **Strict Constraint**: Do not implement until Tower Defense MVP is stable and certified.

---

## Rules for future agents
- **Tower Defense = Exams questions only** (Past papers, model exit exams, national entrance exams).
- **Tower Climb = Question Banks questions only** (Chapter practice questions, topical drills).
- **Both games live on the website** (Next.js App Router).
- **Android app remains WebView + light native chrome**; no native game engines in Kotlin/Compose.
- **Always document progress in this file** when starting or finishing any phase.
