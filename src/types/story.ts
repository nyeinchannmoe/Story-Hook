export interface EpisodeLink {
  title: string;
  description: string;
  link: string;
}

export interface CastMember {
  castUuid: string;
  characterName: string;
  role: string;
}

export interface Cast {
  uuid: string;
  name: string;
  image?: string;
}

export interface OriginalNetwork {
  uuid: string;
  name: string;
}

export interface ResolvedCastMember {
  castUuid: string;
  castName: string;
  characterName: string;
  role: string;
  photo?: string;
}

export interface Story {
  uuid: string;
  title: string;
  mmTitle: string;
  story: string;
  country: string;
  rating: string;
  type: string;
  format: string;
  watchLink: string;
  episodes: number;
  episodeLinks: EpisodeLink[];
  aired: string;
  duration: string;
  orginalNetworks: string[];
  cast: CastMember[];
  photos: string[];
  coverPhoto: string;
}
