import { useTranslation } from 'react-i18next';
import type { PwaUpdatePhase } from '@/hooks/usePwaUpdate';
import { BrandLogo } from './BrandLogo';

interface PwaUpdatePromptProps {
  visible: boolean;
  phase: PwaUpdatePhase;
  updateError: string | null;
  onUpdate: () => void;
  onLater: () => void;
}

export function PwaUpdatePrompt({
  visible,
  phase,
  updateError,
  onUpdate,
  onLater,
}: PwaUpdatePromptProps) {
  const { t } = useTranslation(['dialogs', 'common', 'a11y']);

  if (!visible) return null;

  const isUpdating = phase === 'updating';
  const hasFailed = phase === 'failed';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] flex justify-center p-4 sm:bottom-4 sm:p-0"
      role="dialog"
      aria-modal="false"
      aria-labelledby="pwa-update-title"
      aria-describedby="pwa-update-description"
    >
      <div className="glass w-full max-w-md rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/50 sm:p-5">
        <div className="flex items-start gap-3">
          <BrandLogo size="lg" className="mt-0.5 rounded-lg" />
          <div className="min-w-0 flex-1">
            <h2
              id="pwa-update-title"
              className="text-base font-semibold text-text-primary sm:text-lg"
            >
              {t('dialogs:pwaUpdateTitle')}
            </h2>
            <p
              id="pwa-update-description"
              className="mt-1 text-sm text-text-secondary"
            >
              {hasFailed
                ? t('dialogs:pwaUpdateFailed')
                : isUpdating
                  ? t('dialogs:pwaUpdateUpdating')
                  : t('dialogs:pwaUpdateBody')}
            </p>
            {updateError ? (
              <p className="mt-2 text-xs text-amber-300" role="alert">
                {t('dialogs:pwaUpdateRetryHint')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onLater}
            disabled={isUpdating}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('dialogs:pwaUpdateLater')}
          </button>
          <button
            type="button"
            onClick={onUpdate}
            disabled={isUpdating}
            className="inline-flex items-center justify-center rounded-xl gradient-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            aria-busy={isUpdating}
          >
            {isUpdating
              ? t('dialogs:pwaUpdateUpdating')
              : hasFailed
                ? t('dialogs:pwaUpdateRetry')
                : t('dialogs:pwaUpdateNow')}
          </button>
        </div>
        <span className="sr-only">{t('a11y:pwaUpdateAvailable')}</span>
      </div>
    </div>
  );
}
