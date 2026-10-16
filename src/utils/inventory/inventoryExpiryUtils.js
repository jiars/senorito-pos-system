import { formatDate } from "@/utils/shared/formatters/dateFormatters";
import {
    getBatchDaysLeft,
    isBatchExpired,
} from "@/utils/inventory/inventoryBatchUtils";

export const getExpiryInfo = (item) => {
    if (!item.track_expiry) return { status: 'Non-Perishable', label: 'Does not expire', days: null };

    if (Number(item.current_stock) <= 0) {
        let label = 'No stock recorded';
        if (item.last_stock_action === 'Expired') {
            label = 'Removed by expiry cleanup';
            if (item.last_stock_changed_at) {
                label += ` on ${formatDate(item.last_stock_changed_at)}`;
            }
            // Cleanup time is not the original batch expiration date.
            return { status: 'Expired', label, days: null };
        }

        if (item.last_stock_changed_at) {
            label = `Since ${formatDate(item.last_stock_changed_at)}`;
        }
        return { status: 'No Stock', label, days: null };
    }

    const activeBatches = (item.inventory_batches || [])
        .filter(batch => Number(batch.quantity) > 0);
    const datedBatches = activeBatches
        .filter(batch => batch.expiration_date)
        .sort((first, second) => new Date(first.expiration_date) - new Date(second.expiration_date));

    // Match FEFO: skip expired stock and show the next usable dated batch.
    const nextUsableBatch = datedBatches.find(batch => !isBatchExpired(batch.expiration_date));

    if (nextUsableBatch) {
        const diffDays = getBatchDaysLeft(nextUsableBatch.expiration_date);
        const dateStr = formatDate(nextUsableBatch.expiration_date);
        let status = 'Good';
        if (diffDays <= 30) status = 'Expiring Soon';

        return { status, label: `Next usable: ${dateStr} (${diffDays}d)`, days: diffDays };
    }

    // Laravel permits undated stock after dated usable batches.
    const hasUndatedStock = activeBatches.some(batch => !batch.expiration_date);
    if (hasUndatedStock) {
        return { status: 'No Expiry', label: 'Remaining usable stock has no expiry date', days: null };
    }

    // No usable stock remains; positive expired batches await cleanup.
    if (datedBatches.length === 0) {
        return { status: 'No Expiry', label: 'No batch expiry available', days: null };
    }
    const nearestBatch = datedBatches[0];
    const diffDays = getBatchDaysLeft(nearestBatch.expiration_date);

    const dateStr = formatDate(nearestBatch.expiration_date);

    let label = `Expired: ${dateStr} (${Math.abs(diffDays)}d ago)`;

    if (diffDays === 0) label = `Expired today: ${dateStr}`;

    return { status: 'Expired', label, days: diffDays };
};
