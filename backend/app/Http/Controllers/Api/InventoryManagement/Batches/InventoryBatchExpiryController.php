<?php

namespace App\Http\Controllers\Api\InventoryManagement\Batches;

use App\Models\InventoryManagement\InventoryBatch;
use App\Http\Controllers\Controller;

class InventoryBatchExpiryController extends Controller
{
    public function getAffectedItemIds(string $today)
    {
        // Only expiry-tracked items with remaining expired stock.
        return InventoryBatch::whereHas('inventory_item', function ($query) {
            $query->where('track_expiry', true);
        })
            ->whereNotNull('expiration_date')
            ->where('expiration_date', '<', $today)
            ->where('quantity', '>', 0)
            ->distinct()
            ->pluck('inventory_item_id');
    }

    public function getExpiredBatches(string $inventoryItemId, string $today)
    {
        // Lock these rows while the orchestrator processes them.
        return InventoryBatch::where('inventory_item_id', $inventoryItemId)
            ->whereNotNull('expiration_date')
            ->where('expiration_date', '<', $today)
            ->where('quantity', '>', 0)
            ->orderBy('expiration_date')
            ->orderBy('received_date')
            ->orderBy('created_at')
            ->lockForUpdate()
            ->get();
    }

    public function clearExpiredBatch(InventoryBatch $batch): float
    {
        $expiredQuantity = (float) $batch->quantity;

        $batch->update([
            'quantity' => 0,
        ]);

        return $expiredQuantity;
    }
}
