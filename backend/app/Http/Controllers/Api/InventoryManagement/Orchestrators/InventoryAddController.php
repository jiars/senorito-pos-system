<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchController;
use App\Http\Controllers\Api\InventoryManagement\ConversionUnits\InventoryConversionUnitController;
use App\Http\Controllers\Api\InventoryManagement\Purchases\InventoryPurchaseHistoryController;
use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryAddController extends Controller
{
    public function store(Request $request)
    {
        // Validate basic item fields before starting any database writes.
        $request->validate([
            'itemData.item_name' => 'required|string|unique:inventory_items,item_name',
            'itemData.minimum_level' => 'required|numeric|min:1',
            'itemData.category_id' => 'required|exists:inventory_categories,id',
            'itemData.supplier' => 'nullable|string|max:255',
        ], [
            'itemData.item_name.unique' => 'This inventory item already exists.',
        ]);

        $item = DB::transaction(function () use ($request) {
            $itemData = $request->input('itemData');
            $purchaseData = $request->input('purchaseData');
            $conversions = $request->input('conversionsData', []);
            $userId = $request->user()->id;

            // New items always begin as active.
            $itemData['archived'] = false;
            $itemData['archived_by'] = null;

            // The database automatically generates item_code.
            $item = InventoryItem::create($itemData);
            $baseQuantity = (float) $itemData['current_stock'];

            $batchController = app(InventoryBatchController::class);
            $batch = $batchController->store(
                $purchaseData,
                $item->id,
                $baseQuantity
            );

            $purchaseController = app(
                InventoryPurchaseHistoryController::class
            );
            $purchaseController->store(
                $purchaseData,
                $item->id,
                $batch->id,
                $userId
            );

            if (!empty($conversions)) {
                $conversionController = app(
                    InventoryConversionUnitController::class
                );
                $conversionController->storeMany(
                    $conversions,
                    $item->id
                );
            }

            $reason = 'Initial Stock Creation';

            if (!empty($purchaseData['note'])) {
                $reason .= ' - ' . $purchaseData['note'];
            }

            $auditController = app(
                InventoryAuditLogController::class
            );
            $auditController->store([
                'inventory_item_id' => $item->id,
                'batch_id' => $batch->id,
                'action' => 'Purchase',
                'source' => 'Add Item Modal',
                'quantity_change' => $baseQuantity,
                'stock_before' => 0,
                'stock_after' => $baseQuantity,
                'reason_reference' => $reason,
                'performed_by' => $userId,
            ]);

            return $item->refresh();
        });

        return response()->json([
            'message' => 'Inventory item created successfully.',
            'item' => $item,
        ], 201);
    }
}
