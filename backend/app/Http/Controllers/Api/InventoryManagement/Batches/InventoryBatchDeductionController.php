<?php

namespace App\Http\Controllers\Api\InventoryManagement\Batches;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryBatch;
use Illuminate\Validation\ValidationException;

class InventoryBatchDeductionController extends Controller
{
    public function deduct(string $inventoryItemId, string $selectedBatchId, float $quantity, float $fallbackUnitCost): array
    {
        // Always deduct from the selected batch first.
        $selectedBatch = InventoryBatch::where(
            'inventory_item_id',
            $inventoryItemId
        )
            ->where('id', $selectedBatchId)
            ->lockForUpdate()
            ->first();

        if (!$selectedBatch || (float) $selectedBatch->quantity <= 0) {
            throw ValidationException::withMessages([
                'batchData.selected_batch_id' =>
                'The selected batch has no available stock.',
            ]);
        }

        // Remaining deductions follow FEFO, then FIFO.
        $otherBatches = InventoryBatch::where(
            'inventory_item_id',
            $inventoryItemId
        )
            ->where('id', '!=', $selectedBatchId)
            ->where('quantity', '>', 0)
            ->orderByRaw('expiration_date ASC NULLS LAST')
            ->orderBy('received_date')
            ->orderBy('created_at')
            ->lockForUpdate()
            ->get();

        $batches = collect([$selectedBatch])->concat($otherBatches);

        $availableStock = (float) $batches->sum('quantity');

        if ($availableStock < $quantity) {
            throw ValidationException::withMessages([
                'stockData.quantity' =>
                'There is not enough batch stock for this wastage.',
            ]);
        }

        $remaining = $quantity;
        $totalWastageCost = 0;
        $deductions = [];

        foreach ($batches as $batch) {
            if ($remaining <= 0) {
                break;
            }

            $batchStock = (float) $batch->quantity;
            $deducted = min($batchStock, $remaining);
            $newBatchStock = $batchStock - $deducted;

            $unitCost = (float) $batch->unit_cost;

            if ($unitCost <= 0) {
                $unitCost = $fallbackUnitCost;
            }

            $batch->update([
                'quantity' => $newBatchStock,
            ]);

            $totalWastageCost += $deducted * $unitCost;
            $remaining -= $deducted;

            $deductions[] = [
                'batch_id' => $batch->id,
                'quantity' => $deducted,
                'unit_cost' => $unitCost,
            ];
        }

        return [
            'batch_id' => $selectedBatch->id,
            'total_cost' => $totalWastageCost,
            'deductions' => $deductions,
        ];
    }
}
