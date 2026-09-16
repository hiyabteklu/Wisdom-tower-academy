# Agent / Developer notes — Wisdom Tower Academy

> **Read this before changing UI, flashcards, or the Android shell.**  
> Prevents the same regressions across different agents.

**Last updated:** 2026-09-16

---

## Repos

| Repo | Role |
|------|------|
| `hiyabteklu/Wisdom-tower-academy` | Website (Next.js 15). **Source of truth** for content, auth, packages, flashcards, quizzes, PDFs. |
| `hiyabteklu/Wisdom-tower-academy-app` | Android production app = native Compose chrome + full-screen WebView of the live site. |

Full architecture (must read):  
→ https://github.com/hiyabteklu/Wisdom-tower-academy-app/blob/main/ARCHITECTURE.md

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
6. Respect `prefers-reduced-motion` (CSS already handles this).

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
5. **Top-right notification icon**.
6. Bottom nav: Home / Learning / Packages / Account only.
7. Website header/footer remain hidden via the injected `wta-app-chrome` style.

### Why builds must stay reliable

- Website content changes deploy automatically (WebView always loads live URL).
- Only native chrome / OfflineVault / FLAG_SECURE changes require a new APK.
- Always update `ARCHITECTURE.md` and this file when chrome behaviour changes so the next agent does not re-introduce overlap or missing menu.

---

## Quick verification checklist

**Website (flashcards)**

- [ ] Tap card → smooth 3D flip, back side is cyan-tinted
- [ ] Swipe left / right → animated transition, no instant swap
- [ ] Know / Learning / Again still work and advance the deck

**Android app**

- [ ] Clock / battery never overlap logo or icons
- [ ] Scrolling the page does **not** hide the native top bar
- [ ] Hamburger opens About / Contact / FAQ / etc.
- [ ] Title reads "Wisdom Tower Academy"
- [ ] Notification icon is present on the top right

---

## Related docs

- `docs/NATIVE-ANDROID.md` — long-term pure-Compose vision (not current production)
- `docs/MOBILE-APP.md` — **deprecated** Capacitor notes
- App repo `ARCHITECTURE.md` — living production architecture
