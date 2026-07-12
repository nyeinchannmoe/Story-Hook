export type WatchedFilter = 'all' | 'watched' | 'not_watched';

export interface WatchedEpisodeRef {
  uuid: string;
  link: string;
}

export interface WatchedStorageData {
  version: number;
  series: string[];
  episodes: WatchedEpisodeRef[];
}

export interface WatchedState {
  series: ReadonlySet<string>;
  episodes: ReadonlySet<string>;
}
