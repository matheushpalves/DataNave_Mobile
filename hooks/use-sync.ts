import { useCallback, useEffect, useMemo, useState } from 'react';

import { countPendingVessels, listPendingVessels, removePendingVessel } from '@/services/local-vessel-store';
import { uploadPhotoRequest } from '@/services/photo-service';
import { createVesselRequest } from '@/services/vessel-service';

export function useSync(token: string | null) {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refreshPending = useCallback(async () => {
    const count = await countPendingVessels();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    if (!token) {
      setSyncError('Faça login para sincronizar dados pendentes.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const queue = await listPendingVessels();

      for (const vessel of queue) {
        const created = await createVesselRequest(token, vessel);
        if (vessel.photos?.length) {
          for (const photo of vessel.photos) {
            await uploadPhotoRequest(token, created.id, photo);
          }
        }
        await removePendingVessel(vessel.local_id);
      }

      setLastSyncAt(new Date().toISOString());
      await refreshPending();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Erro durante a sincronização.');
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPending, token]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  return useMemo(
    () => ({
      isSyncing,
      pendingCount,
      syncError,
      lastSyncAt,
      syncNow,
      refreshPending,
    }),
    [isSyncing, pendingCount, syncError, lastSyncAt, syncNow, refreshPending],
  );
}
