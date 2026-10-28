<?php

namespace App\Services\OrderManagement;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Models\InventoryManagement\InventoryAuditLog;
use App\Models\InventoryManagement\InventoryBatch;
use App\Models\InventoryManagement\InventoryItem;
use App\Models\OrderManagement\Order;
use App\Models\OrderManagement\OrderVoidRequest;
use App\Services\InventoryManagement\InventoryExpiryService;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderVoidStockReturnService
{
    // The review orchestrator holds the order/request locks and owns the transaction.
    public function returnStock(Order $order, OrderVoidRequest $voidRequest, string $ownerId): void
    {
        $deductions = $order->stock_deductions()
            ->orderBy('inventory_item_id')->orderBy('batch_id')->orderBy('id')->get();

        if (!$order->stock_deductions_recorded || $deductions->isEmpty()) {
            $this->cannotReturn('Original stock deductions are unavailable. Keep stock deducted or review a separate inventory correction.');
        }
        abort_if(
            InventoryAuditLog::whereIn('original_deduction_id', $deductions->pluck('id'))->exists(),
            409,
            'Stock has already been returned for this order. Refresh Order History.'
        );

        $today = app(InventoryExpiryService::class)->today();
        $transactionReference = (string) Str::uuid();

        // Match checkout: lock ingredients in stable ID order, then their batches.
        foreach ($deductions->groupBy('inventory_item_id') as $itemId => $itemDeductions) {
            $item = InventoryItem::whereKey($itemId)->lockForUpdate()->first();
            if (!$item || $item->archived) {
                $this->cannotReturn('An original ingredient is missing or archived. Stock cannot be returned automatically.');
            }
            $batches = InventoryBatch::where('inventory_item_id', $itemId)
                ->whereIn('id', $itemDeductions->pluck('batch_id'))
                ->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $runningStock = (float) $item->current_stock;

            foreach ($itemDeductions as $deduction) {
                $batch = $batches->get($deduction->batch_id);
                $quantity = -(float) $deduction->quantity_change;
                if (!$batch || !is_finite($quantity) || $quantity <= 0) {
                    $this->cannotReturn('An original batch or deduction is unavailable. Stock cannot be returned automatically.');
                }
                if ($batch->expiration_date && $batch->expiration_date <= $today) {
                    $this->cannotReturn('An original batch has expired. Keep stock deducted; expired ingredients cannot be returned for sale.');
                }

                $batch->update(['quantity' => (float) $batch->quantity + $quantity]);
                $stockAfter = $runningStock + $quantity;
                app(InventoryAuditLogController::class)->store([
                    'inventory_item_id' => $item->id,
                    'batch_id' => $batch->id,
                    'order_id' => $order->id,
                    'void_request_id' => $voidRequest->id,
                    'original_deduction_id' => $deduction->id,
                    'transaction_reference' => $transactionReference,
                    'action' => 'Void Stock Return',
                    'source' => 'Order Void',
                    'quantity_change' => $quantity,
                    'stock_before' => $runningStock,
                    'stock_after' => $stockAfter,
                    'reason_reference' => 'Unused stock returned for Order #' . $order->order_number . ': ' . $voidRequest->reason,
                    'performed_by' => $ownerId,
                ]);
                $runningStock = $stockAfter;
            }

            $item->update(['current_stock' => $runningStock]);
            $effectiveCost = app(InventoryBatchController::class)->getEffectiveCost($item->id, (bool) $item->track_expiry);
            if ($effectiveCost !== null) $item->update(['cost_per_unit' => $effectiveCost]);
        }
    }

    private function cannotReturn(string $message): never
    {
        throw ValidationException::withMessages(['stock_handling' => $message]);
    }
}
