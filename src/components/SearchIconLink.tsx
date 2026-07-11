import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface SearchIconLinkProps {
  className?: string;
}

export function SearchIconLink({ className = '' }: SearchIconLinkProps) {
  return (
    <Link
      to={ROUTES.ADVANCED_SEARCH}
      className={`inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      aria-label="Advanced search"
      title="Advanced search"
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
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
    </Link>
  );
}
