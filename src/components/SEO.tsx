import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME, DEFAULT_OG_IMAGE } from '@/constants';
import { getCurrentLanguage } from '@/i18n';
import { LANGUAGE_META } from '@/i18n/config';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

function setMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function resolveAbsoluteUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, window.location.origin).href;
  } catch {
    return pathOrUrl;
  }
}

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = APP_NAME,
}: SEOProps) {
  const { t, i18n } = useTranslation(['seo', 'common']);

  useEffect(() => {
    const appName = t('common:appName', { defaultValue: APP_NAME });
    const fullTitle =
      title === appName || title === APP_NAME
        ? title
        : t('seo:titleTemplate', { title, appName });

    document.title = fullTitle;

    const language = getCurrentLanguage();
    const ogLocale = LANGUAGE_META[language].ogLocale;
    document.documentElement.lang = language;

    const resolvedImage = resolveAbsoluteUrl(image?.trim() || DEFAULT_OG_IMAGE);
    const resolvedUrl = url
      ? resolveAbsoluteUrl(url)
      : window.location.href;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:locale', ogLocale);
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:image', resolvedImage);
    setMetaTag('property', 'og:url', resolvedUrl);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', resolvedImage);
  }, [title, description, image, url, type, siteName, t, i18n.language]);

  return null;
}
