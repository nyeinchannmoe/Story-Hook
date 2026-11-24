import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME, DEFAULT_OG_IMAGE } from '@/constants';
import { getCurrentLanguage } from '@/i18n';
import { LANGUAGE_META } from '@/i18n/config';
import {
  PRODUCTION_ORIGIN,
  INDEXABLE_ROBOTS,
  safeJsonLdStringify,
  toAbsoluteUrl,
} from '../../social-meta';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  /** Path or absolute URL used for og:url (canonicalized to production origin). */
  url?: string;
  /** Preferred canonical path or absolute URL. Defaults to `url` or homepage. */
  canonical?: string;
  type?: string;
  siteName?: string;
  robots?: string;
  jsonLd?: unknown | unknown[];
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

function setCanonicalLink(href: string) {
  let element = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function setJsonLdScripts(payloads: unknown[]) {
  document
    .querySelectorAll('script[data-seo-jsonld="true"]')
    .forEach((node) => node.remove());

  for (const payload of payloads) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = safeJsonLdStringify(payload);
    document.head.appendChild(script);
  }
}

function resolveProductionUrl(pathOrUrl: string | undefined): string {
  if (!pathOrUrl?.trim()) {
    return `${PRODUCTION_ORIGIN}/`;
  }
  return toAbsoluteUrl(PRODUCTION_ORIGIN, pathOrUrl.trim());
}

export function SEO({
  title,
  description,
  image,
  url,
  canonical,
  type = 'website',
  siteName = APP_NAME,
  robots = INDEXABLE_ROBOTS,
  jsonLd,
}: SEOProps) {
  const { t, i18n } = useTranslation(['seo', 'common']);
  const jsonLdSerialized =
    jsonLd == null ? '' : safeJsonLdStringify(jsonLd);

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

    const resolvedImage = resolveProductionUrl(
      image?.trim() || DEFAULT_OG_IMAGE,
    );
    const resolvedUrl = resolveProductionUrl(url);
    const resolvedCanonical = resolveProductionUrl(canonical ?? url);

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);
    setCanonicalLink(resolvedCanonical);
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

    const payloads =
      jsonLdSerialized === ''
        ? []
        : (JSON.parse(jsonLdSerialized) as unknown);
    const list = Array.isArray(payloads) ? payloads : [payloads];
    setJsonLdScripts(list);

    return () => {
      document
        .querySelectorAll('script[data-seo-jsonld="true"]')
        .forEach((node) => node.remove());
    };
  }, [
    title,
    description,
    image,
    url,
    canonical,
    type,
    siteName,
    robots,
    jsonLdSerialized,
    t,
    i18n.language,
  ]);

  return null;
}
