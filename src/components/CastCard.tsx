import type { CastMember } from '@/types/story';
import { getImageSrc, handleImageError } from '@/utils/image';

interface CastCardProps {
  member: CastMember;
}

const roleStyles: Record<string, string> = {
  'Main Role': 'bg-accent-muted text-accent',
  'Support Role': 'bg-white/5 text-text-secondary',
};

export function CastCard({ member }: CastCardProps) {
  const roleClass = roleStyles[member.role] ?? 'bg-white/5 text-text-secondary';
  const hasPhoto = Boolean(member.photo?.trim());

  return (
    <article className="rounded-xl border border-white/5 bg-bg-card p-4 transition-colors hover:border-white/10 sm:p-5">
      {hasPhoto ? (
        <img
          src={getImageSrc(member.photo)}
          alt={member.castName}
          className="mb-3 h-12 w-12 rounded-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-white/5 text-lg font-bold text-accent">
          {member.castName.charAt(0)}
        </div>
      )}
      <h3 className="font-semibold text-text-primary">{member.castName}</h3>
      <p className="mt-1 text-sm text-text-secondary">
        as <span className="text-text-primary">{member.characterName}</span>
      </p>
      <span
        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleClass}`}
      >
        {member.role}
      </span>
    </article>
  );
}
