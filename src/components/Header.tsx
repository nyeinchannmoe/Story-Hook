import { Link } from 'react-router-dom';
import { APP_NAME, ROUTES } from '@/constants';
import { SearchIconLink } from './SearchIconLink';

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.HOME}
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label={`${APP_NAME} — Go to home`}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-sm font-bold text-white shadow-lg shadow-red-900/30"
            aria-hidden="true"
          >
            SH
          </span>
          <span className="text-lg font-bold tracking-tight text-gradient sm:text-xl">
            {APP_NAME}
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
          <Link
            to={ROUTES.HOME}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:px-4"
          >
            Browse Dramas
          </Link>
          <SearchIconLink />
        </nav>
      </div>
    </header>
  );
}
