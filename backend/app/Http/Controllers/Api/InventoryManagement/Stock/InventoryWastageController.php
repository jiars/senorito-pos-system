<?php

namespace App\Http\Controllers\Api\InventoryManagement\Stock;

use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryWastageOrchestrator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InventoryWastageController extends Controller
{
    public function store(Request $request, string $id)
    {
        // Basic validation while Form Requests are postponed.
        $request->validate([
            'stockData.quantity' => 'required|numeric|gt:0',
            'stockData.reason' => 'required|string|max:255',
            'stockData.notes' => 'nullable|string|max:1000',
            'batchData.selected_batch_id' =>
            'required|uuid|exists:inventory_batches,id',
        ]);

        $item = app(InventoryWastageOrchestrator::class)
            ->store($request, $id);

        return response()->json([
            'message' => 'Inventory wastage recorded successfully.',
            'item' => $item,
        ]);
    }
}
