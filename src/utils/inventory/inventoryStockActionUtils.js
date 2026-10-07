const getBatchTime = (value) =>
  value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;

const compareOldestBatch = (firstBatch, secondBatch) => {
  const receivedDifference =
    getBatchTime(firstBatch.received_date) -
    getBatchTime(secondBatch.received_date);

  if (receivedDifference !== 0) return receivedDifference;

  const createdDifference =
    getBatchTime(firstBatch.created_at) - getBatchTime(secondBatch.created_at);

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

// Preview only; the backend decides the actual deductions.
export const getWastageSpilloverPreview = (item, selectedBatchId, quantity) => {
  const batches = getSortedStockActionBatches(item);
  const selectedBatch = batches.find((batch) => {
    return String(batch.id) === String(selectedBatchId);
  });

  if (!selectedBatch || Number(selectedBatch.quantity) <= 0) return [];

  let remaining = Number(quantity) - Number(selectedBatch.quantity);
  if (!Number.isFinite(remaining) || remaining <= 0) return [];

  const spillover = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    if (String(batch.id) === String(selectedBatchId)) continue;

    const available = Number(batch.quantity);
    if (available <= 0) continue;

    const deducted = Math.min(available, remaining);
    spillover.push({
      batchId: batch.id,
      batchNumber: batch.batch_number,
      quantity: deducted,
    });
    remaining -= deducted;
  }

  return spillover;
};
