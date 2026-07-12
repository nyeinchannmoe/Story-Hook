import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants';

export function Footer() {
  const { t } = useTranslation(['footer', 'common', 'navigation']);
  const year = new Date().getFullYear();
  const appName = t('common:appName');

  return (
    <footer className="mt-auto border-t border-white/5 bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md gradient-accent text-xs font-bold text-white"
              aria-hidden="true"
            >
              {t('navigation:logoMark')}
            </span>
            <span className="font-semibold text-text-primary">{appName}</span>
          </div>
          <nav
            aria-label={t('navigation:mainNav')}
            className="flex flex-wrap items-center justify-center gap-4 text-sm"
          >
            <Link
              to={ROUTES.ABOUT}
              className="text-text-muted transition-colors hover:text-text-primary"
            >
              {t('navigation:about')}
            </Link>
            <Link
              to={ROUTES.SETTINGS}
              className="text-text-muted transition-colors hover:text-text-primary"
            >
              {t('navigation:settings')}
            </Link>
          </nav>
          <p className="text-center text-sm text-text-muted">
            {t('footer:tagline', { year, appName })}
          </p>
        </div>
      </div>
    </footer>
  );
}
