import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Cast } from '@/types/story';
import { createCastLookup } from '@/utils/lookup';
import castsData from '@/data/casts.json';

interface UseCastsResult {
  casts: Cast[];
  castByUuid: Map<string, Cast>;
  loading: boolean;
  error: string | null;
}

export function useCasts(): UseCastsResult {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCasts = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const data = castsData as Cast[];

      if (!Array.isArray(data)) {
        throw new Error('invalidCastsFormat');
      }

      setCasts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'failedLoadCasts';
      setError(message);
      setCasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCasts();
  }, [loadCasts]);

  const castByUuid = useMemo(() => createCastLookup(casts), [casts]);

  return { casts, castByUuid, loading, error };
}
