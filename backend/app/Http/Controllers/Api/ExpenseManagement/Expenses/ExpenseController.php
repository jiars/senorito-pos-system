<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Expenses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ExpenseManagement\Expense;
use App\Models\ExpenseManagement\ExpenseCategory;

class ExpenseController extends Controller
{
    public function storeInventoryPurchase(array $expenseData, string $userId)
    {
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

    public function destroy(Request $request, string $id)
    {
        $expense = Expense::where('archived', false)
            ->findOrFail($id);

        // Preserve the financial record and remember who archived it.
        $expense->update([
            'archived' => true,
            'archived_by' => $request->user()->id,
            'archived_at' => now(),
        ]);

        return response()->json([
            'message' => 'Expense archived successfully.',
        ]);
    }

    public function unarchive(string $id)
    {
        $expense = Expense::where('archived', true)
            ->findOrFail($id);

        $expense->update([
            'archived' => false,
            'archived_by' => null,
            'archived_at' => null,
        ]);

        return response()->json([
            'message' => 'Expense restored successfully.',
        ]);
    }
}
