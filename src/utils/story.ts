import type { Story } from '@/types/story';

const MONTH_INDEX: Record<string, number> = {
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

/**
 * Extract the start date from an aired range string.
 * Uses only the portion before " - " (never the end date).
 * Examples: "January 3, 2023 - January 22, 2023" → Jan 3, 2023
 */
export function parseAiredStartDate(aired: string): Date | null {
  if (typeof aired !== 'string') return null;
  const trimmed = aired.trim();
  if (!trimmed) return null;

  const startPart = trimmed.split(/\s*-\s*/)[0]?.trim() ?? '';
  if (!startPart) return null;

  // "January 3, 2023" | "Jan 3, 2023" | "January 3 2023"
  const withDay = startPart.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
  );
  if (withDay) {
    const month = MONTH_INDEX[withDay[1].toLowerCase()];
    const day = Number.parseInt(withDay[2], 10);
    const year = Number.parseInt(withDay[3], 10);
    if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) {
      return null;
    }
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  // "January 2023" | "Jan 2023"
  const monthYear = startPart.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTH_INDEX[monthYear[1].toLowerCase()];
    const year = Number.parseInt(monthYear[2], 10);
    if (month === undefined || Number.isNaN(year)) return null;
    return new Date(year, month, 1);
  }

  // "2023"
  const yearOnly = startPart.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = Number.parseInt(yearOnly[1], 10);
    if (Number.isNaN(year)) return null;
    return new Date(year, 0, 1);
  }

  return null;
}

/** Timestamp of the aired start date, or -Infinity when missing/invalid. */
export function getAiredStartTimestamp(aired: string): number {
  const date = parseAiredStartDate(aired);
  return date ? date.getTime() : Number.NEGATIVE_INFINITY;
}

/** First year from the aired start date (for year-range filtering). */
export function extractYear(aired: string): number | null {
  const date = parseAiredStartDate(aired);
  if (date) return date.getFullYear();

  if (typeof aired !== 'string' || !aired.trim()) return null;
  const match = aired.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  return Number.parseInt(match[0], 10);
}

/**
 * Numeric rating from strings like "8.8/10".
 * Returns 0 for missing or invalid values.
 */
export function parseRatingValue(rating: string): number {
  if (typeof rating !== 'string') return 0;
  const match = rating.trim().match(/^([\d.]+)/);
  if (!match) return 0;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : 0;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function getStoryPreview(story: string, maxLength = 180): string {
  const cleaned = story.replace(/\s+/g, ' ').trim();
  return truncateText(cleaned, maxLength);
}

export function findStoryByUuid(
  stories: Story[],
  uuid: string,
): Story | undefined {
  return stories.find((s) => s.uuid === uuid);
}

/** Display parts for RatingBadge (`value` / `max`). */
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
