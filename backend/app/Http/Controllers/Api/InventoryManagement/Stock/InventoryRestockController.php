<?php

namespace App\Http\Controllers\Api\InventoryManagement\Stock;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryRestockOrchestrator;

class InventoryRestockController extends Controller
{
    public function store(Request $request, string $id)
    {
        // Basic validation while Form Requests are postponed.
        $request->validate([
            'stockData.quantity' => 'required|numeric|gt:0',
            'stockData.reason' => 'required|string|max:255',
            'stockData.notes' => 'nullable|string|max:1000',
            'purchaseData.total_cost' => 'required|numeric|min:0',
            'purchaseData.supplier' => 'nullable|string|max:255',
            'purchaseData.expiration_date' => 'nullable|date',
        ]);

        $item = app(InventoryRestockOrchestrator::class)
            ->store($request, $id);

        return response()->json([
            'message' => 'Inventory item restocked successfully.',
            'item' => $item,
        ]);
    }
}
