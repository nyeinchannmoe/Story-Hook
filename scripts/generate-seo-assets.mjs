/**
 * Build-time SEO asset generator.
 *
 * Modes:
 *   (default / --all)  Write public/sitemap.xml, then prerender into dist/ when present
 *   --sitemap          Write public/sitemap.xml only
 *   --prerender        Prerender static HTML into dist/ (requires vite build output)
 *
 * Data source: src/data/stories.json (+ casts.json, original_network.json for JSON-LD).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PRODUCTION_ORIGIN = 'https://story-hook.vercel.app';
const APP_NAME = 'Story Hook';
const DEFAULT_SITE_DESCRIPTION =
  'Discover and explore curated Asian dramas.';
const DEFAULT_OG_IMAGE_PATH = '/og-default.png';
const OG_DESCRIPTION_MAX = 200;
const INDEXABLE_ROBOTS = 'index, follow';
const NOINDEX_ROBOTS = 'noindex, follow';

const args = new Set(process.argv.slice(2));
const sitemapOnly = args.has('--sitemap');
const prerenderOnly = args.has('--prerender');
const runSitemap = !prerenderOnly || args.has('--all');
const runPrerender = !sitemapOnly || args.has('--all');

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function safeJsonLdStringify(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function truncateForOg(text, maxLength = OG_DESCRIPTION_MAX) {
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}…`;
}

function isAbsoluteHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeOrigin(origin) {
  return origin.replace(/\/$/, '');
}

function resolveShareImage(coverPhoto, origin = PRODUCTION_ORIGIN) {
  const trimmed = coverPhoto?.trim() ?? '';
  if (trimmed && isAbsoluteHttpUrl(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${normalizeOrigin(origin)}${trimmed}`;
  return `${normalizeOrigin(origin)}${DEFAULT_OG_IMAGE_PATH}`;
}

function buildCanonicalHomeUrl(origin = PRODUCTION_ORIGIN) {
  return `${normalizeOrigin(origin)}/`;
}

function buildCanonicalAboutUrl(origin = PRODUCTION_ORIGIN) {
  return `${normalizeOrigin(origin)}/about`;
}

function buildCanonicalDetailUrl(uuid, origin = PRODUCTION_ORIGIN) {
  return `${normalizeOrigin(origin)}/detail/${uuid}`;
}

function isValidPublicStory(story) {
  return Boolean(story?.uuid?.trim() && story?.title?.trim());
}

function buildStoryDescription(story) {
  const dramaTitle = story.title.trim();
  const mmTitle = story.mmTitle?.trim();
  const synopsis = (story.story || '').replace(/\s+/g, ' ').trim();

  if (mmTitle && mmTitle !== dramaTitle) {
    if (synopsis) {
      return truncateForOg(`${mmTitle} - ${dramaTitle}. ${synopsis}`);
    }
    return truncateForOg(
      `${mmTitle} - ${dramaTitle} drama synopsis, cast, country, rating and episode information.`,
    );
  }

  return truncateForOg(synopsis || DEFAULT_SITE_DESCRIPTION);
}

function parseAiredStartIsoDate(aired) {
  if (!aired?.trim()) return undefined;
  const startPart = aired.trim().split(/\s*-\s*/)[0]?.trim() ?? '';
  if (!startPart) return undefined;

  const monthIndex = {
    january: 0,
    jan: 0,
    february: 1,
    feb: 1,
    march: 2,
    mar: 2,
    april: 3,
    apr: 3,
    may: 4,
    june: 5,
    jun: 5,
    july: 6,
    jul: 6,
    august: 7,
    aug: 7,
    september: 8,
    sep: 8,
    sept: 8,
    october: 9,
    oct: 9,
    november: 10,
    nov: 10,
    december: 11,
    dec: 11,
  };

  const withDay = startPart.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (!withDay) return undefined;

  const month = monthIndex[withDay[1].toLowerCase()];
  const day = Number.parseInt(withDay[2], 10);
  const year = Number.parseInt(withDay[3], 10);
  if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) {
    return undefined;
  }
  const date = new Date(Date.UTC(year, month, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}

function loadJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), 'utf8'));
}

function getPublicStories() {
  const stories = loadJson('src/data/stories.json');
  if (!Array.isArray(stories)) {
    throw new Error('stories.json must be an array');
  }
  const seen = new Set();
  const publicStories = [];
  for (const story of stories) {
    if (!isValidPublicStory(story)) continue;
    if (seen.has(story.uuid)) continue;
    seen.add(story.uuid);
    publicStories.push(story);
  }
  return publicStories;
}

function buildSitemapXml(stories) {
  const urls = [
    { loc: buildCanonicalHomeUrl() },
    { loc: buildCanonicalAboutUrl() },
    ...stories.map((story) => ({
      loc: buildCanonicalDetailUrl(story.uuid),
    })),
  ];

  const unique = [];
  const seen = new Set();
  for (const entry of urls) {
    if (seen.has(entry.loc)) continue;
    seen.add(entry.loc);
    unique.push(entry);
  }

  const body = unique
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function writeSitemap(stories) {
  const xml = buildSitemapXml(stories);
  const target = join(ROOT, 'public', 'sitemap.xml');
  writeFileSync(target, xml, 'utf8');
  console.log(
    `Wrote ${target} (${stories.length} dramas + home + about)`,
  );
}

function stripShareMetaTags(html) {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']description["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*\bproperty=["']og:[^"']*["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']twitter:[^"']*["'][^>]*>/gi, '')
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '')
    .replace(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      '',
    );
}

function renderMetaTags(meta, jsonLdObjects = []) {
  const tags = [
    `<title>${escapeHtmlAttr(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtmlAttr(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtmlAttr(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeHtmlAttr(meta.canonical)}" />`,
    `<meta property="og:title" content="${escapeHtmlAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtmlAttr(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtmlAttr(meta.image)}" />`,
    `<meta property="og:type" content="${escapeHtmlAttr(meta.type)}" />`,
    `<meta property="og:url" content="${escapeHtmlAttr(meta.url)}" />`,
    `<meta property="og:site_name" content="${escapeHtmlAttr(meta.siteName)}" />`,
    `<meta property="og:locale" content="${escapeHtmlAttr(meta.ogLocale ?? 'en_US')}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtmlAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtmlAttr(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtmlAttr(meta.image)}" />`,
  ];

  for (const jsonLd of jsonLdObjects) {
    tags.push(
      `<script type="application/ld+json">${safeJsonLdStringify(jsonLd)}</script>`,
    );
  }

  return tags.join('\n    ');
}

function injectHead(html, meta, jsonLdObjects = []) {
  const stripped = stripShareMetaTags(html);
  const tags = renderMetaTags(meta, jsonLdObjects);
  if (/<\/head>/i.test(stripped)) {
    return stripped.replace(/<\/head>/i, `    ${tags}\n  </head>`);
  }
  return `${tags}\n${stripped}`;
}

function injectRoot(html, rootInnerHtml) {
  if (/<div id="root"><\/div>/i.test(html)) {
    return html.replace(
      /<div id="root"><\/div>/i,
      `<div id="root">${rootInnerHtml}</div>`,
    );
  }
  if (/<div id="root">[\s\S]*?<\/div>/i.test(html)) {
    return html.replace(
      /<div id="root">[\s\S]*?<\/div>/i,
      `<div id="root">${rootInnerHtml}</div>`,
    );
  }
  return html;
}

function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: buildCanonicalHomeUrl(),
    description: DEFAULT_SITE_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      url: buildCanonicalHomeUrl(),
    },
  };
}

function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function buildTvSeriesJsonLd(story, casts, networks) {
  const castByUuid = new Map(casts.map((cast) => [cast.uuid, cast]));
  const networkByUuid = new Map(
    networks.map((network) => [network.uuid, network]),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: story.title.trim(),
    url: buildCanonicalDetailUrl(story.uuid),
  };

  const mmTitle = story.mmTitle?.trim();
  if (mmTitle && mmTitle !== story.title.trim()) {
    jsonLd.alternateName = mmTitle;
  }

  const description = (story.story || '').replace(/\s+/g, ' ').trim();
  if (description) jsonLd.description = description;

  jsonLd.image = resolveShareImage(story.coverPhoto);

  if (story.country?.trim()) {
    jsonLd.countryOfOrigin = {
      '@type': 'Country',
      name: story.country.trim(),
    };
  }

  if (story.type?.trim()) jsonLd.genre = story.type.trim();

  if (
    typeof story.episodes === 'number' &&
    Number.isFinite(story.episodes) &&
    story.episodes > 0
  ) {
    jsonLd.numberOfEpisodes = story.episodes;
  }

  const datePublished = parseAiredStartIsoDate(story.aired);
  if (datePublished) jsonLd.datePublished = datePublished;

  const actors = (story.cast ?? [])
    .map((member) => {
      const cast = castByUuid.get(member.castUuid);
      const name = cast?.name?.trim();
      if (!name) return null;
      const person = { '@type': 'Person', name };
      if (cast?.image && isAbsoluteHttpUrl(cast.image)) {
        person.image = cast.image;
      }
      return person;
    })
    .filter(Boolean);

  if (actors.length > 0) jsonLd.actor = actors;

  const resolvedNetworks = (story.orginalNetworks ?? [])
    .map((uuid) => networkByUuid.get(uuid)?.name?.trim())
    .filter(Boolean);

  if (resolvedNetworks.length === 1) {
    jsonLd.publisher = {
      '@type': 'Organization',
      name: resolvedNetworks[0],
    };
  } else if (resolvedNetworks.length > 1) {
    jsonLd.publisher = resolvedNetworks.map((name) => ({
      '@type': 'Organization',
      name,
    }));
  }

  return jsonLd;
}

function resolveCastNames(story, casts) {
  const castByUuid = new Map(casts.map((cast) => [cast.uuid, cast]));
  return (story.cast ?? [])
    .map((member) => {
      const cast = castByUuid.get(member.castUuid);
      if (!cast?.name?.trim()) return null;
      return {
        name: cast.name.trim(),
        characterName: member.characterName?.trim() || '',
        role: member.role?.trim() || '',
      };
    })
    .filter(Boolean);
}

function resolveNetworkNames(story, networks) {
  const networkByUuid = new Map(
    networks.map((network) => [network.uuid, network]),
  );
  return (story.orginalNetworks ?? [])
    .map((uuid) => networkByUuid.get(uuid)?.name?.trim())
    .filter(Boolean);
}

function buildHomeRootHtml(stories) {
  const items = stories
    .slice(0, 50)
    .map((story) => {
      const href = `/detail/${encodeURIComponent(story.uuid)}`;
      const mm = story.mmTitle?.trim()
        ? `<p lang="my">${escapeHtmlText(story.mmTitle.trim())}</p>`
        : '';
      return `<li>
  <a href="${escapeHtmlAttr(href)}">
    <strong>${escapeHtmlText(story.title.trim())}</strong>
  </a>
  ${mm}
</li>`;
    })
    .join('\n');

  return `<main>
  <header>
    <h1>${escapeHtmlText(APP_NAME)}</h1>
    <p>${escapeHtmlText(DEFAULT_SITE_DESCRIPTION)}</p>
  </header>
  <section aria-label="Drama catalog">
    <h2>Featured dramas</h2>
    <ul>
${items}
    </ul>
  </section>
  <nav>
    <a href="/about">About</a>
  </nav>
</main>`;
}

function buildAboutRootHtml() {
  return `<main>
  <article>
    <h1>About ${escapeHtmlText(APP_NAME)}</h1>
    <p>Story Hook is a curated catalog of Asian dramas with English and Myanmar titles, synopses, cast information, and episode details.</p>
    <p><a href="/home">Browse dramas</a></p>
  </article>
</main>`;
}

function buildDetailRootHtml(story, casts, networks) {
  const cover = resolveShareImage(story.coverPhoto);
  const mmTitle = story.mmTitle?.trim() || '';
  const synopsis = (story.story || '').trim();
  const castMembers = resolveCastNames(story, casts);
  const networkNames = resolveNetworkNames(story, networks);

  const metaRows = [];
  if (story.country?.trim()) {
    metaRows.push(
      `<div><dt>Country</dt><dd>${escapeHtmlText(story.country.trim())}</dd></div>`,
    );
  }
  if (story.rating?.trim()) {
    metaRows.push(
      `<div><dt>Rating</dt><dd>${escapeHtmlText(story.rating.trim())}</dd></div>`,
    );
  }
  if (story.type?.trim()) {
    metaRows.push(
      `<div><dt>Type</dt><dd>${escapeHtmlText(story.type.trim())}</dd></div>`,
    );
  }
  if (story.format?.trim()) {
    metaRows.push(
      `<div><dt>Format</dt><dd>${escapeHtmlText(story.format.trim())}</dd></div>`,
    );
  }
  if (story.aired?.trim()) {
    metaRows.push(
      `<div><dt>Aired</dt><dd>${escapeHtmlText(story.aired.trim())}</dd></div>`,
    );
  }
  if (
    typeof story.episodes === 'number' &&
    Number.isFinite(story.episodes) &&
    story.episodes > 0
  ) {
    metaRows.push(
      `<div><dt>Episodes</dt><dd>${escapeHtmlText(String(story.episodes))}</dd></div>`,
    );
  }
  if (story.duration?.trim()) {
    metaRows.push(
      `<div><dt>Duration</dt><dd>${escapeHtmlText(story.duration.trim())}</dd></div>`,
    );
  }
  if (networkNames.length > 0) {
    metaRows.push(
      `<div><dt>Original network</dt><dd>${escapeHtmlText(networkNames.join(', '))}</dd></div>`,
    );
  }

  const castHtml =
    castMembers.length > 0
      ? `<section>
  <h2>Cast</h2>
  <ul>
${castMembers
  .map((member) => {
    const detail = [member.characterName, member.role]
      .filter(Boolean)
      .join(' · ');
    return `    <li><strong>${escapeHtmlText(member.name)}</strong>${
      detail ? ` — ${escapeHtmlText(detail)}` : ''
    }</li>`;
  })
  .join('\n')}
  </ul>
</section>`
      : '';

  return `<article>
  <nav aria-label="Breadcrumb">
    <a href="/">${escapeHtmlText(APP_NAME)}</a>
    <span aria-hidden="true"> / </span>
    <span>${escapeHtmlText(story.title.trim())}</span>
  </nav>
  <header>
    <img src="${escapeHtmlAttr(cover)}" alt="${escapeHtmlAttr(`${story.title.trim()} cover`)}" width="300" height="450" />
    <h1>${escapeHtmlText(story.title.trim())}</h1>
    ${
      mmTitle
        ? `<p lang="my" class="mm-title">${escapeHtmlText(mmTitle)}</p>`
        : ''
    }
  </header>
  ${metaRows.length > 0 ? `<dl>${metaRows.join('\n')}</dl>` : ''}
  ${
    synopsis
      ? `<section>
  <h2>Synopsis</h2>
  <p lang="my">${escapeHtmlText(synopsis)}</p>
</section>`
      : ''
  }
  ${castHtml}
  <p><a href="/home">Back to catalog</a></p>
</article>`;
}

function buildNotFoundRootHtml() {
  return `<main>
  <h1>Drama Not Found</h1>
  <p>The requested drama could not be found.</p>
  <p><a href="/home">Browse all dramas</a></p>
</main>`;
}

function writeHtmlFile(filePath, html) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, 'utf8');
}

function prerender(stories) {
  const distDir = join(ROOT, 'dist');
  const templatePath = join(distDir, 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error(
      'dist/index.html not found. Run vite build before --prerender.',
    );
  }

  const template = readFileSync(templatePath, 'utf8');
  const casts = loadJson('src/data/casts.json');
  const networks = loadJson('src/data/original_network.json');

  const homeMeta = {
    title: APP_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    image: resolveShareImage(undefined),
    url: buildCanonicalHomeUrl(),
    type: 'website',
    siteName: APP_NAME,
    canonical: buildCanonicalHomeUrl(),
    robots: INDEXABLE_ROBOTS,
    ogLocale: 'en_US',
  };

  const homeJsonLd = [
    buildWebsiteJsonLd(),
    buildBreadcrumbJsonLd([
      { name: APP_NAME, url: buildCanonicalHomeUrl() },
    ]),
  ];

  const homeHtml = injectRoot(
    injectHead(template, homeMeta, homeJsonLd),
    buildHomeRootHtml(stories),
  );

  writeHtmlFile(join(distDir, 'index.html'), homeHtml);
  writeHtmlFile(join(distDir, 'home', 'index.html'), homeHtml);

  const aboutMeta = {
    title: `About | ${APP_NAME}`,
    description:
      'Learn about Story Hook — a curated catalog of Asian dramas with multilingual support.',
    image: resolveShareImage(undefined),
    url: buildCanonicalAboutUrl(),
    type: 'website',
    siteName: APP_NAME,
    canonical: buildCanonicalAboutUrl(),
    robots: INDEXABLE_ROBOTS,
    ogLocale: 'en_US',
  };

  const aboutHtml = injectRoot(
    injectHead(template, aboutMeta, [
      buildBreadcrumbJsonLd([
        { name: APP_NAME, url: buildCanonicalHomeUrl() },
        { name: 'About', url: buildCanonicalAboutUrl() },
      ]),
    ]),
    buildAboutRootHtml(),
  );
  writeHtmlFile(join(distDir, 'about', 'index.html'), aboutHtml);

  let detailCount = 0;
  for (const story of stories) {
    const meta = {
      title: `${story.title.trim()} | ${APP_NAME}`,
      description: buildStoryDescription(story),
      image: resolveShareImage(story.coverPhoto),
      url: buildCanonicalDetailUrl(story.uuid),
      type: 'article',
      siteName: APP_NAME,
      canonical: buildCanonicalDetailUrl(story.uuid),
      robots: INDEXABLE_ROBOTS,
      ogLocale: 'en_US',
    };

    const jsonLd = [
      buildTvSeriesJsonLd(story, casts, networks),
      buildBreadcrumbJsonLd([
        { name: APP_NAME, url: buildCanonicalHomeUrl() },
        {
          name: story.title.trim(),
          url: buildCanonicalDetailUrl(story.uuid),
        },
      ]),
    ];

    const html = injectRoot(
      injectHead(template, meta, jsonLd),
      buildDetailRootHtml(story, casts, networks),
    );

    writeHtmlFile(
      join(distDir, 'detail', story.uuid, 'index.html'),
      html,
    );
    detailCount += 1;
  }

  const notFoundMeta = {
    title: `Drama Not Found | ${APP_NAME}`,
    description: 'The requested drama could not be found.',
    image: resolveShareImage(undefined),
    url: buildCanonicalHomeUrl(),
    type: 'website',
    siteName: APP_NAME,
    canonical: buildCanonicalHomeUrl(),
    robots: NOINDEX_ROBOTS,
    ogLocale: 'en_US',
  };

  const notFoundHtml = injectRoot(
    injectHead(template, notFoundMeta),
    buildNotFoundRootHtml(),
  );
  writeHtmlFile(join(distDir, '404.html'), notFoundHtml);

  // Ensure robots.txt + sitemap.xml are present in dist (Vite copies public/, but re-copy if needed)
  const robotsSrc = join(ROOT, 'public', 'robots.txt');
  const sitemapSrc = join(ROOT, 'public', 'sitemap.xml');
  if (existsSync(robotsSrc)) {
    writeFileSync(
      join(distDir, 'robots.txt'),
      readFileSync(robotsSrc, 'utf8'),
      'utf8',
    );
  }
  if (existsSync(sitemapSrc)) {
    writeFileSync(
      join(distDir, 'sitemap.xml'),
      readFileSync(sitemapSrc, 'utf8'),
      'utf8',
    );
  }

  console.log(
    `Prerendered home, about, 404, and ${detailCount} drama detail pages into dist/`,
  );
}

const stories = getPublicStories();

if (runSitemap && !prerenderOnly) {
  writeSitemap(stories);
}

if (runPrerender && !sitemapOnly) {
  if (existsSync(join(ROOT, 'dist', 'index.html'))) {
    prerender(stories);
  } else if (prerenderOnly) {
    throw new Error('dist/index.html missing; cannot prerender');
  } else {
    console.log('Skipping prerender (dist/ not built yet)');
  }
}
