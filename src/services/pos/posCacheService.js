import { db } from "../../utils/offlineDB";

const POS_REFRESH_KEY = "pos-refresh";
const POS_CACHE_KEY = "pos-cache";
const POS_CACHE_TABLES = ["menuItems", "addons", "categories", "inventoryStock"];

// Missing means no refresh reminder has been recorded yet.
export async function readPOSRefreshState() {
  const savedState = await db.syncMetadata.get(POS_REFRESH_KEY);

  if (savedState) return savedState;

  return {
    id: POS_REFRESH_KEY,
    required: false,
    revision: 0,
  };
}

// Inspect local readiness, including a temporary write (not a test sale).
// This cannot validate a server token or guarantee future storage capacity.
export async function checkPOSOfflineReadiness(cashierId) {
  const readiness = {
    hasSession: Boolean(cashierId),
    storageAvailable: false,
    hasCachedData: false,
    refreshRequired: false,
  };

  if (!cashierId) return readiness;

  try {
    readiness.hasSession = Boolean(localStorage.getItem("auth_token"));
    if (!readiness.hasSession) return readiness;

    await db.transaction(
      "rw",
      [
        db.menuItems, db.addons, db.categories, db.inventoryStock,
        db.offlineOrders, db.syncMetadata,
      ],
      async () => {
        const cache = await db.syncMetadata.get(POS_CACHE_KEY);
        const refresh = await readPOSRefreshState();
        readiness.refreshRequired = refresh.required;

        // The marker and all cache tables are saved in the same transaction.
        let cacheMatches = Boolean(
          cache && cache.counts && cache.counts.menuItems > 0,
        );
        for (const tableName of POS_CACHE_TABLES) {
          const count = await db.table(tableName).count();
          if (!cache || !cache.counts || cache.counts[tableName] !== count) {
            cacheMatches = false;
          }
        }
        readiness.hasCachedData = cacheMatches;

        // Do not announce readiness after this cashier received a known 401.
        const awaitingAuth = await db.offlineOrders
          .where("status")
          .equals("awaiting_auth")
          .filter(
            (order) =>
              (order.last_sync_cashier_id || order.cashier_id) === cashierId,
          )
          .count();
        if (awaitingAuth > 0) readiness.hasSession = false;

        // Put/delete commits atomically; no probe or order is left behind.
        await db.syncMetadata.put({ id: "pos-storage-check" });
        await db.syncMetadata.delete("pos-storage-check");
      },
    );
    readiness.storageAvailable = true;
  } catch (error) {
    console.warn("Could not check offline readiness:", error);
  }

  return readiness;
}

// Record a new requirement to refresh menu and stock.
export async function markPOSRefreshRequired() {
  return db.transaction("rw", db.syncMetadata, async () => {
    const current = await readPOSRefreshState();
    const revision = current.revision + 1;

    await db.syncMetadata.put({
      id: POS_REFRESH_KEY,
      required: true,
      revision,
    });

    return revision;
  });
}

export async function completePOSRefresh(expectedRevision) {
  return db.transaction("rw", db.syncMetadata, async () => {
    const current = await readPOSRefreshState();

    if (current.revision !== expectedRevision) return false;

    await db.syncMetadata.put({
      ...current,
      required: false,
    });

    return true;
  });
}

// Keep Inventory numbers consistent before saving them offline.
const prepareInventoryStock = (inventoryStock) => {
  return inventoryStock.map((item) => {
    return {
      id: item.id,
      item_name: item.item_name,
      base_unit: item.base_unit,
      current_stock: Number(item.current_stock) || 0,
      usable_stock: Number(item.usable_stock ?? item.current_stock) || 0,
      minimum_level: Number(item.minimum_level) || 0,
      archived: Boolean(item.archived),
    };
  });
};

// Replace only refreshable POS data. Unsynced orders are preserved.
export const savePosManagementCache = async (data) => {
  const cachedData = {
    items: data.items || [],
    addons: data.addons || [],
    categories: data.categories || [],
    inventory_stock: prepareInventoryStock(data.inventory_stock || []),
  };

  await db.transaction(
    "rw",
    [db.menuItems, db.addons, db.categories, db.inventoryStock, db.syncMetadata],
    async () => {
      await Promise.all([
        db.menuItems.clear(),
        db.addons.clear(),
        db.categories.clear(),
        db.inventoryStock.clear(),
      ]);

      if (cachedData.items.length > 0)
        await db.menuItems.bulkPut(cachedData.items);

      if (cachedData.addons.length > 0)
        await db.addons.bulkPut(cachedData.addons);

      if (cachedData.categories.length > 0)
        await db.categories.bulkPut(cachedData.categories);

      if (cachedData.inventory_stock.length > 0)
        await db.inventoryStock.bulkPut(cachedData.inventory_stock);

      // A partial/failed cache save must never leave a new ready marker.
      await db.syncMetadata.put({
        id: POS_CACHE_KEY,
        counts: {
          menuItems: cachedData.items.length,
          addons: cachedData.addons.length,
          categories: cachedData.categories.length,
          inventoryStock: cachedData.inventory_stock.length,
        },
      });
    },
  );

  return cachedData;
};
