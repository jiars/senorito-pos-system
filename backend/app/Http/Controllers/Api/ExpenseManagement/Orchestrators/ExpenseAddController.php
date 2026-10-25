<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\Expense;
use App\Models\ExpenseManagement\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseAddController extends Controller
{
    public function store(Request $request)
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

        // Check the current policy even if the browser has an older category list.
        $category = ExpenseCategory::findOrFail($expenseData['category_id']);
        $request->validate([
            'receipt_reference' => $category->receiptReferenceRules(),
        ]);

        // The logged-in profile owns the new record.
        $expenseData['recorded_by'] = $request->user()->id;

        $expense = DB::transaction(function () use ($expenseData) {
            return Expense::create($expenseData);
        });

        return response()->json([
            'message' => 'Expense created successfully.',
            'expense' => $expense,
        ], 201);
    }
}
