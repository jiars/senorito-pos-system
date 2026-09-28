<?php

namespace App\Http\Controllers\Api\InventoryManagement\Batches;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryBatch;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Validation\ValidationException;

class InventorySaleDeductionController extends Controller
{
    public function deduct(string $inventoryItemId, float $quantity): array
    {
        // Lock the Inventory Item during checkout.
        $item = InventoryItem::where('id', $inventoryItemId)
            ->lockForUpdate()
            ->firstOrFail();

        $this->validateItemDeduction(
            $item,
            $quantity
        );

        $batchQuery = InventoryBatch::where(
            'inventory_item_id',
            $inventoryItemId
        )
            ->where('quantity', '>', 0);

        if ($item->track_expiry) {
            // Never sell stock from an expired batch.
            $batchQuery->where(function ($query) {
                $query
                    ->whereNull('expiration_date')
                    ->orWhere(
                        'expiration_date',
                        '>=',
                        now('Asia/Manila')->toDateString()
                    );
            });

            // Expiry-tracked items use FEFO.
            $batchQuery->orderByRaw(
                'expiration_date ASC NULLS LAST'
            );
        }

        // FIFO is the default and FEFO tie-breaker.
        $batches = $batchQuery
            ->orderBy('received_date')
            ->orderBy('created_at')
            ->lockForUpdate()
            ->get();

        $this->validateBatchStock(
            $item,
            $batches,
            $quantity
        );

        $remainingQuantity = $quantity;
        $deductions = [];

        foreach ($batches as $batch) {
            if ($remainingQuantity <= 0) {
                break;
            }

            $batchStock = (float) $batch->quantity;
            $deductedQuantity = min(
                $batchStock,
                $remainingQuantity
            );

            $batch->update([
                'quantity' =>
                $batchStock - $deductedQuantity,
            ]);

            $deductions[] = [
                'batch_id' => $batch->id,
                'quantity' => $deductedQuantity,
                'unit_cost' => (float) $batch->unit_cost,
            ];

            $remainingQuantity -= $deductedQuantity;
        }

        $stockBefore = (float) $item->current_stock;
        $stockAfter = $stockBefore - $quantity;

        $item->update([
            'current_stock' => $stockAfter,
        ]);

        // Refresh the displayed cost using the next usable batch.
        $effectiveCost = app(
            InventoryBatchController::class
        )->getEffectiveCost(
            $item->id,
            (bool) $item->track_expiry
        );

        if ($effectiveCost !== null) {
            $item->update([
                'cost_per_unit' => $effectiveCost,
            ]);
        }

        return [
            'item' => $item->refresh(),
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'deductions' => $deductions,
        ];
    }

    private function validateItemDeduction(InventoryItem $item, float $quantity): void
    {
        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'items' =>
                'Inventory deduction must be greater than zero.',
            ]);
        }

        if ($item->archived) {
            throw ValidationException::withMessages([
                'items' =>
                "{$item->item_name} is archived.",
            ]);
        }

        if ((float) $item->current_stock < $quantity) {
            throw ValidationException::withMessages([
                'items' =>
                "Insufficient stock for {$item->item_name}.",
            ]);
        }
    }

    private function validateBatchStock(InventoryItem $item, $batches, float $quantity): void
    {
        $availableBatchStock = (float) $batches->sum(
            'quantity'
        );

        if ($availableBatchStock < $quantity) {
            throw ValidationException::withMessages([
                'items' =>
                "Insufficient usable batch stock for {$item->item_name}.",
            ]);
        }
    }
}
