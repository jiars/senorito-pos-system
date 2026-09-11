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
            'source' =>
            $purchaseData['source'] ??
                $purchaseData['supplier'] ??
                'Initial Stock',
            'status' => 'Active',
            'unit_cost' => $purchaseData['cost_per_unit'],
        ]);
    }

    public function getFifoCost(string $inventoryItemId)
    {
        // Use the cost of the oldest batch that still has stock.
        return InventoryBatch::where(
            'inventory_item_id',
            $inventoryItemId
        )
            ->where('quantity', '>', 0)
            ->orderBy('received_date')
            ->orderBy('created_at')
            ->value('unit_cost');
    }
}
