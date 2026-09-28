<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseEditController extends Controller
{
    public function sync(Request $request, string $id)
    {
        // Basic validation while Form Requests are postponed.
        $expenseData = $request->validate([
            'category_id' =>
            'required|uuid|exists:expense_categories,id',
            'description' => 'required|string|max:1000',
            'amount' => 'required|numeric|gt:0',
            'vendor' => 'nullable|string|max:255',
            'payment_method' => 'required|string|max:100',
            'receipt_reference' => 'nullable|string|max:255',
            'expense_date' => 'required|date',
        ]);

        $expense = DB::transaction(function () use ($expenseData, $id) {
            // Archived records cannot be edited.
            $expense = Expense::where('archived', false)
                ->findOrFail($id);

            $expense->update($expenseData);

            return $expense->refresh();
        });

        return response()->json([
            'message' => 'Expense updated successfully.',
            'expense' => $expense,
        ]);
    }
}
