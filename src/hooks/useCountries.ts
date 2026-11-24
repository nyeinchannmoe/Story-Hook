import { useEffect, useMemo, useState } from 'react';
import type { Country } from '@/types/story';
import { createCountryLookup } from '@/utils/lookup';
import countriesData from '@/data/countries.json';

interface UseCountriesResult {
  countries: Country[];
  countryByUuid: Map<string, Country>;
  loading: boolean;
  error: string | null;
}

interface CountriesCache {
  countries: Country[];
  error: string | null;
}

let countriesCache: CountriesCache | null = null;

function readCountries(): CountriesCache {
  try {
    const data = countriesData as Country[];

    if (!Array.isArray(data)) {
      throw new Error('invalidCountriesFormat');
    }

    return { countries: data, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'failedLoadCountries';
    return { countries: [], error: message };
  }
}

function ensureCountriesCache(): CountriesCache {
  if (!countriesCache) {
    countriesCache = readCountries();
  }
  return countriesCache;
}

export function useCountries(): UseCountriesResult {
  const initial = ensureCountriesCache();
  const [countries, setCountries] = useState<Country[]>(initial.countries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initial.error);

  useEffect(() => {
    const cache = ensureCountriesCache();
    setCountries(cache.countries);
    setError(cache.error);
    setLoading(false);
  }, []);

  const countryByUuid = useMemo(
    () => createCountryLookup(countries),
    [countries],
  );

  return { countries, countryByUuid, loading, error };
}
