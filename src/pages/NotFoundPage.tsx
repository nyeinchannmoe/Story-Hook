import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer, SEO } from '@/components';
import { ROUTES } from '@/constants';

export default function NotFoundPage() {
  const { t } = useTranslation(['errors', 'seo', 'common']);
  const appName = t('common:appName');

  return (
    <>
      <SEO
        title={t('seo:notFoundTitle')}
        description={t('seo:notFoundDescription')}
      />

      <PageContainer>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-8xl font-bold text-accent" aria-hidden="true">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-text-primary sm:text-3xl">
            {t('errors:pageNotFoundTitle')}
          </h1>
          <p className="mt-3 max-w-md text-text-secondary">
            {t('errors:pageNotFoundBody')}
          </p>
          <Link
            to={ROUTES.HOME}
            className="mt-8 rounded-lg gradient-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
          >
            {t('errors:backToApp', { appName })}
          </Link>
        </div>
      </PageContainer>
    </>
  );
}
