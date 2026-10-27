<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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

            $category = $expense->expense_categories;
            if ($category->requires_receipt) {
                Validator::make($expenseData, [
                    'receipt_reference' => $category->receiptReferenceRules(),
                ])->validate();
                $expenseData['receipt_reference'] = trim($expenseData['receipt_reference']);
            } else {
                // Preserve the stored reference when the category hides this field.
                unset($expenseData['receipt_reference']);
            }

            $expense->update($expenseData);

            return $expense->refresh();
        });

        return response()->json([
            'message' => 'Expense updated successfully.',
            'expense' => $expense,
        ]);
    }
}
