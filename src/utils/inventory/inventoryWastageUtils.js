import { isDateWithinRange } from "@/utils/inventory/inventoryBatchUtils";

export const flattenInventoryWastageLogs = (inventoryItems = []) => {
  return inventoryItems.flatMap((item) =>
    (item.inventory_audit_logs ?? [])
      .filter((log) => log.action === "Wastage")
      .map((log) => {
        const batch = (item.inventory_batches ?? []).find(
          (candidate) => candidate.id === log.batch_id,
        );
        const quantityWasted = Math.abs(Number(log.quantity_change ?? 0));
        const unitCost = Number(batch?.unit_cost ?? item.cost_per_unit ?? 0);

        const reason = log.reason_reference ?? "Unspecified";

        return {
          ...log,
          item,
          batch,
          itemName: item.item_name ?? "Unknown item",
          categoryName:
            item.inventory_categories?.category_name ?? "Uncategorized",
          unit: item.base_unit ?? "",
          batchNumber: batch?.batch_number ?? "—",
          quantityWasted,
          unitCost,
          totalCost: quantityWasted * unitCost,
          reason,
          reasonCategory: reason.split(" - ")[0],
        };
      }),
  );
};

export const filterAndSortInventoryWastage = ({
  logs,
  searchTerm,
  categories,
  reasons,
  receivedDateRange,
  expirationDateRange,
  quickFilter,
  sort,
}) => {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return logs
    .filter((log) => {
      const matchesSearch =
        !normalizedSearch ||
        [log.itemName, log.batchNumber, log.reason, log.source].some((value) =>
          String(value ?? "")
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        );
      const matchesCategory =
        categories.length === 0 || categories.includes(log.categoryName);
      const matchesReason =
        reasons.length === 0 || reasons.includes(log.reasonCategory);
      const matchesReceivedDate = isDateWithinRange(
        log.batch?.received_date ?? log.batch?.created_at,
        receivedDateRange,
      );
      const matchesExpirationDate = isDateWithinRange(
        log.batch?.expiration_date,
        expirationDateRange,
      );
      const matchesQuickFilter =
        !quickFilter?.value ||
        (quickFilter.type === "item" && log.itemName === quickFilter.value) ||
        (quickFilter.type === "reason" &&
          log.reasonCategory === quickFilter.value);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesReason &&
        matchesReceivedDate &&
        matchesExpirationDate &&
        matchesQuickFilter
      );
    })
    .sort((firstLog, secondLog) => {
      const difference =
        new Date(firstLog.created_at ?? 0).getTime() -
        new Date(secondLog.created_at ?? 0).getTime();

      return sort === "oldest" ? difference : -difference;
    });
};

export const getMostFrequentValue = (values) => {
  const counts = values.reduce((result, value) => {
    result.set(value, (result.get(value) ?? 0) + 1);
    return result;
  }, new Map());

  return [...counts.entries()].sort(
    ([firstValue, firstCount], [secondValue, secondCount]) =>
      secondCount - firstCount || firstValue.localeCompare(secondValue),
  )[0]?.[0];
};
