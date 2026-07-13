import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters } from '@/types/search';
import type { Story } from '@/types/story';
import { useWatchedSeriesSet } from '@/hooks/useWatched';
import {
  createDefaultFilters,
  filterAndSortStories,
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

export function useAdvancedSearch(stories: Story[]) {
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
    () => filterAndSortStories(stories, applied, watchedSeries),
    [stories, applied, watchedSeries],
  );

  const updateDraft = useCallback((patch: Partial<SearchFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const search = useCallback(() => {
    const next: SearchFilters = {
      ...draft,
      keyword: draft.keyword.trim(),
      episodesMin: draft.episodesMin.trim(),
      episodesMax: draft.episodesMax.trim(),
      castUuids: [...new Set(draft.castUuids.map((u) => u.trim()).filter(Boolean))],
      networkUuids: [
        ...new Set(draft.networkUuids.map((u) => u.trim()).filter(Boolean)),
      ],
      countries: [...new Set(draft.countries)],
    };
    setDraft(next);
    setApplied(next);

    const params = filtersToSearchParams(next);
    if (!paramsEqual(params, searchParams)) {
      // Replace so filter/query edits do not stack duplicate search history entries.
      setSearchParams(params, { replace: true });
    }
  }, [draft, searchParams, setSearchParams]);

  const reset = useCallback(() => {
    const defaults = createDefaultFilters();
    setDraft(defaults);
    setApplied(defaults);
    setSearchParams({}, { replace: true });
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
