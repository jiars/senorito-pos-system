<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchExpiryController;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class InventoryExpiryCleanupOrchestrator extends Controller
{
    public function cleanup()
    {
        $today = now('Asia/Manila')->toDateString();

        $expiryController = app(
            InventoryBatchExpiryController::class
        );

        $affectedItemIds = $expiryController
            ->getAffectedItemIds($today);

        return DB::transaction(function () use ($today, $affectedItemIds, $expiryController) {
            $cleanedBatchCount = 0;

            foreach ($affectedItemIds as $itemId) {
                // Lock the parent while its batches are changed.
                $item = InventoryItem::where('id', $itemId)
                    ->lockForUpdate()
                    ->firstOrFail();

                $expiredBatches = $expiryController
                    ->getExpiredBatches($item->id, $today);

                if ($expiredBatches->isEmpty()) {
                    continue;
                }

                $stockBefore = (float) $item->current_stock;
                $totalExpiredQuantity =
                    (float) $expiredBatches->sum('quantity');

                if ($totalExpiredQuantity > $stockBefore) {
                    throw new RuntimeException(
                        'Expired batch stock is greater than the item stock for '
                            . $item->item_name . '.'
                    );
                }

                $runningStock = $stockBefore;
                $transactionReference = (string) Str::uuid();

                foreach ($expiredBatches as $batch) {
                    $expiredQuantity = $expiryController
                        ->clearExpiredBatch($batch);

                    $lineStockBefore = $runningStock;
                    $lineStockAfter =
                        $lineStockBefore - $expiredQuantity;

                    app(InventoryAuditLogController::class)->store([
                        'inventory_item_id' => $item->id,
                        'batch_id' => $batch->id,
                        'transaction_reference' =>
                        $transactionReference,
                        'action' => 'Expired',
                        'source' => 'System',
                        'quantity_change' => -abs($expiredQuantity),
                        'stock_before' => $lineStockBefore,
                        'stock_after' => $lineStockAfter,
                        'reason_reference' =>
                        'Auto-Cleanup - Batch '
                            . $batch->batch_number,
                        'performed_by' => null,
                    ]);

                    $runningStock = $lineStockAfter;
                    $cleanedBatchCount++;
                }

                $item->update([
                    'current_stock' => $runningStock,
                ]);

                // Refresh the cost using the next FEFO batch.
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
            }

            return $cleanedBatchCount;
        });
    }
}
