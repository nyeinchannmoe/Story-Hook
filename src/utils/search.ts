import {
  ROUTES,
  SEARCH_COUNTRIES,
  SEARCH_RATING_MAX,
  SEARCH_RATING_MIN,
  SEARCH_YEAR_MAX,
  SEARCH_YEAR_MIN,
  WATCHED_FILTER_OPTIONS,
  type SearchCountry,
} from '@/constants';
import type { SearchFilters, StorySortMode } from '@/types/search';
import type { WatchedFilter } from '@/types/watched';
import type { Story } from '@/types/story';
import {
  extractYear,
  getAiredStartTimestamp,
  parseRatingValue,
} from '@/utils/story';

export { parseRatingValue } from '@/utils/story';

export function createDefaultFilters(): SearchFilters {
  return {
    keyword: '',
    countries: [],
    castUuids: [],
    networkUuids: [],
    ratingFrom: SEARCH_RATING_MIN,
    ratingTo: SEARCH_RATING_MAX,
    episodesMin: '',
    episodesMax: '',
    yearFrom: SEARCH_YEAR_MIN,
    yearTo: SEARCH_YEAR_MAX,
    watched: 'all',
  };
}

function isAiredYearRangeChanged(
  filters: SearchFilters,
  defaults: SearchFilters,
): boolean {
  return (
    filters.yearFrom !== defaults.yearFrom ||
    filters.yearTo !== defaults.yearTo
  );
}

function isRatingRangeChanged(
  filters: SearchFilters,
  defaults: SearchFilters,
): boolean {
  return (
    filters.ratingFrom !== defaults.ratingFrom ||
    filters.ratingTo !== defaults.ratingTo
  );
}

/**
 * Resolve sort mode from applied filters vs defaults.
 * - Default or only aired year changed → aired (newest first)
 * - Only rating changed → rating (highest first)
 * - Both changed → combined (aired primary, rating secondary)
 */
export function resolveStorySortMode(
  filters: SearchFilters,
  defaults: SearchFilters = createDefaultFilters(),
): StorySortMode {
  const airedChanged = isAiredYearRangeChanged(filters, defaults);
  const ratingChanged = isRatingRangeChanged(filters, defaults);

  if (airedChanged && ratingChanged) return 'combined';
  if (ratingChanged) return 'rating';
  return 'aired';
}

interface StorySortKeys {
  story: Story;
  airedTs: number;
  rating: number;
  uuid: string;
}

function decorateForSort(stories: Story[]): StorySortKeys[] {
  return stories.map((story) => ({
    story,
    airedTs: getAiredStartTimestamp(story.aired),
    rating: parseRatingValue(story.rating),
    uuid: typeof story.uuid === 'string' ? story.uuid : '',
  }));
}

function compareUuid(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Sort stories by mode. Parses aired/rating once per story (not per comparison).
 * Missing/invalid values sort last when ordering descending.
 */
export function sortStories(
  stories: Story[],
  mode: StorySortMode = 'aired',
): Story[] {
  if (stories.length <= 1) return stories;

  const decorated = decorateForSort(stories);

  decorated.sort((a, b) => {
    if (mode === 'rating') {
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      return compareUuid(a.uuid, b.uuid);
    }

    if (mode === 'combined') {
      const airedDiff = b.airedTs - a.airedTs;
      if (airedDiff !== 0) return airedDiff;
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      return compareUuid(a.uuid, b.uuid);
    }

    // aired (default / home)
    const airedDiff = b.airedTs - a.airedTs;
    if (airedDiff !== 0) return airedDiff;
    return compareUuid(a.uuid, b.uuid);
  });

  return decorated.map((entry) => entry.story);
}

/** Home catalog: newest aired start date first. */
export function sortStoriesByAiredDate(stories: Story[]): Story[] {
  return sortStories(stories, 'aired');
}

function uniqueUuids(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const uuid = value.trim();
    if (!uuid || seen.has(uuid)) continue;
    seen.add(uuid);
    result.push(uuid);
  }
  return result;
}

/** Keyword matches title, Myanmar title, and character names only. */
function matchesKeyword(story: Story, keyword: string): boolean {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;

  if (story.title.toLowerCase().includes(q)) return true;
  if (story.mmTitle.toLowerCase().includes(q)) return true;

  return story.cast.some((member) =>
    member.characterName.toLowerCase().includes(q),
  );
}

/** Empty selection means all countries. */
function matchesCountry(story: Story, countries: SearchCountry[]): boolean {
  if (countries.length === 0) return true;
  return countries.includes(story.country as SearchCountry);
}

/** Story must include at least one selected cast UUID (OR). */
function matchesCastUuids(story: Story, castUuids: string[]): boolean {
  if (castUuids.length === 0) return true;
  const storyCasts = new Set(story.cast.map((member) => member.castUuid));
  return castUuids.some((uuid) => storyCasts.has(uuid));
}

/** Story must include at least one selected network UUID (OR). */
function matchesNetworkUuids(story: Story, networkUuids: string[]): boolean {
  if (networkUuids.length === 0) return true;
  const storyNetworks = new Set(story.orginalNetworks);
  return networkUuids.some((uuid) => storyNetworks.has(uuid));
}

function matchesRating(
  story: Story,
  ratingFrom: number,
  ratingTo: number,
): boolean {
  const value = parseRatingValue(story.rating);
  return value >= ratingFrom && value <= ratingTo;
}

function matchesEpisodes(
  story: Story,
  episodesMin: string,
  episodesMax: string,
): boolean {
  const minRaw = episodesMin.trim();
  const maxRaw = episodesMax.trim();

  if (minRaw !== '') {
    const min = Number(minRaw);
    if (!Number.isNaN(min) && story.episodes < min) return false;
  }

  if (maxRaw !== '') {
    const max = Number(maxRaw);
    if (!Number.isNaN(max) && story.episodes > max) return false;
  }

  return true;
}

function matchesAiredYear(
  story: Story,
  yearFrom: number,
  yearTo: number,
): boolean {
  if (yearFrom <= SEARCH_YEAR_MIN && yearTo >= SEARCH_YEAR_MAX) {
    return true;
  }

  const year = extractYear(story.aired);
  if (year === null) return false;
  return year >= yearFrom && year <= yearTo;
}

function matchesWatchedStatus(
  story: Story,
  watchedFilter: WatchedFilter,
  watchedSeries: ReadonlySet<string>,
): boolean {
  if (watchedFilter === 'all') return true;

  const uuid = typeof story.uuid === 'string' ? story.uuid.trim() : '';
  const isWatched = uuid !== '' && watchedSeries.has(uuid);

  if (watchedFilter === 'watched') return isWatched;
  if (watchedFilter === 'not_watched') return !isWatched;
  return true;
}

export function filterStories(
  stories: Story[],
  filters: SearchFilters,
  watchedSeries: ReadonlySet<string> = new Set(),
): Story[] {
  return stories.filter(
    (story) =>
      matchesKeyword(story, filters.keyword) &&
      matchesCountry(story, filters.countries) &&
      matchesCastUuids(story, filters.castUuids) &&
      matchesNetworkUuids(story, filters.networkUuids) &&
      matchesRating(story, filters.ratingFrom, filters.ratingTo) &&
      matchesEpisodes(story, filters.episodesMin, filters.episodesMax) &&
      matchesAiredYear(story, filters.yearFrom, filters.yearTo) &&
      matchesWatchedStatus(story, filters.watched, watchedSeries),
  );
}

/** Always filter first, then sort the filtered set. */
export function filterAndSortStories(
  stories: Story[],
  filters: SearchFilters,
  watchedSeries: ReadonlySet<string> = new Set(),
): Story[] {
  const filtered = filterStories(stories, filters, watchedSeries);
  return sortStories(filtered, resolveStorySortMode(filters));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const defaults = createDefaultFilters();
  const params = new URLSearchParams();

  const keyword = filters.keyword.trim();
  if (keyword) {
    params.set('q', keyword);
  }

  if (filters.countries.length > 0) {
    for (const country of filters.countries) {
      params.append('country', country);
    }
  }

  for (const uuid of uniqueUuids(filters.castUuids)) {
    params.append('cast', uuid);
  }

  for (const uuid of uniqueUuids(filters.networkUuids)) {
    params.append('network', uuid);
  }

  if (filters.ratingFrom !== defaults.ratingFrom) {
    params.set('ratingFrom', String(filters.ratingFrom));
  }
  if (filters.ratingTo !== defaults.ratingTo) {
    params.set('ratingTo', String(filters.ratingTo));
  }

  if (filters.episodesMin.trim() !== '') {
    params.set('episodesMin', filters.episodesMin.trim());
  }
  if (filters.episodesMax.trim() !== '') {
    params.set('episodesMax', filters.episodesMax.trim());
  }

  if (filters.yearFrom !== defaults.yearFrom) {
    params.set('yearFrom', String(filters.yearFrom));
  }
  if (filters.yearTo !== defaults.yearTo) {
    params.set('yearTo', String(filters.yearTo));
  }

  if (filters.watched !== defaults.watched) {
    params.set('watched', filters.watched);
  }

  return params;
}

export function searchParamsToFilters(
  params: URLSearchParams,
): SearchFilters {
  const defaults = createDefaultFilters();

  const keyword =
    params.get('q')?.trim() || params.get('keyword')?.trim() || '';

  const countryParams = params.getAll('country');
  let countries: SearchCountry[] = [];

  if (countryParams.length > 0) {
    const valid = countryParams.filter((c): c is SearchCountry =>
      (SEARCH_COUNTRIES as readonly string[]).includes(c),
    );
    if (valid.length > 0) {
      countries = [...new Set(valid)];
    }
  }

  const castUuids = uniqueUuids([
    ...params.getAll('cast'),
    ...params.getAll('casts'),
  ]);

  const networkUuids = uniqueUuids([
    ...params.getAll('network'),
    ...params.getAll('networks'),
  ]);

  const ratingFromRaw = params.get('ratingFrom');
  const ratingToRaw = params.get('ratingTo');
  let ratingFrom = defaults.ratingFrom;
  let ratingTo = defaults.ratingTo;

  if (ratingFromRaw !== null) {
    const parsed = parseFloat(ratingFromRaw);
    if (!Number.isNaN(parsed)) {
      ratingFrom = clamp(parsed, SEARCH_RATING_MIN, SEARCH_RATING_MAX);
    }
  }
  if (ratingToRaw !== null) {
    const parsed = parseFloat(ratingToRaw);
    if (!Number.isNaN(parsed)) {
      ratingTo = clamp(parsed, SEARCH_RATING_MIN, SEARCH_RATING_MAX);
    }
  }
  if (ratingFrom > ratingTo) {
    [ratingFrom, ratingTo] = [ratingTo, ratingFrom];
  }

  const episodesMin = params.get('episodesMin')?.trim() ?? '';
  const episodesMax = params.get('episodesMax')?.trim() ?? '';

  const yearFromRaw = params.get('yearFrom');
  const yearToRaw = params.get('yearTo');
  let yearFrom = defaults.yearFrom;
  let yearTo = defaults.yearTo;

  if (yearFromRaw !== null) {
    const parsed = parseInt(yearFromRaw, 10);
    if (!Number.isNaN(parsed)) {
      yearFrom = clamp(parsed, SEARCH_YEAR_MIN, SEARCH_YEAR_MAX);
    }
  }
  if (yearToRaw !== null) {
    const parsed = parseInt(yearToRaw, 10);
    if (!Number.isNaN(parsed)) {
      yearTo = clamp(parsed, SEARCH_YEAR_MIN, SEARCH_YEAR_MAX);
    }
  }
  if (yearFrom > yearTo) {
    [yearFrom, yearTo] = [yearTo, yearFrom];
  }

  const watchedRaw = params.get('watched')?.trim().toLowerCase() ?? '';
  const watched: WatchedFilter = (
    WATCHED_FILTER_OPTIONS as readonly string[]
  ).includes(watchedRaw)
    ? (watchedRaw as WatchedFilter)
    : defaults.watched;

  return {
    keyword,
    countries,
    castUuids,
    networkUuids,
    ratingFrom,
    ratingTo,
    episodesMin,
    episodesMax,
    yearFrom,
    yearTo,
    watched,
  };
}

export function buildAdvancedSearchPath(options: {
  castUuid?: string;
  networkUuid?: string;
}): string {
  const params = new URLSearchParams();
  if (options.castUuid?.trim()) {
    params.set('cast', options.castUuid.trim());
  }
  if (options.networkUuid?.trim()) {
    params.set('network', options.networkUuid.trim());
  }
  const query = params.toString();
  return query
    ? `${ROUTES.ADVANCED_SEARCH}?${query}`
    : ROUTES.ADVANCED_SEARCH;
}
