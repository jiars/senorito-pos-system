<?php

namespace App\Http\Controllers\Api\ExpenseManagement\Categories;

use App\Http\Controllers\Controller;
use App\Models\ExpenseManagement\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ExpenseCategoryController extends Controller
{
    private function normalizeInventoryPurchaseName(Request $request): void
    {
        $name = $request->input('category_name');
        if (is_string($name) && ExpenseCategory::isInventoryPurchaseName($name)) {
            $request->merge(['category_name' => ExpenseCategory::INVENTORY_PURCHASE]);
        }
    }

    public function index()
    {
        $categories = ExpenseCategory::withCount('expenses')
            ->orderBy('category_name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        // Check uniqueness against the same system name that will be saved.
        $this->normalizeInventoryPurchaseName($request);
        $categoryData = $request->validate([
            'category_name' =>
            'required|string|max:255|unique:expense_categories,category_name',
            'requires_receipt' => 'sometimes|boolean',
            'auto_archive_yearly' => 'sometimes|boolean',
        ]);

        $categoryData['requires_receipt'] = $categoryData['requires_receipt'] ?? false;
        $categoryData['auto_archive_yearly'] = $categoryData['auto_archive_yearly'] ?? false;
        if (ExpenseCategory::isInventoryPurchaseName($categoryData['category_name'])) {
            $categoryData['auto_archive_yearly'] = false;
        }
        $category = ExpenseCategory::create($categoryData);

        return response()->json($category, 201);
    }

    public function update(Request $request, string $id)
    {
        $this->normalizeInventoryPurchaseName($request);
        $categoryData = $request->validate([
            'category_name' =>
            'required|string|max:255|unique:expense_categories,category_name,' . $id,
            'requires_receipt' => 'sometimes|boolean',
            'auto_archive_yearly' => 'sometimes|boolean',
        ]);

        $category = ExpenseCategory::findOrFail($id);

        // Restocking relies on this system category's fixed name.
        if (ExpenseCategory::isInventoryPurchaseName($category->category_name)
            && !ExpenseCategory::isInventoryPurchaseName($categoryData['category_name'])) {
            throw ValidationException::withMessages([
                'category_name' => 'Inventory Purchase is a system category and cannot be renamed.',
            ]);
        }

        if (ExpenseCategory::isInventoryPurchaseName($categoryData['category_name'])) {
            $categoryData['auto_archive_yearly'] = false;
        }

        // Older callers can rename a category without resetting its settings.
        $category->update($categoryData);

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
