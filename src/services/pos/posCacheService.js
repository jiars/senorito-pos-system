import { db } from "../../utils/offlineDB";

const POS_REFRESH_KEY = "pos-refresh";

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
    [db.menuItems, db.addons, db.categories, db.inventoryStock],
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
    },
  );

  return cachedData;
};
