import { Link, useParams } from 'react-router-dom';
import {
  PageContainer,
  SEO,
  RatingBadge,
  CastCard,
  PhotoGallery,
  DetailSkeleton,
  EmptyState,
  SearchIconLink,
} from '@/components';
import { ROUTES } from '@/constants';
import { useStory } from '@/hooks/useStories';
import { getStoryPreview, isValidUrl } from '@/utils/story';
import { getImageSrc, handleImageError } from '@/utils/image';

export default function DetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { story, loading, error } = useStory(uuid);

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
          title="Failed to Load Drama"
          description={error}
          action={
            <Link
              to={ROUTES.HOME}
              className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white"
            >
              Back to Home
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
          title="Drama Not Found"
          description="The drama you're looking for doesn't exist or may have been removed."
          action={
            <Link
              to={ROUTES.HOME}
              className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white"
            >
              Browse All Dramas
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const description = getStoryPreview(story.story, 160);
  const hasWatchLink = isValidUrl(story.watchLink);

  return (
    <>
      <SEO
        title={story.title}
        description={description}
        image={story.coverPhoto}
        type="article"
      />

      {/* Hero Section */}
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
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              aria-label="Go back to home"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <SearchIconLink className="glass" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="shrink-0">
              <img
                src={getImageSrc(story.coverPhoto)}
                alt={`${story.title} cover`}
                className="mx-auto w-48 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 sm:w-56 lg:mx-0 lg:w-64"
                onError={handleImageError}
              />
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
                  {story.country}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-text-secondary">
                  {story.episodes} Episodes
                </span>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Aired
                  </dt>
                  <dd className="mt-1 text-text-primary">{story.aired}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Country
                  </dt>
                  <dd className="mt-1 text-text-primary">{story.country}</dd>
                </div>
              </dl>

              {hasWatchLink && (
                <a
                  href={story.watchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg gradient-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Now
                </a>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Story Section */}
      <PageContainer className="py-8">
        <section aria-labelledby="story-heading">
          <h2
            id="story-heading"
            className="mb-4 text-2xl font-bold text-text-primary"
          >
            Story
          </h2>
          <div className="rounded-2xl border border-white/5 bg-bg-card p-6 sm:p-8">
            <p className="whitespace-pre-line font-myanmar text-base leading-relaxed text-text-secondary sm:text-lg">
              {story.story}
            </p>
          </div>
        </section>

        {/* Cast Section */}
        {story.cast.length > 0 && (
          <section className="mt-12" aria-labelledby="cast-heading">
            <h2
              id="cast-heading"
              className="mb-6 text-2xl font-bold text-text-primary"
            >
              Cast
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {story.cast.map((member) => (
                <CastCard
                  key={`${member.castName}-${member.characterName}`}
                  member={member}
                />
              ))}
            </div>
          </section>
        )}

        {/* Photos Section */}
        {story.photos.length > 0 && (
          <section className="mt-12" aria-labelledby="photos-heading">
            <h2
              id="photos-heading"
              className="mb-6 text-2xl font-bold text-text-primary"
            >
              Photos
            </h2>
            <PhotoGallery photos={story.photos} title={story.title} />
          </section>
        )}
      </PageContainer>
    </>
  );
}
