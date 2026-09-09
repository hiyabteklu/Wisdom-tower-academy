# Wisdom Tower Academy — Native Android App (Jetpack Compose)

**Status (Sep 2026):** Pure native Jetpack Compose app is the official direction.  
The previous Capacitor WebView shell has been retired.

Package name: `com.wisdomtower.academy`  
Theme: Dark navy + cyan (matching website)  
Backend: Same Supabase project as the website (`https://amieczmpqrvavzjikbdi.supabase.co`)

---

## Goals

- Fast, smooth native UI (Jetpack Compose + Navigation)
- **Real data only** from the same Supabase project the website uses
- No invented / hardcoded demo subjects, notes, or prices
- Auth: real Supabase email/password (session in EncryptedSharedPreferences)
- Freshman free for signed-in users (same rule as website)
- Paid packages locked until ownership is confirmed via `enrollments` / `orders`
- Notes / PDFs / flashcards / quizzes load only from real storage URLs or `learning_resources` rows
- `FLAG_SECURE` (screenshot + screen-record block) — keep disabled only during active debugging
- Offline support (private encrypted storage) in a later phase

---

## Architecture (target)

```
app/
  data/
    api/          # Supabase client (ktor or supabase-kt)
    local/        # Room + EncryptedSharedPreferences + private file storage
    repository/   # Single source of truth
    model/        # Domain models matching website schema
  ui/
    theme/        # Navy/cyan Material 3 theme
    navigation/   # Compose Navigation
    screens/
      auth/
      home/       # Real package list from backend
      packages/
      subjects/
      viewer/     # Notes, PDF, Flashcards, Quiz
      downloads/
  MainActivity.kt
```

**Hard rules**
1. Never invent subjects, packages, or content.
2. If a package/subject has no published rows in Supabase → show honest empty / “Coming soon” state.
3. Only use the public anon key on the client. Never embed service-role keys.
4. All ownership checks go through `enrollments` (and verified `orders`).

---

## Current state (from AI Studio experiments)

- Multiple debug APKs were generated under the `ais-dev-...` domain.
- Auth flow, package listing, and some screens exist in Compose form.
- Previous builds mixed real Supabase calls with hardcoded / generated demo curriculum — this must be cleaned.
- `FLAG_SECURE` was temporarily commented out for debugging.
- Supabase URL is correctly set to `https://amieczmpqrvavzjikbdi.supabase.co`.

**Immediate priority:** make login + home + one package detail work against **real** tables only, then rebuild a clean debug APK.

---

## Phased plan

### Phase 0 — Foundation (now)
- [ ] Confirm exact Supabase schema (tables, RLS, storage buckets) — see Claude prompt below
- [ ] Clean AI Studio project: delete all hardcoded catalogs / fake generators
- [ ] Working email/password sign-in + sign-up against real Auth
- [ ] Session persistence with EncryptedSharedPreferences
- [ ] Home screen shows only packages that exist in backend (or honest empty state)
- [ ] One package detail → real subjects or clear “no content yet”

### Phase 1 — Core learning loop
- [ ] Subject hubs (notes, PDFs, flashcards, question banks, exams)
- [ ] Load content only from `learning_resources` + Storage signed URLs
- [ ] Ownership gating (Freshman free when signed in; paid packages require enrollment)
- [ ] Basic progress tracking

### Phase 2 — Polish & security
- [ ] Re-enable `FLAG_SECURE`
- [ ] Offline download of owned resources into private app storage
- [ ] Optional encryption of offline files
- [ ] Proper error / empty / offline states
- [ ] App icon, splash, versioning

### Phase 3 — Release
- [ ] Signed release AAB
- [ ] Play Console internal testing
- [ ] Privacy policy + data-safety form

---

## Key tables the app must respect

(Exact columns and RLS come from the live Supabase project — use the Claude prompt to extract them.)

- `orders`
- `enrollments`
- `learning_resources`
- `learning_progress`
- `profiles`
- Storage buckets used by the website for PDFs / notes

Package IDs must match the website exactly (`freshman`, `gat`, `exit-exam`, etc.).

---

## Security notes

| Feature                    | Status                          |
|---------------------------|---------------------------------|
| Real Supabase Auth        | Required                        |
| EncryptedSharedPreferences| Required for session            |
| FLAG_SECURE               | Temporarily off for debugging   |
| Private internal storage  | Required for future offline     |
| Anon key only on client   | Required                        |
| No fake content           | Hard rule                       |

---

## Related files in this repo

- Website is the source of truth for content and package structure.
- Old Capacitor docs and `capacitor.config.ts` are deprecated (kept for history).
- SQL setup scripts in `docs/` describe the intended schema; always verify against the live project.

---

## Next actions

1. Run the two prompts (Google AI Studio + Claude) provided by the assistant.
2. Paste the answers back so the Compose app can be aligned 1:1 with the real backend.
3. Rebuild a clean debug APK that only talks to real data.
