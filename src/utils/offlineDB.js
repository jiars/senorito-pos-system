import Dexie from "dexie";

export const db = new Dexie('SenoritoPOS_OfflineDB');
db.version(2).stores({
    offlineOrders: '++id, status, created_at',
    menuItems: 'id, category_id, name, pos_status',
    inventoryStock: 'id, item_name, current_stock',
    categories: 'id, category_name',
    addons: 'id, addon_name'
});

export const clearOfflineDB = async () => {
    await db.offlineOrders.clear();
    await db.menuItems.clear();
    await db.inventoryStock.clear();
    await db.categories.clear();
    await db.addons.clear();
};
