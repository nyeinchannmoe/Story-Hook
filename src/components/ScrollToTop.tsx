import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ROUTES } from '@/constants';

/** Paths that keep a shared scroll position across revisits (browse / search). */
const RESTORE_ON_REVISIT = new Set<string>([
  ROUTES.HOME,
  ROUTES.ADVANCED_SEARCH,
]);

const savedPositions = new Map<string, number>();

function scrollKey(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

function readScrollY(): number {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

function writeScrollY(y: number) {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, y);
  html.scrollTop = y;
  document.body.scrollTop = y;
  html.style.scrollBehavior = previous;
}

/**
 * Saves and restores window scroll across SPA navigations.
 * List routes restore on revisit; other routes restore on history POP only.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  const key = scrollKey(pathname, search);
  const keyRef = useRef(key);
  const scrollYRef = useRef(readScrollY());

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const persist = () => {
      const y = readScrollY();
      scrollYRef.current = y;
      savedPositions.set(keyRef.current, y);
    };

    window.addEventListener('scroll', persist, { passive: true });
    window.addEventListener('pagehide', persist);

    return () => {
      window.removeEventListener('scroll', persist);
      window.removeEventListener('pagehide', persist);
    };
  }, []);

  useLayoutEffect(() => {
    const previousKey = keyRef.current;

    if (previousKey !== key) {
      savedPositions.set(previousKey, scrollYRef.current);
      keyRef.current = key;
    }

    const saved = savedPositions.get(key);
    const shouldRestore =
      saved !== undefined &&
      (navigationType === 'POP' || RESTORE_ON_REVISIT.has(pathname));

    const targetY = shouldRestore ? saved : 0;

    writeScrollY(targetY);
    scrollYRef.current = targetY;

    // Re-apply after paint so late layout cannot leave a tall list at the top.
    const rafId = requestAnimationFrame(() => {
      writeScrollY(targetY);
      scrollYRef.current = targetY;
    });
    const timeoutId = window.setTimeout(() => {
      writeScrollY(targetY);
      scrollYRef.current = targetY;
    }, 0);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [key, pathname, navigationType]);

  return null;
}
