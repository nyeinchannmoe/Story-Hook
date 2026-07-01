export interface CastMember {
  castName: string;
  characterName: string;
  role: string;
}

export interface Story {
  uuid: string;
  title: string;
  mmTitle: string;
  story: string;
  country: string;
  rating: string;
  watchLink: string;
  episodes: number;
  aired: string;
  cast: CastMember[];
  photos: string[];
  coverPhoto: string;
}
