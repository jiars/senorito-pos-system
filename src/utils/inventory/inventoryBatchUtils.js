import { getBusinessDateKey } from "@/utils/shared/formatters/businessDates";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const getInventoryDateKey = (value) => {
  // Expiry/received dates are calendar labels; timestamps use the Manila day.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return getBusinessDateKey(value);
};

export const getBatchDaysLeft = (expirationDate) => {
  if (!expirationDate) return null;

  const expiryDay = getInventoryDateKey(expirationDate);
  const today = getBusinessDateKey(new Date());
  // UTC arithmetic measures whole calendar days, not device-local midnights.
  return Math.ceil(
    (new Date(`${expiryDay}T00:00:00Z`).getTime() -
      new Date(`${today}T00:00:00Z`).getTime()) /
    DAY_IN_MILLISECONDS,
  );
};

export const isBatchExpired = (expirationDate) => {
  const daysLeft = getBatchDaysLeft(expirationDate);

  // Missing dates are not automatically classified as expired.
  if (daysLeft === null) return false;

  return daysLeft <= 0;
};

export const getBatchStatus = (batch) => {
  // Empty batches remain in history but no longer need expiry warnings.
  if (Number(batch.quantity) <= 0) return "Depleted";

  const daysLeft = getBatchDaysLeft(batch.expiration_date);

  if (daysLeft === null) return "No Expiry";
  if (isBatchExpired(batch.expiration_date)) return "Expired";
  if (daysLeft <= 7) return "Expiring within 7 days";
  return "Good";
};

export const isDateWithinRange = (value, range) => {
  if (!range?.from && !range?.to) return true;
  if (!value) return false;

  const date = getInventoryDateKey(value);
  if (!date) return false;
  // FilterDateRange already supplies YYYY-MM-DD labels from the calendar picker.
  const from = range?.from || null;
  const to = range?.to || null;

  return (from === null || date >= from) && (to === null || date <= to);
};

export const flattenInventoryBatches = (inventoryItems = [], purchaseHistory = []) => {
  return inventoryItems.flatMap((item) =>
    (item.inventory_batches ?? []).map((batch) => ({
      ...batch,
      item,
      purchase: purchaseHistory.find((purchase) => { return purchase.batch_id === batch.id; }),
      itemName: item.item_name ?? "Unknown item",
      categoryName: item.inventory_categories?.category_name ?? "Uncategorized",
      unit: item.base_unit ?? "",
      displayStatus: getBatchStatus(batch),
    })),
  );
};

export const filterAndSortInventoryBatches = ({
  batches,
  searchTerm,
  categories,
  statuses,
  receivedDateRange,
  expirationDateRange,
  sort,
}) => {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return batches
    .filter((batch) => {
      const matchesSearch =
        !normalizedSearch ||
        [batch.itemName, batch.batch_number, batch.displayStatus].some((value) =>
          String(value ?? "").toLocaleLowerCase().includes(normalizedSearch),
        );
      const matchesCategory =
        categories.length === 0 || categories.includes(batch.categoryName);
      const matchesStatus =
        statuses.length === 0 ||
        statuses.includes(batch.displayStatus) ||
        (statuses.includes("At Risk") &&
          ["Expired", "Expiring within 7 days"].includes(batch.displayStatus));
      const matchesReceivedDate = isDateWithinRange(
        batch.received_date ?? batch.created_at,
        receivedDateRange,
      );
      const matchesExpirationDate = isDateWithinRange(
        batch.expiration_date,
        expirationDateRange,
      );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesReceivedDate &&
        matchesExpirationDate
      );
    })
    .sort((firstBatch, secondBatch) => {
      if (sort === "latest" || sort === "oldest") {
        const firstDate = new Date(
          firstBatch.created_at ?? firstBatch.received_date ?? 0,
        ).getTime();
        const secondDate = new Date(
          secondBatch.created_at ?? secondBatch.received_date ?? 0,
        ).getTime();
        const difference = firstDate - secondDate;

        return sort === "latest" ? -difference : difference;
      }

      const itemComparison = firstBatch.itemName.localeCompare(
        secondBatch.itemName,
        undefined,
        { numeric: true, sensitivity: "base" },
      );
      const comparison =
        itemComparison ||
        String(firstBatch.batch_number ?? "").localeCompare(
          String(secondBatch.batch_number ?? ""),
          undefined,
          { numeric: true, sensitivity: "base" },
        );

      return sort === "z-0" ? -comparison : comparison;
    });
};
