import { UNKNOWN_CAST_SENTINEL } from '@/constants';
import type {
  Cast,
  Country,
  Genre,
  OriginalNetwork,
  ResolvedCastMember,
  Story,
} from '@/types/story';

export function createCastLookup(casts: Cast[]): Map<string, Cast> {
  return new Map(casts.map((cast) => [cast.uuid, cast]));
}

export function createNetworkLookup(
  networks: OriginalNetwork[],
): Map<string, OriginalNetwork> {
  return new Map(networks.map((network) => [network.uuid, network]));
}

export function createGenreLookup(genres: Genre[]): Map<string, Genre> {
  return new Map(genres.map((genre) => [genre.uuid, genre]));
}

export function createCountryLookup(countries: Country[]): Map<string, Country> {
  return new Map(countries.map((country) => [country.uuid, country]));
}

export function resolveCastMember(
  member: Story['cast'][number],
  castByUuid: Map<string, Cast>,
): ResolvedCastMember {
  const cast = castByUuid.get(member.castUuid);
  return {
    castUuid: member.castUuid,
    castName: cast?.name ?? UNKNOWN_CAST_SENTINEL,
    characterName: member.characterName,
    role: member.role,
    photo: cast?.image,
  };
}

export function resolveStoryCast(
  story: Story,
  castByUuid: Map<string, Cast>,
): ResolvedCastMember[] {
  return story.cast.map((member) => resolveCastMember(member, castByUuid));
}

export function resolveStoryNetworks(
  story: Story,
  networkByUuid: Map<string, OriginalNetwork>,
): OriginalNetwork[] {
  return story.orginalNetworks
    .map((uuid) => networkByUuid.get(uuid))
    .filter((network): network is OriginalNetwork => Boolean(network));
}

export function resolveStoryGenres(
  story: Story,
  genreByUuid: Map<string, Genre>,
): Genre[] {
  const seen = new Set<string>();
  const resolved: Genre[] = [];

  for (const uuid of story.genres ?? []) {
    const trimmed = typeof uuid === 'string' ? uuid.trim() : '';
    if (!trimmed || seen.has(trimmed)) continue;
    const genre = genreByUuid.get(trimmed);
    if (!genre) continue;
    seen.add(trimmed);
    resolved.push(genre);
  }

  return resolved;
}

export function resolveStoryCountry(
  story: Story,
  countryByUuid: Map<string, Country>,
): Country | undefined {
  const uuid =
    typeof story.country_uuid === 'string' ? story.country_uuid.trim() : '';
  if (!uuid) return undefined;
  return countryByUuid.get(uuid);
}
