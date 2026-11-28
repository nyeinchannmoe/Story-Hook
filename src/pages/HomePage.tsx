import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  SEO,
  StoryGrid,
  LoadingSkeleton,
  EmptyState,
  Pagination,
} from '@/components';
import { useStories } from '@/hooks/useStories';
import { usePagination } from '@/hooks/usePagination';
import { translateErrorMessage } from '@/i18n/helpers';
import { buildWebsiteJsonLd } from '../../social-meta';

export default function HomePage() {
  const { t } = useTranslation(['home', 'common', 'seo', 'errors']);
  const { stories, loading, error, refetch } = useStories();
  const {
    pageItems,
    currentPage,
    totalPages,
    totalItems,
    rangeFrom,
    rangeTo,
    setPage,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
  } = usePagination(stories);
  const listTopRef = useRef<HTMLDivElement>(null);
  const hasMountedPageRef = useRef(false);

  useEffect(() => {
    if (!hasMountedPageRef.current) {
      hasMountedPageRef.current = true;
      return;
    }
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  return (
    <>
      <SEO
        title={t('seo:homeTitle')}
        description={t('seo:homeDescription')}
        url="/"
        canonical="/"
        jsonLd={buildWebsiteJsonLd()}
      />

      <PageContainer>
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {t('home:titlePrefix')}{' '}
            <span className="text-accent">{t('home:titleAccent')}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
            {t('home:subtitle')}
          </p>
        </header>

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <EmptyState
            title={t('home:failedTitle')}
            description={translateErrorMessage(t, error)}
            action={
              <button
                type="button"
                onClick={refetch}
                className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
              >
                {t('common:tryAgain')}
              </button>
            }
          />
        )}

        {!loading && !error && stories.length === 0 && (
          <EmptyState
            title={t('home:emptyTitle')}
            description={t('home:emptyDescription')}
          />
        )}

        {!loading && !error && stories.length > 0 && (
          <div ref={listTopRef}>
            <StoryGrid stories={pageItems} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeFrom={rangeFrom}
              rangeTo={rangeTo}
              onPageChange={setPage}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
          </div>
        )}
      </PageContainer>
    </>
  );
}
