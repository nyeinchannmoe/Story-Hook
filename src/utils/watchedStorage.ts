import type {
  WatchedEpisodeRef,
  WatchedState,
  WatchedStorageData,
} from '@/types/watched';

export const WATCHED_STORAGE_KEY = 'story-hook-watched';
export const WATCHED_STORAGE_VERSION = 1;

const EPISODE_KEY_SEPARATOR = '\u0000';

export function makeEpisodeKey(uuid: string, link: string): string {
  return `${uuid}${EPISODE_KEY_SEPARATOR}${link}`;
}

export function parseEpisodeKey(
  key: string,
): WatchedEpisodeRef | null {
  const separatorIndex = key.indexOf(EPISODE_KEY_SEPARATOR);
  if (separatorIndex <= 0) return null;
  const uuid = key.slice(0, separatorIndex);
  const link = key.slice(separatorIndex + EPISODE_KEY_SEPARATOR.length);
  if (!uuid || !link) return null;
  return { uuid, link };
}

function normalizeUuid(uuid: unknown): string | null {
  if (typeof uuid !== 'string') return null;
  const trimmed = uuid.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLink(link: unknown): string | null {
  if (typeof link !== 'string') return null;
  const trimmed = link.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createEmptyState(): WatchedState {
  return {
    series: new Set(),
    episodes: new Set(),
  };
}

function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const probe = '__story_hook_watched_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function coerceSeriesList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    const uuid = normalizeUuid(item);
    if (!uuid || seen.has(uuid)) continue;
    seen.add(uuid);
    result.push(uuid);
  }

  return result;
}

function coerceEpisodeList(value: unknown): WatchedEpisodeRef[] {
  if (!Array.isArray(value)) return [];

  const result: WatchedEpisodeRef[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const uuid = normalizeUuid(record.uuid);
    const link = normalizeLink(record.link);
    if (!uuid || !link) continue;

    const key = makeEpisodeKey(uuid, link);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ uuid, link });
  }

  return result;
}

/** Migrate legacy shapes: string[], or { series?, episodes?, watched? }. */
function migrateRawData(raw: unknown): WatchedStorageData {
  if (Array.isArray(raw)) {
    return {
      version: WATCHED_STORAGE_VERSION,
      series: coerceSeriesList(raw),
      episodes: [],
    };
  }

  if (!raw || typeof raw !== 'object') {
    return {
      version: WATCHED_STORAGE_VERSION,
      series: [],
      episodes: [],
    };
  }

  const record = raw as Record<string, unknown>;
  const seriesSource =
    record.series ?? record.watched ?? record.storyUuids ?? record.uuids;
  const episodesSource = record.episodes ?? record.episodeLinks;

  return {
    version: WATCHED_STORAGE_VERSION,
    series: coerceSeriesList(seriesSource),
    episodes: coerceEpisodeList(episodesSource),
  };
}

function stateFromData(data: WatchedStorageData): WatchedState {
  const series = new Set(data.series);
  const episodes = new Set(
    data.episodes.map((episode) => makeEpisodeKey(episode.uuid, episode.link)),
  );
  return { series, episodes };
}

function dataFromState(state: WatchedState): WatchedStorageData {
  const episodes: WatchedEpisodeRef[] = [];

  for (const key of state.episodes) {
    const parsed = parseEpisodeKey(key);
    if (parsed) episodes.push(parsed);
  }

  return {
    version: WATCHED_STORAGE_VERSION,
    series: [...state.series],
    episodes,
  };
}

export function readWatchedStorage(): WatchedState {
  if (!isStorageAvailable()) {
    return createEmptyState();
  }

  try {
    const raw = window.localStorage.getItem(WATCHED_STORAGE_KEY);
    if (raw == null || raw.trim() === '') {
      return createEmptyState();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return createEmptyState();
    }

    return stateFromData(migrateRawData(parsed));
  } catch {
    return createEmptyState();
  }
}

export function writeWatchedStorage(state: WatchedState): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const payload = JSON.stringify(dataFromState(state));
    window.localStorage.setItem(WATCHED_STORAGE_KEY, payload);
    return true;
  } catch {
    return false;
  }
}

export function cloneWatchedState(state: WatchedState): WatchedState {
  return {
    series: new Set(state.series),
    episodes: new Set(state.episodes),
  };
}
