# Blog Comments — Plan & Resume Doc

**Status:** PLANNING — not built yet. Nothing wired into the site. This doc lets us resume cold on any day.
**Last updated:** 2026-07-19

---

## Goal
Let visitors comment on blog posts, but only after signing in with a **real big-platform account**, and capture their **avatar, name, provider, timestamp, and comment**. Best-in-class, fast, fits the current static / CloudFlare Pages / Decap-CMS architecture.

## Decisions locked in
- **Backend:** Supabase (Auth + Postgres + Row-Level Security). Own-your-data, works directly from the static site (no custom server), EU region for GDPR.
- **Providers:** **Google now.** **Facebook later** (trivial: enable provider + add a button; schema already stores `author_provider`, no migration). **Apple = skipped** (requires Apple Developer Program at $99/yr — no free tier).
- **X (Twitter): dropped** — no free API tier in 2026 (pay-per-use).
- **Region:** Supabase **EU (Frankfurt)**.
- **Supabase dashboard account:** sign in with **GitHub + 2FA** (repo already on GitHub; solo project). Set billing/contact email to a stable address. This is separate from the end-user Google login.
- **Architecture separation:** Decap/git = *authored* content (posts). Supabase DB = *user-generated* content (comments). Do NOT store comments in git (commit-per-comment would trigger a rebuild each time).

## Open decision (confirm on resume)
- **Moderation posture.** Recommended default: **instant display** (`status` defaults to `approved`), with admin able to hide/delete and users able to delete their own. One-line switch to pre-moderation documented in `supabase/schema.sql`. → *Confirm instant vs pre-approval before Phase 2.*

---

## Phase 0 — user setup (the only part that needs your accounts; ~20–30 min)
1. Create a **Supabase project**, region **EU (Frankfurt)**, free tier. Sign in with GitHub (2FA on).
2. **Google OAuth:** Google Cloud Console → create OAuth 2.0 Client (Web). In Supabase → Auth → Providers → Google, paste Client ID + Secret. Copy Supabase's shown **redirect URL** back into the Google client's "Authorized redirect URIs".
3. Supabase → Auth → **URL Configuration** → add redirect allowlist: `https://ivaylodj.com`, `https://ivaylodj-website.pages.dev`, `http://localhost:8000`.
4. **Hand back to me two values** (both safe to commit — anon key is public by design; RLS is the real guard):
   - Project URL: `https://<ref>.supabase.co`
   - `anon` public API key
- ⚠️ #1 time-sink is **redirect-URI mismatch** (Google ↔ Supabase ↔ domains). Match them exactly.

## Phase 1 — database
- Run **`supabase/schema.sql`** (in this repo) in the Supabase SQL Editor. Creates the `comments` table + RLS policies. See that file for the moderation toggle.

## Phase 2 — frontend auth + submit
- Load `supabase-js` via CDN (no build step).
- `js/comments-config.js` — Project URL + anon key.
- `js/comments.js` — Google login/logout, session handling, submit (insert with name/avatar/provider from the OAuth session; RLS enforces `user_id = auth.uid()`).

## Phase 3 — display
- Render comment list into the section `blog_post.js` already creates in `#blog-post-content`: avatar, name, provider badge, relative time, body. Newest-first, lazy-loaded (never blocks the gallery/lightbox). Empty/loading states.

## Phase 4 — moderation + privacy
- Status workflow (per the locked decision), delete-own, simple rate-limit, GDPR consent line, admin flow via Supabase dashboard.

## Phase 5 — polish + ship
- Threaded replies (optional, `parent_id` already in schema), realtime updates (optional), avatar caching to Supabase Storage (avatar URLs can expire), style to match the Cherga theme, tests, deploy. Update `AGENTS.md`.

---

## Effort estimate (honest)
- **Focused engineering ≈ 4–6 hours (~half a day).** Bulk is `comments.js` (list render + auth wiring) and theme styling.
- **Calendar ≈ ~1 day** end-to-end, driven mostly by OAuth redirect-config round-trips and our review/merge cadence — not by code volume.

## Data captured per comment (see `supabase/schema.sql`)
`post_slug, user_id, author_name, author_avatar_url, author_provider, body, parent_id, status, created_at, edited_at`

## Files (planned)
- `supabase/schema.sql` — ✅ created (DB schema + RLS; ready to paste).
- `js/comments-config.js` — TODO (Project URL + anon key).
- `js/comments.js` — TODO (auth + submit + render).
- `blog_post.html` / `js/blog_post.js` — TODO (mount point + init by post slug).
- `css/theme.css` (or inline) — TODO (styling).

## How to resume
1. Read this file + `supabase/schema.sql`.
2. If Phase 0 is done, hand me the Project URL + anon key and confirm moderation → I build Phases 1–5 on a `comments` branch with review at each merge (same workflow as `REMEDIATION.md`).
3. If Phase 0 isn't done, do it first (checklist above).

## Adding Facebook later (non-breaking)
Enable Facebook in Supabase → Auth → Providers (Meta app + App Review), add a "Continue with Facebook" button in `comments.js`. No schema/data change (`author_provider` already stored).
