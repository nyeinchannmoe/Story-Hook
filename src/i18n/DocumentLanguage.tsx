import { useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage } from '@/i18n';
import { LANGUAGE_META } from '@/i18n/config';

/** Keeps <html lang> and dir in sync with the active i18n language. */
export function DocumentLanguage() {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    // Signal that React has mounted so the boot splash can hide (see index.html).
    // Keep the class once set — StrictMode remount must not flash the splash.
    document.documentElement.classList.add('app-mounted');
    document.documentElement.classList.remove('app-boot-failed');
  }, []);

  useEffect(() => {
    const language = getCurrentLanguage();
    const meta = LANGUAGE_META[language];
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
  }, [i18n.language, i18n.resolvedLanguage]);

  return null;
}
