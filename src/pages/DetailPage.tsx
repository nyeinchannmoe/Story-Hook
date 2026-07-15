import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  SEO,
  RatingBadge,
  CastCard,
  PhotoGallery,
  DetailSkeleton,
  EmptyState,
  SearchIconLink,
  WatchedToggle,
} from '@/components';
import { ROUTES } from '@/constants';
import { useStory } from '@/hooks/useStories';
import { useCasts } from '@/hooks/useCasts';
import { useNetworks } from '@/hooks/useNetworks';
import { useSmartBack } from '@/hooks/useSmartBack';
import {
  useIsEpisodeWatched,
  useIsSeriesWatched,
  useWatchedActions,
} from '@/hooks/useWatched';
import {
  getLinkPlatform,
  getStoryPreview,
  isValidUrl,
  type LinkPlatform,
} from '@/utils/story';
import { getImageSrc, handleImageError } from '@/utils/image';
import {
  resolveStoryCast,
  resolveStoryNetworks,
} from '@/utils/lookup';
import { buildAdvancedSearchPath } from '@/utils/search';
import { translateCountry, translateErrorMessage } from '@/i18n/helpers';
import type { EpisodeLink } from '@/types/story';
import telegramLogo from '@/assets/telegram-logo.png';
import facebookLogo from '@/assets/facebook-logo.png';
import youtubeLogo from '@/assets/youtube-logo.png';

const PLATFORM_LOGOS: Record<
  LinkPlatform,
  { src: string; alt: string; className: string }
> = {
  telegram: {
    src: telegramLogo,
    alt: 'Telegram',
    className: 'rounded-full object-cover',
  },
  facebook: {
    src: facebookLogo,
    alt: 'Facebook',
    className: 'rounded-full object-cover',
  },
  youtube: {
    src: youtubeLogo,
    alt: 'YouTube',
    className: 'rounded-lg object-cover',
  },
};

interface EpisodeLinkItemProps {
  storyUuid: string;
  storyTitle: string;
  episode: EpisodeLink;
  index: number;
}

function EpisodeLinkItem({
  storyUuid,
  storyTitle,
  episode,
  index,
}: EpisodeLinkItemProps) {
  const { t } = useTranslation(['detail', 'a11y', 'common']);
  const hasLink = isValidUrl(episode.link);
  const canToggle = Boolean(episode.link?.trim());
  const watched = useIsEpisodeWatched(storyUuid, episode.link);
  const { toggleEpisode, markEpisode } = useWatchedActions();
  const episodeDescription = episode.description?.trim();
  const platform = getLinkPlatform(episode.link);
  const platformLogo = platform ? PLATFORM_LOGOS[platform] : null;

  const watchedAriaLabel = watched
    ? t('a11y:markEpisodeUnwatched', {
        title: episode.title || storyTitle,
        index: index + 1,
      })
    : t('a11y:markEpisodeWatched', {
        title: episode.title || storyTitle,
        index: index + 1,
      });

  const handleEpisodeLinkClick = () => {
    markEpisode(storyUuid, episode.link, true);
  };

  return (
    <li
      className={`rounded-2xl border p-5 transition-colors sm:p-6 ${
        watched
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-white/5 bg-bg-card'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {platformLogo ? (
          <img
            src={platformLogo.src}
            alt={platformLogo.alt}
            className={`mt-0.5 h-7 w-7 shrink-0 sm:h-8 sm:w-8 ${platformLogo.className}`}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {hasLink ? (
              <a
                href={episode.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleEpisodeLinkClick}
                className={`text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  watched
                    ? 'text-text-secondary line-through decoration-emerald-500/50 hover:text-text-primary'
                    : 'text-accent hover:text-accent/80'
                }`}
              >
                {episode.title}
              </a>
            ) : (
              <p
                className={`text-lg font-semibold ${
                  watched
                    ? 'text-text-secondary line-through decoration-emerald-500/50'
                    : 'text-text-primary'
                }`}
              >
                {episode.title}
              </p>
            )}
            {watched && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                {t('common:watched')}
              </span>
            )}
          </div>
          {episodeDescription ? (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
              {episodeDescription}
            </p>
          ) : null}
        </div>

        {canToggle && (
          <WatchedToggle
            watched={watched}
            onToggle={() => toggleEpisode(storyUuid, episode.link)}
            label={watchedAriaLabel}
            watchedLabel={t('common:watched')}
            unwatchedLabel={t('common:markWatched')}
            variant="icon"
            size="md"
            showLabel={false}
            className="shrink-0"
          />
        )}
      </div>
    </li>
  );
}

export default function DetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation([
    'detail',
    'common',
    'errors',
    'filters',
    'a11y',
  ]);
  const { story, loading, error } = useStory(uuid);
  const { castByUuid } = useCasts();
  const { networkByUuid } = useNetworks();
  const seriesWatched = useIsSeriesWatched(story?.uuid);
  const { toggleSeries } = useWatchedActions();
  const goBack = useSmartBack();

  if (loading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title={t('detail:failedTitle')}
          description={translateErrorMessage(t, error)}
          action={
            <Link
              to={ROUTES.HOME}
              className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white"
            >
              {t('common:backToHome')}
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (!story) {
    return (
      <PageContainer>
        <EmptyState
          title={t('detail:notFoundTitle')}
          description={t('detail:notFoundDescription')}
          action={
            <Link
              to={ROUTES.HOME}
              className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white"
            >
              {t('common:browseAllDramas')}
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const description = getStoryPreview(story.story, 160);
  const hasWatchLink = isValidUrl(story.watchLink);
  const resolvedCast = resolveStoryCast(story, castByUuid);
  const resolvedNetworks = resolveStoryNetworks(story, networkByUuid);
  const episodeLinks = story.episodeLinks ?? [];
  const canToggleSeries = Boolean(story.uuid?.trim());

  const seriesWatchedAriaLabel = seriesWatched
    ? t('a11y:markSeriesUnwatched', { title: story.title })
    : t('a11y:markSeriesWatched', { title: story.title });

  return (
    <>
      <SEO
        title={story.title}
        description={description}
        image={story.coverPhoto}
        type="article"
      />

      <section className="relative">
        <div className="relative h-[40vh] min-h-[280px] max-h-[500px] w-full overflow-hidden sm:h-[50vh]">
          <img
            src={getImageSrc(story.coverPhoto)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-transparent to-transparent" />
        </div>

        <PageContainer className="relative -mt-32 sm:-mt-40">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              aria-label={t('detail:goBack')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('detail:back')}
            </button>
            <SearchIconLink className="glass" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="relative shrink-0">
              <img
                src={getImageSrc(story.coverPhoto)}
                alt={t('common:coverAlt', { title: story.title })}
                className={`mx-auto w-48 rounded-2xl border shadow-2xl shadow-black/50 sm:w-56 lg:mx-0 lg:w-64 ${
                  seriesWatched ? 'border-emerald-500/40' : 'border-white/10'
                }`}
                onError={handleImageError}
              />
              {seriesWatched && (
                <span className="absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-md bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm lg:left-3 lg:translate-x-0">
                  {t('common:watched')}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-primary sm:text-4xl lg:text-5xl">
                {story.title}
              </h1>
              <p className="mt-2 font-myanmar text-lg text-text-secondary sm:text-xl">
                {story.mmTitle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingBadge rating={story.rating} size="lg" />
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-text-secondary">
                  {translateCountry(t, story.country)}
                </span>
                {story.type && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-text-secondary">
                    {story.type}
                  </span>
                )}
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-text-secondary">
                  {t('common:episodesCount', { count: story.episodes })}
                </span>
                {seriesWatched && (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                    {t('detail:alreadyWatched')}
                  </span>
                )}
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {t('detail:aired')}
                  </dt>
                  <dd className="mt-1 text-text-primary">{story.aired}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {t('detail:country')}
                  </dt>
                  <dd className="mt-1 text-text-primary">
                    {translateCountry(t, story.country)}
                  </dd>
                </div>
                {story.type && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      {t('detail:type')}
                    </dt>
                    <dd className="mt-1 text-text-primary">{story.type}</dd>
                  </div>
                )}
                {story.format && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      {t('detail:format')}
                    </dt>
                    <dd className="mt-1 text-text-primary">{story.format}</dd>
                  </div>
                )}
                {story.duration && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      {t('detail:duration')}
                    </dt>
                    <dd className="mt-1 text-text-primary">{story.duration}</dd>
                  </div>
                )}
                {resolvedNetworks.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      {t('detail:originalNetworks')}
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {resolvedNetworks.map((network) => (
                        <Link
                          key={network.uuid}
                          to={buildAdvancedSearchPath({
                            networkUuid: network.uuid,
                          })}
                          className="text-accent transition-colors hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          {network.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {hasWatchLink && (
                  <a
                    href={story.watchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg gradient-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('detail:watchNow')}
                  </a>
                )}
                {canToggleSeries && (
                  <WatchedToggle
                    watched={seriesWatched}
                    onToggle={() => toggleSeries(story.uuid)}
                    label={seriesWatchedAriaLabel}
                    watchedLabel={t('detail:alreadyWatched')}
                    unwatchedLabel={t('detail:markAsWatched')}
                    variant="button"
                  />
                )}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-8">
        <section aria-labelledby="story-heading">
          <h2
            id="story-heading"
            className="mb-4 text-2xl font-bold text-text-primary"
          >
            {t('detail:story')}
          </h2>
          <div className="rounded-2xl border border-white/5 bg-bg-card p-6 sm:p-8">
            <p className="whitespace-pre-line font-myanmar text-base leading-relaxed text-text-secondary sm:text-lg">
              {story.story}
            </p>
          </div>
        </section>

        {episodeLinks.length > 0 && (
          <section className="mt-12" aria-labelledby="episode-links-heading">
            <h2
              id="episode-links-heading"
              className="mb-6 text-2xl font-bold text-text-primary"
            >
              {t('detail:episodeLinks')}
            </h2>
            <ul className="space-y-4">
              {episodeLinks.map((episode, index) => (
                <EpisodeLinkItem
                  key={`${episode.link || episode.title}-${index}`}
                  storyUuid={story.uuid}
                  storyTitle={story.title}
                  episode={episode}
                  index={index}
                />
              ))}
            </ul>
          </section>
        )}

        {resolvedCast.length > 0 && (
          <section className="mt-12" aria-labelledby="cast-heading">
            <h2
              id="cast-heading"
              className="mb-6 text-2xl font-bold text-text-primary"
            >
              {t('detail:cast')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resolvedCast.map((member) => (
                <CastCard
                  key={`${member.castUuid}-${member.characterName}`}
                  member={member}
                />
              ))}
            </div>
          </section>
        )}

        {story.photos.length > 0 && (
          <section className="mt-12" aria-labelledby="photos-heading">
            <h2
              id="photos-heading"
              className="mb-6 text-2xl font-bold text-text-primary"
            >
              {t('detail:photos')}
            </h2>
            <PhotoGallery photos={story.photos} title={story.title} />
          </section>
        )}
      </PageContainer>
    </>
  );
}
