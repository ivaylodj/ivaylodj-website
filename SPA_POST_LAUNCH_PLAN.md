# SPA / pjax Navigation — Post-Launch Plan & Resume Doc

**Status:** DEFERRED to post-launch (user decision, 2026-07-22). Nothing built. `main` unchanged.
**Trigger to start:** user says go, after go-live (2026-07-24).
**Why this exists:** make the native **full-view (fullscreen) survive page navigation with zero gap**, which is impossible on a reloading multi-page site.

---

## Goal
When the user toggles full-view (the header fullscreen button) and then clicks any internal link, the site should **stay in fullscreen seamlessly** — no exit, no "click to re-engage" gap.

## Root cause (already diagnosed — see git history around commit `6d7a2ec`)
1. The button uses the **native browser Fullscreen API** (`jQuery('html').fullscreen()` in `js/theme.js`), toggling the cosmetic class `cherga_in_fullview_mode`.
2. The site is **plain multi-page**: every internal link is a full document unload + reload (no AJAX/SPA; `fadeOnLoad`/preloader are just a load fade). **Aurel is identical** — no persistence upstream.
3. Browsers **force-exit the Fullscreen API on document unload**, and the API **cannot be re-entered without a fresh user gesture** (hard security rule in Chrome/Firefox/Safari).
   → Therefore no on-load script can silently restore fullscreen. The only way to never drop it is to **never unload the document** = client-side navigation.

## What already shipped (the interim fix, on `main`, commit `6d7a2ec`)
`js/theme.js` full-view block now:
- Persists intent in `localStorage['cherga_fullview']` = `'on'|'off'`.
- Toggle keyed off the **visible state** (class), so on/off is always correct.
- `fscreenchange` stays in sync and distinguishes a **user exit** (Esc/browser UI → forget intent) from a **navigation-caused exit** (`beforeunload`/`pagehide` flag → keep intent).
- On load, if intent is on, reflects it visually and **re-enters on the first user gesture** (pointerdown/keydown/click, capture) — the earliest the browser allows.
- `try/catch` around localStorage (private-mode safe); removes stale intent if fullscreen unsupported.

**Known limitation of the interim fix:** after each navigation the page is NOT fullscreen until the user's first interaction. Not a bug — a browser constraint. This SPA plan removes it.

## Chosen architecture
**pjax / client-side navigation** (keeps real per-page URLs → SEO preserved, unlike an iframe shell). Intercept internal links → fetch target HTML → swap the content container in place → `history.pushState` → re-init page widgets. Document never unloads → fullscreen persists; navigation also feels instant.

- **Router:** prefer **Swup** (battle-tested: history, scroll, transitions, hooks) vendored locally as `js/swup.min.js` (no build step; Cloudflare Pages Free). Acceptable fallback: a ~80-line hand-rolled pjax if vendoring/CDN is undesirable. Router choice is the *easy* part.
- **Swap container:** the content only — e.g. `.cherga_main_wrapper`. Keep **header, footer, preloader, and the PhotoSwipe root persistent** (unchanged between pages). The full-view button lives in the persistent header, so its handler stays bound and fullscreen is never touched by the swap.

## THE hard part — re-initialising page widgets safely (the real risk)
`js/theme.js` (1497 lines) **interleaves one-time global bindings with per-page content init** inside its two big blocks — `jQuery(document).ready(...)` (~L344–828) and `jQuery(window).on('load', ...)` (~L829–954). Re-running them wholesale after a swap would **stack duplicate global handlers** every navigation. Specifically found inside those blocks:
- `cherga_window.on('scroll', …)` — **sticky-header + footer logic (bound twice)**.
- `window.addEventListener('scroll', …)` — more sticky-header logic (in the load block).
- `jQuery(document).on('click', …)` — delegated handlers bound *inside* ready.
- `.cherga_back_to_top` click, tabs, grid filters, before/after sliders — direct-bound.
- Gallery/widget inits: `owlCarousel` (L472, L529, L920), `isotope` masonry/packery (L579, L874), kenburns, `slider_gallery`, `split_gallery`, PhotoSwipe setup (L118/146), and the JS setters `cherga_js_bg_image/_color/_font_size/_min_height` (L381–472).
- Also: contact-form submit is **direct-bound** at `#contact_form input[type=submit]` (L329) → must become document-delegated to survive swaps.

### Required refactor (the work)
Split `theme.js` init into two clearly-separated parts:
1. **`chergaBindGlobalsOnce()`** — everything bound to persistent `document`/`window`/header/footer (scroll/sticky, delegated clicks, back-to-top, resize, full-view, mobile menu). Runs **exactly once** on first load. NEVER re-run.
2. **`chergaInitContent($scope)`** — everything that operates on swapped content (JS setters, owlCarousel, isotope, kenburns, sliders, split, PhotoSwipe binding, countdown, flickr). Must be **idempotent / scoped to the new container** so it can run on first load AND on every pjax `page:view`. For plugins that break on double-init, guard with a data flag or destroy-before-init; new content is fresh DOM so most are safe if scoped.
   - Convert direct-bound content handlers (contact form, etc.) to `jQuery(document).on('click', selector, …)` delegation so they need no re-binding.
3. Re-run the **bottom-of-body inline scripts** that some pages carry (e.g. the PhotoSwipe `data-size` pre-computation on grid pages; the copyright year). Either move their logic into `chergaInitContent` or have the router re-execute inline `<script>`s in the swapped region.
4. **blog pages:** `js/blog.js` (listing) and `js/blog_post.js` (single post) run their own DOM-ready fetches of `_posts/index.json`. On pjax navigation to/within the blog they must be re-invoked for the new view. `blog_post.js` is the **most fragile file** (two independent `index.json` fetch entry points) — treat with care; expose a re-init entry rather than relying on DOM-ready.

## Step-by-step implementation (on a `spa-navigation` branch; never touch `main` until verified)
1. Branch `spa-navigation`.
2. Refactor `theme.js` → `chergaBindGlobalsOnce()` + `chergaInitContent($scope)`; keep behaviour byte-identical on first load (regression check before any pjax).
3. Convert direct-bound content handlers to delegation.
4. Add router (`js/swup.min.js` vendored + `js/spa.js` config): container `.cherga_main_wrapper`, `linkSelector` for internal links only (skip `mailto:`, external, `target=_blank`, hash-only, downloads, `?post=` handled), `page:view` → `chergaInitContent` + blog re-init + inline-script re-run.
5. Wire scripts into all 27 pages (shared include pattern) + mark the container.
6. Scroll restoration, focus management, `aria-live` route announce, in-flight fetch abort, prefetch-on-hover (perf), graceful fallback to full navigation on fetch error.
7. Fullscreen: with the document persistent, the existing `theme.js` full-view code "just works" across navigations; drop the first-gesture re-entry shim (keep localStorage persistence for reloads/new tabs).

## Testing checklist (interactive — REQUIRES the user; cannot be auto-verified)
For EVERY page type and BOTH first-load and post-pjax-navigation:
- [ ] Sticky header stick/unstick at 1200px threshold; no duplicate/janky scroll; logo-shrink behaves.
- [ ] Back-to-top appears/works; footer reveal logic intact.
- [ ] Each gallery type initialises + relayouts: grid masonry (sunsets/birds/unsorted/dov), packery, kenburns slider (nightscapes), slider_gallery (neowise etc.), split_gallery (autumn).
- [ ] PhotoSwipe lightbox opens with correct aspect ratios on new content.
- [ ] Gallery-intro sticky-reveal (sliders) + scrim (grids) still correct.
- [ ] Blog listing + single post render on pjax; sidebar widgets; related posts; category/tag.
- [ ] Contact form submits (delegated).
- [ ] Mobile menu open/close + submenu; on pjax.
- [ ] **Full-view: toggle on → click through Portfolio/Blog/About/galleries → stays fullscreen with NO gap.** Esc exits and stays off. Reload restores intent.
- [ ] No duplicate event handlers after 5+ navigations (check listener count / no double-fire).
- [ ] Direct URL load of every page still works (crawlers/SEO); view-source still has full HTML.
- [ ] `npm test` (52) still green.

## Risks / notes
- Highest risk = the `theme.js` split introducing a subtle site-wide regression (sticky header / galleries / lightbox). Mitigate: keep first-load behaviour identical, verify before enabling pjax; land in small reviewed steps like `REMEDIATION.md`.
- SEO unaffected: real HTML pages remain; pjax is progressive enhancement (works without JS = normal navigation).
- Perf: prefetch-on-hover + only-content swap → very fast transitions; good Core Web Vitals.
- Keep the interim localStorage fix — still useful for reloads / new tabs / no-JS.

## How to resume
1. Read this file + the full-view block in `js/theme.js` (commit `6d7a2ec`).
2. Branch `spa-navigation`, do steps 1–7 above, verify with the checklist WITH the user, then merge to `main`.
