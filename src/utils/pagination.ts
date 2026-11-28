import { PAGINATION_SIBLING_COUNT } from '@/constants';

export type PaginationItem = number | 'ellipsis';

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0 || pageSize <= 0) {
    return 0;
  }
  return Math.ceil(totalItems / pageSize);
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) {
    return 1;
  }
  return Math.min(Math.max(page, 1), totalPages);
}

export function getPageSlice<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] {
  if (items.length === 0 || pageSize <= 0) {
    return [];
  }

  const totalPages = getTotalPages(items.length, pageSize);
  const currentPage = clampPage(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getDisplayRange(
  totalItems: number,
  page: number,
  pageSize: number,
): { from: number; to: number } {
  if (totalItems <= 0 || pageSize <= 0) {
    return { from: 0, to: 0 };
  }

  const totalPages = getTotalPages(totalItems, pageSize);
  const currentPage = clampPage(page, totalPages);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  return { from, to };
}

/**
 * Builds a compact page list with ellipses for large page counts.
 * Example: 1 … 4 5 6 … 20
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number = PAGINATION_SIBLING_COUNT,
): PaginationItem[] {
  if (totalPages <= 0) {
    return [];
  }

  const safeSiblingCount = Math.max(0, siblingCount);
  const totalSlots = safeSiblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - safeSiblingCount, 1);
  const rightSibling = Math.min(currentPage + safeSiblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * safeSiblingCount;
    return [
      ...Array.from({ length: leftCount }, (_, index) => index + 1),
      'ellipsis',
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * safeSiblingCount;
    return [
      1,
      'ellipsis',
      ...Array.from(
        { length: rightCount },
        (_, index) => totalPages - rightCount + index + 1,
      ),
    ];
  }

  return [
    1,
    'ellipsis',
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, index) => leftSibling + index,
    ),
    'ellipsis',
    totalPages,
  ];
}
