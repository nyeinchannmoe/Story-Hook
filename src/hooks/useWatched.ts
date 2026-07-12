import { useCallback, useSyncExternalStore } from 'react';
import {
  getWatchedSeriesSet,
  getWatchedState,
  getWatchedVersion,
  isEpisodeWatched as checkEpisodeWatched,
  isSeriesWatched as checkSeriesWatched,
  setEpisodeWatched,
  setSeriesWatched,
  subscribeWatchedStore,
  toggleEpisodeWatched,
  toggleSeriesWatched,
} from '@/utils/watchedStore';

function subscribe(listener: () => void): () => void {
  return subscribeWatchedStore(listener);
}

/** Subscribes only to series watched status for a single UUID (minimal re-renders). */
export function useIsSeriesWatched(uuid: string | null | undefined): boolean {
  const normalized =
    typeof uuid === 'string' && uuid.trim() ? uuid.trim() : '';

  return useSyncExternalStore(
    subscribe,
    () => (normalized ? checkSeriesWatched(normalized) : false),
    () => false,
  );
}

/** Subscribes only to episode watched status for a single story UUID + link. */
export function useIsEpisodeWatched(
  uuid: string | null | undefined,
  link: string | null | undefined,
): boolean {
  const normalizedUuid =
    typeof uuid === 'string' && uuid.trim() ? uuid.trim() : '';
  const normalizedLink =
    typeof link === 'string' && link.trim() ? link.trim() : '';

  return useSyncExternalStore(
    subscribe,
    () =>
      normalizedUuid && normalizedLink
        ? checkEpisodeWatched(normalizedUuid, normalizedLink)
        : false,
    () => false,
  );
}

/** Version counter — use when filtering lists that depend on watched series. */
export function useWatchedVersion(): number {
  return useSyncExternalStore(
    subscribe,
    getWatchedVersion,
    () => 0,
  );
}

export function useWatchedSeriesSet(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => getWatchedSeriesSet(),
    () => getWatchedState().series,
  );
}

export function useWatchedActions() {
  const toggleSeries = useCallback((uuid: string | null | undefined) => {
    return toggleSeriesWatched(uuid);
  }, []);

  const markSeries = useCallback(
    (uuid: string | null | undefined, watched: boolean) => {
      return setSeriesWatched(uuid, watched);
    },
    [],
  );

  const toggleEpisode = useCallback(
    (uuid: string | null | undefined, link: string | null | undefined) => {
      return toggleEpisodeWatched(uuid, link);
    },
    [],
  );

  const markEpisode = useCallback(
    (
      uuid: string | null | undefined,
      link: string | null | undefined,
      watched: boolean,
    ) => {
      return setEpisodeWatched(uuid, link, watched);
    },
    [],
  );

  return {
    toggleSeries,
    markSeries,
    toggleEpisode,
    markEpisode,
  };
}
