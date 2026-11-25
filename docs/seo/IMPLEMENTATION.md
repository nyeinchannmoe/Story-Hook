# SEO Implementation Record

This document describes the **final implemented** SEO work in Story Hook, not a proposal.

## Files created

| File | Purpose |
|------|---------|
| `public/robots.txt` | Crawl policy + production sitemap declaration |
| `public/sitemap.xml` | Generated URL list (rewritten on each `prebuild`) |
| `scripts/generate-seo-assets.mjs` | Sitemap writer + post-Vite HTML prerenderer |
| `scripts/verify-seo.mjs` | Automated SEO validation |
| `docs/seo/README.md` | Main SEO architecture guide |
| `docs/seo/IMPLEMENTATION.md` | This file |
| `docs/seo/GOOGLE-SEARCH-CONSOLE.md` | GSC setup |
| `docs/seo/BING-WEBMASTER.md` | Bing + IndexNow notes |
| `docs/seo/SEO-CHECKLIST.md` | Operational checklist |

## Files modified

| File | Purpose of change |
|------|-------------------|
| `social-meta.ts` | Canonical/robots helpers, richer descriptions, JSON-LD builders, safer HTML injection |
| `middleware.ts` | Pass-through for valid dramas; **HTTP 404** for invalid UUIDs; no longer overwrites prerender meta |
| `src/components/SEO.tsx` | Canonical link, robots, production-absolute URLs, JSON-LD script management |
| `src/pages/DetailPage.tsx` | Shared description builder + TVSeries/Breadcrumb JSON-LD |
| `src/pages/HomePage.tsx` | Canonical `/` + WebSite JSON-LD |
| `src/pages/AboutPage.tsx` | Canonical `/about` |
| `src/pages/SettingsPage.tsx` | `noindex` |
| `src/pages/AdvancedSearchPage.tsx` | `noindex` |
| `src/pages/NotFoundPage.tsx` | `noindex` |
| `index.html` | Absolute production OG/Twitter/canonical defaults |
| `package.json` | `prebuild`, prerender step, `generate:seo`, `verify:seo` |
| `vercel.json` | Cache/content-type headers for sitemap + robots |
| `tsconfig.app.json` | Include root `social-meta.ts` for client imports |
| `scripts/verify-social-meta.mjs` | Aligned with Perfect Crown sample + canonical checks |
| `README.md` | Short SEO section linking here |

## Important implementation decisions

1. **Stay on Vite SPA** — no Next.js migration.
2. **Build-time prerender** after `vite build` — injects meta + semantic `#root` HTML using the built asset template so script/link hashes stay correct.
3. **`createRoot` (not `hydrateRoot`)** — prerender is a crawler-oriented HTML snapshot; React replaces `#root` for the interactive UI. This avoids brittle hydration mismatches while still shipping meaningful first HTML. Prerender roots use `class="sr-only"` (plus critical CSS clip) so sighted users see the boot splash, not raw text, until `html.app-mounted`.
4. **Canonical homepage is `/`** — `/home` is prerendered for direct hits but canonicalizes to `/` to prevent duplicates.
5. **Production origin for canonicals** — always `https://story-hook.vercel.app` so preview hosts do not become preferred URLs.
6. **Middleware narrowed to `/detail/:uuid`** — only enforces 404 for missing dramas; valid pages are served from static prerender files.
7. **No `hreflang`** — routes are not language-prefixed.
8. **No IndexNow API key in the repo** — IndexNow remains optional/manual (see Bing doc).
9. **No invented `lastmod`** in the sitemap.

## How prerendering works

```text
npm run prebuild
  → generate-seo-assets.mjs --sitemap
  → writes public/sitemap.xml

npm run build
  → tsc -b
  → vite build  (dist/index.html + assets; copies public/*)
  → generate-seo-assets.mjs --prerender
      reads dist/index.html
      writes dist/index.html, dist/home/index.html, dist/about/index.html,
             dist/detail/<uuid>/index.html, dist/404.html
      ensures dist/robots.txt + dist/sitemap.xml
```

Drama detail HTML includes (when present in JSON): English title, Myanmar title, synopsis, cover image, country, rating, type, format, aired, episodes, duration, original networks, cast names/roles.

## How metadata is generated

Shared logic lives in `social-meta.ts` (runtime) and is mirrored in `scripts/generate-seo-assets.mjs` (build). Drama descriptions use real `mmTitle`, `title`, and `story` text, truncated for OG length.

## How sitemap URLs are generated

1. Load `stories.json`
2. Keep entries with non-empty `uuid` + `title` (dedupe by uuid)
3. Emit `/`, `/about`, and each `/detail/{uuid}` under the production origin
4. Escape XML entities

## How invalid URLs are handled

| Case | Behavior |
|------|----------|
| Valid drama UUID | Static prerender → HTTP 200 |
| Invalid drama UUID | Middleware → HTTP **404**, `noindex`, user-friendly not-found HTML |
| Other unknown paths | SPA rewrite → client `NotFoundPage` (`noindex`) |

## How to add new drama records without manual SEO edits

1. Add the drama to `src/data/stories.json` (and cast/network JSON if needed)
2. Ensure home/advanced-search links surface it via existing data hooks
3. Run `npm run build` (or deploy to Vercel)

Automatically obtained:

- Prerendered detail HTML
- Sitemap entry
- Unique title/description/canonical/OG/Twitter
- TVSeries JSON-LD when fields support it
- Internal links from the home catalog cards (`StoryCard` → `<a href="/detail/...">`)

No per-drama edits to SEO scripts are required.
