<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchCorrectionController;
use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InventoryCorrectionOrchestrator extends Controller
{
    public function store(Request $request, string $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Lock the item during the Correction process.
            $item = InventoryItem::where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($item->archived) {
                abort(409, 'An archived item cannot be corrected.');
            }

            $stockData = $request->input('stockData');
            $batchData = $request->input('batchData');

            $actualBatchQuantity =
                (float) $stockData['actual_batch_quantity'];

            $stockBefore = (float) $item->current_stock;

            $correction = app(
                InventoryBatchCorrectionController::class
            )->applyActualCount(
                $item->id,
                $batchData['selected_batch_id'],
                $actualBatchQuantity,
                (float) $item->cost_per_unit
            );

            $difference = (float) $correction['difference'];
            $stockAfter = $stockBefore + $difference;

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'stockData.actual_batch_quantity' =>
                    'The correction would make the item stock negative.',
                ]);
            }

            $item->update([
                'current_stock' => $stockAfter,
            ]);

            $reason = $stockData['reason'];

            if (!empty($stockData['notes'])) {
                $reason .= ' - ' . $stockData['notes'];
            }

            $batchChange = $correction['changes'][0];

            app(InventoryAuditLogController::class)->store([
                'inventory_item_id' => $item->id,
                'batch_id' => $batchChange['batch_id'],
                'transaction_reference' => (string) Str::uuid(),
                'action' => 'Manual Adjustment',
                'source' => 'Stock Log Modal',
                'quantity_change' =>
                (float) $batchChange['quantity_change'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reason_reference' => $reason,
                'performed_by' => $request->user()->id,
            ]);

            // Refresh FEFO/FIFO cost after Correction.
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

            return $item->refresh();
        });
    }
}
