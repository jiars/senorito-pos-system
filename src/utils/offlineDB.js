import Dexie from "dexie";

export const db = new Dexie("SenoritoPOS_OfflineDB");
db.version(2).stores({
  offlineOrders: "++id, status, created_at",
  menuItems: "id, category_id, name, pos_status",
  inventoryStock: "id, item_name, current_stock",
  categories: "id, category_name",
  addons: "id, addon_name",
});

db.version(3).stores({
  offlineOrders:
    "++id, &client_transaction_id, offline_order_number, status, created_at",
  menuItems: "id, category_id, name, pos_status",
  inventoryStock: "id, item_name, current_stock",
  categories: "id, category_name",
  addons: "id, addon_name",
});

// Keep recovery information even after the page reloads.
db.version(4).stores({
  syncMetadata: "id",
});

// Clear refreshable cache without deleting unsynced sales.
export const clearOfflineCache = async () => {
  await db.transaction(
    "rw",
    [db.menuItems, db.inventoryStock, db.categories, db.addons],
    async () => {
      await Promise.all([
        db.menuItems.clear(),
        db.inventoryStock.clear(),
        db.categories.clear(),
        db.addons.clear(),
      ]);
    },
  );
};
