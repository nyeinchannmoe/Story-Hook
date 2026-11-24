# SEO Checklist — Story Hook

Use this checklist for development, release, and periodic maintenance.

## Development

- [ ] Drama data changes go into `src/data/stories.json` (no hardcoded SEO script edits)
- [ ] New dramas have non-empty `uuid`, `title`, and useful `story` / `mmTitle` when available
- [ ] Cover images use absolute `https` URLs when possible
- [ ] Cast/network UUIDs resolve in `casts.json` / `original_network.json`
- [ ] Detail links remain standard anchors (`StoryCard` / router `Link`)
- [ ] Client `SEO` usage sets canonical for indexable pages and `noindex` for settings/search/404

## Local verification

- [ ] `npm run generate:seo` (or `prebuild`) updates `public/sitemap.xml`
- [ ] `public/robots.txt` allows `/` and references the production sitemap
- [ ] `npm run verify:social-meta` passes
- [ ] After a full build, `npm run verify:seo` passes (no FAIL lines)

## Production build

- [ ] `npm run lint` passes
- [ ] `npm run build` completes (`tsc` + Vite + prerender)
- [ ] `dist/robots.txt` and `dist/sitemap.xml` exist
- [ ] `dist/detail/<uuid>/index.html` exists for each public drama
- [ ] Perfect Crown prerender contains English + Myanmar titles
- [ ] Invalid UUID is **not** present under `dist/detail/`
- [ ] `dist/404.html` is `noindex`

## Vercel deployment

- [ ] Deploy from a commit that includes the SEO build scripts
- [ ] Live check: `https://story-hook.vercel.app/robots.txt`
- [ ] Live check: `https://story-hook.vercel.app/sitemap.xml`
- [ ] Live check: homepage View Source shows title, description, canonical, JSON-LD
- [ ] Live check: a drama detail View Source shows title, mmTitle, synopsis, OG tags, JSON-LD
- [ ] Live check: invalid `/detail/<random-uuid>` returns **HTTP 404**
- [ ] Social debugger rescrape still shows drama-specific previews

## Google Search Console

- [ ] URL-prefix property for `https://story-hook.vercel.app/` created
- [ ] Ownership verified (HTML tag deployed with **Google-issued** code)
- [ ] Sitemap submitted
- [ ] Homepage inspected + indexing requested (optional but recommended)
- [ ] Important drama URLs inspected after publish
- [ ] Page indexing report reviewed for soft 404 / noindex surprises

## Bing Webmaster Tools

- [ ] Site added and verified
- [ ] Sitemap submitted
- [ ] Sample URLs inspected
- [ ] (Optional) IndexNow planned with server-side secret — key not in frontend

## New drama publishing

- [ ] Record added to `stories.json`
- [ ] App UI lists the drama (home / search)
- [ ] Production build/deploy completed
- [ ] New URL present in live `sitemap.xml`
- [ ] Live detail URL returns 200 with prerendered content
- [ ] (Optional) GSC / Bing URL inspection for the new page

## Periodic SEO maintenance

- [ ] Re-run `npm run verify:seo` after major releases
- [ ] Review GSC coverage / enhancement reports monthly
- [ ] Review Bing crawl/index stats monthly
- [ ] Confirm robots.txt still allows public assets
- [ ] Watch for duplicate `/` vs `/home` issues (canonical should stay `/`)
- [ ] Remove or fix dramas with empty titles before release
- [ ] After large catalog imports, spot-check several prerendered detail pages
