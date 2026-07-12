import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ResolvedCastMember } from '@/types/story';
import { ROUTES, UNKNOWN_CAST_SENTINEL } from '@/constants';
import { getImageSrc, handleImageError } from '@/utils/image';
import { translateRole } from '@/i18n/helpers';

interface CastCardProps {
  member: ResolvedCastMember;
}

const roleStyles: Record<string, string> = {
  'Main Role': 'bg-accent-muted text-accent',
  'Support Role': 'bg-white/5 text-text-secondary',
};

export function CastCard({ member }: CastCardProps) {
  const { t } = useTranslation(['common', 'a11y']);
  const roleClass = roleStyles[member.role] ?? 'bg-white/5 text-text-secondary';
  const hasPhoto = Boolean(member.photo?.trim());
  const displayName =
    member.castName === UNKNOWN_CAST_SENTINEL
      ? t('common:unknownCast')
      : member.castName;
  const searchTo = `${ROUTES.ADVANCED_SEARCH}?q=${encodeURIComponent(member.castName === UNKNOWN_CAST_SENTINEL ? displayName : member.castName)}`;

  return (
    <Link
      to={searchTo}
      className="block rounded-xl border border-white/5 bg-bg-card p-4 transition-colors hover:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-5"
      aria-label={t('a11y:searchFeaturing', { name: displayName })}
    >
      <article>
        {hasPhoto ? (
          <img
            src={getImageSrc(member.photo)}
            alt={displayName}
            className="mb-3 h-12 w-12 rounded-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-white/5 text-lg font-bold text-accent">
            {displayName.charAt(0)}
          </div>
        )}
        <h3 className="font-semibold text-text-primary">{displayName}</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {t('common:asCharacter', { character: member.characterName })}
        </p>
        <span
          className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleClass}`}
        >
          {translateRole(t, member.role)}
        </span>
      </article>
    </Link>
  );
}
