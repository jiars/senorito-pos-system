<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Categories;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $categories = ExpenseCategory::withCount('expenses')
            ->orderBy('category_name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_name' =>
            'required|string|max:255|unique:expense_categories,category_name',
        ]);

        $category = ExpenseCategory::create([
            'category_name' => $request->input('category_name'),
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'category_name' =>
            'required|string|max:255|unique:expense_categories,category_name,' . $id,
        ]);

        $category = ExpenseCategory::findOrFail($id);

        $category->update([
            'category_name' => $request->input('category_name'),
        ]);

        return response()->json($category);
    }

    public function destroy(string $id)
    {
        $category = ExpenseCategory::findOrFail($id);

        // A category can only be deleted when unused.
        if ($category->expenses()->exists()) {
            return response()->json([
                'message' =>
                'This category cannot be deleted because an Expense uses it.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'message' => 'Expense category deleted successfully.',
        ]);
    }
}
