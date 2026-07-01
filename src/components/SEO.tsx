import { useEffect } from 'react';
import { APP_NAME } from '@/constants';

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
  useEffect(() => {
    const fullTitle = title === APP_NAME ? title : `${title} | ${APP_NAME}`;
    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
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
  }, [title, description, image, url, type]);

  return null;
}
