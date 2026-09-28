<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchDeductionController;
use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class InventoryWastageOrchestrator extends Controller
{
    public function store(Request $request, string $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Lock the item during the complete Wastage process.
            $item = InventoryItem::where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($item->archived) {
                abort(409, 'An archived item cannot record wastage.');
            }

            $stockData = $request->input('stockData');
            $batchData = $request->input('batchData');

            $quantity = (float) $stockData['quantity'];
            $stockBefore = (float) $item->current_stock;

            if ($quantity > $stockBefore) {
                throw ValidationException::withMessages([
                    'stockData.quantity' =>
                    'Wastage cannot be greater than the current stock.',
                ]);
            }

            $deduction = app(
                InventoryBatchDeductionController::class
            )->deduct(
                $item->id,
                $batchData['selected_batch_id'],
                $quantity,
                (float) $item->cost_per_unit
            );

            $stockAfter = $stockBefore - $quantity;

            $item->update([
                'current_stock' => $stockAfter,
            ]);

            $reason = $stockData['reason'];

            if (!empty($stockData['notes'])) {
                $reason .= ' - ' . $stockData['notes'];
            }

            // Every affected batch shares one transaction reference.
            $transactionReference = (string) Str::uuid();
            $runningStock = $stockBefore;
            $auditController = app(InventoryAuditLogController::class);

            foreach ($deduction['deductions'] as $index => $batchDeduction) {
                $deductedQuantity = (float) $batchDeduction['quantity'];
                $lineStockBefore = $runningStock;
                $lineStockAfter = $lineStockBefore - $deductedQuantity;

                $lineReason = $reason;

                if ($index > 0) {
                    $lineReason .= ' - Spillover';
                }

                $auditController->store([
                    'inventory_item_id' => $item->id,
                    'batch_id' => $batchDeduction['batch_id'],
                    'transaction_reference' => $transactionReference,
                    'action' => 'Wastage',
                    'source' => 'Stock Log Modal',
                    'quantity_change' => -abs($deductedQuantity),
                    'stock_before' => $lineStockBefore,
                    'stock_after' => $lineStockAfter,
                    'reason_reference' => $lineReason,
                    'performed_by' => $request->user()->id,
                ]);

                $runningStock = $lineStockAfter;
            }
            // Refresh the cached cost using the oldest available batch.
            $fifoCost = app(
                InventoryBatchController::class
            )->getEffectiveCost($item->id, (bool) $item->track_expiry);

            if ($fifoCost !== null) {
                $item->update([
                    'cost_per_unit' => $fifoCost,
                ]);
            }

            return $item->refresh();
        });
    }
}
