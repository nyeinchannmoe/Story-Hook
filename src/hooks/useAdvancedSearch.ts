import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADVANCED_SEARCH_DEBOUNCE_MS } from '@/constants';
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

function normalizeFilters(filters: SearchFilters): SearchFilters {
  return {
    ...filters,
    keyword: filters.keyword.trim(),
    episodesMin: filters.episodesMin.trim(),
    episodesMax: filters.episodesMax.trim(),
    castUuids: [
      ...new Set(filters.castUuids.map((u) => u.trim()).filter(Boolean)),
    ],
    networkUuids: [
      ...new Set(filters.networkUuids.map((u) => u.trim()).filter(Boolean)),
    ],
    genreUuids: [
      ...new Set(filters.genreUuids.map((u) => u.trim()).filter(Boolean)),
    ],
    countryUuids: [
      ...new Set(filters.countryUuids.map((u) => u.trim()).filter(Boolean)),
    ],
  };
}

function filtersEquivalent(a: SearchFilters, b: SearchFilters): boolean {
  return paramsEqual(filtersToSearchParams(a), filtersToSearchParams(b));
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
  const draftRef = useRef(draft);
  const searchParamsRef = useRef(searchParams);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  draftRef.current = draft;
  searchParamsRef.current = searchParams;

  useEffect(() => {
    setDraft(urlFilters);
    setApplied(urlFilters);
  }, [urlFilters]);

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const applyFilters = useCallback(
    (filters: SearchFilters) => {
      const next = normalizeFilters(filters);
      setDraft(next);
      setApplied(next);

      const params = filtersToSearchParams(next);
      if (!paramsEqual(params, searchParamsRef.current)) {
        // Replace so filter/query edits do not stack duplicate search history entries.
        setSearchParams(params, { replace: true });
      }
    },
    [setSearchParams],
  );

  const results = useMemo(
    () => filterAndSortStories(stories, applied, watchedSeries),
    [stories, applied, watchedSeries],
  );

  const updateDraft = useCallback((patch: Partial<SearchFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const search = useCallback(() => {
    clearDebounceTimer();
    applyFilters(draftRef.current);
  }, [applyFilters, clearDebounceTimer]);

  const reset = useCallback(() => {
    clearDebounceTimer();
    const defaults = createDefaultFilters();
    setDraft(defaults);
    setApplied(defaults);
    setSearchParams({}, { replace: true });
  }, [clearDebounceTimer, setSearchParams]);

  useEffect(() => {
    if (filtersEquivalent(draft, applied)) {
      return;
    }

    clearDebounceTimer();
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      applyFilters(draftRef.current);
    }, ADVANCED_SEARCH_DEBOUNCE_MS);

    return () => {
      clearDebounceTimer();
    };
  }, [draft, applied, applyFilters, clearDebounceTimer]);

  return {
    draft,
    applied,
    results,
    updateDraft,
    search,
    reset,
  };
}
