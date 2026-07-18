# ivaylodj.com — Remediation Tracking Doc

**Purpose:** Living checklist for the site-wide audit remediation. Update the status boxes as work lands so we can resume at any point.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done (committed+pushed) · `[!]` blocked/needs decision

**Baseline:** audit performed on `main`; findings verified against disk. Full audit summary lives in the conversation that created this doc. Aurel reference: `/Users/ivaylodj/html-themes/other themes/html/aurel`.

---

## How to resume
1. Read this file top-to-bottom; the first phase with unchecked items is where we are.
2. Each item lists exact `file:line` (approximate — re-grep before editing, line numbers drift as edits land).
3. Complete a phase fully across ALL its files (no partial fixes), then commit + push, then check its boxes and note the commit hash.
4. Risky phases (3, 5) additionally require `npm test` + browser verification before commit.

---

## Phase 0 — Ground truth (prep)
- [ ] Branch/prep + run `npm test`, record real test count (docs disagree: 52 vs 47)

## Phase 1 — Broken links & SEO-critical (low risk) — **STARTED**
- [ ] `sitemap.xml` — replace all `/galleries/` → `/portfolio/` (23 `<loc>`); drop stale `namibia.html` entry (orphan; real page is `world-travels/namibia-2021.html`)
- [ ] `about.html:707` — `contacts_1.html` → `contacts.html`
- [ ] `portfolio/namibia.html:636` — `contacts_1.html` → `../contacts.html`
- [ ] `portfolio/world-travels/namibia-2021.html:677` — `contacts_1.html` → `../../contacts.html`
- [ ] `blog_post.html:146` — next-post `blog_image.html` (repoint/remove)
- [ ] `blog_standard.html:239` — next-post `blog_image.html` (repoint/remove)
- [ ] `portfolio/namibia.html:634` + `portfolio/world-travels/namibia-2021.html:675` — remove `demo-storage.com` "Video Slider" links
- [ ] `portfolio/namibia.html:600,605,613,618` + `world-travels/namibia-2021.html:641,646,654,659` — fix malformed `href="/>` featured-post anchors (8)
- [ ] `static/admin/config.yml` — `galleries` collection `folder` → `portfolio` (or remove)

## Phase 2 — Portfolio gallery correctness (medium risk)
- [ ] Add `isotope.pkgd.min.js` + `imagesloaded.pkgd.min.js` to masonry pages: `portfolio/varna/day-of-varna-2019.html`, `day-of-varna-2020.html`, `funfair-winter.html` (match `sunsets.html` script set)
- [ ] Remove `cherga_albums_grid_page` body class from nested indexes: `portfolio/varna/index.html`, `seasons/index.html`, `world-travels/index.html`, `europe-travels/index.html`
- [ ] Neutralize/remove demo `items_set` + `albums_listing_addon` blocks in `js/theme.js` (~698–781)
- [ ] Remove duplicate hardcoded `.pswp` roots (theme.js injects one): `portfolio/unsorted.html`, `varna/day-of-varna-2019.html`, `day-of-varna-2020.html`, `funfair-winter.html`, `world-travels/namibia-2021.html`
- [ ] Fix PhotoSwipe to use live per-slide `data-size` (build slide array in click handler) — `js/theme.js:70–128`; optionally add `data-size` per image
- [ ] Move `<footer>` inside `cherga_site_wrapper` + add `cherga_back_to_top` on: `portfolio/nightscapes.html`, `neowise.html`, `sunrises.html`, `vera-su.html`, `sunsets.html`, `unsorted.html`, `seasons/spring.html`

## Phase 3 — Blog single-post page (HIGH risk — run `npm test` + browser)
- [ ] `blog_post.html:122–172` — remove duplicated static blocks (tags/share/nav/comments); JS injects them
- [ ] `blog_post.js:494` — replace `setActiveTag`/`window.parent` tag links (point to `blog.html?tag=`)
- [ ] `blog_post.html` sidebar (175–237) — wire real IDs for `buildSidebarWidgets` OR remove dead function (`blog_post.js:798–888`, 662–669)
- [ ] `blog_post.html:20` — GTM `GTM-5G6PPWB` → `GTM-WR3X354K`; add `<noscript>` + Cloudflare analytics
- [ ] Add SEO/OG/canonical/JSON-LD head block to `blog.html`, `blog_post.html`, `blog_standard.html`
- [ ] `blog_post.js:169–174` & `890–901` — fetch `index.json` once; unify sort comparator

## Phase 4 — Consistency & polish (low risk)
- [ ] `current-menu-item` desktop↔mobile alignment: `portfolio/europe-travels/index.html`, `seasons/index.html`, `world-travels/index.html`, `varna/index.html` (desktop `:88`), and `index.html` (mobile `:153`)
- [ ] `blog.html:279` — copyright `div#copyright-year` → `span` pattern
- [ ] `portfolio/index.html:368` — Vera Su tile label "portraits" → "black sea" (matches `black-sea` class/filter)
- [ ] Remove dead commented `albums_grid.html` menu fragments: `index.html:88`, `about.html:700,701`
- [ ] (optional) Normalize subdir canonicals to trailing-slash form

## Phase 5 — Sticky header (isolated; known rabbit hole — browser-test vs Aurel)
- [ ] Align JS threshold (`theme.js:851,860,1012` `>1024`) to `1200` OR move logo-shrink rules (`theme.css:1215–1234`) into `@media(min-width:1200px)`
- [ ] Consolidate to one scroll handler; create `cherga_header_holder` placeholder in `ready` not `load`

## Phase 6 — Hygiene & docs (no user-facing risk)
- [ ] Remove/relink orphan `portfolio/namibia.html`; move root `blog_standard.html` → `_templates/` (repoint `blog_post.html` placeholders)
- [ ] `git rm` `blog_post.html.bak`, `img/clipart/back_1.old.jpg`, `img/clipart/blog_single/img-7.old.jpg`; add `*.bak`/`*.old.*` to `.gitignore`
- [ ] `js/theme.js` — convert `setTimeout` string-eval (×27) to fn refs; add `event` param (`:204`); remove stray `0` (`:90`); remove dead `nested-toggle` handler
- [ ] `js/blog_post.js` — remove dead `galleryConfigFromMd` (281–308)
- [ ] `js/blog.js` — remove/curtail fake "Page 1 of N" pagination (256–272)
- [ ] Docs: `AGENTS.md`, `MEMORY.md`, `CLAUDE.md` — `galleries/`→`portfolio/`, "Photos"→"Portfolio", fix counts (29 pages, 4 subdirs, real test count), stale commit IDs

---

## Change log
_(append commit hashes as phases land)_
- _pending_
