import type { SearchCountry } from '@/constants';

export interface SearchFilters {
  keyword: string;
  countries: SearchCountry[];
  ratingFrom: number;
  ratingTo: number;
  episodesMin: string;
  episodesMax: string;
  yearFrom: number;
  yearTo: number;
}
