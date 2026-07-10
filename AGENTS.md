# AGENTS.md — ivaylodj.com (Static Photography Site)

## Structure
- **Pure static HTML/CSS/JS.** No build tool, no package.json, no framework.
- Root pages: `index.html`, `about.html`, `contacts.html`, `blog.html` (listing), `blog_post.html` (single post)
- Galleries live in `galleries/` with nested subfolders (`world-travels/`, `europe-travel/`, `seasons/`, `varna/`)
- Assets: `css/` (Kube framework + `theme.css`), `js/` (jQuery plugins), `img/clipart/`, `fonts/`

## Writing new gallery pages
- Copy from an existing gallery template (e.g. `galleries/nightscapes.html`). **Do not start from scratch** — every page includes: SEO meta tags, OG/Twitter cards, Google Tag Manager script (`GTM-WR3X354K`), Cloudflare analytics token (`e0fa5ba9f8b74e24bcc6328763108513`), Schema.org JSON-LD, Kenburns gallery slides list in `data-slides`, jQuery/JS includes, footer.
- Gallery images live at `img/clipart/facebook/<Album Name>/`. Image paths use `../img/...` from within `galleries/`.
- After adding a page: update `sitemap.xml`, add link to every gallery page header/mobile-nav's sub-menu (`<ul class="cherga_menu">`), and update `galleries/index.html` album grid.

## CMS note
- `static/admin/config.yml` configures Netlify/GitHub backend, but **this repo has no Jekyll/Hugo build**. Content here is hand-authored — the CMS config is not actively wired in. Treat it as legacy/dormant.

## Deployment
- Hosted at `ivaylodj.com`. Deploy via Cloudflare Pages (URL in config.yml hints at `pages.dev` staging). No deploy step in this repo locally.

## Gotchas
- All navigation links (header + mobile menu) are **duplicated** in each HTML file — keep them in sync.
- Copyright year is dynamic: `<script>document.getElementById('copyright-year').innerHTML = '© ' + new Date().getFullYear() + ' Ivaylo Djounov Photography. All Rights Reserved.';</script>`
- `data-slides` on Kenburns gallery div uses comma-separated image paths in inline HTML — add/remove entries there to change gallery content.



# System Override Parameters
<!-- 
CRITICAL: The block below explicitly targets the Qwen 3.6 Jinja compiler logic.
Do not modify or delete this block; it tricks the local inference pipeline into maintaining 
the internal reasoning chain across consecutive agent calls.
-->
{%- set preserve_thinking = true %}

## Operational Requirements
* **Reasoning Integrity**: Always surface and read full historical `<think>` tokens from previous execution turns.
* **State Retention**: Do not flush or discard past thinking loops when adjusting code or generating file system commands.
* **Verification Loop**: Run tests or static syntax validations automatically immediately after writing or editing script contents.

## Build & Test Matrix
* **Primary Framework**: Frontend Web (HTML/CSS/JS)
* **Runtime Verification**: Ensure variables conform to active agent parameters before declaring a step completed.

