/**
 * Pure helpers for server-side Open Graph / Twitter Card injection.
 * Used by Vercel Edge Middleware (must stay free of Node-only and React APIs).
 */

export interface StoryShareFields {
  uuid: string;
  title: string;
  mmTitle?: string;
  story: string;
  coverPhoto?: string;
}

export interface SocialMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  siteName: string;
}

export const APP_NAME = 'Story Hook';
export const DEFAULT_SITE_DESCRIPTION =
  'Discover and explore curated Asian dramas.';
export const DEFAULT_OG_IMAGE_PATH = '/og-default.png';
export const NOT_FOUND_TITLE = `Drama Not Found | ${APP_NAME}`;
export const NOT_FOUND_DESCRIPTION =
  'The requested drama could not be found.';
export const OG_DESCRIPTION_MAX = 200;

export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

export function resolveShareImage(
  coverPhoto: string | undefined,
  origin: string,
): string {
  const trimmed = coverPhoto?.trim() ?? '';
  if (trimmed && isAbsoluteHttpUrl(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/') && origin) {
    return `${origin.replace(/\/$/, '')}${trimmed}`;
  }
  return `${origin.replace(/\/$/, '')}${DEFAULT_OG_IMAGE_PATH}`;
}

export function buildStorySocialMeta(
  story: StoryShareFields,
  origin: string,
): SocialMeta {
  const dramaTitle = story.title.trim();
  const title = `${dramaTitle} | ${APP_NAME}`;
  const mmTitle = story.mmTitle?.trim();
  const synopsis = story.story || DEFAULT_SITE_DESCRIPTION;
  const descriptionSource =
    mmTitle && mmTitle !== dramaTitle
      ? `${mmTitle}. ${synopsis}`
      : synopsis;
  const description = truncateForOg(descriptionSource);
  const image = resolveShareImage(story.coverPhoto, origin);
  const url = `${origin.replace(/\/$/, '')}/detail/${story.uuid}`;

  return {
    title,
    description,
    image,
    url,
    type: 'article',
    siteName: APP_NAME,
  };
}

export function buildNotFoundSocialMeta(origin: string, uuid: string): SocialMeta {
  return {
    title: NOT_FOUND_TITLE,
    description: NOT_FOUND_DESCRIPTION,
    image: resolveShareImage(undefined, origin),
    url: `${origin.replace(/\/$/, '')}/detail/${uuid}`,
    type: 'article',
    siteName: APP_NAME,
  };
}

export function buildDefaultSocialMeta(origin: string, path = '/'): SocialMeta {
  const base = origin.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url =
    normalizedPath === '/' || normalizedPath === '/home'
      ? `${base}${normalizedPath === '/home' ? '/home' : '/'}`
      : `${base}${normalizedPath}`;

  return {
    title: APP_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    image: resolveShareImage(undefined, origin),
    url,
    type: 'website',
    siteName: APP_NAME,
  };
}

export function findStoryShareFields(
  stories: StoryShareFields[],
  uuid: string,
): StoryShareFields | undefined {
  return stories.find((story) => story.uuid === uuid);
}

/** Strip existing share-related tags so injected tags are authoritative. */
export function stripShareMetaTags(html: string): string {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']description["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*\bproperty=["']og:[^"']*["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']twitter:[^"']*["'][^>]*>/gi, '');
}

export function renderShareMetaTags(meta: SocialMeta): string {
  const t = escapeHtmlAttr(meta.title);
  const d = escapeHtmlAttr(meta.description);
  const image = escapeHtmlAttr(meta.image);
  const url = escapeHtmlAttr(meta.url);
  const siteName = escapeHtmlAttr(meta.siteName);
  const type = escapeHtmlAttr(meta.type);

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${siteName}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ');
}

export function injectSocialMeta(html: string, meta: SocialMeta): string {
  const stripped = stripShareMetaTags(html);
  const tags = renderShareMetaTags(meta);
  if (/<\/head>/i.test(stripped)) {
    return stripped.replace(/<\/head>/i, `    ${tags}\n  </head>`);
  }
  return `${tags}\n${stripped}`;
}
