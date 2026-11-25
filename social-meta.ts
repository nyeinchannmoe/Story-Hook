/**
 * Pure helpers for SEO metadata, Open Graph / Twitter Cards, canonical URLs,
 * and JSON-LD. Used by Vercel Edge Middleware and mirrored by build-time SEO scripts.
 * Must stay free of Node-only and React APIs.
 */

export interface StoryShareFields {
  uuid: string;
  title: string;
  mmTitle?: string;
  story: string;
  coverPhoto?: string;
  country_uuid?: string;
  rating?: string;
  type?: string;
  format?: string;
  aired?: string;
  episodes?: number;
  duration?: string;
  orginalNetworks?: string[];
  cast?: Array<{
    castUuid: string;
    characterName: string;
    role: string;
  }>;
}

export interface CastShareFields {
  uuid: string;
  name: string;
  image?: string;
}

export interface NetworkShareFields {
  uuid: string;
  name: string;
}

export interface CountryShareFields {
  uuid: string;
  country: string;
}

export interface SocialMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  siteName: string;
  canonical: string;
  robots: string;
  ogLocale?: string;
}

export const APP_NAME = 'Story Hook';
export const PRODUCTION_ORIGIN = 'https://story-hook.vercel.app';
export const DEFAULT_SITE_DESCRIPTION =
  'Discover and explore curated Asian dramas.';
export const DEFAULT_OG_IMAGE_PATH = '/og-default.png';
export const NOT_FOUND_TITLE = `Drama Not Found | ${APP_NAME}`;
export const NOT_FOUND_DESCRIPTION =
  'The requested drama could not be found.';
export const OG_DESCRIPTION_MAX = 200;
export const INDEXABLE_ROBOTS = 'index, follow';
export const NOINDEX_ROBOTS = 'noindex, follow';

/** Preferred homepage canonical path (avoids `/` vs `/home` duplication). */
export const CANONICAL_HOME_PATH = '/';

export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Safe JSON for embedding inside <script type="application/ld+json">. */
export function safeJsonLdStringify(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function truncateForOg(
  text: string,
  maxLength = OG_DESCRIPTION_MAX,
): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}…`;
}

export function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '');
}

export function toAbsoluteUrl(origin: string, pathOrUrl: string): string {
  const base = normalizeOrigin(origin);
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return `${base}/`;
  if (isAbsoluteHttpUrl(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${base}${trimmed}`;
  return `${base}/${trimmed}`;
}

export function resolveShareImage(
  coverPhoto: string | undefined,
  origin: string,
): string {
  const trimmed = coverPhoto?.trim() ?? '';
  if (trimmed && isAbsoluteHttpUrl(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/') && origin) {
    return `${normalizeOrigin(origin)}${trimmed}`;
  }
  return `${normalizeOrigin(origin)}${DEFAULT_OG_IMAGE_PATH}`;
}

export function buildCanonicalHomeUrl(origin = PRODUCTION_ORIGIN): string {
  return `${normalizeOrigin(origin)}${CANONICAL_HOME_PATH === '/' ? '/' : CANONICAL_HOME_PATH}`;
}

export function buildCanonicalAboutUrl(origin = PRODUCTION_ORIGIN): string {
  return `${normalizeOrigin(origin)}/about`;
}

export function buildCanonicalDetailUrl(
  uuid: string,
  origin = PRODUCTION_ORIGIN,
): string {
  return `${normalizeOrigin(origin)}/detail/${uuid}`;
}

export function buildStoryDescription(story: StoryShareFields): string {
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

export function buildStorySocialMeta(
  story: StoryShareFields,
  origin: string = PRODUCTION_ORIGIN,
): SocialMeta {
  const dramaTitle = story.title.trim();
  const title = `${dramaTitle} | ${APP_NAME}`;
  const description = buildStoryDescription(story);
  const image = resolveShareImage(story.coverPhoto, origin);
  const url = buildCanonicalDetailUrl(story.uuid, origin);

  return {
    title,
    description,
    image,
    url,
    type: 'article',
    siteName: APP_NAME,
    canonical: url,
    robots: INDEXABLE_ROBOTS,
    ogLocale: 'en_US',
  };
}

export function buildNotFoundSocialMeta(
  origin: string = PRODUCTION_ORIGIN,
  uuid: string,
): SocialMeta {
  const url = buildCanonicalDetailUrl(uuid, origin);
  return {
    title: NOT_FOUND_TITLE,
    description: NOT_FOUND_DESCRIPTION,
    image: resolveShareImage(undefined, origin),
    url,
    type: 'article',
    siteName: APP_NAME,
    canonical: url,
    robots: NOINDEX_ROBOTS,
  };
}

export function buildDefaultSocialMeta(
  origin: string = PRODUCTION_ORIGIN,
  path = '/',
): SocialMeta {
  const base = normalizeOrigin(origin);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isHome =
    normalizedPath === '/' ||
    normalizedPath === '/home' ||
    normalizedPath === '';

  const canonical = isHome
    ? buildCanonicalHomeUrl(origin)
    : `${base}${normalizedPath}`;

  const isAbout = normalizedPath === '/about';

  return {
    title: isAbout ? `About | ${APP_NAME}` : APP_NAME,
    description: isAbout
      ? 'Learn about Story Hook — a curated catalog of Asian dramas with multilingual support.'
      : DEFAULT_SITE_DESCRIPTION,
    image: resolveShareImage(undefined, origin),
    url: canonical,
    type: 'website',
    siteName: APP_NAME,
    canonical,
    robots: INDEXABLE_ROBOTS,
    ogLocale: 'en_US',
  };
}

export function findStoryShareFields(
  stories: StoryShareFields[],
  uuid: string,
): StoryShareFields | undefined {
  return stories.find((story) => story.uuid === uuid);
}

export function isValidPublicStory(story: StoryShareFields): boolean {
  return Boolean(story.uuid?.trim() && story.title?.trim());
}

/** Parse aired start into YYYY-MM-DD when unambiguously available; otherwise omit. */
export function parseAiredStartIsoDate(aired: string | undefined): string | undefined {
  if (!aired?.trim()) return undefined;
  const startPart = aired.trim().split(/\s*-\s*/)[0]?.trim() ?? '';
  if (!startPart) return undefined;

  const monthIndex: Record<string, number> = {
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
  if (withDay) {
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

  return undefined;
}

export function buildTvSeriesJsonLd(
  story: StoryShareFields,
  options: {
    origin?: string;
    casts?: CastShareFields[];
    networks?: NetworkShareFields[];
    countries?: CountryShareFields[];
  } = {},
): Record<string, unknown> {
  const origin = options.origin ?? PRODUCTION_ORIGIN;
  const castByUuid = new Map(
    (options.casts ?? []).map((cast) => [cast.uuid, cast]),
  );
  const networkByUuid = new Map(
    (options.networks ?? []).map((network) => [network.uuid, network]),
  );
  const countryByUuid = new Map(
    (options.countries ?? []).map((country) => [country.uuid, country]),
  );

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: story.title.trim(),
    url: buildCanonicalDetailUrl(story.uuid, origin),
  };

  const mmTitle = story.mmTitle?.trim();
  if (mmTitle && mmTitle !== story.title.trim()) {
    jsonLd.alternateName = mmTitle;
  }

  const description = (story.story || '').replace(/\s+/g, ' ').trim();
  if (description) {
    jsonLd.description = description;
  }

  const image = resolveShareImage(story.coverPhoto, origin);
  if (image) {
    jsonLd.image = image;
  }

  const countryUuid = story.country_uuid?.trim();
  const countryName = countryUuid
    ? countryByUuid.get(countryUuid)?.country?.trim()
    : undefined;
  if (countryName) {
    jsonLd.countryOfOrigin = {
      '@type': 'Country',
      name: countryName,
    };
  }

  if (story.type?.trim()) {
    jsonLd.genre = story.type.trim();
  }

  if (
    typeof story.episodes === 'number' &&
    Number.isFinite(story.episodes) &&
    story.episodes > 0
  ) {
    jsonLd.numberOfEpisodes = story.episodes;
  }

  const datePublished = parseAiredStartIsoDate(story.aired);
  if (datePublished) {
    jsonLd.datePublished = datePublished;
  }

  const actors = (story.cast ?? [])
    .map((member) => {
      const cast = castByUuid.get(member.castUuid);
      const name = cast?.name?.trim();
      if (!name) return null;
      const person: Record<string, unknown> = {
        '@type': 'Person',
        name,
      };
      if (cast?.image && isAbsoluteHttpUrl(cast.image)) {
        person.image = cast.image;
      }
      return person;
    })
    .filter((actor): actor is Record<string, unknown> => Boolean(actor));

  if (actors.length > 0) {
    jsonLd.actor = actors;
  }

  const networks = (story.orginalNetworks ?? [])
    .map((uuid) => networkByUuid.get(uuid)?.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (networks.length === 1) {
    jsonLd.publisher = {
      '@type': 'Organization',
      name: networks[0],
    };
  } else if (networks.length > 1) {
    jsonLd.publisher = networks.map((name) => ({
      '@type': 'Organization',
      name,
    }));
  }

  return jsonLd;
}

export function buildWebsiteJsonLd(
  origin: string = PRODUCTION_ORIGIN,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: buildCanonicalHomeUrl(origin),
    description: DEFAULT_SITE_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      url: buildCanonicalHomeUrl(origin),
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  origin: string = PRODUCTION_ORIGIN,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(origin, item.path),
    })),
  };
}

/** Strip existing share-related tags so injected tags are authoritative. */
export function stripShareMetaTags(html: string): string {
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

export function renderShareMetaTags(
  meta: SocialMeta,
  jsonLdObjects: unknown[] = [],
): string {
  const t = escapeHtmlAttr(meta.title);
  const d = escapeHtmlAttr(meta.description);
  const image = escapeHtmlAttr(meta.image);
  const url = escapeHtmlAttr(meta.url);
  const canonical = escapeHtmlAttr(meta.canonical);
  const siteName = escapeHtmlAttr(meta.siteName);
  const type = escapeHtmlAttr(meta.type);
  const robots = escapeHtmlAttr(meta.robots);
  const ogLocale = escapeHtmlAttr(meta.ogLocale ?? 'en_US');

  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${siteName}" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ];

  for (const jsonLd of jsonLdObjects) {
    tags.push(
      `<script type="application/ld+json">${safeJsonLdStringify(jsonLd)}</script>`,
    );
  }

  return tags.join('\n    ');
}

export function injectSocialMeta(
  html: string,
  meta: SocialMeta,
  jsonLdObjects: unknown[] = [],
): string {
  const stripped = stripShareMetaTags(html);
  const tags = renderShareMetaTags(meta, jsonLdObjects);
  if (/<\/head>/i.test(stripped)) {
    return stripped.replace(/<\/head>/i, `    ${tags}\n  </head>`);
  }
  return `${tags}\n${stripped}`;
}

/**
 * Class on prerendered root landmarks: crawlable/accessible text stays in the
 * DOM while sighted users see the boot splash until React mounts.
 * Mirrored by scripts/generate-seo-assets.mjs builders.
 */
export const PRERENDER_ROOT_CLASS = 'sr-only';

/** Not-found body injected by Edge Middleware when 404.html is unavailable. */
export function buildNotFoundRootHtml(): string {
  return `<main class="${PRERENDER_ROOT_CLASS}">
  <h1>Drama Not Found</h1>
  <p>The requested drama could not be found.</p>
  <p><a href="/home">Browse all dramas</a></p>
</main>`;
}

/**
 * Replace `#root` inner HTML only. Sibling boot splash / failed-load nodes
 * outside `#root` are preserved (same contract as generate-seo-assets injectRoot).
 */
export function injectRootContent(html: string, rootInnerHtml: string): string {
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
