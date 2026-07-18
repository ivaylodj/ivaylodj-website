# MEMORY.md — Critical Context for All Agents/LLMs

**Last updated:** 2026-07-19

---

## 🔴 CRITICAL — MUST READ FIRST

### Aurel Theme Reference Path
**The single source of truth for correct HTML structure and menu patterns:**

```
/Users/ivaylodj/html-themes/other themes/html/aurel
```

**ALWAYS reference this path BEFORE:**
- Analyzing HTML structure and menu patterns
- Identifying correct CSS class usage (menu-item-has-children, current-menu-item, etc.)
- Checking submenu nesting and markup patterns
- Auditing template consistency
- Making ANY structural changes to menus or templates

**Why:** Previous agents wasted time re-discovering patterns that are already documented in Aurel. This is the authoritative reference.

---

## Working Style Rules (Strictly Enforced)

1. **REFERENCE AUREL FIRST** — Check `/Users/ivaylodj/html-themes/other themes/html/aurel` before changing HTML structure
2. **Precise incremental tasks** — One logical change per commit, exact file paths, exact line numbers
3. **Always show git output** — After `git push`, verify output shows changes reached GitHub
4. **No AI attribution** — Never add "Co-Authored-By: Claude..." unless explicitly asked
5. **Check git status first** — Before committing, run `git status` to catch stray files (once committed an empty "main" file)
6. **Scan comprehensively** — Don't do partial fixes — analyze the whole codebase before implementing
7. **Test in browser** — Don't claim success based on tests alone; actually test features in a browser

---

## Project Info

- **Site:** https://ivaylodj.com
- **Dev:** https://ivaylodj-website.pages.dev
- **Repo:** https://github.com/ivaylodj/ivaylodj-website
- **Tech:** HTML5, CSS3, JavaScript (jQuery), Owl Carousel, CloudFlare Pages
- **Contact:** ivaylo.djounov@mypos.com

---

## Current work: site-wide audit remediation

A full audit + phased remediation is tracked in **`REMEDIATION.md`** (repo root).
Phases 1–4 and 6 are complete (broken links, sitemap, gallery/PhotoSwipe fixes,
blog single-post repair, consistency polish, hygiene). Phase 5 (sticky-header
collapse) remains. Galleries live under `portfolio/`; the nav label is "Portfolio".

---

## Gallery Restructure Project

**Status:** In progress  
**Open items:**
- Demo captions for gallery images
- Carousel headings on blog post view

See `AGENTS.md` for full project state and next steps.

---

## Key File Locations

```
/Users/ivaylodj/html-themes/other themes/html/aurel    ← REFERENCE THEME (CRITICAL!)
/Users/ivaylodj/gh-ivaylodj.com/ivaylodj-website/      ← THIS PROJECT
  ├── AGENTS.md                                          ← Project guide + working style
  ├── MEMORY.md                                          ← This file
  ├── index.html, about.html, contacts.html, blog.html
  ├── _posts/index.json + *.md files
  ├── js/blog.js, blog_post.js, theme.js
  └── css/theme.css
```

---

## For Agents/LLMs Joining This Project

1. Read `AGENTS.md` for full context, test setup, deployment info
2. Check this file (MEMORY.md) for critical working rules
3. **ALWAYS reference Aurel theme before making structural changes**
4. When in doubt, ask the user (ivaylo.djounov@mypos.com) rather than guessing

---
