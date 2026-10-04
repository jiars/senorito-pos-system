import { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { readOfflineQueue } from "../../services/pos/offlineQueueService";
import { syncPendingOfflineOrders } from "../../services/pos/offlineOrderSyncService";

export function useOfflineSync({ onSuccess, onError, onSettled }) {
  return useMutation({
    mutationKey: ["offline-order-sync"],
    mutationFn: syncPendingOfflineOrders,
    networkMode: "always",
    retry: false,
    onSuccess,
    onError,
    onSettled,
  });
}

// Read sync progress without starting another upload.
export function useOfflineSyncState(cashierId) {
  const showSyncedConfirmation = useSyncConfirmation(cashierId);
  const syncStates = useMutationState({
    filters: {
      mutationKey: ["offline-order-sync"],
      exact: true,
    },
  });

  const refreshStates = useMutationState({
    filters: {
      mutationKey: ["offline-sync-refresh"],
      exact: true,
    },
  });

  let latestSync = null;
  let isSyncing = false;

  for (const state of syncStates) {
    if (!cashierId || state.variables !== cashierId) continue;
    if (state.status === "pending") isSyncing = true;
    if (!latestSync || state.submittedAt >= latestSync.submittedAt)
      latestSync = state;
  }

  let latestRefresh = null;
  let isRefreshing = false;

  for (const state of refreshStates) {
    // Only observe refreshes belonging to this cashier.
    if (!cashierId || state.variables !== cashierId) continue;

    if (state.status === "pending") isRefreshing = true;

    if (!latestRefresh || state.submittedAt >= latestRefresh.submittedAt)
      latestRefresh = state;
  }

  let refreshFailed = false;

  if (latestRefresh) refreshFailed = latestRefresh.status === "error";

  return {
    isSyncing,
    latestSync,
    isRefreshing,
    latestRefresh,
    refreshFailed,
    showSyncedConfirmation,
  };
}

function useSyncConfirmation(cashierId) {
  const queryClient = useQueryClient();
  const source = useMemo(() => ({ cashierId }), [cashierId]);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!source.cashierId) return;

    let timer;
    let generation = 0;

    function clearConfirmation() {
      generation++;
      window.clearTimeout(timer);
      setConfirmation(null);
    }

    async function confirmRefresh(result) {
      const currentGeneration = generation;

      try {
        const queue = await readOfflineQueue(source.cashierId);

        // Ignore an outdated check or an incomplete synchronization.
        if (
          currentGeneration !== generation ||
          !navigator.onLine ||
          queue.refreshRequired ||
          queue.pendingCount > 0 ||
          queue.attentionCount > 0 ||
          queue.otherCashierCount > 0 ||
          queue.unknownOwnerCount > 0
        ) {
          return;
        }

        const remaining = 5000 - (Date.now() - result.completedAt);
        if (remaining <= 0) return;

        setConfirmation({ source });
        timer = window.setTimeout(clearConfirmation, remaining);
      } catch {
        // An unreadable queue cannot justify a success confirmation.
      }
    }

    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== "updated") return;

      const mutation = event.mutation;
      const key = mutation.options.mutationKey;
      if (!key || key.length !== 1) return;

      const isUpload = key[0] === "offline-order-sync";
      const isRefresh = key[0] === "offline-sync-refresh";

      if (!isUpload && !isRefresh) return;
      if (mutation.state.variables !== source.cashierId) return;

      if (event.action.type === "pending" || event.action.type === "error") {
        clearConfirmation();
        return;
      }

      // Only react to a new successful required refresh—not old history.
      if (!isRefresh || event.action.type !== "success") return;

      const result = mutation.state.data;
      if (!result || !result.refreshedSavedOrders) return;

      clearConfirmation();
      void confirmRefresh(result);
    });

    window.addEventListener("offline", clearConfirmation);

    return () => {
      generation++;
      window.clearTimeout(timer);
      unsubscribe();
      window.removeEventListener("offline", clearConfirmation);
    };
  }, [queryClient, source]);

  return Boolean(confirmation && confirmation.source === source);
}
