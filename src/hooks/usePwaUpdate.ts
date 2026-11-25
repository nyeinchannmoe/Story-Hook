import { useCallback, useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  PWA_INTERACTION_EVENTS,
  isSafeToApplyPwaUpdate,
} from '@/utils/pwaUpdateSafety';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const UPDATE_CHECK_DEBOUNCE_MS = 10_000;
const SAFE_APPLY_POLL_MS = 1_000;

export interface PwaUpdateState {
  offlineReady: boolean;
  checkForUpdates: () => void;
}

/**
 * Automatic background PWA updates with safe activation.
 *
 * Keeps vite-plugin-pwa `registerType: 'prompt'` + `skipWaiting: false` so the
 * new worker finishes installing/precaching while the current version stays
 * active. Activation (SKIP_WAITING) and reload run only at a safe point —
 * never via the old Update Now dialog, and not via blind `autoUpdate` reloads.
 */
export function usePwaUpdate(): PwaUpdateState {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const checkInFlightRef = useRef(false);
  const lastCheckAtRef = useRef(0);
  const updateReadyRef = useRef(false);
  const activatingRef = useRef(false);
  const pendingReloadRef = useRef(false);
  const lastInteractionAtRef = useRef(Date.now());
  const updateServiceWorkerRef = useRef<(reloadPage?: boolean) => Promise<void>>(
    async () => undefined,
  );
  const tryApplyRef = useRef<() => void>(() => undefined);

  const stopPolling = useCallback(() => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const ensurePolling = useCallback(() => {
    if (pollRef.current != null) return;
    if (!updateReadyRef.current && !pendingReloadRef.current) return;

    pollRef.current = window.setInterval(() => {
      tryApplyRef.current();
    }, SAFE_APPLY_POLL_MS);
  }, []);

  const tryApply = useCallback(() => {
    const safe = isSafeToApplyPwaUpdate({
      lastInteractionAt: lastInteractionAtRef.current,
    });

    if (pendingReloadRef.current) {
      if (!safe) {
        ensurePolling();
        return;
      }
      pendingReloadRef.current = false;
      stopPolling();
      window.location.reload();
      return;
    }

    if (!updateReadyRef.current || activatingRef.current) {
      if (!updateReadyRef.current && !pendingReloadRef.current) {
        stopPolling();
      }
      return;
    }

    if (!safe) {
      ensurePolling();
      return;
    }

    activatingRef.current = true;
    ensurePolling();

    void updateServiceWorkerRef
      .current()
      .catch((error: unknown) => {
        activatingRef.current = false;
        console.warn(
          '[pwa-update] Failed to activate waiting service worker; keeping current version.',
          error,
        );
      });
  }, [ensurePolling, stopPolling]);

  tryApplyRef.current = tryApply;

  const {
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedReload() {
      // New worker already controlling (this tab or a sibling activated it).
      pendingReloadRef.current = true;
      updateReadyRef.current = false;
      activatingRef.current = false;
      tryApplyRef.current();
    },
    onNeedRefresh() {
      // Waiting worker finished install/precache; activate when safe.
      updateReadyRef.current = true;
      activatingRef.current = false;
      tryApplyRef.current();
    },
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration ?? null;
      if (!registration) return;

      const runUpdateCheck = () => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        if (checkInFlightRef.current) return;

        const now = Date.now();
        if (now - lastCheckAtRef.current < UPDATE_CHECK_DEBOUNCE_MS) return;

        checkInFlightRef.current = true;
        lastCheckAtRef.current = now;

        void registration
          .update()
          .catch((error: unknown) => {
            console.warn(
              '[pwa-update] Update check failed; will retry later.',
              error,
            );
          })
          .finally(() => {
            checkInFlightRef.current = false;
          });
      };

      runUpdateCheck();
      intervalRef.current = window.setInterval(
        runUpdateCheck,
        UPDATE_CHECK_INTERVAL_MS,
      );
    },
    onRegisterError(error) {
      console.warn(
        '[pwa-update] Service worker registration failed; app continues without SW updates.',
        error,
      );
    },
  });

  updateServiceWorkerRef.current = updateServiceWorker;

  const checkForUpdates = useCallback(() => {
    const registration = registrationRef.current;
    if (!registration) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (checkInFlightRef.current) return;

    const now = Date.now();
    if (now - lastCheckAtRef.current < UPDATE_CHECK_DEBOUNCE_MS) return;

    checkInFlightRef.current = true;
    lastCheckAtRef.current = now;

    void registration
      .update()
      .catch((error: unknown) => {
        console.warn(
          '[pwa-update] Update check failed; will retry later.',
          error,
        );
      })
      .finally(() => {
        checkInFlightRef.current = false;
      });
  }, []);

  useEffect(() => {
    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now();
    };

    for (const eventName of PWA_INTERACTION_EVENTS) {
      window.addEventListener(eventName, markInteraction, {
        capture: true,
        passive: true,
      });
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
        tryApplyRef.current();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        checkForUpdates();
        tryApplyRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      for (const eventName of PWA_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, markInteraction, true);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handlePageShow);
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
      }
      stopPolling();
    };
  }, [checkForUpdates, stopPolling]);

  return {
    offlineReady,
    checkForUpdates,
  };
}
