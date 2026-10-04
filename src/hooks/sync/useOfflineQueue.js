import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { readOfflineQueue } from "../../services/pos/offlineQueueService";

export function useOfflineQueue(cashierId) {
  // Keep results separate when the signed-in cashier changes.
  const source = useMemo(() => ({ cashierId }), [cashierId]);

  const snapshot = useLiveQuery(async () => {
    if (!source.cashierId) return null;

    try {
      const summary = await readOfflineQueue(source.cashierId);

      return { source, summary, error: null };
    } catch (error) {
      // Keep a failed read distinct from an empty queue.
      return { source, summary: null, error };
    }
  }, [source]);

  let currentSnapshot = null;

  if (snapshot && snapshot.source === source) currentSnapshot = snapshot;

  let summary = null;
  let error = null;

  if (currentSnapshot) {
    summary = currentSnapshot.summary;
    error = currentSnapshot.error;
  }

  return {
    summary,
    isChecking: Boolean(cashierId) && currentSnapshot === null,
    queueReadFailed: Boolean(error),
    error,
  };
}
