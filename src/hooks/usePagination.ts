import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import {
  clampPage,
  getDisplayRange,
  getPageSlice,
  getTotalPages,
} from '@/utils/pagination';

export interface UsePaginationOptions {
  pageSize?: number;
  /** When this value changes, the current page resets to 1. */
  resetKey?: string | number;
}

export interface UsePaginationResult<T> {
  pageItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  rangeFrom: number;
  rangeTo: number;
  setPage: (page: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function usePagination<T>(
  items: readonly T[],
  options: UsePaginationOptions = {},
): UsePaginationResult<T> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const { resetKey } = options;
  const [page, setPageState] = useState(1);

  useEffect(() => {
    setPageState(1);
  }, [resetKey]);

  const totalItems = items.length;
  const totalPages = getTotalPages(totalItems, pageSize);
  const currentPage = clampPage(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      setPageState(currentPage);
    }
  }, [page, currentPage]);

  const pageItems = useMemo(
    () => getPageSlice(items, currentPage, pageSize),
    [items, currentPage, pageSize],
  );

  const { from: rangeFrom, to: rangeTo } = useMemo(
    () => getDisplayRange(totalItems, currentPage, pageSize),
    [totalItems, currentPage, pageSize],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      if (totalPages === 0) {
        return;
      }
      setPageState(clampPage(nextPage, totalPages));
    },
    [totalPages],
  );

  const goToPrevious = useCallback(() => {
    setPage(currentPage - 1);
  }, [currentPage, setPage]);

  const goToNext = useCallback(() => {
    setPage(currentPage + 1);
  }, [currentPage, setPage]);

  return {
    pageItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    rangeFrom,
    rangeTo,
    setPage,
    goToPrevious,
    goToNext,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
}
