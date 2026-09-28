<?php

namespace App\Http\Controllers\Api\InventoryManagement\Batches;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryBatch;
use Illuminate\Validation\ValidationException;

class InventoryBatchCorrectionController extends Controller
{
    public function applyActualCount(string $inventoryItemId, string $selectedBatchId, float $actualBatchQuantity, float $fallbackUnitCost): array
    {
        $batch = InventoryBatch::where(
            'inventory_item_id',
            $inventoryItemId
        )
            ->where('id', $selectedBatchId)
            ->lockForUpdate()
            ->first();

        if (!$batch) {
            throw ValidationException::withMessages([
                'batchData.selected_batch_id' =>
                'The selected batch does not belong to this item.',
            ]);
        }

        $batchStockBefore = (float) $batch->quantity;
        $difference = $actualBatchQuantity - $batchStockBefore;

        if ($difference === 0.0) {
            throw ValidationException::withMessages([
                'stockData.actual_batch_quantity' =>
                'The batch already has this quantity.',
            ]);
        }

        $unitCost = (float) $batch->unit_cost;

        if ($unitCost <= 0) {
            $unitCost = $fallbackUnitCost;
        }

        // Correction sets the exact physical count of this batch.
        $batch->update([
            'quantity' => $actualBatchQuantity,
        ]);

        return [
            'difference' => $difference,
            'changes' => [
                [
                    'batch_id' => $batch->id,
                    'quantity_change' => $difference,
                    'unit_cost' => $unitCost,
                ],
            ],
        ];
    }
}
