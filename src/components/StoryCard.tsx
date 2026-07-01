import { Link } from 'react-router-dom';
import type { Story } from '@/types/story';
import { ROUTES } from '@/constants';
import { extractYear, getStoryPreview } from '@/utils/story';
import { getImageSrc, handleImageError } from '@/utils/image';
import { RatingBadge } from './RatingBadge';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const detailPath = `${ROUTES.DETAIL}/${story.uuid}`;
  const year = extractYear(story.aired);
  const preview = getStoryPreview(story.story);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/5 bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl hover:shadow-black/40">
      <Link
        to={detailPath}
        className="relative block aspect-[2/3] overflow-hidden"
        aria-label={`View details for ${story.title}`}
      >
        <img
          src={getImageSrc(story.coverPhoto)}
          alt={`${story.title} cover`}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        {year && (
          <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {year}
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div>
          <Link to={detailPath}>
            <h2 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent sm:text-xl">
              {story.title}
            </h2>
          </Link>
          <p className="mt-1 font-myanmar text-sm text-text-secondary">
            {story.mmTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RatingBadge rating={story.rating} size="sm" />
          {year && (
            <span className="text-sm text-text-muted">{year}</span>
          )}
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
          {preview}
        </p>

        <Link
          to={detailPath}
          className="mt-auto inline-flex items-center justify-center rounded-lg gradient-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
