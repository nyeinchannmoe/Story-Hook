/**
 * SEO validation for Story Hook.
 * Validates robots.txt, sitemap.xml, prerendered HTML (when dist/ exists),
 * and social-meta consistency against stories.json.
 *
 * Run: node scripts/verify-seo.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PRODUCTION_ORIGIN = 'https://story-hook.vercel.app';
const PERFECT_CROWN_UUID = '2b7121c4-ee9f-4350-89a0-38135affdb0d';
const INVALID_UUID = '00000000-0000-0000-0000-000000000000';

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`WARN: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function read(relativePath) {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

function loadStories() {
  const stories = JSON.parse(read('src/data/stories.json'));
  return stories.filter(
    (story) => story?.uuid?.trim() && story?.title?.trim(),
  );
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let index = 0;
  while (true) {
    const found = haystack.indexOf(needle, index);
    if (found === -1) return count;
    count += 1;
    index = found + needle.length;
  }
}

function extractMetaContent(html, attribute, key) {
  const re = new RegExp(
    `<meta[^>]*${attribute}=["']${key}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    'i',
  );
  const alt = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${key}["'][^>]*>`,
    'i',
  );
  return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? null;
}

function extractCanonical(html) {
  const re =
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i;
  const alt =
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i;
  return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? null;
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

function assertAbsoluteHttp(url, label) {
  if (!url || !/^https:\/\//i.test(url)) {
    fail(`${label} must be absolute https URL, got: ${url}`);
    return false;
  }
  return true;
}

// --- robots.txt ---
{
  const robotsPath = join(ROOT, 'public', 'robots.txt');
  if (!existsSync(robotsPath)) {
    fail('public/robots.txt missing');
  } else {
    const robots = readFileSync(robotsPath, 'utf8');
    if (!/User-agent:\s*\*/i.test(robots)) {
      fail('robots.txt missing User-agent: *');
    }
    if (!/Allow:\s*\//i.test(robots)) {
      fail('robots.txt missing Allow: /');
    }
    if (!robots.includes(`${PRODUCTION_ORIGIN}/sitemap.xml`)) {
      fail('robots.txt missing production sitemap URL');
    }
    if (/Disallow:\s*\/(assets|src|\.vite)/i.test(robots)) {
      fail('robots.txt appears to block static assets');
    }
    pass('robots.txt present and allows crawlers with sitemap');
  }
}

// --- sitemap ---
{
  const sitemapPath = join(ROOT, 'public', 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    fail('public/sitemap.xml missing — run generate-seo-assets first');
  } else {
    const sitemap = readFileSync(sitemapPath, 'utf8');
    const stories = loadStories();

    if (!sitemap.includes('<?xml') || !sitemap.includes('<urlset')) {
      fail('sitemap.xml is not valid XML urlset');
    }

    if (sitemap.includes('localhost') || sitemap.includes('127.0.0.1')) {
      fail('sitemap.xml contains development URLs');
    }

    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    const unique = new Set(locs);
    if (locs.length !== unique.size) {
      fail('sitemap.xml contains duplicate URLs');
    }

    if (!unique.has(`${PRODUCTION_ORIGIN}/`)) {
      fail('sitemap missing canonical homepage');
    }
    if (!unique.has(`${PRODUCTION_ORIGIN}/about`)) {
      fail('sitemap missing /about');
    }
    if (unique.has(`${PRODUCTION_ORIGIN}/home`)) {
      fail('sitemap should not include /home (canonical is /)');
    }
    if (unique.has(`${PRODUCTION_ORIGIN}/settings`)) {
      fail('sitemap should not include /settings');
    }
    if (unique.has(`${PRODUCTION_ORIGIN}/advanced-search`)) {
      fail('sitemap should not include /advanced-search');
    }

    for (const story of stories) {
      const expected = `${PRODUCTION_ORIGIN}/detail/${story.uuid}`;
      if (!unique.has(expected)) {
        fail(`sitemap missing drama URL: ${expected}`);
      }
    }

    const perfect = `${PRODUCTION_ORIGIN}/detail/${PERFECT_CROWN_UUID}`;
    if (!unique.has(perfect)) {
      fail('sitemap missing Perfect Crown URL');
    }

    for (const loc of unique) {
      if (!loc.startsWith(PRODUCTION_ORIGIN)) {
        fail(`sitemap URL has wrong host: ${loc}`);
      }
    }

    pass(
      `sitemap.xml valid with ${unique.size} unique production URLs (${stories.length} dramas)`,
    );
  }
}

// --- prerendered dist (optional if not built) ---
{
  const distIndex = join(ROOT, 'dist', 'index.html');
  if (!existsSync(distIndex)) {
    warn('dist/ missing — skip prerender HTML checks (run production build)');
  } else {
    const stories = loadStories();
    const homeHtml = readFileSync(distIndex, 'utf8');

    if (!extractTitle(homeHtml)) fail('home HTML missing <title>');
    if (!extractMetaContent(homeHtml, 'name', 'description')) {
      fail('home HTML missing meta description');
    }
    const homeCanonical = extractCanonical(homeHtml);
    if (homeCanonical !== `${PRODUCTION_ORIGIN}/`) {
      fail(`home canonical expected ${PRODUCTION_ORIGIN}/, got ${homeCanonical}`);
    }
    if (countOccurrences(homeHtml, 'rel="canonical"') !== 1) {
      fail('home HTML must have exactly one canonical');
    }
    if (!homeHtml.includes('application/ld+json')) {
      fail('home HTML missing JSON-LD');
    }
    if (!/<div id="root">[\s\S]*<h1>[\s\S]*Story Hook/i.test(homeHtml)) {
      fail('home prerender missing Story Hook content in #root');
    }
    pass('home prerender metadata and content OK');

    const aboutPath = join(ROOT, 'dist', 'about', 'index.html');
    if (!existsSync(aboutPath)) {
      fail('dist/about/index.html missing');
    } else {
      const aboutHtml = readFileSync(aboutPath, 'utf8');
      if (extractCanonical(aboutHtml) !== `${PRODUCTION_ORIGIN}/about`) {
        fail('about canonical incorrect');
      }
      if (!aboutHtml.includes('About')) {
        fail('about prerender missing About content');
      }
      pass('about prerender OK');
    }

    const homeDir = join(ROOT, 'dist', 'home', 'index.html');
    if (!existsSync(homeDir)) {
      fail('dist/home/index.html missing');
    } else {
      const homeAlias = readFileSync(homeDir, 'utf8');
      if (extractCanonical(homeAlias) !== `${PRODUCTION_ORIGIN}/`) {
        fail('/home prerender must canonicalize to /');
      }
      pass('/home prerender canonicalizes to /');
    }

    for (const story of stories) {
      const detailPath = join(
        ROOT,
        'dist',
        'detail',
        story.uuid,
        'index.html',
      );
      if (!existsSync(detailPath)) {
        fail(`missing prerender for ${story.uuid}`);
        continue;
      }

      const html = readFileSync(detailPath, 'utf8');
      const title = extractTitle(html);
      const description = extractMetaContent(html, 'name', 'description');
      const canonical = extractCanonical(html);
      const ogImage = extractMetaContent(html, 'property', 'og:image');
      const ogUrl = extractMetaContent(html, 'property', 'og:url');
      const robots = extractMetaContent(html, 'name', 'robots');

      const expectedTitleFragment = escapeMinimal(story.title.trim());
      if (
        !title ||
        (!title.includes(story.title.trim()) &&
          !title.includes(expectedTitleFragment))
      ) {
        fail(`detail ${story.uuid} title missing drama name`);
      }
      if (!description) fail(`detail ${story.uuid} missing description`);
      if (canonical !== `${PRODUCTION_ORIGIN}/detail/${story.uuid}`) {
        fail(`detail ${story.uuid} canonical incorrect: ${canonical}`);
      }
      if (countOccurrences(html, 'rel="canonical"') !== 1) {
        fail(`detail ${story.uuid} must have exactly one canonical`);
      }
      if (!assertAbsoluteHttp(ogImage, `detail ${story.uuid} og:image`)) {
        // already failed
      }
      if (ogUrl !== canonical) {
        fail(`detail ${story.uuid} og:url must match canonical`);
      }
      if (!robots || !/index/i.test(robots)) {
        fail(`detail ${story.uuid} robots should allow indexing`);
      }

      if (!html.includes(escapeMinimal(story.title.trim()))) {
        fail(`detail ${story.uuid} body missing English title`);
      }
      if (story.mmTitle?.trim() && !html.includes(story.mmTitle.trim())) {
        fail(`detail ${story.uuid} body missing Myanmar title`);
      }
      if (story.story?.trim()) {
        const snippet = story.story.trim().slice(0, 40);
        if (!html.includes(snippet) && !html.includes(escapeMinimal(snippet))) {
          fail(`detail ${story.uuid} body missing synopsis snippet`);
        }
      }

      const jsonLdBlocks = extractJsonLdBlocks(html);
      if (jsonLdBlocks.length === 0) {
        fail(`detail ${story.uuid} missing JSON-LD`);
      } else {
        let hasTvSeries = false;
        for (const block of jsonLdBlocks) {
          let parsed;
          try {
            parsed = JSON.parse(block);
          } catch {
            fail(`detail ${story.uuid} JSON-LD is invalid JSON`);
            continue;
          }
          if (parsed['@type'] === 'TVSeries') {
            hasTvSeries = true;
            if (parsed.name !== story.title.trim()) {
              fail(`detail ${story.uuid} JSON-LD name mismatch`);
            }
            if (
              story.mmTitle?.trim() &&
              story.mmTitle.trim() !== story.title.trim() &&
              parsed.alternateName !== story.mmTitle.trim()
            ) {
              fail(`detail ${story.uuid} JSON-LD alternateName mismatch`);
            }
            if (parsed.aggregateRating || parsed.review) {
              fail(
                `detail ${story.uuid} JSON-LD must not invent ratings/reviews`,
              );
            }
          }
        }
        if (!hasTvSeries) {
          fail(`detail ${story.uuid} missing TVSeries JSON-LD`);
        }
      }
    }

    pass(`all ${stories.length} drama detail prerenders validated`);

    // Perfect Crown spot check
    const perfectPath = join(
      ROOT,
      'dist',
      'detail',
      PERFECT_CROWN_UUID,
      'index.html',
    );
    if (existsSync(perfectPath)) {
      const html = readFileSync(perfectPath, 'utf8');
      if (!html.includes('Perfect Crown (2026)')) {
        fail('Perfect Crown English title missing in prerender');
      }
      if (!html.includes('စာချုပ်ဝင် မင်းသမီး')) {
        fail('Perfect Crown Myanmar title missing in prerender');
      }
      pass('Perfect Crown prerender content OK');
    }

    // Invalid UUID must not have a prerendered page
    const invalidPath = join(
      ROOT,
      'dist',
      'detail',
      INVALID_UUID,
      'index.html',
    );
    if (existsSync(invalidPath)) {
      fail('invalid UUID should not have a prerendered detail page');
    } else {
      pass('invalid UUID has no prerendered detail page');
    }

    if (!existsSync(join(ROOT, 'dist', '404.html'))) {
      fail('dist/404.html missing');
    } else {
      const notFound = readFileSync(join(ROOT, 'dist', '404.html'), 'utf8');
      const robots = extractMetaContent(notFound, 'name', 'robots');
      if (!robots || !/noindex/i.test(robots)) {
        fail('404.html should be noindex');
      }
      pass('404.html present with noindex');
    }

    // Ensure sitemap and robots copied to dist
    if (!existsSync(join(ROOT, 'dist', 'robots.txt'))) {
      fail('dist/robots.txt missing');
    }
    if (!existsSync(join(ROOT, 'dist', 'sitemap.xml'))) {
      fail('dist/sitemap.xml missing');
    } else {
      pass('dist contains robots.txt and sitemap.xml');
    }

    // No unexpected prerender for private routes as indexable duplicates
    // (settings/advanced-search may fall through to SPA — OK)
  }
}

function escapeMinimal(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- social meta sample (legacy + extended) ---
{
  const stories = loadStories();
  const story = stories.find((item) => item.uuid === PERFECT_CROWN_UUID);
  if (!story) {
    fail('Perfect Crown missing from stories.json');
  } else {
    const descriptionParts = [];
    if (story.mmTitle?.trim()) descriptionParts.push(story.mmTitle.trim());
    if (story.title?.trim()) descriptionParts.push(story.title.trim());
    if (!story.story?.trim()) {
      fail('Perfect Crown missing synopsis');
    }
    pass('Perfect Crown sample drama fields present for meta generation');
  }
}

console.log('');
if (failures.length > 0) {
  console.error(
    `SEO verification failed: ${failures.length} error(s), ${warnings.length} warning(s)`,
  );
  process.exit(1);
}

console.log(
  `SEO verification passed${warnings.length ? ` with ${warnings.length} warning(s)` : ''}`,
);
