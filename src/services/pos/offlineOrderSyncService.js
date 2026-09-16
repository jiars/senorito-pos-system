import { db } from "../../utils/offlineDB";
import { processOnlineCheckout } from "./checkoutService";

let activeSyncPromise = null;

// Synchronize queued offline orders one at a time.
const runOfflineOrderSync = async () => {
  const pendingOrders = await db.offlineOrders
    .where("status")
    .anyOf("pending_sync", "failed", "syncing")
    .sortBy("created_at");

  if (pendingOrders.length === 0) {
    return {
      success: true,
      synced: 0,
      failed: 0,
      message: "No offline orders to sync.",
    };
  }

  let syncedCount = 0;
  let failedCount = 0;

  for (const offlineOrder of pendingOrders) {
    try {
      if (!offlineOrder.checkout_payload || !offlineOrder.client_transaction_id)
        throw new Error("Offline order uses an unsupported legacy format.");

      await db.offlineOrders.update(offlineOrder.id, {
        status: "syncing",
        last_error: null,
      });

      // Use the same Laravel checkout used by online orders.
      await processOnlineCheckout(
        offlineOrder.checkout_payload,
        offlineOrder.client_transaction_id,
      );

      // Delete only after Laravel confirms success.
      await db.offlineOrders.delete(offlineOrder.id);
      syncedCount++;

      console.log(`Offline order synced: ${offlineOrder.offline_order_number}`);
    } catch (error) {
      const retryableStatuses = [408, 425, 429];

      const shouldRetry =
        !error.status ||
        error.status >= 500 ||
        retryableStatuses.includes(error.status);

      const nextStatus = shouldRetry ? "failed" : "requires_attention";

      await db.offlineOrders.update(offlineOrder.id, {
        status: nextStatus,
        sync_attempts: (offlineOrder.sync_attempts || 0) + 1,
        last_error: error.message,
      });

      failedCount++;

      console.error(
        `Failed to sync ${offlineOrder.offline_order_number}:`,
        error.message,
      );
    }
  }

  return {
    success: failedCount === 0,
    synced: syncedCount,
    failed: failedCount,
    message: `Synced ${syncedCount} orders. Failed: ${failedCount}.`,
  };
};

// Prevent two sync processes from running at the same time.
export const syncPendingOfflineOrders = async () => {
  if (activeSyncPromise) return activeSyncPromise;

  activeSyncPromise = runOfflineOrderSync();

  try {
    return await activeSyncPromise;
  } catch (error) {
    console.error("Error synchronizing offline orders:", error.message);

    throw new Error(error.message || "Failed to synchronize offline orders");
  } finally {
    activeSyncPromise = null;
  }
};
