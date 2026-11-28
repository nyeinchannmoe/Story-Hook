import type { WatchedFilter } from '@/types/watched';

export type { WatchedFilter };

export interface SearchFilters {
  keyword: string;
  countryUuids: string[];
  castUuids: string[];
  networkUuids: string[];
  genreUuids: string[];
  ratingFrom: number;
  ratingTo: number;
  episodesMin: string;
  episodesMax: string;
  yearFrom: number;
  yearTo: number;
  watched: WatchedFilter;
}

/** How filtered (or home) story lists are ordered. */
export type StorySortMode = 'aired' | 'rating' | 'combined';

export interface SuggestOption {
  uuid: string;
  name: string;
  /** Optional profile image (cast); absent → letter avatar when showAvatar. */
  image?: string;
}
