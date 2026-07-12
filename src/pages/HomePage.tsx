import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  SEO,
  StoryGrid,
  LoadingSkeleton,
  EmptyState,
} from '@/components';
import { useStories } from '@/hooks/useStories';
import { translateErrorMessage } from '@/i18n/helpers';

export default function HomePage() {
  const { t } = useTranslation(['home', 'common', 'seo', 'errors']);
  const { stories, loading, error, refetch } = useStories();

  return (
    <>
      <SEO
        title={t('seo:homeTitle')}
        description={t('seo:homeDescription')}
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
          <StoryGrid stories={stories} />
        )}
      </PageContainer>
    </>
  );
}
