import { PLACEHOLDER_IMAGE } from '@/constants';

export function getImageSrc(src: string | undefined | null): string {
  if (!src || src.trim() === '') return PLACEHOLDER_IMAGE;
  return src;
}

export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
): void {
  const img = event.currentTarget;
  if (!img.src.endsWith(PLACEHOLDER_IMAGE)) {
    img.src = PLACEHOLDER_IMAGE;
  }
}
