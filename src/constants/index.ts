export const APP_NAME = 'Story Hook';

export const APP_DESCRIPTION =
  'Discover and explore the best Asian dramas with reviews, cast info, and more.';

export const ROUTES = {
  HOME: '/home',
  DETAIL: '/detail',
  ADVANCED_SEARCH: '/advanced-search',
  SETTINGS: '/settings',
  ABOUT: '/about',
} as const;

export const PLACEHOLDER_IMAGE = '/placeholder-drama.svg';

export const SKELETON_CARD_COUNT = 6;

export const SEARCH_COUNTRIES = [
  'South Korea',
  'China',
  'Japan',
  'Thailand',
  'Vietnam',
  'Indonesia',
  'Malaysia',
  'Philippines',
  'Singapore',
  'Hong Kong',
  'Taiwan',
  'Macau',
  'Myanmar',
] as const;

export type SearchCountry = (typeof SEARCH_COUNTRIES)[number];

export const SEARCH_RATING_MIN = 0;
export const SEARCH_RATING_MAX = 10;
export const SEARCH_YEAR_MIN = 1980;
export const SEARCH_YEAR_MAX = new Date().getFullYear();

/** Sentinel used when a cast UUID cannot be resolved; translate via common:unknownCast. */
export const UNKNOWN_CAST_SENTINEL = '__unknown_cast__';

export const WATCHED_FILTER_OPTIONS = [
  'all',
  'watched',
  'not_watched',
] as const;
