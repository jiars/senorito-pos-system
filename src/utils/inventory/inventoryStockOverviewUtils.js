import { getExpiryInfo } from "@/utils/inventoryExpiryUtils";

export const getInventoryStockStatus = (item) => {
  if (Number(item.current_stock) === 0) return "Out of Stock";
  if (Number(item.current_stock) <= Number(item.minimum_level)) {
    return "Low Stock";
  }

  return "In-stock";
};

export const filterAndSortInventoryItems = ({
  items,
  searchTerm,
  categories,
  statuses,
  expiryStatuses,
  sort,
}) => {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return items
    .filter((item) => {
      const categoryName = item.inventory_categories?.category_name ?? "";
      const stockStatus = getInventoryStockStatus(item);
      const expiryStatus = getExpiryInfo(item).status;

      return (
        (!normalizedSearch ||
          String(item.item_name ?? "")
            .toLocaleLowerCase()
            .includes(normalizedSearch)) &&
        (categories.length === 0 || categories.includes(categoryName)) &&
        (statuses.length === 0 || statuses.includes(stockStatus)) &&
        (expiryStatuses.length === 0 ||
          expiryStatuses.includes(expiryStatus))
      );
    })
    .sort((firstItem, secondItem) => {
      if (sort === "latest" || sort === "oldest") {
        const dateDifference =
          new Date(firstItem.created_at ?? 0).getTime() -
          new Date(secondItem.created_at ?? 0).getTime();

        return sort === "latest" ? -dateDifference : dateDifference;
      }

      const comparison = String(firstItem.item_name ?? "").localeCompare(
        String(secondItem.item_name ?? ""),
        undefined,
        { numeric: true, sensitivity: "base" },
      );

      return sort === "z-0" ? -comparison : comparison;
    });
};

export const getInventoryLastUpdatedInfo = (item) => {
  const logs = item.inventory_audit_logs ?? [];

  if (logs.length === 0) return null;

  const latestLog = [...logs].sort(
    (firstLog, secondLog) =>
      new Date(secondLog.created_at) - new Date(firstLog.created_at),
  )[0];

  return {
    date: new Date(latestLog.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    action: latestLog.action,
  };
};
