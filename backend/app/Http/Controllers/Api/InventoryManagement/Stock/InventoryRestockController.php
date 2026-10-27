<?php

namespace App\Http\Controllers\Api\InventoryManagement\Stock;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryRestockOrchestrator;
use App\Models\ExpenseManagement\ExpenseCategory;

class InventoryRestockController extends Controller
{
    public function store(Request $request, string $id)
    {
        // Basic validation while Form Requests are postponed.
        $request->validate([
            'origin' => 'sometimes|required|in:inventory_restock,expense_purchase',
            'stockData.quantity' => 'required|numeric|gt:0',
            'stockData.reason' => 'required|string|max:255',
            'stockData.notes' => 'nullable|string|max:1000',
            'purchaseData.total_cost' => 'required|numeric|min:1',
            'purchaseData.supplier' => 'nullable|string|max:255',
            'purchaseData.expiration_date' => 'nullable|date',
            'purchaseData.expense_date' => 'required_if:origin,expense_purchase|nullable|date_format:Y-m-d',
            'purchaseData.description' => 'required_if:origin,expense_purchase|nullable|string|max:1000',
            'purchaseData.receipt_reference' => 'nullable|string|max:255',
        ]);

        // Only Expense Tracking entries require a reference; Inventory Restock is exempt.
        if ($request->input('origin') === 'expense_purchase') {
            $category = ExpenseCategory::where('category_name', 'Inventory Purchase')->firstOrFail();
            $request->validate([
                'purchaseData.receipt_reference' => $category->receiptReferenceRules(),
            ]);
        }

        $result = app(InventoryRestockOrchestrator::class)
            ->store($request, $id);

        return response()->json([
            'message' => 'Inventory item restocked successfully.',
            'item' => $result['item'],
            'batch' => $result['batch']->only(['id', 'batch_number']),
        ]);
    }
}
