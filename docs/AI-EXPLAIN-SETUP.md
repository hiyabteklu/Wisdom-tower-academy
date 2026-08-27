# AI Explain feature — setup (do this once)

Code is already in the repo. You only need cloud keys + one SQL script.

## 1. Supabase (do this first)

1. Open [supabase.com](https://supabase.com) → your project (or create a free one).
2. **SQL Editor** → New query → paste everything from `docs/supabase-setup.sql` → **Run**.
3. **Project Settings → API** copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret; never put in client code)

## 2. Vercel AI Gateway

1. Open [vercel.com](https://vercel.com) → your team/account.
2. Go to **AI Gateway** (or AI section) → create an **API key**.
3. Copy it → `AI_GATEWAY_API_KEY`.
4. Free tier includes about **$5 credits / month** — enough for development and early traffic when explanations are cached.

Optional: set `AI_EXPLAIN_MODEL` to any Gateway model slug (default in code: `openai/gpt-oss-20b`).

## 3. Put env vars on Vercel

Project → **Settings → Environment Variables** → add for Production + Preview:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase |
| `AI_GATEWAY_API_KEY` | from AI Gateway |

Redeploy after saving.

## 4. Local dev

```bash
cp .env.example .env.local
# fill in the same values
npm install
npm run dev
```

Open: [http://localhost:3000/academy/quiz-demo](http://localhost:3000/academy/quiz-demo)

## How it works

- Student answers → **Explain** → `POST /api/explain`
- Server checks rate limit → Supabase cache by `question_id` → else Vercel AI SDK / Gateway
- Keys never leave the server
- If AI is down or unconfigured → polite fallback text; quiz still works
