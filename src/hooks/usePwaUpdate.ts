import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const DISMISS_SESSION_KEY = 'story-hook-pwa-update-dismissed';

export type PwaUpdatePhase = 'idle' | 'ready' | 'updating' | 'failed';

export interface PwaUpdateState {
  needRefresh: boolean;
  offlineReady: boolean;
  phase: PwaUpdatePhase;
  updateError: string | null;
  updateNow: () => Promise<void>;
  dismiss: () => void;
  checkForUpdates: () => void;
}

function readDismissedFingerprint(): string | null {
  try {
    return sessionStorage.getItem(DISMISS_SESSION_KEY);
  } catch {
    return null;
  }
}

function writeDismissedFingerprint(value: string): void {
  try {
    sessionStorage.setItem(DISMISS_SESSION_KEY, value);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function clearDismissedFingerprint(): void {
  try {
    sessionStorage.removeItem(DISMISS_SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Service worker registration + user-prompted deployment update lifecycle.
 * New workers stay waiting until the user chooses Update Now.
 */
export function usePwaUpdate(): PwaUpdateState {
  const [phase, setPhase] = useState<PwaUpdatePhase>('idle');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingFingerprintRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration ?? null;

      if (!registration) return;

      const check = () => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        void registration.update().catch(() => {
          // Keep the installed version; retry on next opportunity.
        });
      };

      check();
      intervalRef.current = window.setInterval(check, UPDATE_CHECK_INTERVAL_MS);
    },
    onRegisterError() {
      setUpdateError('registerFailed');
      setPhase('failed');
    },
    onNeedRefresh() {
      const fingerprint =
        registrationRef.current?.waiting?.scriptURL ??
        `need-refresh-${Date.now()}`;
      waitingFingerprintRef.current = fingerprint;

      const dismissedFingerprint = readDismissedFingerprint();
      if (dismissedFingerprint && dismissedFingerprint === fingerprint) {
        setDismissed(true);
        setPhase('idle');
        return;
      }

      setDismissed(false);
      setUpdateError(null);
      setPhase('ready');
    },
    onOfflineReady() {
      setOfflineReady(true);
    },
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (needRefresh && !dismissed) {
      setPhase((current) => (current === 'updating' ? current : 'ready'));
    }
  }, [needRefresh, dismissed]);

  const checkForUpdates = useCallback(() => {
    const registration = registrationRef.current;
    if (!registration) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    void registration.update().catch(() => {
      // Preserve last good version; connectivity may return later.
    });
  }, []);

  const updateNow = useCallback(async () => {
    setPhase('updating');
    setUpdateError(null);
    clearDismissedFingerprint();

    try {
      await updateServiceWorker(true);
    } catch {
      setUpdateError('updateFailed');
      setPhase('failed');
    }
  }, [updateServiceWorker]);

  const dismiss = useCallback(() => {
    const fingerprint =
      waitingFingerprintRef.current ??
      registrationRef.current?.waiting?.scriptURL ??
      'dismissed';
    writeDismissedFingerprint(fingerprint);
    setDismissed(true);
    setNeedRefresh(false);
    setPhase('idle');
    setUpdateError(null);
  }, [setNeedRefresh]);

  const showPrompt = needRefresh && !dismissed && phase !== 'idle';

  return {
    needRefresh: showPrompt || phase === 'updating' || phase === 'failed',
    offlineReady,
    phase: showPrompt || phase === 'updating' || phase === 'failed' ? phase : 'idle',
    updateError,
    updateNow,
    dismiss,
    checkForUpdates,
  };
}
