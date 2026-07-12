import { useTranslation } from 'react-i18next';
import { PageContainer, SEO } from '@/components';

export default function AboutPage() {
  const { t } = useTranslation(['about', 'seo']);

  const features = [
    t('about:featureBrowse'),
    t('about:featureSearch'),
    t('about:featureDetail'),
    t('about:featureI18n'),
  ];

  return (
    <>
      <SEO
        title={t('seo:aboutTitle')}
        description={t('seo:aboutDescription')}
      />

      <PageContainer>
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {t('about:title')}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
            {t('about:subtitle')}
          </p>
        </header>

        <section className="rounded-2xl border border-white/5 bg-bg-card p-5 sm:p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-text-primary">
            {t('about:heading')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            {t('about:body')}
          </p>

          <h3 className="mt-8 text-lg font-semibold text-text-primary">
            {t('about:featuresHeading')}
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-text-secondary">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      </PageContainer>
    </>
  );
}
