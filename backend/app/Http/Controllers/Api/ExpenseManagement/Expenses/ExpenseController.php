<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Expenses;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\Expense;
use App\Models\ExpenseManagement\ExpenseCategory;

class ExpenseController extends Controller
{
    public function storeInventoryPurchase(
        array $expenseData,
        string $userId
    ) {
        // Find the proper Finance category.
        $category = ExpenseCategory::where(
            'category_name',
            'Inventory Purchase'
        )->firstOrFail();

        return Expense::create([
            'category_id' => $category->id,
            'description' => $expenseData['description'],
            'amount' => $expenseData['amount'],
            'vendor' => $expenseData['vendor'] ?? null,
            'expense_date' => now()->toDateString(),
            'recorded_by' => $userId,
        ]);
    }
}
