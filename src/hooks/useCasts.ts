import { useEffect, useMemo, useState } from 'react';
import type { Cast } from '@/types/story';
import { createCastLookup } from '@/utils/lookup';
import castsData from '@/data/casts.json';

interface UseCastsResult {
  casts: Cast[];
  castByUuid: Map<string, Cast>;
  loading: boolean;
  error: string | null;
}

interface CastsCache {
  casts: Cast[];
  error: string | null;
}

let castsCache: CastsCache | null = null;

function readCasts(): CastsCache {
  try {
    const data = castsData as Cast[];

    if (!Array.isArray(data)) {
      throw new Error('invalidCastsFormat');
    }

    return { casts: data, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'failedLoadCasts';
    return { casts: [], error: message };
  }
}

function ensureCastsCache(): CastsCache {
  if (!castsCache) {
    castsCache = readCasts();
  }
  return castsCache;
}

export function useCasts(): UseCastsResult {
  const initial = ensureCastsCache();
  const [casts, setCasts] = useState<Cast[]>(initial.casts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initial.error);

  useEffect(() => {
    const cache = ensureCastsCache();
    setCasts(cache.casts);
    setError(cache.error);
    setLoading(false);
  }, []);

  const castByUuid = useMemo(() => createCastLookup(casts), [casts]);

  return { casts, castByUuid, loading, error };
}
