export const SUPPORTED_LANGUAGES = ['en', 'zh', 'th', 'ko', 'my'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const LANGUAGE_STORAGE_KEY = 'story-hook-language';

export const NAMESPACES = [
  'common',
  'navigation',
  'home',
  'detail',
  'search',
  'advancedSearch',
  'filters',
  'settings',
  'about',
  'footer',
  'errors',
  'dialogs',
  'toast',
  'forms',
  'validation',
  'seo',
  'a11y',
] as const;

export type TranslationNamespace = (typeof NAMESPACES)[number];

export const LANGUAGE_META: Record<
  SupportedLanguage,
  { nativeName: string; englishName: string; ogLocale: string; dir: 'ltr' | 'rtl' }
> = {
  en: {
    nativeName: 'English',
    englishName: 'English',
    ogLocale: 'en_US',
    dir: 'ltr',
  },
  zh: {
    nativeName: '中文',
    englishName: 'Chinese',
    ogLocale: 'zh_CN',
    dir: 'ltr',
  },
  th: {
    nativeName: 'ไทย',
    englishName: 'Thai',
    ogLocale: 'th_TH',
    dir: 'ltr',
  },
  ko: {
    nativeName: '한국어',
    englishName: 'Korean',
    ogLocale: 'ko_KR',
    dir: 'ltr',
  },
  my: {
    nativeName: 'မြန်မာ',
    englishName: 'Myanmar',
    ogLocale: 'my_MM',
    dir: 'ltr',
  },
};

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Map browser language tags (e.g. zh-CN, ko-KR) to supported app languages. */
export function resolveBrowserLanguage(tag: string): SupportedLanguage | null {
  const normalized = tag.toLowerCase().replace('_', '-');
  const base = normalized.split('-')[0] ?? normalized;

  if (isSupportedLanguage(base)) {
    return base;
  }

  if (base === 'zh' || normalized.startsWith('zh')) {
    return 'zh';
  }

  return null;
}
