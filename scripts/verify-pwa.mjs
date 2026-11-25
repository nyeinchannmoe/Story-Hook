import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const swPath = join(dist, 'sw.js');
const manifestPath = join(dist, 'manifest.webmanifest');

if (!existsSync(swPath)) {
  console.error('Missing dist/sw.js');
  process.exit(1);
}
if (!existsSync(manifestPath)) {
  console.error('Missing dist/manifest.webmanifest');
  process.exit(1);
}

const sw = readFileSync(swPath, 'utf8');
const urls = [...sw.matchAll(/url:"([^"]+)"/g)].map((match) => match[1]);

const checks = {
  precacheCount: urls.length,
  hasIndex: urls.includes('index.html'),
  hasStories: urls.some((url) => url.includes('useStories')),
  hasHomePage: urls.some((url) => url.includes('HomePage')),
  hasAdvancedSearch: urls.some((url) => url.includes('AdvancedSearch')),
  hasDetailPage: urls.some((url) => url.includes('DetailPage')),
  hasCommonLocale: urls.some((url) => /common-.*\.js$/.test(url)),
  hasPlaceholder: urls.some((url) => url.includes('placeholder-drama')),
  hasIcons: urls.filter((url) => url.includes('icons/')),
  hasNavigateFallback: sw.includes('createHandlerBoundToURL'),
  hasCleanup: sw.includes('cleanupOutdatedCaches'),
  hasSkipWaitingMessage: sw.includes('SKIP_WAITING'),
};

console.log(JSON.stringify(checks, null, 2));

const required = [
  'hasIndex',
  'hasStories',
  'hasHomePage',
  'hasAdvancedSearch',
  'hasDetailPage',
  'hasCommonLocale',
  'hasPlaceholder',
  'hasNavigateFallback',
  'hasCleanup',
  'hasSkipWaitingMessage',
];

const failed = required.filter((key) => !checks[key]);
if (failed.length > 0 || checks.hasIcons.length === 0) {
  console.error('PWA verification failed:', failed);
  process.exit(1);
}

console.log('PWA verification passed');
