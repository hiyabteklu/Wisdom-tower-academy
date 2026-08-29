# Wisdom Tower Academy

Isolated education platform — Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways.

Sister product: [Wisdom-tower-digital](https://github.com/hiyabteklu/Wisdom-tower-digital)  
Live Digital: https://wisdom-tower-digital.vercel.app

## Stack
- Next.js 15 + TypeScript + Tailwind
- Supabase (use a **new** project — do not reuse Digital keys)
- Vercel (new project)

## Setup
```bash
npm install
cp .env.example .env.local   # fill NEW Supabase keys + NEXT_PUBLIC_DIGITAL_URL
npm run dev

