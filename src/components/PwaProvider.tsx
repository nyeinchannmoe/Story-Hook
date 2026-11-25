import { useCallback } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { useConnectivity } from '@/hooks/useConnectivity';
import { usePwaUpdate } from '@/hooks/usePwaUpdate';

/**
 * Wires connectivity UI and service-worker update prompts into the app shell.
 */
export function PwaProvider() {
  const {
    needRefresh,
    phase,
    updateError,
    updateNow,
    dismiss,
    checkForUpdates,
  } = usePwaUpdate();

  const handleBecameOnline = useCallback(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const { isOffline } = useConnectivity(handleBecameOnline);

  return (
    <>
      <OfflineIndicator visible={isOffline} />
      <PwaUpdatePrompt
        visible={needRefresh}
        phase={phase}
        updateError={updateError}
        onUpdate={() => {
          void updateNow();
        }}
        onLater={dismiss}
      />
    </>
  );
}
