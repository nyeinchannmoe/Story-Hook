import type { ButtonHTMLAttributes, MouseEvent } from 'react';

type WatchedToggleVariant = 'overlay' | 'button' | 'icon';
type WatchedToggleSize = 'sm' | 'md' | 'lg';

interface WatchedToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'> {
  watched: boolean;
  onToggle: () => void;
  label: string;
  watchedLabel?: string;
  unwatchedLabel?: string;
  variant?: WatchedToggleVariant;
  size?: WatchedToggleSize;
  showLabel?: boolean;
}

const sizeClasses: Record<WatchedToggleSize, string> = {
  sm: 'h-9 w-9 min-h-9 min-w-9',
  md: 'h-10 w-10 min-h-10 min-w-10',
  lg: 'h-11 w-11 min-h-11 min-w-11',
};

const iconSizeClasses: Record<WatchedToggleSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-5 w-5',
};

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckCircleSolidIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function WatchedToggle({
  watched,
  onToggle,
  label,
  watchedLabel,
  unwatchedLabel,
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className = '',
  disabled,
  ...rest
}: WatchedToggleProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    onToggle();
  };

  const visibleLabel = watched
    ? (watchedLabel ?? label)
    : (unwatchedLabel ?? label);

  if (variant === 'button') {
    return (
      <button
        type="button"
        aria-pressed={watched}
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50 ${
          watched
            ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            : 'border border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:bg-white/10 hover:text-text-primary'
        } ${className}`}
        {...rest}
      >
        {watched ? (
          <CheckCircleSolidIcon className="h-5 w-5" />
        ) : (
          <CheckCircleIcon className="h-5 w-5" />
        )}
        <span>{visibleLabel}</span>
      </button>
    );
  }

  const overlayBase =
    variant === 'overlay'
      ? 'rounded-full bg-black/65 text-white shadow-lg backdrop-blur-sm hover:bg-black/80 active:scale-95'
      : 'rounded-lg text-text-secondary hover:bg-white/10 hover:text-text-primary active:scale-95';

  const watchedStyles = watched
    ? variant === 'overlay'
      ? 'bg-emerald-500/90 text-white hover:bg-emerald-500'
      : 'text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300'
    : '';

  return (
    <button
      type="button"
      aria-pressed={watched}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${overlayBase} ${watchedStyles} ${showLabel ? 'w-auto px-3' : ''} ${className}`}
      {...rest}
    >
      {watched ? (
        <CheckCircleSolidIcon className={iconSizeClasses[size]} />
      ) : (
        <CheckCircleIcon className={iconSizeClasses[size]} />
      )}
      {showLabel ? (
        <span className="text-xs font-semibold sm:text-sm">{visibleLabel}</span>
      ) : null}
    </button>
  );
}
