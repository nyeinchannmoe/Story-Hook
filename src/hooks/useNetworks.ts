import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OriginalNetwork } from '@/types/story';
import { createNetworkLookup } from '@/utils/lookup';
import networksData from '@/data/original_network.json';

interface UseNetworksResult {
  networks: OriginalNetwork[];
  networkByUuid: Map<string, OriginalNetwork>;
  loading: boolean;
  error: string | null;
}

export function useNetworks(): UseNetworksResult {
  const [networks, setNetworks] = useState<OriginalNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNetworks = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const data = networksData as OriginalNetwork[];

      if (!Array.isArray(data)) {
        throw new Error('invalidNetworksFormat');
      }

      setNetworks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'failedLoadNetworks';
      setError(message);
      setNetworks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNetworks();
  }, [loadNetworks]);

  const networkByUuid = useMemo(
    () => createNetworkLookup(networks),
    [networks],
  );

  return { networks, networkByUuid, loading, error };
}
