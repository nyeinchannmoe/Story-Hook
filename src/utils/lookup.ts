import { UNKNOWN_CAST_SENTINEL } from '@/constants';
import type { Cast, OriginalNetwork, ResolvedCastMember, Story } from '@/types/story';

export function createCastLookup(casts: Cast[]): Map<string, Cast> {
  return new Map(casts.map((cast) => [cast.uuid, cast]));
}

export function createNetworkLookup(
  networks: OriginalNetwork[],
): Map<string, OriginalNetwork> {
  return new Map(networks.map((network) => [network.uuid, network]));
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
