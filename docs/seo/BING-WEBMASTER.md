# Bing Webmaster Tools — Story Hook

Website URL: **https://story-hook.vercel.app/**

## Bing Webmaster Tools setup

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with a Microsoft account
3. Add the site: `https://story-hook.vercel.app/`
4. Prefer **URL prefix** / site URL import matching the production HTTPS host

You can also import the site from Google Search Console if that property is already verified (Bing offers GSC import).

## Website ownership verification

Bing supports several methods (XML file, meta tag, DNS, GSC import).

### HTML meta tag (typical for this repo)

1. Copy the verification meta tag Bing provides
2. Add it to `index.html` `<head>` (same pattern as Google’s tag)
3. Deploy to Vercel
4. Click **Verify** in Bing Webmaster Tools

Do **not** commit invented verification codes. Use only the value Bing shows for your account.

### Alternative

Upload Bing’s verification XML file into `public/` and deploy so it is available at the site root — only if you choose that method in the Bing UI.

## Sitemap submission

1. Open **Sitemaps** in Bing Webmaster Tools
2. Submit:

   `https://story-hook.vercel.app/sitemap.xml`

3. Confirm Bing can fetch and process it

The sitemap is generated from `stories.json` on every production build.

## URL inspection

1. Use Bing’s **URL Inspection** (or equivalent site scan tools in Webmaster)
2. Test:
   - Homepage: `https://story-hook.vercel.app/`
   - A drama such as Perfect Crown:  
     `https://story-hook.vercel.app/detail/2b7121c4-ee9f-4350-89a0-38135affdb0d`
3. Confirm HTTP 200, visible title/description, and that robots allow crawling

## Indexing status checks

In Bing Webmaster Tools, review:

- Indexed pages / crawl stats
- Sitemap errors
- Blocked URLs (should be none for public catalog pages)
- Soft 404 / 404 reports — invalid drama UUIDs should appear as **404**, not 200

## IndexNow overview

[IndexNow](https://www.indexnow.org/) lets you notify supported search engines (including Bing) when URLs are added or updated.

### Status in this project

IndexNow is **not** wired as a mandatory runtime integration. Reasons:

- Requires an API key that must **never** ship in frontend bundles or public files without care
- Optional for baseline SEO (sitemap + prerender are sufficient to start)

### If you implement IndexNow later (secure pattern)

1. Generate a key in Bing Webmaster Tools / IndexNow
2. Host `{key}.txt` at the site root **or** use a key file path Bing documents
3. Call the IndexNow API from a **server-side** or CI secret context only:

   - Vercel serverless function with `INDEXNOW_KEY` env var, **or**
   - GitHub Action / deploy hook after catalog updates

4. Never expose the key in client React code or commit it to git
5. POST only changed URLs (new/updated drama detail URLs + homepage if needed)

Example conceptual payload (do not embed real keys):

```json
{
  "host": "story-hook.vercel.app",
  "key": "<from-environment>",
  "urlList": [
    "https://story-hook.vercel.app/detail/<uuid>"
  ]
}
```

### Submitting newly added dramas without IndexNow

1. Add the drama to `stories.json`
2. Deploy (`npm run build` on Vercel)
3. Confirm the URL appears in `sitemap.xml`
4. Optionally paste the new URL into Bing URL submission / inspection tools

## Security notes

- Do not publish private API keys, webmaster tokens, or verification secrets in public docs beyond placeholder instructions
- Rotate any key that was ever committed accidentally
