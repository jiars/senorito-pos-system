<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchExpiryController;
use App\Services\InventoryManagement\InventoryExpiryService;
use App\Models\InventoryManagement\InventoryCleanupRun;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class InventoryExpiryCleanupOrchestrator extends Controller
{
    public function cleanupForApp(Request $request)
    {
        // Only active, authenticated staff may trigger this fallback.
        if ($request->user()->status !== 'Active') {
            return response()->json([
                'message' => 'Your account is not active.',
            ], 403);
        }

        try {
            // Reuse the same daily check and cleanup used by Cron.
            $result = $this->cleanupDaily();

            // Return readiness information, not inventory details.
            return response()->json([
                'business_date' => $result['business_date'],
                'already_completed' => $result['already_completed'],
            ]);
        } catch (Throwable $exception) {
            // Keep the technical error in Laravel's logs.
            report($exception);

            return response()->json([
                'message' => 'Unable to complete the inventory check. Please retry.',
            ], 500);
        }
    }

    public function cleanupDaily(): array
    {
        $today = app(InventoryExpiryService::class)->today();

        return DB::transaction(function () use ($today) {
            // Create today's record without replacing an existing one.
            InventoryCleanupRun::query()->insertOrIgnore([
                'business_date' => $today,
            ]);

            // Only one daily attempt can work on this record at a time.
            $run = InventoryCleanupRun::where('business_date', $today)
                ->lockForUpdate()
                ->firstOrFail();

            if ($run->completed_at !== null) {
                return [
                    'business_date' => $today,
                    'already_completed' => true,
                    'cleaned_batch_count' => (int) $run->cleaned_batch_count,
                ];
            }

            // Reuse the existing cleanup for all eligible ingredients.
            $cleanedBatchCount = $this->cleanup(null, $today, $run->id);

            // Save completion together with the stock and audit changes.
            $run->update([
                'cleaned_batch_count' => $cleanedBatchCount,
                'completed_at' => now()->toIso8601String(),
            ]);

            return [
                'business_date' => $today,
                'already_completed' => false,
                'cleaned_batch_count' => $cleanedBatchCount,
            ];
        });
    }

    public function cleanup(
        ?string $inventoryItemId = null,
        ?string $businessDate = null,
        ?string $cleanupRunId = null
    )
    {
        $today = $businessDate;

        if ($today === null) $today = app(InventoryExpiryService::class)->today();

        $expiryController = app(InventoryBatchExpiryController::class);

        $affectedItemIds = $expiryController->getAffectedItemIds($today, $inventoryItemId);

        return DB::transaction(function () use ($today, $affectedItemIds, $expiryController, $cleanupRunId) {
            $cleanedBatchCount = 0;

            foreach ($affectedItemIds as $itemId) {
                // Lock the parent while its batches are changed.
                $item = InventoryItem::where('id', $itemId)
                    ->lockForUpdate()
                    ->firstOrFail();

                $expiredBatches = $expiryController->getExpiredBatches($item->id, $today);

                if ($expiredBatches->isEmpty()) continue;

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
                        // Keep the deducted quantity linked to this daily result.
                        'cleanup_run_id' => $cleanupRunId,
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
