import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Story } from '@/types/story';
import { ROUTES } from '@/constants';
import { extractYear, getStoryPreview } from '@/utils/story';
import { getImageSrc, handleImageError } from '@/utils/image';
import { translateCountry } from '@/i18n/helpers';
import { useIsSeriesWatched, useWatchedActions } from '@/hooks/useWatched';
import type { DetailLocationState } from '@/hooks/useSmartBack';
import { RatingBadge } from './RatingBadge';
import { WatchedToggle } from './WatchedToggle';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const { t } = useTranslation(['common', 'a11y', 'filters']);
  const location = useLocation();
  const detailPath = `${ROUTES.DETAIL}/${story.uuid}`;
  const detailState: DetailLocationState = {
    from: `${location.pathname}${location.search}`,
  };
  const year = extractYear(story.aired);
  const preview = getStoryPreview(story.story);
  const watched = useIsSeriesWatched(story.uuid);
  const { toggleSeries } = useWatchedActions();
  const canToggle = Boolean(story.uuid?.trim());

  const watchedAriaLabel = watched
    ? t('a11y:markSeriesUnwatched', { title: story.title })
    : t('a11y:markSeriesWatched', { title: story.title });

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${
        watched
          ? 'border-emerald-500/25 hover:border-emerald-500/40'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="relative">
        <Link
          to={detailPath}
          state={detailState}
          className="relative block aspect-[2/3] overflow-hidden"
          aria-label={t('a11y:viewDetailsFor', { title: story.title })}
        >
          <img
            src={getImageSrc(story.coverPhoto)}
            alt={t('common:coverAlt', { title: story.title })}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              watched ? 'opacity-80' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
          {year && (
            <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {year}
            </span>
          )}
          {watched && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/90 px-2 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              {t('common:watched')}
            </span>
          )}
        </Link>

        {canToggle && (
          <div className="absolute left-3 top-3 z-10">
            <WatchedToggle
              watched={watched}
              onToggle={() => toggleSeries(story.uuid)}
              label={watchedAriaLabel}
              variant="overlay"
              size="sm"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div>
          <Link to={detailPath} state={detailState}>
            <h2 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent sm:text-xl">
              {story.title}
            </h2>
          </Link>
          <p className="mt-1 font-myanmar text-sm text-text-secondary">
            {story.mmTitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RatingBadge rating={story.rating} size="sm" />
          <span className="text-sm text-text-muted">
            {translateCountry(t, story.country)}
          </span>
          <span className="text-sm text-text-muted" aria-hidden="true">
            ·
          </span>
          <span className="text-sm text-text-muted">
            {story.episodes} {t('common:episodesShort')}
          </span>
          {year && (
            <>
              <span className="text-sm text-text-muted" aria-hidden="true">
                ·
              </span>
              <span className="text-sm text-text-muted">{year}</span>
            </>
          )}
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
          {preview}
        </p>

        <Link
          to={detailPath}
          state={detailState}
          className="mt-auto inline-flex items-center justify-center rounded-lg gradient-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
        >
          {t('common:viewDetails')}
        </Link>
      </div>
    </article>
  );
}
