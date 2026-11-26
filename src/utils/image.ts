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

let imageProtectionInstalled = false;

/** Blocks image context menus and drag-out; does not affect non-image UI. */
export function installImageProtection(): void {
  if (imageProtectionInstalled || typeof document === 'undefined') return;
  imageProtectionInstalled = true;

  document.addEventListener('contextmenu', (event) => {
    if (event.target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  });

  document.addEventListener('dragstart', (event) => {
    if (event.target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  });
}
