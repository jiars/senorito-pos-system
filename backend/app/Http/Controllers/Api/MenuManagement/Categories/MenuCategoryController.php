<?php

namespace App\Http\Controllers\Api\MenuManagement\Categories;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuCategory;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    // READ: Get all categories
    public function index()
    {
        // Notice how clean this is compared to DB::table()!
        return response()->json(MenuCategory::orderBy('category_name', 'asc')->get());
    }

    // CREATE: Add a new category
    public function store(Request $request)
    {
        // 1. Validate the input (Make sure it's not empty and is a string)
        $request->validate([
            'category_name' => 'required|string|max:255'
        ]);

        // 2. Tell the Model to create it
        $category = MenuCategory::create([
            'category_name' => $request->category_name
        ]);

        return response()->json($category, 201);
    }

    // UPDATE: Edit an existing category
    public function update(Request $request, string $id)
    {
        $request->validate([
            'category_name' => 'required|string|max:255'
        ]);

        // 1. Find the specific category by ID
        $category = MenuCategory::findOrFail($id);

        // 2. Update the name and save
        $category->category_name = $request->category_name;
        $category->save();

        return response()->json(['message' => 'Category updated successfully']);
    }

    // DELETE: Delete a category
    public function destroy(string $id)
    {
        $category = MenuCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
