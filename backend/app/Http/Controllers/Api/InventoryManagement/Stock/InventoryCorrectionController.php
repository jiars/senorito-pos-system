<?php

namespace App\Http\Controllers\Api\InventoryManagement\Stock;

use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryCorrectionOrchestrator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InventoryCorrectionController extends Controller
{
    public function store(Request $request, string $id)
    {
        // The user provides the new actual physical count.
        $request->validate([
            'stockData.actual_batch_quantity' => 'required|numeric|gt:0',
            'stockData.reason' => 'required|string|max:255',
            'stockData.notes' => 'nullable|string|max:1000',
            'batchData.selected_batch_id' =>
            'required|uuid|exists:inventory_batches,id',
        ]);

        $item = app(InventoryCorrectionOrchestrator::class)
            ->store($request, $id);

        return response()->json([
            'message' => 'Inventory stock corrected successfully.',
            'item' => $item,
        ]);
    }
}
