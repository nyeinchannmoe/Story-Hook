import {
  PageContainer,
  SEO,
  StoryGrid,
  LoadingSkeleton,
  EmptyState,
} from '@/components';
import { APP_DESCRIPTION, APP_NAME } from '@/constants';
import { useStories } from '@/hooks/useStories';

export default function HomePage() {
  const { stories, loading, error, refetch } = useStories();

  return (
    <>
      <SEO
        title={APP_NAME}
        description={APP_DESCRIPTION}
      />

      <PageContainer>
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Discover <span className="text-accent">Dramas</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
            Explore curated Asian drama reviews with cast details, ratings, and
            full story synopses.
          </p>
        </header>

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <EmptyState
            title="Failed to Load Dramas"
            description={error}
            action={
              <button
                type="button"
                onClick={refetch}
                className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
              >
                Try Again
              </button>
            }
          />
        )}

        {!loading && !error && stories.length === 0 && (
          <EmptyState
            title="No Dramas Found"
            description="There are no dramas available at the moment. Check back later for new additions."
          />
        )}

        {!loading && !error && stories.length > 0 && (
          <StoryGrid stories={stories} />
        )}
      </PageContainer>
    </>
  );
}
