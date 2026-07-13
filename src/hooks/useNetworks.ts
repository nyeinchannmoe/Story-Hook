import { useEffect, useMemo, useState } from 'react';
import type { OriginalNetwork } from '@/types/story';
import { createNetworkLookup } from '@/utils/lookup';
import networksData from '@/data/original_network.json';

interface UseNetworksResult {
  networks: OriginalNetwork[];
  networkByUuid: Map<string, OriginalNetwork>;
  loading: boolean;
  error: string | null;
}

interface NetworksCache {
  networks: OriginalNetwork[];
  error: string | null;
}

let networksCache: NetworksCache | null = null;

function readNetworks(): NetworksCache {
  try {
    const data = networksData as OriginalNetwork[];

    if (!Array.isArray(data)) {
      throw new Error('invalidNetworksFormat');
    }

    return { networks: data, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'failedLoadNetworks';
    return { networks: [], error: message };
  }
}

function ensureNetworksCache(): NetworksCache {
  if (!networksCache) {
    networksCache = readNetworks();
  }
  return networksCache;
}

export function useNetworks(): UseNetworksResult {
  const initial = ensureNetworksCache();
  const [networks, setNetworks] = useState<OriginalNetwork[]>(
    initial.networks,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initial.error);

  useEffect(() => {
    const cache = ensureNetworksCache();
    setNetworks(cache.networks);
    setError(cache.error);
    setLoading(false);
  }, []);

  const networkByUuid = useMemo(
    () => createNetworkLookup(networks),
    [networks],
  );

  return { networks, networkByUuid, loading, error };
}
