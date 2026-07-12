import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters } from '@/types/search';
import type { Cast, OriginalNetwork, Story } from '@/types/story';
import { useWatchedSeriesSet } from '@/hooks/useWatched';
import {
  createDefaultFilters,
  filterStories,
  filtersToSearchParams,
  searchParamsToFilters,
} from '@/utils/search';

function paramsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  const aKeys = [...a.keys()].sort();
  const bKeys = [...b.keys()].sort();
  if (aKeys.length !== bKeys.length) return false;
  if (aKeys.some((key, i) => key !== bKeys[i])) return false;

  for (const key of aKeys) {
    const aValues = a.getAll(key).sort().join('\0');
    const bValues = b.getAll(key).sort().join('\0');
    if (aValues !== bValues) return false;
  }
  return true;
}

export function useAdvancedSearch(
  stories: Story[],
  castByUuid: Map<string, Cast> = new Map(),
  networkByUuid: Map<string, OriginalNetwork> = new Map(),
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlFilters = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  );

  const [draft, setDraft] = useState<SearchFilters>(urlFilters);
  const [applied, setApplied] = useState<SearchFilters>(urlFilters);
  const watchedSeries = useWatchedSeriesSet();

  useEffect(() => {
    setDraft(urlFilters);
    setApplied(urlFilters);
  }, [urlFilters]);

  const results = useMemo(
    () =>
      filterStories(
        stories,
        applied,
        castByUuid,
        networkByUuid,
        watchedSeries,
      ),
    [stories, applied, castByUuid, networkByUuid, watchedSeries],
  );

  const updateDraft = useCallback((patch: Partial<SearchFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const search = useCallback(() => {
    const next = {
      ...draft,
      keyword: draft.keyword.trim(),
      episodesMin: draft.episodesMin.trim(),
      episodesMax: draft.episodesMax.trim(),
    };
    setDraft(next);
    setApplied(next);

    const params = filtersToSearchParams(next);
    if (!paramsEqual(params, searchParams)) {
      setSearchParams(params, { replace: false });
    }
  }, [draft, searchParams, setSearchParams]);

  const reset = useCallback(() => {
    const defaults = createDefaultFilters();
    setDraft(defaults);
    setApplied(defaults);
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

  return {
    draft,
    applied,
    results,
    updateDraft,
    search,
    reset,
  };
}
