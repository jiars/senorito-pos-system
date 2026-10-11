import { formatDate } from "@/utils/shared/formatters/dateFormatters";
import { getBatchDaysLeft } from "@/utils/inventory/inventoryBatchUtils";

export const getExpiryInfo = (item) => {
    if (!item.track_expiry) return { status: 'Non-Perishable', label: 'Does not expire', days: null };
    
    if (item.current_stock === 0) {
        const logs = item.inventory_audit_logs || [];
        let label = 'No stock recorded';
        let isExpiredLoss = false;
        if (logs.length > 0) {
            const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const latest = sortedLogs[0];
            const dateStr = formatDate(latest.created_at);
            
            if (latest.action === 'Expired') {
                isExpiredLoss = true;
                label = `Expired on ${dateStr}`;
            } else {
                label = `Since ${dateStr}`;
            }
        }
        
        if (isExpiredLoss) {
            return { status: 'Expired', label, days: 0 };
        } else {
            return { status: 'No Stock', label, days: null };
        }
    }

    const activeBatches = (item.inventory_batches || [])
        .filter(b => b.quantity > 0 && b.expiration_date)
        .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));

    if (activeBatches.length === 0) {
        return { status: 'No Stock', label: 'Missing expiry dates', days: null };
    }

    const nearestBatch = activeBatches[0];
    const diffDays = getBatchDaysLeft(nearestBatch.expiration_date);
    
    const dateStr = formatDate(nearestBatch.expiration_date);

    if (diffDays < 0) {
        return { status: 'Expired', label: `Expired: ${dateStr} (${Math.abs(diffDays)}d ago)`, days: diffDays };
    } else if (diffDays <= 30) {
        return { status: 'Expiring Soon', label: `Nearest: ${dateStr} (${diffDays}d)`, days: diffDays };
    } else {
        return { status: 'Good', label: `Nearest: ${dateStr} (${diffDays}d)`, days: diffDays };
    }
};
