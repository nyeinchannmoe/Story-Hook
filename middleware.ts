/**
 * Vercel Edge Middleware — status handling for drama detail routes.
 *
 * Valid `/detail/:uuid` pages are prerendered at build time with full SEO
 * metadata and content. This middleware must not overwrite those pages.
 *
 * Invalid UUIDs return HTTP 404 with a noindex not-found document so crawlers
 * do not treat missing dramas as soft 404s.
 *
 * Social-share meta for valid dramas lives in the prerendered HTML.
 */
import stories from './src/data/stories.json';
import {
  buildNotFoundRootHtml,
  buildNotFoundSocialMeta,
  findStoryShareFields,
  injectRootContent,
  injectSocialMeta,
  type StoryShareFields,
} from './social-meta';

export const config = {
  matcher: ['/detail/:uuid', '/detail/:uuid/'],
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

/** Continue to the filesystem / static prerendered page. */
function passThrough(): Response {
  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}

export default async function middleware(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = getOrigin(request);
  const pathname = requestUrl.pathname.replace(/\/$/, '') || '/';
  const detailMatch = pathname.match(/^\/detail\/([^/]+)$/);

  if (!detailMatch?.[1]) {
    return passThrough();
  }

  const uuid = decodeURIComponent(detailMatch[1]);
  const story = findStoryShareFields(stories as StoryShareFields[], uuid);

  if (story) {
    // Serve the build-time prerendered HTML (meta + content already embedded).
    return passThrough();
  }

  const indexResponse = await fetch(new URL('/404.html', origin));
  const fallbackResponse = indexResponse.ok
    ? indexResponse
    : await fetch(new URL('/index.html', origin));

  if (!fallbackResponse.ok) {
    return new Response('Drama Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  let html = await fallbackResponse.text();
  const meta = buildNotFoundSocialMeta(origin, uuid);

  if (!indexResponse.ok) {
    html = injectRootContent(
      injectSocialMeta(html, meta),
      buildNotFoundRootHtml(),
    );
  } else {
    // 404.html already has noindex meta; refresh URL-specific tags.
    html = injectSocialMeta(html, meta);
  }

  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  });
}
