# Image & logo storage (GitHub + Vercel free + Supabase free)

## Where each kind of file goes

| Asset type | Put it here | Why |
|------------|-------------|-----|
| **Site logo, bank logos, package cards, freshman thumbs, service icons** | `public/images/...` in this GitHub repo | Served by Vercel CDN, zero Supabase storage cost, works offline in build |
| **Payment receipts (user uploads)** | Supabase Storage bucket `payment-receipts` | Already wired in code; private user content |
| **User avatars** | Usually from Google/OAuth; optional later: Supabase `avatars` bucket | Not required now |
| **Hundreds of large course photos later** | Prefer Supabase Storage bucket `media` **or** external CDN | Avoid bloating the Git repo past ~1 GB soft limit |

**Rule of thumb on free tiers**
- Keep **static marketing/UI images** in `public/` (optimize to WebP/JPEG, aim &lt;200 KB each).
- Keep **user-generated files** in Supabase Storage.
- Do **not** commit raw 5–10 MB photos for every card.

---

## Folder map (replace placeholders by same filename)

```
public/
  images/
    brand/
      logo.svg              ← main site logo (also logo.png if you prefer)
      logo-mark.svg         ← square icon / favicon source
      og-cover.jpg          ← 1200×630 social share (16:9-ish)
    banks/
      telebirr.png
      cbe-birr.png
      awash.png
      dashen.png
      abyssinia.png
      cooperative.png
      wegagen.png
      hibret.png
      bunna.png
      zemen.png
      bank-generic.png      ← fallback
    packages/
      grade-9.jpg           ← 16:9 recommended
      grade-10.jpg
      grade-11.jpg
      grade-12.jpg
      freshman.jpg
      uat.jpg
      gat.jpg
      coc.jpg
      exit.jpg
    freshman/
      mathematics.jpg       ← 16:9 (1280×720 ideal)
      english-1.jpg
      physics.jpg
      psychology.jpg
      logic.jpg
      geography.jpg
      anthropology.jpg
      civics.jpg
      economics.jpg
      emerging-technology.jpg
      entrepreneurship.jpg
      global-trends.jpg
      history.jpg
      inclusiveness.jpg
      chemistry.jpg
      biology.jpg
      cpp-programming.jpg
      applied-math-1.jpg
      english-2.jpg
    services/
      digital-marketing.jpg
      social-media.jpg
      graphics-design.jpg
      web-development.jpg
      seo.jpg
      content-writing.jpg
    digital/
      hero.jpg
      register-business-1.jpg   ← 1:1 cards on Digital page
      register-business-2.jpg
      register-business-3.jpg
```

**How to swap in real files**
1. Export/optimize your image.
2. Name it **exactly** like the placeholder (same path + filename).
3. Replace the file in the repo (or upload via GitHub web UI).
4. Redeploy Vercel — no code change needed if the path matches.

URLs in the site are always: `/images/...` (maps to `public/images/...`).

---

## Supabase Storage (already used)

| Bucket | Purpose |
|--------|---------|
| `payment-receipts` | Order payment screenshots/PDFs |

Create via SQL in `docs/supabase-master.sql` (safe to re-run).
