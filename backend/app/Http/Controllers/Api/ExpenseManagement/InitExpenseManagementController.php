<?php

namespace App\Http\Controllers\Api\ExpenseManagement;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\Expense;
use App\Models\ExpenseManagement\ExpenseCategory;

class InitExpenseManagementController extends Controller
{
    public function index()
    {
        // Fetch categories together with their usage count.
        $categories = ExpenseCategory::withCount('expenses')
            ->orderBy('category_name', 'asc')
            ->get();

        // Fetch all records needed by the Expense page.
        $relations = [
            'expense_categories:id,category_name',
            'profiles:id,first_name,last_name',
            'archived_by_profile:id,first_name,last_name',
        ];

        // Fetch active Expenses.
        $expenses = Expense::with($relations)
            ->where('archived', false)
            ->orderBy('expense_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'categories' => $categories,
            'expenses' => $expenses,
        ]);
    }
}
