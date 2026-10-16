<?php

namespace App\Http\Controllers\Api\InventoryManagement\Batches;

use App\Services\InventoryManagement\InventoryExpiryService;
use App\Models\InventoryManagement\InventoryBatch;
use App\Http\Controllers\Controller;

class InventoryBatchExpiryController extends Controller
{
    public function getAffectedItemIds(string $today, ?string $inventoryItemId = null)
    {
        // Find expiry-tracked ingredients with remaining expired stock.
        $query = InventoryBatch::whereHas('inventory_item', function ($query) {
            $query->where('track_expiry', true);
        })
            ->where('quantity', '>', 0);

        if ($inventoryItemId !== null)
            $query->where('inventory_item_id', $inventoryItemId);

        app(InventoryExpiryService::class)
            ->applyExpiredFilter($query, $today);

        return $query
            ->distinct()
            ->pluck('inventory_item_id');
    }

    public function getExpiredBatchesQuery(string $inventoryItemId, string $today)
    {
        $query = InventoryBatch::where('inventory_item_id', $inventoryItemId)
            ->where('quantity', '>', 0);

        app(InventoryExpiryService::class)
            ->applyExpiredFilter($query, $today);

        // Select expired batches with remaining stock.
        return $query
            ->orderBy('expiration_date')
            ->orderBy('received_date')
            ->orderBy('created_at');
    }

    public function clearExpiredBatch(InventoryBatch $batch): float
    {
        $expiredQuantity = (float) $batch->quantity;

        $batch->update([
            'quantity' => 0,
        ]);

        return $expiredQuantity;
    }

    public function getExpiredBatches(string $inventoryItemId, string $today)
    {
        // Real cleanup still locks the selected batches.
        return $this->getExpiredBatchesQuery($inventoryItemId, $today)
            ->lockForUpdate()
            ->get();
    }
}
