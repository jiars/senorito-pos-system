<?php

namespace App\Http\Controllers\Api\InventoryManagement\Categories;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InventoryCategoryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:inventory_categories,category_name'
        ]);

        $category = InventoryCategory::create([
            'id' => Str::uuid(),
            'category_name' => $request->input('category_name'),
            'archived' => false
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:inventory_categories,category_name,' . $id
        ]);

        $category = InventoryCategory::findOrFail($id);
        $category->update([
            'category_name' => $request->input('category_name')
        ]);

        return response()->json($category);
    }

    public function destroy(string $id)
    {
        $category = InventoryCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
