import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PAGINATION_SIBLING_COUNT } from '@/constants';
import { getPaginationItems } from '@/utils/pagination';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rangeFrom: number;
  rangeTo: number;
  onPageChange: (page: number) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

function formatCount(value: number, language: string): string {
  try {
    return value.toLocaleString(language);
  } catch {
    return value.toLocaleString();
  }
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  rangeFrom,
  rangeTo,
  onPageChange,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: PaginationProps) {
  const { t, i18n } = useTranslation(['common', 'a11y']);

  const pageItems = useMemo(
    () => getPaginationItems(currentPage, totalPages, PAGINATION_SIBLING_COUNT),
    [currentPage, totalPages],
  );

  if (totalItems <= 0 || totalPages <= 0) {
    return null;
  }

  const language = i18n.resolvedLanguage ?? i18n.language;
  const summary = t('common:paginationShowing', {
    from: formatCount(rangeFrom, language),
    to: formatCount(rangeTo, language),
    total: formatCount(totalItems, language),
  });

  const controlClassName =
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40';

  const idleControlClassName = `${controlClassName} border-white/10 bg-bg-secondary text-text-secondary hover:border-white/20 hover:text-text-primary`;
  const activeControlClassName = `${controlClassName} border-accent/40 bg-accent-muted text-text-primary`;

  return (
    <div className="mt-8 flex flex-col gap-4 sm:mt-10">
      <p className="text-sm text-text-secondary" aria-live="polite">
        {summary}
      </p>

      {totalPages > 1 ? (
        <nav
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label={t('a11y:paginationNav')}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={idleControlClassName}
              aria-label={t('a11y:paginationPreviousPage')}
            >
              {t('common:paginationPrevious')}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className={idleControlClassName}
              aria-label={t('a11y:paginationNextPage')}
            >
              {t('common:paginationNext')}
            </button>
          </div>

          <ul className="flex flex-wrap items-center gap-2">
            {pageItems.map((item, index) => {
              if (item === 'ellipsis') {
                return (
                  <li
                    key={`ellipsis-${index}`}
                    className="px-1 text-sm text-text-muted"
                    aria-hidden="true"
                  >
                    …
                  </li>
                );
              }

              const isCurrent = item === currentPage;

              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onPageChange(item)}
                    className={
                      isCurrent ? activeControlClassName : idleControlClassName
                    }
                    aria-label={t('a11y:paginationGoToPage', { page: item })}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {formatCount(item, language)}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
