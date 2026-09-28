const getBatchTime = (value) =>
  value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;

const compareOldestBatch = (firstBatch, secondBatch) => {
  const receivedDifference =
    getBatchTime(firstBatch.received_date) -
    getBatchTime(secondBatch.received_date);

  if (receivedDifference !== 0) return receivedDifference;

  const createdDifference =
    getBatchTime(firstBatch.created_at) -
    getBatchTime(secondBatch.created_at);

  if (createdDifference !== 0) return createdDifference;

  return String(firstBatch.batch_number ?? "").localeCompare(
    String(secondBatch.batch_number ?? ""),
    undefined,
    { numeric: true },
  );
};

export const getSortedStockActionBatches = (item) =>
  [...(item?.inventory_batches ?? [])].sort((firstBatch, secondBatch) => {
    const firstHasStock = Number(firstBatch.quantity) > 0;
    const secondHasStock = Number(secondBatch.quantity) > 0;

    if (firstHasStock !== secondHasStock) return firstHasStock ? -1 : 1;

    if (firstHasStock) {
      const expirationDifference =
        getBatchTime(firstBatch.expiration_date) -
        getBatchTime(secondBatch.expiration_date);

      if (expirationDifference !== 0) return expirationDifference;
    }

    return compareOldestBatch(firstBatch, secondBatch);
  });
