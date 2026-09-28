const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getBatchDaysLeft = (expirationDate) => {
  if (!expirationDate) return null;

  return Math.ceil(
    (startOfDay(expirationDate).getTime() - startOfDay().getTime()) /
      DAY_IN_MILLISECONDS,
  );
};

export const getBatchStatus = (batch) => {
  const daysLeft = getBatchDaysLeft(batch.expiration_date);

  if (daysLeft === null) return "No Expiry";
  if (daysLeft < 0) return "Expired";
  if (daysLeft <= 7) return "Expiring in 7 days";
  return "Good";
};

export const isDateWithinRange = (value, range) => {
  if (!range?.from && !range?.to) return true;
  if (!value) return false;

  const date = startOfDay(value).getTime();
  const from = range?.from ? startOfDay(range.from).getTime() : null;
  const to = range?.to ? startOfDay(range.to).getTime() : null;

  return (from === null || date >= from) && (to === null || date <= to);
};

export const flattenInventoryBatches = (inventoryItems = []) => {
  return inventoryItems.flatMap((item) =>
    (item.inventory_batches ?? []).map((batch) => ({
      ...batch,
      item,
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
        [batch.itemName, batch.batch_number, batch.source].some((value) =>
          String(value ?? "").toLocaleLowerCase().includes(normalizedSearch),
        );
      const matchesCategory =
        categories.length === 0 || categories.includes(batch.categoryName);
      const matchesStatus =
        statuses.length === 0 ||
        statuses.includes(batch.displayStatus) ||
        (statuses.includes("At Risk") &&
          ["Expired", "Expiring in 7 days"].includes(batch.displayStatus));
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
