import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function resetWindowScroll() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  html.style.scrollBehavior = previous;
}

/** Reset window scroll on route change so pages open from the top. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    resetWindowScroll();

    // Data pages swap a short skeleton for tall content after a short delay;
    // re-assert top so scroll anchoring cannot pin the viewport to the bottom.
    const rafId = requestAnimationFrame(resetWindowScroll);
    const timeoutId = window.setTimeout(resetWindowScroll, 450);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}
