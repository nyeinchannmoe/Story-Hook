import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  NAMESPACES,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  resolveBrowserLanguage,
  type SupportedLanguage,
} from './config';

void i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    ns: [...NAMESPACES],
    defaultNS: 'common',
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key: string) => key,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => {
        if (isSupportedLanguage(lng)) {
          return lng;
        }
        const resolved = resolveBrowserLanguage(lng);
        return resolved ?? DEFAULT_LANGUAGE;
      },
    },
    react: {
      useSuspense: true,
    },
  });

export function changeAppLanguage(language: SupportedLanguage): Promise<void> {
  if (!isSupportedLanguage(language)) {
    return Promise.resolve();
  }
  document.documentElement.lang = language;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  return i18n.changeLanguage(language).then(() => undefined);
}

export function getCurrentLanguage(): SupportedLanguage {
  const lng = (i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LANGUAGE).split(
    '-',
  )[0];
  return isSupportedLanguage(lng) ? lng : DEFAULT_LANGUAGE;
}

export { i18n };
export default i18n;
