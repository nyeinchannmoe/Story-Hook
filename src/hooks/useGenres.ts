import { useEffect, useMemo, useState } from 'react';
import type { Genre } from '@/types/story';
import { createGenreLookup } from '@/utils/lookup';
import genresData from '@/data/genres.json';

interface UseGenresResult {
  genres: Genre[];
  genreByUuid: Map<string, Genre>;
  loading: boolean;
  error: string | null;
}

interface GenresCache {
  genres: Genre[];
  error: string | null;
}

let genresCache: GenresCache | null = null;

function readGenres(): GenresCache {
  try {
    const data = genresData as Genre[];

    if (!Array.isArray(data)) {
      throw new Error('invalidGenresFormat');
    }

    return { genres: data, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'failedLoadGenres';
    return { genres: [], error: message };
  }
}

function ensureGenresCache(): GenresCache {
  if (!genresCache) {
    genresCache = readGenres();
  }
  return genresCache;
}

export function useGenres(): UseGenresResult {
  const initial = ensureGenresCache();
  const [genres, setGenres] = useState<Genre[]>(initial.genres);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initial.error);

  useEffect(() => {
    const cache = ensureGenresCache();
    setGenres(cache.genres);
    setError(cache.error);
    setLoading(false);
  }, []);

  const genreByUuid = useMemo(
    () => createGenreLookup(genres),
    [genres],
  );

  return { genres, genreByUuid, loading, error };
}
