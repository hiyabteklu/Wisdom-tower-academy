# Wisdom Tower Academy

Isolated education platform — Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways.

Sister product: [Wisdom-tower-digital](https://github.com/hiyabteklu/Wisdom-tower-digital)  
Live Digital: https://wisdomtower.tech  
Live Academy: https://wisdom-tower-academy.live

## Stack
- Next.js 15 + TypeScript + Tailwind (website)
- Supabase (use a **new** project — do not reuse Digital keys)
- Vercel (new project)
- **Android app:** Pure native Jetpack Compose (Kotlin) — see [docs/NATIVE-ANDROID.md](docs/NATIVE-ANDROID.md)

## Setup (website)
```bash
npm install
cp .env.example .env.local   # fill NEW Supabase keys + NEXT_PUBLIC_DIGITAL_URL
npm run dev
```

## Android app (Native)
Full plan, architecture, and status:

→ **[docs/NATIVE-ANDROID.md](docs/NATIVE-ANDROID.md)**

> **Note:** The old Capacitor shell approach has been retired in favor of a full native Compose app that talks directly to the same Supabase project as the website. `capacitor.config.ts` is kept only for historical reference and can be removed later.
