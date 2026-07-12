import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME } from '@/constants';
import { getCurrentLanguage } from '@/i18n';
import { LANGUAGE_META } from '@/i18n/config';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
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

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
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

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:locale', ogLocale);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);

    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }

    if (url) {
      setMetaTag('property', 'og:url', url);
    }
  }, [title, description, image, url, type, t, i18n.language]);

  return null;
}
