import { useTranslation } from 'react-i18next';

interface OfflineIndicatorProps {
  visible: boolean;
}

export function OfflineIndicator({ visible }: OfflineIndicatorProps) {
  const { t } = useTranslation(['common', 'a11y']);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center px-4 sm:top-[4.25rem]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto flex max-w-lg items-center gap-2 rounded-xl border border-amber-500/30 bg-bg-secondary/95 px-3 py-2 text-sm text-text-primary shadow-lg shadow-black/40 backdrop-blur-md sm:px-4">
        <span
          className="inline-flex h-2 w-2 shrink-0 rounded-full bg-amber-400"
          aria-hidden="true"
        />
        <span className="font-medium">{t('common:offlineBannerTitle')}</span>
        <span className="hidden text-text-secondary sm:inline">
          {t('common:offlineBannerBody')}
        </span>
        <span className="sr-only">{t('a11y:offlineStatus')}</span>
      </div>
    </div>
  );
}
