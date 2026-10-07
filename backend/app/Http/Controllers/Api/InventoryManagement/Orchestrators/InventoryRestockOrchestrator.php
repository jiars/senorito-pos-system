<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ExpenseManagement\Expenses\ExpenseController;
use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Http\Controllers\Api\InventoryManagement\Purchases\InventoryPurchaseHistoryController;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryRestockOrchestrator extends Controller
{
    public function store(Request $request, string $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Lock the item during the complete Restock process.
            $item = InventoryItem::where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($item->archived) {
                abort(409, 'An archived item cannot be restocked.');
            }

            $stockData = $request->input('stockData');
            $purchaseData = $request->input('purchaseData');

            if (
                $item->track_expiry &&
                empty($purchaseData['expiration_date'])
            ) {
                throw ValidationException::withMessages([
                    'purchaseData.expiration_date' =>
                    'Expiration date is required for this item.',
                ]);
            }

            $quantity = (float) $stockData['quantity'];
            $totalCost = (float) $purchaseData['total_cost'];
            $stockBefore = (float) $item->current_stock;
            $stockAfter = $stockBefore + $quantity;
            $costPerUnit = $totalCost / $quantity;
            $userId = $request->user()->id;

            // Complete data shared by the Batch and Purchase workers.
            $purchaseData['source'] = 'Restock';
            $purchaseData['quantity_purchased'] = $quantity;
            $purchaseData['purchase_unit'] = $item->base_unit;
            $purchaseData['cost_per_unit'] = $costPerUnit;

            $batchController = app(InventoryBatchController::class);

            $batch = $batchController->store(
                $purchaseData,
                $item->id,
                $quantity
            );

            app(InventoryPurchaseHistoryController::class)->store(
                $purchaseData,
                $item->id,
                $batch->id,
                $userId
            );

            $item->update([
                'current_stock' => $stockAfter,
            ]);

            $reason = $stockData['reason'];

            if (!empty($stockData['notes'])) {
                $reason .= ' - ' . $stockData['notes'];
            }

            app(InventoryAuditLogController::class)->store([
                'inventory_item_id' => $item->id,
                'batch_id' => $batch->id,
                'action' => 'Purchase',
                'source' => 'Stock Log Modal',
                'quantity_change' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reason_reference' => $reason,
                'performed_by' => $userId,
            ]);

            app(ExpenseController::class)->storeInventoryPurchase([
                'description' => 'Restock: ' . $item->item_name,
                'amount' => $totalCost,
                'vendor' => $purchaseData['supplier'] ?? null,
            ], $userId);

            $fifoCost = $batchController->getEffectiveCost($item->id, (bool) $item->track_expiry);

            if ($fifoCost !== null) {
                $item->update([
                    'cost_per_unit' => $fifoCost,
                ]);
            }

            return [
                'item' => $item->refresh(),
                'batch' => $batch->refresh(),
            ];
        });
    }
}
