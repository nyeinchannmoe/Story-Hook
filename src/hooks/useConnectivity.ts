import { useCallback, useEffect, useRef, useState } from 'react';
import { probeConnectivity } from '@/utils/connectivity';

const RECHECK_DEBOUNCE_MS = 800;
const ONLINE_EVENT = 'online';
const OFFLINE_EVENT = 'offline';
const VISIBILITY_EVENT = 'visibilitychange';

export interface ConnectivityState {
  isOffline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
  recheck: () => void;
}

/**
 * Lightweight online/offline state with a real reachability probe.
 * Emits offline only after a failed probe (or immediate navigator offline).
 */
export function useConnectivity(
  onBecameOnline?: () => void,
): ConnectivityState {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const wasOfflineRef = useRef(isOffline);
  const onBecameOnlineRef = useRef(onBecameOnline);
  const debounceRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    onBecameOnlineRef.current = onBecameOnline;
  }, [onBecameOnline]);

  const applyResult = useCallback((online: boolean) => {
    const nextOffline = !online;
    const previouslyOffline = wasOfflineRef.current;
    wasOfflineRef.current = nextOffline;
    setIsOffline(nextOffline);
    setLastCheckedAt(Date.now());

    if (previouslyOffline && online) {
      onBecameOnlineRef.current?.();
    }
  }, []);

  const runCheck = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsChecking(true);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        applyResult(false);
        return;
      }
      const online = await probeConnectivity();
      applyResult(online);
    } finally {
      inFlightRef.current = false;
      setIsChecking(false);
    }
  }, [applyResult]);

  const scheduleCheck = useCallback(() => {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      void runCheck();
    }, RECHECK_DEBOUNCE_MS);
  }, [runCheck]);

  useEffect(() => {
    void runCheck();

    const handleOnline = () => {
      scheduleCheck();
    };
    const handleOffline = () => {
      applyResult(false);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        scheduleCheck();
      }
    };

    window.addEventListener(ONLINE_EVENT, handleOnline);
    window.addEventListener(OFFLINE_EVENT, handleOffline);
    document.addEventListener(VISIBILITY_EVENT, handleVisibility);

    return () => {
      window.removeEventListener(ONLINE_EVENT, handleOnline);
      window.removeEventListener(OFFLINE_EVENT, handleOffline);
      document.removeEventListener(VISIBILITY_EVENT, handleVisibility);
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [applyResult, runCheck, scheduleCheck]);

  return {
    isOffline,
    isChecking,
    lastCheckedAt,
    recheck: scheduleCheck,
  };
}
