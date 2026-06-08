# Moving AcreHub to a new laptop

**Good news:** almost nothing is tied to the laptop. The **code** lives on GitHub, the
**database** lives on Supabase (cloud), and the **live site** is hosted on Vercel (cloud,
auto-deploys from GitHub). A laptop is just an editor. To work on the new machine you only
need to: install the tools → clone the repo → install packages → add the secret keys → run.

The only things that DON'T come from GitHub (by design) are:
- `node_modules/` — rebuilt by `npm install` (never copied).
- `.env.local` — your secret keys. Gitignored. You copy these over manually (see Step 5).

---

## 1. Install the tools (once, on the new laptop)
- **Git** — https://git-scm.com/download/win
- **Node.js LTS (v20.19 or newer)** — https://nodejs.org  (the project warns on older Node)
- **VS Code** — https://code.visualstudio.com
- Sign in to **GitHub** inside VS Code (Accounts icon, bottom-left) so you can pull/push.

## 2. Clone the repo
In VS Code: **View → Command Palette → "Git: Clone"**, paste:
```
https://github.com/sg19811/bhumi.git
```
Pick a folder (e.g. `C:\bhumi`), then **Open** the cloned folder.
(Or in a terminal: `git clone https://github.com/sg19811/bhumi.git`)

## 3. Install packages
Open a terminal in VS Code (**Terminal → New Terminal**) and run:
```
npm install
```

## 4. Create your env file from the template
```
copy .env.example .env.local
```
(PowerShell: `Copy-Item .env.example .env.local`)

## 5. Paste the secret values into `.env.local`
`.env.example` lists the variable **names**; you fill in the real **values**. Get them from:
- **Easiest:** copy the existing `.env.local` from the OLD laptop (USB stick, or a password
  manager / secure note). It already has the 3 required values.
- **Or re-fetch from the dashboards:**
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
    → Supabase dashboard → your project → **Settings → API**.

⚠️ Never paste these keys into chat, email, or a committed file. `.env.local` is gitignored on
purpose. The `SUPABASE_SERVICE_ROLE_KEY` is especially sensitive (it bypasses security rules).

Optional keys (leave blank to keep the feature off):
- `ANTHROPIC_API_KEY` → enables the farm-plot AI features (console.anthropic.com).
- Analytics / email keys — see `.env.example`.

## 6. Run it
```
npm run dev
```
It prints a local URL — usually **http://localhost:3000** (on the old laptop it was 3001
only because another program held 3000). Open that URL in your browser.

That's it — you're running the full app against the same live database.

---

## Notes & gotchas
- **Database is shared and in the cloud.** Both laptops talk to the *same* Supabase project,
  so you do **not** re-run the SQL migrations after moving — they're already applied. The only
  outstanding one is `supabase-farm-plots-phase3.sql` (run it once when you're ready; see
  `docs/pending-report.md`).
- **Deploying is not laptop-dependent.** Pushing to `main` on GitHub triggers Vercel
  automatically, from any machine.
- **First read for any code work:** `CLAUDE.md` + `AGENTS.md` (this repo uses Next.js 16 with
  breaking changes — read `node_modules/next/dist/docs/` before writing Next.js code).
- **Useful commands:**
  - `npm run dev` — local dev server
  - `npm run build` — production build (catches errors)
  - `npm run test:typecheck` — TypeScript check
  - `npm run test:lint` — lint
  - `npm run test:smoke` — Playwright smoke tests
- **Branches not yet merged** (on GitHub, optional): `overnight/foundation-hardening` (now
  merged into main) and `chore/tracker-resync`. Nothing else is laptop-only — verified clean.
- **Sanity check after setup:** `git status` should say "nothing to commit, working tree clean",
  and `npm run build` should finish green.
