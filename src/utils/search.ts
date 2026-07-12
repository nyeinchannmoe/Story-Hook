import {
  SEARCH_COUNTRIES,
  SEARCH_RATING_MAX,
  SEARCH_RATING_MIN,
  SEARCH_YEAR_MAX,
  SEARCH_YEAR_MIN,
  WATCHED_FILTER_OPTIONS,
  type SearchCountry,
} from '@/constants';
import type { SearchFilters } from '@/types/search';
import type { WatchedFilter } from '@/types/watched';
import type { Cast, OriginalNetwork, Story } from '@/types/story';
import { extractYear } from '@/utils/story';

export function createDefaultFilters(): SearchFilters {
  return {
    keyword: '',
    countries: [...SEARCH_COUNTRIES],
    ratingFrom: SEARCH_RATING_MIN,
    ratingTo: SEARCH_RATING_MAX,
    episodesMin: '',
    episodesMax: '',
    yearFrom: SEARCH_YEAR_MIN,
    yearTo: SEARCH_YEAR_MAX,
    watched: 'all',
  };
}

export function parseRatingValue(rating: string): number {
  const match = rating.trim().match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function matchesKeyword(
  story: Story,
  keyword: string,
  castByUuid: Map<string, Cast>,
  networkByUuid: Map<string, OriginalNetwork>,
): boolean {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;

  if (story.title.toLowerCase().includes(q)) return true;
  if (story.mmTitle.toLowerCase().includes(q)) return true;

  const matchesNetwork = story.orginalNetworks.some((uuid) => {
    const networkName = networkByUuid.get(uuid)?.name ?? '';
    return networkName.toLowerCase().includes(q);
  });
  if (matchesNetwork) return true;

  return story.cast.some((member) => {
    const castName = castByUuid.get(member.castUuid)?.name ?? '';
    return (
      castName.toLowerCase().includes(q) ||
      member.characterName.toLowerCase().includes(q)
    );
  });
}

function matchesCountry(story: Story, countries: SearchCountry[]): boolean {
  if (countries.length === 0) return false;
  if (countries.length === SEARCH_COUNTRIES.length) return true;
  return countries.includes(story.country as SearchCountry);
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
  castByUuid: Map<string, Cast> = new Map(),
  networkByUuid: Map<string, OriginalNetwork> = new Map(),
  watchedSeries: ReadonlySet<string> = new Set(),
): Story[] {
  return stories.filter(
    (story) =>
      matchesKeyword(story, filters.keyword, castByUuid, networkByUuid) &&
      matchesCountry(story, filters.countries) &&
      matchesRating(story, filters.ratingFrom, filters.ratingTo) &&
      matchesEpisodes(story, filters.episodesMin, filters.episodesMax) &&
      matchesAiredYear(story, filters.yearFrom, filters.yearTo) &&
      matchesWatchedStatus(story, filters.watched, watchedSeries),
  );
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

  const allSelected =
    filters.countries.length === SEARCH_COUNTRIES.length &&
    SEARCH_COUNTRIES.every((c) => filters.countries.includes(c));

  if (!allSelected && filters.countries.length > 0) {
    for (const country of filters.countries) {
      params.append('country', country);
    }
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
  let countries: SearchCountry[] = [...defaults.countries];

  if (countryParams.length > 0) {
    const valid = countryParams.filter((c): c is SearchCountry =>
      (SEARCH_COUNTRIES as readonly string[]).includes(c),
    );
    if (valid.length > 0) {
      countries = [...new Set(valid)];
    }
  }

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
    ratingFrom,
    ratingTo,
    episodesMin,
    episodesMax,
    yearFrom,
    yearTo,
    watched,
  };
}
