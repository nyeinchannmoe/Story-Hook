import { useTranslation } from 'react-i18next';
import { PageContainer, SEO } from '@/components';
import {
  LANGUAGE_META,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/i18n/config';
import { changeAppLanguage, getCurrentLanguage } from '@/i18n';

export default function SettingsPage() {
  const { t, i18n } = useTranslation(['settings', 'seo', 'common']);
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (language: SupportedLanguage) => {
    void changeAppLanguage(language);
  };

  return (
    <>
      <SEO
        title={t('seo:settingsTitle')}
        description={t('seo:settingsDescription')}
      />

      <PageContainer>
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {t('settings:title')}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
            {t('settings:subtitle')}
          </p>
        </header>

        <section
          className="rounded-2xl border border-white/5 bg-bg-card p-5 sm:p-6 lg:p-8"
          aria-labelledby="language-heading"
        >
          <h2
            id="language-heading"
            className="text-xl font-semibold text-text-primary"
          >
            {t('settings:languageHeading')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {t('settings:languageDescription')}
          </p>

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-medium text-text-primary">
              {t('settings:languageLabel')}
            </legend>
            <div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              role="radiogroup"
              aria-label={t('settings:languageLabel')}
            >
              {SUPPORTED_LANGUAGES.map((code) => {
                const meta = LANGUAGE_META[code];
                const selected = currentLanguage === code;
                return (
                  <label
                    key={code}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      selected
                        ? 'border-accent/40 bg-accent-muted text-text-primary'
                        : 'border-white/10 bg-bg-secondary text-text-secondary hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={code}
                      checked={selected}
                      onChange={() => handleLanguageChange(code)}
                      className="h-4 w-4 border-white/20 bg-bg-primary text-accent focus:ring-accent focus:ring-offset-0"
                    />
                    <span className="flex flex-col">
                      <span className="font-medium text-text-primary">
                        {meta.nativeName}
                      </span>
                      <span className="text-xs text-text-muted">
                        {meta.englishName}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-4 text-xs text-text-muted" aria-live="polite">
            {t('settings:currentLanguage', {
              language: LANGUAGE_META[currentLanguage].nativeName,
            })}
            {' · '}
            {t('settings:languageHint')}
          </p>
          {/* Re-read i18n.language so the live region updates on change */}
          <span className="sr-only">{i18n.language}</span>
        </section>
      </PageContainer>
    </>
  );
}
