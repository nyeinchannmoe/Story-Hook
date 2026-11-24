# Google Search Console Setup — Story Hook

Website URL: **https://story-hook.vercel.app/**

This guide is for **manual** Google Search Console (GSC) actions. The repository does **not** contain a Google verification code — Google issues that uniquely for your account.

## 1. Create a Google Search Console property

1. Open [Google Search Console](https://search.google.com/search-console)
2. Sign in with the Google account that should own the property
3. Click **Add property**

## 2. Select URL-prefix property

1. Choose **URL prefix** (not Domain) unless you also control DNS for a custom domain
2. Enter exactly:

   `https://story-hook.vercel.app/`

3. Continue

URL-prefix verification matches this exact scheme + host + path prefix.

## 3. Verifying website ownership

Google offers several methods. For this Vite/Vercel app, the **HTML tag** method is the simplest code-side option.

## 4. Adding the HTML verification meta tag

1. In GSC, choose **HTML tag** verification
2. Copy the meta tag Google shows. It looks like:

   ```html
   <meta name="google-site-verification" content="YOUR_CODE_FROM_GOOGLE" />
   ```

3. **Do not invent a code.** Use only the value Google displays for your property.

## 5. Deploying the verification tag

Insert the meta tag into the document `<head>` of the site that GSC will fetch.

**Recommended location in this project:**

- File: `index.html` (project root)
- Place it near the other meta tags inside `<head>`, for example after `theme-color`

Because production prerendering starts from the Vite-built `index.html`, the tag is preserved in prerendered pages unless a strip step removes unknown metas (current strip logic only removes share/SEO tags it manages — it does **not** remove `google-site-verification`).

After editing:

```bash
npm run build
```

Deploy to Vercel (push or CLI). Confirm the live HTML contains the tag:

`https://story-hook.vercel.app/` → View Source → search for `google-site-verification`.

## 6. Completing verification

1. Return to GSC
2. Click **Verify**
3. On success, the property becomes active

If verification fails: wait for CDN cache, hard-refresh, confirm you deployed to the same host you registered, and that the meta `content` matches exactly.

## 7. Submitting the sitemap

1. In GSC open **Sitemaps**
2. Submit:

   `https://story-hook.vercel.app/sitemap.xml`

   (or the path `sitemap.xml` relative to the property)

3. Confirm GSC can fetch it (status should become Success after processing)

## 8. Using URL Inspection

1. Open **URL Inspection**
2. Enter a URL, for example:

   - `https://story-hook.vercel.app/`
   - `https://story-hook.vercel.app/detail/2b7121c4-ee9f-4350-89a0-38135affdb0d` (Perfect Crown)

## 9. Testing the live URL

In URL Inspection:

1. Click **Test live URL**
2. Confirm Google can retrieve HTML
3. Check that the inspected title/description look correct
4. Confirm the page is not blocked by robots.txt

## 10. Requesting indexing

1. After a successful live test, click **Request indexing**
2. Use this for important new or updated URLs (homepage, new dramas)
3. Quota limits apply — prioritize key pages; the sitemap covers the rest

Indexing is a request, not a guarantee of timing or inclusion.

## 11. Checking Page Indexing reports

1. Open **Pages** (Index / Page indexing)
2. Review **Why pages aren’t indexed** and **Indexed** counts
3. Re-check after deploying SEO changes (allow days/weeks for recrawl)

## 12. Understanding common statuses

| Status | Meaning | Typical action |
|--------|---------|----------------|
| **Discovered — currently not indexed** | Google knows the URL but has not indexed it yet | Wait; ensure quality/internal links; optionally request indexing for key URLs |
| **Crawled — currently not indexed** | Crawled but not selected for index | Improve uniqueness/content usefulness; avoid thin duplicates |
| **Alternate page with proper canonical tag** | Google honors a canonical pointing elsewhere | Expected for `/home` → `/`. Ensure the canonical target is the preferred URL |
| **Duplicate without user-selected canonical** | Duplicate signals without a clear canonical | Ensure exactly one canonical; avoid duplicate templates |
| **Excluded by `noindex`** | Page sends noindex | Expected for settings, advanced search, 404s |
| **Blocked by robots.txt** | robots disallows crawl | Should not happen with current `Allow: /` — verify live robots.txt |
| **Soft 404** | URL returns 200 but looks like not-found | Invalid dramas should now return **HTTP 404** via middleware |

## 13. Troubleshooting common indexing problems

1. **Site not in results for “Story Hook”** — brand queries can take time; submit sitemap, request homepage indexing, ensure homepage title/description mention Story Hook (they do).
2. **Drama title not found** — confirm the drama URL is in `sitemap.xml`, returns 200 with prerendered title/mmTitle, and is linked from `/home`.
3. **Myanmar title queries** — ensure `mmTitle` appears in prerender HTML and meta description (it does when present in JSON).
4. **Social preview works but Google does not** — social crawlers and Googlebot differ; focus on sitemap + Inspection + content quality.
5. **Wrong canonical host** — must be `https://story-hook.vercel.app` (implemented).
6. **After adding dramas** — rebuild/deploy, then use Inspection on the new URL if urgent.

### Code-side preparation already done

- robots.txt + sitemap.xml
- Prerendered indexable HTML for home, about, and dramas
- Canonical tags
- HTTP 404 for invalid drama UUIDs
- `noindex` on non-indexable app pages

### Still required from you

- Create the GSC property
- Paste **your** verification meta tag into `index.html` and deploy
- Submit the sitemap
- Request indexing for priority URLs
