import { db } from '../../utils/offlineDB';
import { processCheckout } from './ordersService';

export const syncOfflineOrders = async () => {
    try {
        // 1. Get all pending orders from Dexie
        const pendingOrders = await db.offlineOrders.toArray();
        
        if (pendingOrders.length === 0) {
            return { success: true, message: 'No offline orders to sync.' };
        }

        console.log(`Found ${pendingOrders.length} offline orders. Starting sync...`);

        let successCount = 0;
        let failCount = 0;

        // 2. Loop through each order and upload to Supabase
        for (const order of pendingOrders) {
            try {
                // Remove the extra Dexie fields so it matches what processCheckout expects
                const { id, status, created_at, ...orderDetails } = order;

                // Send to Supabase using our existing online function
                await processCheckout(orderDetails);

                // 3. If successful, DELETE it from Dexie so it doesn't upload again
                await db.offlineOrders.delete(id);
                successCount++;
                
                console.log(`Successfully synced offline order: ${orderDetails.transactionId}`);
            } catch (err) {
                console.error(`Failed to sync order ${order.transactionId}:`, err);
                failCount++;
                // We DON'T delete it from Dexie if it fails. It will try again next time.
            }
        }

        return { 
            success: true, 
            synced: successCount, 
            failed: failCount,
            message: `Synced ${successCount} orders. Failed: ${failCount}` 
        };

    } catch (error) {
        console.error('Error during auto-sync:', error);
        return { success: false, error: error.message };
    }
};
