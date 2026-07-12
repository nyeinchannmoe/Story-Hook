import {
  makeEpisodeKey,
  readWatchedStorage,
  writeWatchedStorage,
} from '@/utils/watchedStorage';
import type { WatchedState } from '@/types/watched';

type Listener = () => void;

let state: WatchedState = readWatchedStorage();
let version = 0;
const listeners = new Set<Listener>();
let storageListenerAttached = false;

function emitChange(): void {
  version += 1;
  for (const listener of listeners) {
    listener();
  }
}

function ensureStorageListener(): void {
  if (storageListenerAttached || typeof window === 'undefined') return;
  storageListenerAttached = true;

  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== null && event.key !== 'story-hook-watched') return;
    state = readWatchedStorage();
    emitChange();
  });
}

export function subscribeWatchedStore(listener: Listener): () => void {
  ensureStorageListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getWatchedState(): WatchedState {
  return state;
}

export function getWatchedVersion(): number {
  return version;
}

export function isSeriesWatched(uuid: string | null | undefined): boolean {
  if (typeof uuid !== 'string') return false;
  const normalized = uuid.trim();
  if (!normalized) return false;
  return state.series.has(normalized);
}

export function isEpisodeWatched(
  uuid: string | null | undefined,
  link: string | null | undefined,
): boolean {
  if (typeof uuid !== 'string' || typeof link !== 'string') return false;
  const normalizedUuid = uuid.trim();
  const normalizedLink = link.trim();
  if (!normalizedUuid || !normalizedLink) return false;
  return state.episodes.has(makeEpisodeKey(normalizedUuid, normalizedLink));
}

export function getWatchedSeriesSet(): ReadonlySet<string> {
  return state.series;
}

export function setSeriesWatched(
  uuid: string | null | undefined,
  watched: boolean,
): boolean {
  if (typeof uuid !== 'string') return false;
  const normalized = uuid.trim();
  if (!normalized) return false;

  const currentlyWatched = state.series.has(normalized);
  if (currentlyWatched === watched) return currentlyWatched;

  const nextSeries = new Set(state.series);
  if (watched) {
    nextSeries.add(normalized);
  } else {
    nextSeries.delete(normalized);
  }

  state = {
    series: nextSeries,
    episodes: state.episodes,
  };
  writeWatchedStorage(state);
  emitChange();
  return watched;
}

export function toggleSeriesWatched(
  uuid: string | null | undefined,
): boolean {
  return setSeriesWatched(uuid, !isSeriesWatched(uuid));
}

export function setEpisodeWatched(
  uuid: string | null | undefined,
  link: string | null | undefined,
  watched: boolean,
): boolean {
  if (typeof uuid !== 'string' || typeof link !== 'string') return false;
  const normalizedUuid = uuid.trim();
  const normalizedLink = link.trim();
  if (!normalizedUuid || !normalizedLink) return false;

  const key = makeEpisodeKey(normalizedUuid, normalizedLink);
  const currentlyWatched = state.episodes.has(key);
  if (currentlyWatched === watched) return currentlyWatched;

  const nextEpisodes = new Set(state.episodes);
  if (watched) {
    nextEpisodes.add(key);
  } else {
    nextEpisodes.delete(key);
  }

  state = {
    series: state.series,
    episodes: nextEpisodes,
  };
  writeWatchedStorage(state);
  emitChange();
  return watched;
}

export function toggleEpisodeWatched(
  uuid: string | null | undefined,
  link: string | null | undefined,
): boolean {
  return setEpisodeWatched(uuid, link, !isEpisodeWatched(uuid, link));
}

/** Re-hydrate from localStorage (e.g. after external mutation). */
export function reloadWatchedStore(): void {
  state = readWatchedStorage();
  emitChange();
}
