import { db } from "../../utils/offlineDB";
import { summarizeOfflineQueue } from "../../utils/sync/syncStatus";
import { readPOSRefreshState } from "./posCacheService";

// Read saved-order counts, display details, and unfinished refresh state.
export async function readOfflineQueue(cashierId) {
  if (!cashierId)
    throw new Error("A signed-in cashier is required to inspect the queue.");

  return db.transaction("r", [db.offlineOrders, db.syncMetadata], async () => {
    const orders = await db.offlineOrders.toArray();
    const refreshState = await readPOSRefreshState();
    const summary = summarizeOfflineQueue(orders, cashierId);

    return {
      ...summary,
      refreshRequired: refreshState.required,
      refreshRevision: refreshState.revision,
    };
  });
}
