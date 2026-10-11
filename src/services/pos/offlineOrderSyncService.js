import { db } from "../../utils/offlineDB";
import { processOnlineCheckout } from "./checkoutService";
import { markPOSRefreshRequired } from "./posCacheService";
import { canRetryOfflineOrder } from "../../utils/sync/syncStatus";

let activeSyncPromise = null;

// Synchronize queued offline orders one at a time.
const runOfflineOrderSync = async (cashierId, canContinue, retryOrderId) => {
  let pendingOrders;

  if (retryOrderId !== null) {
    // Re-read the selected row: the popover may contain an older snapshot.
    const order = await db.offlineOrders.get(retryOrderId);
    pendingOrders = canRetryOfflineOrder(order) ? [order] : [];
  } else {
    pendingOrders = await db.offlineOrders
      .where("status")
      .anyOf("pending_sync", "failed", "syncing", "awaiting_auth")
      .sortBy("created_at");
  }

  if (pendingOrders.length === 0) {
    return {
      success: true,
      synced: 0,
      failed: 0,
      attention: 0,
      signInRequired: false,
      connectionIssue: false,
      message: "No offline orders to sync.",
    };
  }

  let syncedCount = 0;
  let failedCount = 0;
  let attentionCount = 0;
  let signInRequired = false;
  let connectionIssue = false;
  let paused = false;

  for (const offlineOrder of pendingOrders) {
    // A valid token alone is not permission to run an unattended uploader.
    if (!cashierId || !canContinue()) {
      paused = true;
      break;
    }

    try {
      if (!offlineOrder.cashier_id) {
        const ownerError = new Error(
          "Original cashier is missing. Please ask an administrator to review this order.",
        );
        ownerError.status = 422;
        throw ownerError;
      }

      if (
        !offlineOrder.checkout_payload ||
        !offlineOrder.client_transaction_id
      ) {
        const formatError = new Error(
          "Offline order uses an unsupported legacy format.",
        );
        formatError.status = 422;
        throw formatError;
      }

      await db.offlineOrders.update(offlineOrder.id, {
        status: "syncing",
        last_error: null,
        last_error_status: null,
      });

      // The page/session may have changed while local storage was updating.
      if (!canContinue()) {
        await db.offlineOrders.update(offlineOrder.id, {
          status: offlineOrder.status,
          last_error: offlineOrder.last_error ?? null,
          last_error_status: offlineOrder.last_error_status ?? null,
        });
        paused = true;
        break;
      }

      // Use the same Laravel checkout used by online orders.
      await processOnlineCheckout(
        {
          ...offlineOrder.checkout_payload,
          cashier_id: offlineOrder.cashier_id,
          // Existing queued orders already saved this timestamp in Dexie.
          // Missing timestamps must fail validation, not become the upload time.
          offline_created_at: offlineOrder.created_at || null,
        },
        offlineOrder.client_transaction_id,
      );

      // Laravel accepted the order. Save the refresh reminder and remove
      // the local order together, so a reload cannot lose the reminder.
      await db.transaction(
        "rw",
        [db.offlineOrders, db.syncMetadata],
        async () => {
          await markPOSRefreshRequired();
          await db.offlineOrders.delete(offlineOrder.id);
        },
      );

      syncedCount++;

      console.log(`Offline order synced: ${offlineOrder.offline_order_number}`);
    } catch (error) {
      const errorStatus = error.status || null;
      const retryableStatuses = [408, 425, 429];

      const shouldRetry =
        !errorStatus ||
        errorStatus >= 500 ||
        retryableStatuses.includes(errorStatus);

      let nextStatus = "requires_attention";

      if (errorStatus === 401) {
        nextStatus = "awaiting_auth";
        signInRequired = true;
      } else if (shouldRetry) {
        nextStatus = "failed";
        connectionIssue = true;
      } else attentionCount++;

      await db.offlineOrders.update(offlineOrder.id, {
        status: nextStatus,
        sync_attempts: (offlineOrder.sync_attempts || 0) + 1,
        last_error: error.message,
        last_error_status: errorStatus,
        last_sync_cashier_id: cashierId,
      });

      failedCount++;

      console.error(
        `Failed to sync ${offlineOrder.offline_order_number}:`,
        error.message,
      );

      // Further requests cannot resolve a connection or authentication failure.
      if (signInRequired || connectionIssue || errorStatus === 403) {
        break;
      }
    }
  }

  return {
    success: failedCount === 0 && !paused,
    synced: syncedCount,
    failed: failedCount,
    attention: attentionCount,
    signInRequired,
    connectionIssue,
    paused,
    message: `Synced ${syncedCount} orders. Failed: ${failedCount}.`,
  };
};

// Prevent two sync processes from running at the same time.
export const syncPendingOfflineOrders = async (
  cashierId,
  canContinue = () => false,
  retryOrderId = null,
) => {
  if (activeSyncPromise) {
    // A new page/session must not inherit the previous uploader's result.
    await activeSyncPromise.catch(() => null);
    return syncPendingOfflineOrders(cashierId, canContinue, retryOrderId);
  }

  activeSyncPromise = runOfflineOrderSync(cashierId, canContinue, retryOrderId);

  try {
    return await activeSyncPromise;
  } catch (error) {
    console.error("Error synchronizing offline orders:", error.message);

    throw new Error(error.message || "Failed to synchronize offline orders", {
      cause: error,
    });
  } finally {
    activeSyncPromise = null;
  }
};
