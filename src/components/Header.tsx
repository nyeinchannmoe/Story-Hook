import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants';
import { SearchIconLink } from './SearchIconLink';

export function Header() {
  const { t } = useTranslation(['navigation', 'common', 'a11y']);
  const appName = t('common:appName');

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.HOME}
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label={t('navigation:goHome', { appName })}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-sm font-bold text-white shadow-lg shadow-red-900/30"
            aria-hidden="true"
          >
            {t('navigation:logoMark')}
          </span>
          <span className="text-lg font-bold tracking-tight text-gradient sm:text-xl">
            {appName}
          </span>
        </Link>

        <nav
          aria-label={t('navigation:mainNav')}
          className="flex items-center gap-1 sm:gap-2"
        >
          <Link
            to={ROUTES.HOME}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:px-4"
          >
            {t('navigation:browseDramas')}
          </Link>
          <Link
            to={ROUTES.SETTINGS}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:inline-flex sm:px-4"
          >
            {t('navigation:settings')}
          </Link>
          <SearchIconLink />
          <Link
            to={ROUTES.SETTINGS}
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:hidden"
            aria-label={t('a11y:openSettings')}
            title={t('navigation:settings')}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
