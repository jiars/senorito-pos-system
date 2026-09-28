import { isDateWithinRange } from "./inventoryBatchUtils";

export const normalizeInventoryPurchaseHistory = (purchaseHistory = []) => {
  return purchaseHistory.map((purchase) => {
    const creatorName = [
      purchase.creator?.first_name,
      purchase.creator?.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...purchase,
      itemName: purchase.inventory_item?.item_name ?? "Unknown item",
      batchNumber: purchase.inventory_batch?.batch_number ?? "—",
      recordedBy: creatorName || "—",
    };
  });
};

export const filterAndSortInventoryPurchases = ({
  purchases,
  searchTerm,
  suppliers,
  purchaseDateRange,
  sort,
}) => {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return purchases
    .filter((purchase) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          purchase.itemName,
          purchase.batchNumber,
          purchase.supplier,
          purchase.recordedBy,
        ].some((value) =>
          String(value ?? "").toLocaleLowerCase().includes(normalizedSearch),
        );
      const matchesSupplier =
        suppliers.length === 0 || suppliers.includes(purchase.supplier);
      const matchesDate = isDateWithinRange(
        purchase.purchased_at,
        purchaseDateRange,
      );

      return matchesSearch && matchesSupplier && matchesDate;
    })
    .sort((firstPurchase, secondPurchase) => {
      const difference =
        new Date(firstPurchase.purchased_at ?? 0).getTime() -
        new Date(secondPurchase.purchased_at ?? 0).getTime();

      return sort === "oldest" ? difference : -difference;
    });
};
