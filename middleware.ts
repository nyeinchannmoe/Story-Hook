/**
 * Vercel Edge Middleware — injects crawler-readable Open Graph / Twitter Card
 * metadata into the initial HTML before JavaScript runs.
 *
 * Detail routes (/detail/:uuid) receive story-specific tags from stories.json.
 * All other document routes keep the generic Story Hook homepage preview.
 */
import stories from './src/data/stories.json';
import {
  buildDefaultSocialMeta,
  buildNotFoundSocialMeta,
  buildStorySocialMeta,
  findStoryShareFields,
  injectSocialMeta,
  type StoryShareFields,
} from './social-meta';

export const config = {
  matcher: [
    '/',
    '/home',
    '/home/',
    '/detail/:uuid',
    '/detail/:uuid/',
  ],
};

function getOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost) {
    const host = forwardedHost.split(',')[0]?.trim();
    const proto =
      forwardedProto?.split(',')[0]?.trim() ||
      (url.protocol === 'http:' ? 'http' : 'https');
    if (host) {
      return `${proto}://${host}`;
    }
  }

  return url.origin;
}

export default async function middleware(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = getOrigin(request);
  const pathname = requestUrl.pathname.replace(/\/$/, '') || '/';

  const indexResponse = await fetch(new URL('/index.html', origin));
  if (!indexResponse.ok) {
    return fetch(request);
  }

  const html = await indexResponse.text();
  const detailMatch = pathname.match(/^\/detail\/([^/]+)$/);

  let meta;
  if (detailMatch?.[1]) {
    const uuid = decodeURIComponent(detailMatch[1]);
    const story = findStoryShareFields(
      stories as StoryShareFields[],
      uuid,
    );
    meta = story
      ? buildStorySocialMeta(story, origin)
      : buildNotFoundSocialMeta(origin, uuid);
  } else {
    meta = buildDefaultSocialMeta(origin, pathname);
  }

  const body = injectSocialMeta(html, meta);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
