import { PLACEHOLDER_IMAGE } from '@/constants';

export function extractYear(aired: string): number | null {
  const match = aired.match(/\b(19|20)\d{2}\b/g);
  if (!match || match.length === 0) return null;
  return parseInt(match[0], 10);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function parseRating(rating: string): number {
  const match = rating.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function getImageSrc(src: string | undefined | null): string {
  if (!src || src.trim() === '') return PLACEHOLDER_IMAGE;
  return src;
}

export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
): void {
  const img = event.currentTarget;
  if (img.src !== PLACEHOLDER_IMAGE && !img.dataset.fallback) {
    img.dataset.fallback = 'true';
    img.src = PLACEHOLDER_IMAGE;
  }
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
