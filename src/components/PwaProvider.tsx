import { useCallback } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { useConnectivity } from '@/hooks/useConnectivity';
import { usePwaUpdate } from '@/hooks/usePwaUpdate';

/**
 * Wires connectivity UI and automatic background service-worker updates.
 */
export function PwaProvider() {
  const { checkForUpdates } = usePwaUpdate();

  const handleBecameOnline = useCallback(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const { isOffline } = useConnectivity(handleBecameOnline);

  return <OfflineIndicator visible={isOffline} />;
}
