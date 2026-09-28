<?php

namespace App\Http\Controllers\Api\InventoryManagement\Purchases;

use App\Models\InventoryManagement\InventoryPurchaseHistory;
use App\Http\Controllers\Controller;

class InventoryPurchaseHistoryController extends Controller
{
    public function store(array $purchaseData, string $inventoryItemId, string $batchId, string $userId)
    {
        // Purchase history is permanent and insert-only.
        return InventoryPurchaseHistory::create([
            'inventory_item_id' => $inventoryItemId,
            'batch_id' => $batchId,
            'quantity_purchased' => $purchaseData['quantity_purchased'],
            'purchase_unit' => $purchaseData['purchase_unit'],
            'total_cost' => $purchaseData['total_cost'],
            'cost_per_unit' => $purchaseData['cost_per_unit'],
            'supplier' => $purchaseData['supplier'] ?? null,
            'created_by' => $userId,
        ]);
    }
}
