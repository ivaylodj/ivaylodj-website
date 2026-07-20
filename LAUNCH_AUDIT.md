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

## ⏭️ PHASE 3 — Performance / Core Web Vitals (~half day) — NEXT
- [ ] **Images:** `img/photos` = 161 MB, JPG-only, some 1.4–1.86 MB (Morocco/img-2 1.86 MB, Batova/img-6 1.4 MB, Nightscapes/img-1 964 KB). Compress to ~150–250 KB, generate WebP/AVIF + responsive sizes (Cloudflare Polish/Images can automate). `back_1.jpg` OG/hero = 1.6 MB.
- [ ] **Lazy-loading** (`loading="lazy"`) + width/height on media (0 pages use it → CLS/LCP risk). NOTE: galleries inject photos via JS `data-slides` (no `<img>` tags) → invisible to image search/LLMs; add real `<img>`/`<noscript>` fallbacks where feasible.
- [ ] **Dedicated OG card** 1200×630 (<300 KB, tagged `og:image:width/height/alt`) instead of 1.6 MB back_1.jpg.
- [ ] Fonts: `preconnect` to fonts.googleapis/gstatic + `&display=swap` (currently render-blocking, no preconnect). `defer` where safe. jQuery stack is legacy but functional — low priority.

## ⏭️ PHASE 4 — Content investment (needs USER's words) `[!]`
- [ ] **2–4 sentence intro paragraph per gallery** (where/when/gear/technique + location keywords: "Milky Way over the Bulgarian Black Sea coast", "Batova", "Kaliakra"). Biggest classic-SEO content gap — galleries are `<h1>` + slider, near-zero crawlable text.
- [ ] A few **real blog posts** ("How I shoot the Milky Way from Bulgaria", "Photographing comet Neowise"); remove/replace the "First Post / More posts coming soon" stub featured on About.
- [ ] Strengthen **About E-E-A-T** (exhibitions/awards/publications/years active/gear + byline photo).
- [ ] contacts.html "ABOUT ME" block ("Hey! Thanks for stopping by!") — tighten to contact-focused intro, align with fine-art positioning.

## ⏭️ PRE-LAUNCH CHECKLIST — 2026-07-22 `[!]`
- [ ] Canonical domain: 301 pages.dev + www → `https://ivaylodj.com` (schema/canonicals already non-www). Force HTTPS. Cloudflare Pages custom-domain + redirect rules.
- [ ] Refresh sitemap `lastmod` to launch date; re-verify every `<loc>` resolves on live host (incl. trailing-slash + `%20` image paths).
- [ ] Google Search Console + Bing Webmaster: verify domain, submit sitemap. Enable Cloudflare **IndexNow**.
- [ ] Real branded **404 page** (none exists).
- [ ] Confirm GTM (`GTM-WR3X354K`) published + Cloudflare Analytics fire on prod. Validate structured data (Rich Results Test) + OG (FB/Twitter validators) on live domain.
- [ ] Confirm `_templates/`, `coverage/`, `node_modules/` excluded from deployed output (gitignored — verify).

---

## Deferred / separate (with rationale)
- **blog_post.js double `index.json` fetch** — deliberately NOT consolidated: two timing-independent XHR entry points (loadPost L159 + sidebar builder L~856); refactoring the site's most fragile file for a browser-cached ~2KB non-bug is a poor risk/reward trade.
- **Blog comments** — fully planned in `COMMENTS_PLAN.md`; blocked on user's ~20-min Supabase Phase-0 (create project + Google OAuth, hand back Project URL + anon key, confirm moderation posture).
- **theme.js remaining hygiene** — none outstanding (setTimeout sweep + nested-toggle done in Phase 1).

## How to resume
1. Read this file; first unchecked box = where we are (Phase 2, add H1s).
2. Every code change: verify against disk (grep), `npm test` (52), serve-check on `python3 -m http.server 8000`, then commit per phase.
3. Phase 4 + pre-launch need user input (copy, domain/DNS, GSC access).
