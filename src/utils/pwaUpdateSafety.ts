/** Minimum quiet period after user input before an update may apply. */
export const PWA_UPDATE_IDLE_MS = 2_500;

const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

export interface PwaUpdateSafetyOptions {
  lastInteractionAt: number;
  idleMs?: number;
}

function isEditableElement(element: Element | null): boolean {
  if (!element || element === document.body || element === document.documentElement) {
    return false;
  }

  if (typeof element.matches === 'function' && element.matches(EDITABLE_SELECTOR)) {
    return true;
  }

  return Boolean((element as HTMLElement).isContentEditable);
}

/**
 * Returns true when applying a waiting service worker (skipWaiting + reload)
 * is unlikely to interrupt typing, open overlays, or active filter UI.
 *
 * Requires a visible tab so a background client does not claim control while
 * the user is actively interacting in another Story Hook tab.
 */
export function isSafeToApplyPwaUpdate(
  options: PwaUpdateSafetyOptions,
): boolean {
  if (typeof document === 'undefined') return false;
  if (document.visibilityState !== 'visible') return false;

  if (document.querySelector('[aria-modal="true"]')) return false;
  if (document.querySelector('[role="listbox"]')) return false;

  const active = document.activeElement;
  if (isEditableElement(active)) return false;

  if (
    active instanceof HTMLElement &&
    active.getAttribute('aria-expanded') === 'true'
  ) {
    return false;
  }

  const idleMs = options.idleMs ?? PWA_UPDATE_IDLE_MS;
  if (Date.now() - options.lastInteractionAt < idleMs) return false;

  return true;
}

/** Interaction events that indicate the user is mid-session. */
export const PWA_INTERACTION_EVENTS = [
  'pointerdown',
  'keydown',
  'touchstart',
  'wheel',
  'input',
] as const;
