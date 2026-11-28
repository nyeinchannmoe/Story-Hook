import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { SUGGESTION_PAGE_SIZE } from '@/constants';
import { usePagination } from '@/hooks/usePagination';
import type { SuggestOption } from '@/types/search';
import { getImageSrc } from '@/utils/image';

interface MultiSelectSuggestFieldProps {
  id?: string;
  label: string;
  placeholder: string;
  helpText?: string;
  options: SuggestOption[];
  selectedUuids: string[];
  onChange: (uuids: string[]) => void;
  noResultsLabel: string;
  removeAriaLabel: (name: string) => string;
  listboxLabel: string;
  pageSize?: number;
  /** Leading circular avatar (image or initial) on each suggestion. */
  showAvatar?: boolean;
}

function compareSuggestOptions(a: SuggestOption, b: SuggestOption): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

function SuggestOptionAvatar({
  name,
  image,
}: {
  name: string;
  image?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasPhoto = Boolean(image?.trim()) && !imageFailed;

  if (hasPhoto) {
    return (
      <img
        src={getImageSrc(image)}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-white/5 text-sm font-bold text-accent"
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}

export function MultiSelectSuggestField({
  id: idProp,
  label,
  placeholder,
  helpText,
  options,
  selectedUuids,
  onChange,
  noResultsLabel,
  removeAriaLabel,
  listboxLabel,
  pageSize = SUGGESTION_PAGE_SIZE,
  showAvatar = false,
}: MultiSelectSuggestFieldProps) {
  const { t } = useTranslation(['common', 'a11y']);
  const reactId = useId();
  const fieldId = idProp ?? `${reactId}-field`;
  const listboxId = `${fieldId}-listbox`;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipFocusOpenRef = useRef(false);

  const selectedSet = useMemo(
    () => new Set(selectedUuids),
    [selectedUuids],
  );

  const sortedOptions = useMemo(
    () => [...options].sort(compareSuggestOptions),
    [options],
  );

  const selectedOptions = useMemo(() => {
    const byUuid = new Map(sortedOptions.map((option) => [option.uuid, option]));
    return selectedUuids
      .map((uuid) => byUuid.get(uuid) ?? { uuid, name: uuid })
      .filter((option) => option.uuid.trim() !== '');
  }, [sortedOptions, selectedUuids]);

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return sortedOptions.filter((option) => {
      if (selectedSet.has(option.uuid)) return false;
      if (!q) return true;
      return option.name.toLowerCase().includes(q);
    });
  }, [sortedOptions, query, selectedSet]);

  const suggestionResetKey = `${query.trim()}\0${selectedUuids.join('\0')}`;

  const {
    pageItems: suggestions,
    currentPage,
    totalPages,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
  } = usePagination(filteredSuggestions, {
    pageSize,
    resetKey: suggestionResetKey,
  });

  const showDropdown = open;

  useEffect(() => {
    if (!showDropdown) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex(suggestions.length > 0 ? 0 : -1);
  }, [showDropdown, suggestions]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const addUuid = useCallback(
    (uuid: string) => {
      if (!uuid || selectedSet.has(uuid)) return;
      onChange([...selectedUuids, uuid]);
      setQuery('');
      skipFocusOpenRef.current = true;
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, selectedSet, selectedUuids],
  );

  const removeUuid = useCallback(
    (uuid: string) => {
      onChange(selectedUuids.filter((value) => value !== uuid));
    },
    [onChange, selectedUuids],
  );

  const keepInputFocus = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault();
    },
    [],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (!showDropdown) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (suggestions.length === 0) return;
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (suggestions.length === 0) return;
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
      return;
    }

    if (event.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault();
        addUuid(suggestions[activeIndex].uuid);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-medium text-text-primary"
      >
        {label}
      </label>

      {selectedOptions.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2" aria-label={label}>
          {selectedOptions.map((option) => (
            <li key={option.uuid}>
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-accent/40 bg-accent-muted px-3 py-1.5 text-sm text-text-primary">
                <span className="truncate">{option.name}</span>
                <button
                  type="button"
                  onClick={() => removeUuid(option.uuid)}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={removeAriaLabel(option.name)}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        id={fieldId}
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (skipFocusOpenRef.current) {
            skipFocusOpenRef.current = false;
            return;
          }
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />

      {helpText && (
        <p className="mt-2 text-xs text-text-muted">{helpText}</p>
      )}

      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-bg-card shadow-xl shadow-black/40">
          <ul
            id={listboxId}
            role="listbox"
            aria-label={listboxLabel}
            className="max-h-60 overflow-auto py-1"
          >
            {suggestions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-text-muted">
                {noResultsLabel}
              </li>
            ) : (
              suggestions.map((option, index) => {
                const active = index === activeIndex;
                return (
                  <li
                    key={option.uuid}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? 'bg-accent-muted text-text-primary'
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => addUuid(option.uuid)}
                    >
                      {showAvatar ? (
                        <SuggestOptionAvatar
                          name={option.name}
                          image={option.image}
                        />
                      ) : null}
                      <span className="min-w-0 truncate">{option.name}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
              <button
                type="button"
                onMouseDown={keepInputFocus}
                onClick={goToPrevious}
                disabled={!canGoPrevious}
                className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-bg-secondary px-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('a11y:paginationPreviousPage')}
              >
                {t('common:paginationPrevious')}
              </button>
              <p
                className="text-xs text-text-muted tabular-nums"
                aria-live="polite"
              >
                {currentPage} / {totalPages}
              </p>
              <button
                type="button"
                onMouseDown={keepInputFocus}
                onClick={goToNext}
                disabled={!canGoNext}
                className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-bg-secondary px-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('a11y:paginationNextPage')}
              >
                {t('common:paginationNext')}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
