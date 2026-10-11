import { useEffect, useMemo, useRef, useState } from "react";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { readOfflineQueue } from "../../services/pos/offlineQueueService";
import { syncPendingOfflineOrders } from "../../services/pos/offlineOrderSyncService";
import {
  checkPOSOfflineReadiness,
  readPOSRefreshState,
} from "../../services/pos/posCacheService";
import { useAuth } from "../useAuth";
import { isLogoutInProgress } from "../../services/authService";
import { canUseOfflineQueue } from "../../utils/sync/syncStatus";

import { toast } from "../../components/ui/toast";
import {
  getPOSSyncToastFeedback,
  getPOSOfflineToastFeedback,
} from "@/utils/pos/feedback/posFeedback";

export function useOfflineSync({
  refreshAfterSync,
  onSuccess,
  onError,
  onSettled,
}) {
  const { user } = useAuth();
  const sessionRef = useRef(null);

  useEffect(() => {
    sessionRef.current = canUseOfflineQueue(user)
      ? { cashierId: user.id, token: localStorage.getItem("auth_token") }
      : null;

    return () => {
      sessionRef.current = null;
    };
  }, [user]);

  function showFeedback(cashierId, result, options = {}) {
    const feedback = getPOSSyncToastFeedback(result, {
      ...options,
      onViewDetails: () => {
        // Ask the existing Topbar popover to open for this account.
        window.dispatchEvent(
          new CustomEvent("senorito:open-sync-details", {
            detail: { cashierId },
          }),
        );
      },
    });

    if (feedback) toast.add(feedback);
  }

  return useMutation({
    mutationKey: ["offline-order-sync"],
    networkMode: "always",
    retry: false,

    mutationFn: async (request) => {
      // Automatic sync passes the cashier ID; manual retry also names one order.
      const cashierId = typeof request === "string" ? request : request.cashierId;
      const retryOrderId = typeof request === "string" ? null : request.retryOrderId;
      const session = sessionRef.current;
      const canContinue = () =>
        Boolean(
          session &&
            sessionRef.current === session &&
            session.cashierId === cashierId &&
            session.token &&
            session.token === localStorage.getItem("auth_token") &&
            navigator.onLine &&
            document.visibilityState === "visible" &&
            !isLogoutInProgress(),
        );

      let result;

      try {
        result = await syncPendingOfflineOrders(cashierId, canContinue, retryOrderId);
      } catch (error) {
        if (canContinue()) showFeedback(cashierId, null, { syncFailed: true });
        throw error;
      }

      if (result.paused || !canContinue()) return { ...result, paused: true };

      // An earlier upload can finish after the page was hidden or closed.
      // Its saved reminder must still be refreshed, even with an empty queue.
      const refreshState = await readPOSRefreshState();
      if (!canContinue()) return { ...result, paused: true };

      if (refreshAfterSync && (result.synced > 0 || refreshState.required)) {
        try {
          // Do not announce completion before menu and stock are ready.
          await refreshAfterSync();
        } catch (error) {
          if (canContinue())
            showFeedback(cashierId, result, { refreshFailed: true });
          throw error;
        }
      }

      if (!canContinue()) return { ...result, paused: true };
      showFeedback(cashierId, result);
      return result;
    },

    onSuccess,
    onError,
    onSettled,
  });
}

const OFFLINE_TOAST_ID = "pos-offline-notification";

// Notify once per offline visit/transition, after active POS preparation settles.
export function useOfflineNotification({
  cashierId,
  isOnline,
  isPreparing,
  refreshRequired,
}) {
  const episodeRef = useRef({ cashierId: null, notified: false });

  useEffect(() => {
    if (isOnline || episodeRef.current.cashierId !== cashierId) {
      episodeRef.current = { cashierId, notified: false };
      toast.close(OFFLINE_TOAST_ID);
    }
    if (isOnline || isPreparing || episodeRef.current.notified) return;

    let cancelled = false;

    async function notifyOffline() {
      const readiness = await checkPOSOfflineReadiness(cashierId);
      // Ignore a late result after reconnect, account change, or leaving POS.
      if (cancelled || navigator.onLine) return;

      // Include the page's unsatisfied receipt/refresh lock, not just Dexie.
      if (refreshRequired) readiness.refreshRequired = true;
      toast.add({
        ...getPOSOfflineToastFeedback(readiness),
        id: OFFLINE_TOAST_ID,
      });
      episodeRef.current.notified = true;
    }

    notifyOffline();
    return () => {
      cancelled = true;
    };
  }, [cashierId, isOnline, isPreparing, refreshRequired]);

  useEffect(() => {
    return () => toast.close(OFFLINE_TOAST_ID);
  }, []);
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
    const syncCashierId = typeof state.variables === "string"
      ? state.variables
      : state.variables?.cashierId;
    if (!cashierId || syncCashierId !== cashierId) continue;
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
      const variables = mutation.state.variables;
      const operationCashierId = typeof variables === "string"
        ? variables
        : variables?.cashierId;
      if (operationCashierId !== source.cashierId) return;

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
