# Launch Audit & Plan — ivaylodj.com

**Goal:** best-in-class, polished fine-art photography site that ranks as highly as possible in **search engines and AI/answer engines** for "ivaylodj", "Ivaylo Djounov", "fine art photography Varna/Bulgaria", "nightscape/astrophotography Bulgaria", and the site's hot topics — for the real-domain go-live on **2026-07-22**.

**Source:** two deep audits (content/photography+design; SEO/AEO) run 2026-07-19/20. This doc = the actionable, phased plan + record. Resume from the first unchecked item.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done (committed) · `[!]` needs user input

---

## ✅ PHASE 1 — Launch-blockers + SEO quick wins — DONE (commit `7630387`)
- [x] **Vera Su** reframed Portrait/Fashion → Black Sea shipwreck (title/meta/OG/Twitter/JSON-LD/genre; slide titles: Run Aground / Against the Coast / Held Fast / Salvage). *User approved facts.*
- [x] Funfair `%20` decoded in title/og/twitter/JSON-LD name (image-path `%20` correctly kept).
- [x] Removed phantom "portraits" (portfolio index meta/OG/Twitter/JSON-LD; seasons/autumn meta+genre→Nature; seasons tile → "nature, seasons").
- [x] contacts.html mobile menu: demo twitter/pinterest/bare social links → real FB + IG.
- [x] Voice unified "hobby/amateur" → "fine art photographer" (contacts.html, blog.html, welcome-post.md).
- [x] `sameAs` populated (FB + IG) in Person JSON-LD (index.html, about.html) — key entity/AEO signal.
- [x] **Favicon set** generated from `img/logo.png` (white emblem composited on `#171717`): `favicon.ico` (16/32/48) + `favicon-16/32`, `apple-touch-icon` (180), `android-chrome-192/512`, `site.webmanifest`, `theme-color`. Wired into all 27 pages (absolute `/` paths). *Pillow installed user-level to build these.*
- [x] Canonicals: 4 subdir index pages normalized to trailing-slash (canonical + og:url + JSON-LD url).
- [x] robots.txt blocks `/static/admin/`; sitemap `changefreq` weekly→monthly (22), lastmod bumped.
- [x] Stripped demo/fashion captions: birds (7), sunsets (30 incl. 18× "Sunset", 8× "Road to Home").
- [x] **Also merged in this commit (was "Part A" polish):** theme.js hygiene (28 setTimeout string-eval → function refs; removed dead `.nested-toggle` handler); sticky-header `stick_me` threshold 1024→1199 (match `position:fixed @media(min-width:1200px)`, kills 1025–1199px logo-shrink quirk — **deliberate Aurel deviation, user-approved**); **header part-width feedback-loop fix** (menu drifting right / vanishing on repeated resize — was a pre-existing Aurel bug in `cherga_theme_setup`); reconciled IMAGE_CLEANUP.md.

Prior related commit: `2b9b6b2` (Golden Hour cover de-dup, about.html hero type+CTA fix, about footer featured widget, namibia pre-footer removal).

---

## ✅ PHASE 2 — SEO structure — DONE (commits `7f2d1f8`, `74133b3`)
- [x] Visually-hidden `<h1>` (page title) added to 9 slider galleries + blog.html + contacts.html (blog_post.html gets its H1 from blog_post.js). New `.cherga_sr_only` utility in theme.css.
- [x] Alt text populated on 108 previously-empty images (98 gallery photos, contextual per gallery; + about tiles/featured thumbs, sidebar banners, contacts photo).
- [x] Structured-data graph: index.html `@graph` = Person(`@id` #person) + WebSite(#website) + ProfilePage; about.html Person unified via @id; blog.html Blog JSON-LD; **22 portfolio pages** each got BreadcrumbList + author `@id`->#person. All JSON-LD validated.
- [x] `/llms.txt` (AI answer-engine surface: bio, galleries, socials).
- [x] Plain-text bio: already satisfied — homepage + about.html carry extensive crawlable prose (not JS-only).
- [ ] (P3, deferred) Cross-page naming consistency: "Portfolio" named 4 ways (nav / index title "Photo Galleries" / index H1 "My Photography Collections" / about H2 "Explore My Collections"); funfair label drift (H1 "Varna Funfair Winter" vs tile "Funfair Winter"). Minor.

## ✅ PHASE 3 — Performance / Core Web Vitals — DONE within Free-plan scope (commit `c9c0f43`)
- [x] Fonts: `preconnect` (fonts.googleapis.com + fonts.gstatic.com) + `&display=swap` on all 27 pages — removes render-blocking wait / FOIT.
- [x] Images (investigated, left as-is): lossless `jpegtran` pass = only **~1%** (images already 2048px, well-encoded sRGB, minimal metadata) → reverted (not worth binary-history churn). Meaningful savings need **lossy** re-encode (declined — fine-art quality) or **Cloudflare Polish** (Pro-plan; site is on **Free**, staying Free). Effectively optimal for the constraints.
- [~] Lazy-loading — DEFERRED: gallery grids are isotope masonry with `height:auto` images; native `loading="lazy"` breaks below-fold layout. Would need a lazy lib + isotope relayout-on-load shim. Revisit only if desired.
- [~] Dedicated OG card — DEFERRED (low value): gallery pages already use their own photo as `og:image` (good for social); only home/about/blog/contacts would benefit from a generic 1200×630 card. Minor.

## ⏭️ PHASE 4 — Content investment (needs USER's words) — IN PROGRESS `[!]`
**First-pass copy drafted in `DRAFT_COPY_PHASE4.md`** (17 gallery intros, 2 blog posts, About E-E-A-T block) — awaiting user edits, then I wire it in (grid galleries = visible intro slot; slider galleries = new slim intro band below the fullscreen slider, pending user OK).
- [ ] **2–4 sentence intro paragraph per gallery** (where/when/gear/technique + location keywords: "Milky Way over the Bulgarian Black Sea coast", "Batova", "Kaliakra"). Biggest classic-SEO content gap — galleries are `<h1>` + slider, near-zero crawlable text.
- [ ] A few **real blog posts** ("How I shoot the Milky Way from Bulgaria", "Photographing comet Neowise"); remove/replace the "First Post / More posts coming soon" stub featured on About.
- [ ] Strengthen **About E-E-A-T** (exhibitions/awards/publications/years active/gear + byline photo).
- [ ] contacts.html "ABOUT ME" block ("Hey! Thanks for stopping by!") — tighten to contact-focused intro, align with fine-art positioning.

## ⏭️ PRE-LAUNCH CHECKLIST — 2026-07-22 `[!]`
- [ ] Canonical domain: 301 pages.dev + www → `https://ivaylodj.com` (schema/canonicals already non-www). Force HTTPS. Cloudflare Pages custom-domain + redirect rules.
- [ ] Refresh sitemap `lastmod` to launch date; re-verify every `<loc>` resolves on live host (incl. trailing-slash + `%20` image paths).
- [ ] Google Search Console + Bing Webmaster: verify domain, submit sitemap. Enable Cloudflare **IndexNow**.
- [x] Real branded **404 page** — `404.html` (dark/gold theme, noindex, absolute paths); Cloudflare Pages auto-serves it (commit `2fe5b67`).
- [ ] Confirm GTM (`GTM-WR3X354K`) published + Cloudflare Analytics fire on prod. Validate structured data (Rich Results Test) + OG (FB/Twitter validators) on live domain.
- [x] Deploy exclusions verified: `node_modules/` + `coverage/` not tracked (not deployed); `_templates/` is tracked but `robots.txt` disallows it (acceptable; optional to remove from repo later).

---

## Deferred / separate (with rationale)
- **blog_post.js double `index.json` fetch** — deliberately NOT consolidated: two timing-independent XHR entry points (loadPost L159 + sidebar builder L~856); refactoring the site's most fragile file for a browser-cached ~2KB non-bug is a poor risk/reward trade.
- **Blog comments** — fully planned in `COMMENTS_PLAN.md`; blocked on user's ~20-min Supabase Phase-0 (create project + Google OAuth, hand back Project URL + anon key, confirm moderation posture).
- **theme.js remaining hygiene** — none outstanding (setTimeout sweep + nested-toggle done in Phase 1).

## How to resume

**EXACT STATE — end of 2026-07-21 session.** Branch `main`, clean, pushed. HEAD = `55aa5c7`.
Phases **1, 2, 3 DONE** (see above). Server: `python3 -m http.server 8000`. 52 tests pass.

**We are HERE → Phase 4 (content), awaiting the user's edits.** The ball is in the user's court:
1. **User edits `DRAFT_COPY_PHASE4.md`** (17 gallery intros + 2 blog posts + About E-E-A-T block; fill `[brackets]`). When they say it's ready → I wire the copy in:
   - Grid galleries (sunsets, birds, unsorted, autumn, namibia-2021, day-of-varna-2019/2020, funfair-winter) → replace the italic subtitle in the existing visible intro `<p>` slot under the H1.
   - Slider galleries (nightscapes, neowise, sunrises, vera-su, spring, funfair-summer, morocco, rome, la-ciotat) → **PENDING USER OK**: add a slim intro band *below* the fullscreen slider (crawlable, keeps immersive first view).
   - Blog posts → new `_posts/YYYY-MM-DD-slug.md` + `_posts/index.json` entries (confirm NEOWISE cover folder name on disk).
   - About → insert the Background/E-E-A-T block; confirm `img/clipart/about_me.jpg` is really the photographer.
2. **Pre-launch dashboard tasks (user-only, for 07-22)** — still open in the checklist above: canonical-domain 301s (pages.dev+www→ivaylodj.com), GSC + Bing verify + submit sitemap + IndexNow, confirm GTM published + analytics on prod, validate structured data/OG on live domain. *(Offered: I can draft step-by-step instructions for these.)*
3. **Blog comments** — separate, parked on user's Supabase Phase-0 (`COMMENTS_PLAN.md`).

**Workflow reminder:** verify against disk (grep), `npm test` (52), serve-check on :8000, commit per logical unit (no AI attribution), verify push (local==origin). `DRAFT_COPY_PHASE4.md` is a temp working doc — delete it once its copy is live.

## Commit log (this launch effort)
`c343935` plan · `7f2d1f8` H1s/alt/llms · `74133b3` schema/breadcrumbs · `c9c0f43` fonts · `2fe5b67` 404 + drafts · `55aa5c7` state (HEAD). Earlier: `2b9b6b2`, `7630387` (Phase 1).
