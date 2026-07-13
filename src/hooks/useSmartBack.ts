import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export type DetailLocationState = {
  from?: string;
};

function getHistoryIndex(): number | undefined {
  const idx = window.history.state?.idx;
  return typeof idx === 'number' ? idx : undefined;
}

/**
 * Returns to the previous history entry when possible; otherwise uses the
 * referrer path passed via location state, then a fallback route.
 */
export function useSmartBack(fallback: string = ROUTES.HOME) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const historyIdx = getHistoryIndex();
    if (historyIdx !== undefined && historyIdx > 0) {
      navigate(-1);
      return;
    }

    const from = (location.state as DetailLocationState | null)?.from;
    if (from && from !== `${location.pathname}${location.search}`) {
      navigate(from);
      return;
    }

    navigate(fallback);
  }, [fallback, location.pathname, location.search, location.state, navigate]);
}
