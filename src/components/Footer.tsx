import { APP_NAME } from '@/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md gradient-accent text-xs font-bold text-white"
              aria-hidden="true"
            >
              SH
            </span>
            <span className="font-semibold text-text-primary">{APP_NAME}</span>
          </div>
          <p className="text-center text-sm text-text-muted">
            &copy; {year} {APP_NAME}. Your gateway to Asian dramas.
          </p>
        </div>
      </div>
    </footer>
  );
}
