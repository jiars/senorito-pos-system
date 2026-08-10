export const getExpiryInfo = (item) => {
    if (!item.track_expiry) return { status: 'Non-Perishable', label: 'Does not expire', days: null };
    
    if (item.current_stock === 0) {
        const logs = item.inventory_audit_logs || [];
        let label = 'No stock recorded';
        let isExpiredLoss = false;
        if (logs.length > 0) {
            const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const latest = sortedLogs[0];
            const dateObj = new Date(latest.created_at);
            const dateStr = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
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
    const expiryDate = new Date(nearestBatch.expiration_date);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDateOnly = new Date(nearestBatch.expiration_date);
    expiryDateOnly.setHours(0, 0, 0, 0);

    const diffTime = expiryDateOnly - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateStr = expiryDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (diffDays < 0) {
        return { status: 'Expired', label: `Expired: ${dateStr} (${Math.abs(diffDays)}d ago)`, days: diffDays };
    } else if (diffDays <= 30) {
        return { status: 'Expiring Soon', label: `Nearest: ${dateStr} (${diffDays}d)`, days: diffDays };
    } else {
        return { status: 'Good', label: `Nearest: ${dateStr} (${diffDays}d)`, days: diffDays };
    }
};
