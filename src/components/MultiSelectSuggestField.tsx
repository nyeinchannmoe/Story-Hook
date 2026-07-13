import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { SuggestOption } from '@/types/search';

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
}

const MAX_SUGGESTIONS = 12;

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
}: MultiSelectSuggestFieldProps) {
  const reactId = useId();
  const fieldId = idProp ?? `${reactId}-field`;
  const listboxId = `${fieldId}-listbox`;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(
    () => new Set(selectedUuids),
    [selectedUuids],
  );

  const selectedOptions = useMemo(() => {
    const byUuid = new Map(options.map((option) => [option.uuid, option]));
    return selectedUuids
      .map((uuid) => byUuid.get(uuid) ?? { uuid, name: uuid })
      .filter((option) => option.uuid.trim() !== '');
  }, [options, selectedUuids]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return options
      .filter(
        (option) =>
          !selectedSet.has(option.uuid) &&
          option.name.toLowerCase().includes(q),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [options, query, selectedSet]);

  const showDropdown = open && query.trim().length > 0;

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
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />

      {helpText && (
        <p className="mt-2 text-xs text-text-muted">{helpText}</p>
      )}

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={listboxLabel}
          className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-bg-card py-1 shadow-xl shadow-black/40"
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
                    className={`flex w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'bg-accent-muted text-text-primary'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addUuid(option.uuid)}
                  >
                    {option.name}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
