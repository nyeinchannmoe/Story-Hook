import type { Story } from '@/types/story';

export function extractYear(aired: string): number | null {
  const match = aired.match(/\b(19|20)\d{2}\b/g);
  if (!match || match.length === 0) return null;
  return parseInt(match[0], 10);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function getStoryPreview(story: string, maxLength = 180): string {
  const cleaned = story.replace(/\s+/g, ' ').trim();
  return truncateText(cleaned, maxLength);
}

export function findStoryByUuid(stories: Story[], uuid: string): Story | undefined {
  return stories.find((s) => s.uuid === uuid);
}

export function parseRating(rating: string): { value: string; max: string } {
  const match = rating.trim().match(/^([\d.]+)\s*\/\s*([\d.]+)/);
  if (match) {
    return { value: match[1], max: match[2] };
  }
  return { value: rating.trim(), max: '10' };
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
