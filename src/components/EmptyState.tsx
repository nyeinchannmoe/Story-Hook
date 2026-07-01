interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-bg-card px-6 py-16 text-center"
      role="status"
    >
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5"
        aria-hidden="true"
      >
        <svg
          className="h-8 w-8 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M9 8h6M9 12h6m-3 4h3"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-text-primary">{title}</h2>
      <p className="mb-6 max-w-md text-text-secondary">{description}</p>
      {action}
    </div>
  );
}
