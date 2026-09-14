<?php

namespace App\Http\Controllers\Api\InventoryManagement\Batches;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryBatch;

class InventoryBatchController extends Controller
{
    public function store(array $purchaseData, string $inventoryItemId, float $baseQuantity)
    {
        // The database trigger automatically generates the batch number.
        return InventoryBatch::create([
            'inventory_item_id' => $inventoryItemId,
            'quantity' => $baseQuantity,
            'expiration_date' => $purchaseData['expiration_date'] ?? null,
            'received_date' => now(),
            'source' => $purchaseData['source'] ?? $purchaseData['supplier'] ??    'Initial Stock',
            'status' => 'Active',
            'unit_cost' => $purchaseData['cost_per_unit'],
        ]);
    }

    public function getEffectiveCost(string $inventoryItemId, bool $trackExpiry)
    {
        $query = InventoryBatch::where(
            'inventory_item_id',
            $inventoryItemId
        )->where('quantity', '>', 0);

        // Expiry-tracked items use the batch that expires first.
        if ($trackExpiry)
            $query->orderByRaw('expiration_date ASC NULLS LAST');


        // FIFO is used as the main or fallback ordering.
        return $query
            ->orderBy('received_date')
            ->orderBy('created_at')
            ->value('unit_cost');
    }
}
