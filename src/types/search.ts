import type { SearchCountry } from '@/constants';
import type { WatchedFilter } from '@/types/watched';

export type { WatchedFilter };

export interface SearchFilters {
  keyword: string;
  countries: SearchCountry[];
  ratingFrom: number;
  ratingTo: number;
  episodesMin: string;
  episodesMax: string;
  yearFrom: number;
  yearTo: number;
  watched: WatchedFilter;
}
