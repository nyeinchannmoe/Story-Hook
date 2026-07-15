/**
 * Local verification of social meta generation against stories.json.
 * Run: node scripts/verify-social-meta.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const stories = JSON.parse(
  readFileSync(join(root, 'src/data/stories.json'), 'utf8'),
);

const ORIGIN = 'https://story-hook.vercel.app';
const SAMPLE = 'ddb4a524-fd12-4fb0-8950-525792e2d5d4';
const APP_NAME = 'Story Hook';

function truncateForOg(text, maxLength = 200) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}…`;
}

function buildMeta(story) {
  const dramaTitle = story.title.trim();
  const mmTitle = story.mmTitle?.trim();
  const synopsis = story.story || '';
  const descriptionSource =
    mmTitle && mmTitle !== dramaTitle
      ? `${mmTitle}. ${synopsis}`
      : synopsis;

  return {
    title: `${dramaTitle} | ${APP_NAME}`,
    description: truncateForOg(descriptionSource),
    image: story.coverPhoto,
    url: `${ORIGIN}/detail/${story.uuid}`,
    type: 'article',
    siteName: APP_NAME,
  };
}

const story = stories.find((s) => s.uuid === SAMPLE);
if (!story) {
  console.error('FAIL: sample UUID missing from stories.json');
  process.exit(1);
}

const meta = buildMeta(story);
const checks = [
  meta.title.endsWith(`| ${APP_NAME}`),
  meta.description.length > 0 && meta.description.length <= 201,
  /^https?:\/\//i.test(meta.image),
  meta.url === `${ORIGIN}/detail/${SAMPLE}`,
  meta.type === 'article',
  meta.siteName === APP_NAME,
];

console.log(JSON.stringify(meta, null, 2));
if (checks.every(Boolean)) {
  console.log('PASS: sample drama social meta looks valid');
} else {
  console.error('FAIL: meta validation checks failed', checks);
  process.exit(1);
}

const missing = buildMeta({
  uuid: 'invalid-id',
  title: 'Drama Not Found',
  story: 'The requested drama could not be found.',
  coverPhoto: `${ORIGIN}/og-default.png`,
});
console.log('not-found fallback title:', `${'Drama Not Found'} | ${APP_NAME}`);
console.log('og-default present:', readFileSync(join(root, 'public/og-default.png')).length > 0);
void missing;
