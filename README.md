# AccessStudio

AccessStudio helps Dr. Maya's Access to Computers students at Ventura
College build their own learning app, step by step, and share it on the
class wall. Students are adult learners with intellectual and developmental
disabilities, so the whole app uses simple adult language, large text, big
tap targets, and read-aloud buttons. It never feels childish.

## What students do

1. Type the class code (a door code, not a login).
2. Pick what to make: **Play a Game** or **Learn & Practice**, then a
   subject (word game, math game, vocabulary, math, and more), then how to
   answer, how long a round is, and what the timer is for.
3. Tap idea chips and sentence starters, or add their own words by typing
   or speaking. A live **My prompt so far** panel shows the prompt growing.
4. Add a first name (optional) — the finished page is titled like
   **Josh's app**. A privacy note says the app never asks for a full name,
   address, or phone number.
5. Pick a look: Bright & Energetic, Calm Ocean, Warm Sunset, or Bold
   High-Contrast.
6. Press **Make My App**. Claude Haiku builds the real working app right
   there on the same page — a playable game or practice app. The app makes
   up its own words and problems, so students never supply content and no
   teacher supplies anything.
7. Listen, try another version, or **Publish to Class Wall**.

The class wall is on the home page. Every card is a link that opens the
full working app, with a Listen button and a Back button. The teacher page
at `/teacher` (password only) lists every app, hides or deletes a card
with one tap, and exports CSV or JSON for portfolios and IEP or transition
records.

## Look

Greenhouse Studio on a white background (not cream): terracotta, leaf
green, and soil brown, a watercolor shelf banner as a full-width running
header on every page, and the welcome pill reading **"grow your ideas
with Dr. Maya"**. A hamburger dropdown menu (Home, Class Wall, Start a
New App) is the only navigation — no always-visible buttons.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React 19
- Supabase (`projects` table) for the class wall
- Claude Haiku (`claude-haiku-4-5-20251001`) through `@anthropic-ai/sdk`
  in a server-side route (`/api/generate`)
- All AI calls and database writes happen on the server. The generated
  app plays inside a sandboxed iframe (`sandbox="allow-scripts"`, no
  `allow-same-origin`), and its HTML is safety-checked before it is
  stored or shown.
- Rate limit: 10 generations per IP per hour (in-memory, per serverless
  instance — a fair-use guard, not a hard global cap).

## Run it locally

```bash
npm install
cp .env.example .env.local
# fill in the values in .env.local (see below)
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Where it comes from |
| --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys (pay-as-you-go) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Service role key (keep secret; server only) |
| `CLASS_ACCESS_CODE` | Pick a short, easy code and tell the class in person |
| `TEACHER_ADMIN_PASSWORD` | Pick a password only Dr. Maya knows |

## Set up Supabase

1. Create a free project at https://supabase.com (no project is created
   by this repo).
2. Open Dashboard → SQL Editor → New query, paste in `schema.sql`, and
   run it. It creates the `projects` table and turns on Row Level
   Security with no public policies, so only the server (service role
   key) can read and write.
3. Copy the Project URL and the service role key into the variables
   above.

## Deploy on Vercel

1. Push this repo to GitHub (see below).
2. In Vercel, import the repo. Vercel picks up the Next.js settings
   automatically.
3. In Vercel → Settings → Environment Variables, add all five variables
   from the table above.
4. Deploy. After each push to `main`, Vercel deploys the new version
   automatically.

## Push to GitHub

```bash
git init
git add .
git commit -m "AccessStudio: real app for Dr. Maya's Access to Computers class"
git branch -M main
git remote add origin https://github.com/maya-wq2626/accessstudio.git
git push -u origin main
```

`.env.local` is git-ignored. Never commit real keys or passwords.

## Accessibility (WCAG AA)

- Body text is 18px or larger; buttons and tap targets are at least
  48px tall.
- Every text/background pairing in the app shell and in all four
  student looks was audited with real contrast numbers — see
  `CONTRAST_AUDIT.md`. All 20 pairings pass WCAG AA (4.5:1 for normal
  text).
- Semantic HTML (header, nav, main, footer, headings), a skip link,
  visible keyboard focus, aria labels on controls, `aria-live` status
  messages, and built-in read-aloud (Web Speech API) on the result and
  detail views.
- The generated apps are told to use 18px+ text, 48px+ tap targets,
  high contrast, one task at a time, and a Listen button.

## What is NOT in this repo

- No Supabase project, no Vercel deployment, and no real keys, codes,
  or passwords. Those are set up by Dr. Maya (or with her approval) and
  live only in Vercel's environment settings.
- No student accounts, no PINs, no approval queue. The class code is
  the only guard.
