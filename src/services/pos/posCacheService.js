import { db } from "../../utils/offlineDB";

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
