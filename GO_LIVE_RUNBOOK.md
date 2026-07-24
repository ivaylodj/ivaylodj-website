# Go-Live Runbook — ivaylodj.com

**Target launch: 2026-07-26.** Everything below is done in the **Cloudflare dashboard** (I can't do these from the repo). Steps are ordered; do them top to bottom on launch day.

Canonical target host is the **apex, non-www, HTTPS**: `https://ivaylodj.com` — this matches every `<link rel="canonical">`, `og:url`, and the sitemap already in the repo.

---

## 1. Attach the custom domain to the Pages project

1. Cloudflare dashboard → **Workers & Pages** → your Pages project (the one serving `*.pages.dev`).
2. **Custom domains** tab → **Set up a domain** → enter `ivaylodj.com` → follow prompts.
   - Cloudflare auto-creates the apex DNS record (CNAME flattened to the Pages target) and issues the SSL cert. Wait for status **Active** (cert can take a few minutes).
3. Note your project's `*.pages.dev` hostname (shown on the project page) — you need the exact value in step 4. It looks like `something.pages.dev`.

## 2. Force HTTPS (whole zone)

1. Select the **ivaylodj.com** zone → **SSL/TLS** → **Edge Certificates**.
2. Toggle **Always Use HTTPS** = **On**.
3. (Recommended) **SSL/TLS → Overview** → encryption mode **Full (strict)**.

## 3. Redirect `www.ivaylodj.com` → apex (301)

Cloudflare's `_redirects` file is **path-only and cannot match hostnames**, so host redirects must be done here in the dashboard. Two equivalent free options — **A (Redirect Rules)** is simplest for two hosts:

### Option A — Single Redirect Rule (recommended)
1. **ivaylodj.com** zone → **Rules** → **Redirect Rules** → **Create rule**.
2. Name: `www → apex`.
3. **When incoming requests match**: Field `Hostname` — Operator `equals` — Value `www.ivaylodj.com`.
4. **Then / URL redirect**:
   - Type: **Dynamic**
   - Expression: `concat("https://ivaylodj.com", http.request.uri.path)`
   - Status code: **301**
   - **Preserve query string**: ✅ checked
5. **Deploy**.
6. **DNS record so the edge can intercept www** — **DNS** → **Add record**:
   - Type `A`, Name `www`, IPv4 `192.0.2.1` (reserved placeholder — there's no origin; the redirect fires at the edge), **Proxy status: Proxied (orange cloud)**.
   - *(A proxied `CNAME www → ivaylodj.com` also works; the point is it must be proxied.)*

### Option B — Bulk Redirect (Cloudflare's documented Pages method)
Account → **Bulk Redirects** → create a list, add:
`Source www.ivaylodj.com` → `Target https://ivaylodj.com`, Status **301**, parameters **Preserve query string · Subpath matching · Preserve path suffix · Include subdomains** → create a rule from the list. Still add the proxied `www` A record above.

## 4. Redirect `*.pages.dev` → apex (301)

Same as step 3 but for the Pages hostname.

### Option A — Redirect Rule
- New rule `pages.dev → apex`: Field `Hostname` equals `<your-project>.pages.dev` → Dynamic `concat("https://ivaylodj.com", http.request.uri.path)`, **301**, preserve query string ✅.
- ⚠ Redirect Rules live on a **zone**; the `*.pages.dev` hostname is not in your zone, so if the rule doesn't fire, use **Option B (Bulk Redirect)** which operates account-wide — this is Cloudflare's documented path for pages.dev.

### Option B — Bulk Redirect (documented, reliable for pages.dev)
Account → **Bulk Redirects** → add to the list:
`Source <your-project>.pages.dev` → `Target https://ivaylodj.com`, **301**, same four parameters as above.

## 5. Verify (after DNS/cert propagate)

```sh
curl -sI https://www.ivaylodj.com/         | grep -iE 'HTTP/|^location'   # → 301 → https://ivaylodj.com/
curl -sI https://<your-project>.pages.dev/ | grep -iE 'HTTP/|^location'   # → 301 → https://ivaylodj.com/
curl -sI http://ivaylodj.com/              | grep -iE 'HTTP/|^location'   # → 301/308 → https (Always Use HTTPS)
curl -sI https://ivaylodj.com/             | grep -iE 'HTTP/'             # → 200
# path + query preservation:
curl -sI 'https://www.ivaylodj.com/blog_post.html?post=2026-07-12-chasing-comet-neowise' | grep -i '^location'
#   → location: https://ivaylodj.com/blog_post.html?post=2026-07-12-chasing-comet-neowise
```

---

## 6. Other launch-day tasks (from LAUNCH_AUDIT.md)

- **Sitemap** — ✅ already refreshed in-repo (`lastmod` → 2026-07-26, 4 blog posts added, commit `4b0e85f`). Just confirm `https://ivaylodj.com/sitemap.xml` serves it live.
- **Google Search Console** — add `ivaylodj.com` (DNS TXT verification via Cloudflare DNS), submit `https://ivaylodj.com/sitemap.xml`. This also satisfies the Google OAuth-consent **domain verification** for branded comments sign-in.
- **Bing Webmaster** — verify + submit sitemap. Enable Cloudflare **IndexNow** (zone → **Caching**/**Configuration** depending on plan) for instant crawl pings.
- **GTM / Analytics** — confirm `GTM-WR3X354K` + Cloudflare Web Analytics fire on the live apex (Tag Assistant / Realtime).
- **Validate on live domain** — Google Rich Results Test (structured data), Facebook Sharing Debugger + X/Twitter Card Validator (OG tags).
- **Google OAuth consent** — finish **logo upload** (still pending) so the brand shows for all comment sign-ins.

## 7. Internal planning docs hidden — ✅ DONE (in-repo)

Internal docs + the `_tests/` dir were git-tracked and (no build step) served publicly at e.g. `https://ivaylodj.com/CLAUDE.md`. Now handled in-repo:

- **`_redirects`** 301s each internal doc + `/_tests/*` → `/`, so they're never served. Path-based, first-match-wins; **`_posts/*.md` is deliberately untouched** (the blog fetches those at runtime — a blanket `/*.md` rule would break the blog, so explicit paths are used). Cloudflare treats `_redirects` as config, so it isn't itself served.
- **`robots.txt`** has matching `Disallow:` lines so they're never indexed even if a link leaks.
- `README.MD` is left public (conventional for a repo). `CLAUDE.md`/`AGENTS.md` stay at repo root (agent tooling needs them there) — the edge redirect hides them regardless of location.

Verify after deploy:
```sh
curl -sI https://ivaylodj.com/CLAUDE.md          | grep -iE 'HTTP/|^location'   # → 301 → /
curl -sI https://ivaylodj.com/_tests/STATUS.md   | grep -iE 'HTTP/|^location'   # → 301 → /
curl -sI 'https://ivaylodj.com/blog_post.html?post=2026-07-12-chasing-comet-neowise' | grep -i 'HTTP/'  # → 200 (blog unaffected)
```
