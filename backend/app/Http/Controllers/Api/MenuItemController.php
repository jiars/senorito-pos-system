<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * READ: Get all menu items WITH their category
     */
    public function index()
    {
        // 'with('category')' automatically joins the MenuCategory model!
        return response()->json(MenuItem::with('category')->orderBy('item_name', 'asc')->get());
    }

    /**
     * CREATE: Add a new menu item
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_name' => 'required|string|max:255',
            'category_id' => 'required|exists:menu_categories,id',
            'pricing_type' => 'required|string',
            'pos_status' => 'required|string',
            'recipe_status' => 'required|string'
        ]);
        $data = $request->all();
        // Automatically set archived to false on creation
        $data['archived'] = false;
        $item = MenuItem::create($data);
        return response()->json($item, 201);
    }

    /**
     * UPDATE: Edit a menu item
     */
    public function update(Request $request, string $id)
    {
        $item = MenuItem::findOrFail($id);
        $data = $request->all();

        // Match the logic you had in React: If it becomes Available, un-archive it
        if ($request->pos_status === 'Available') {
            $data['archived'] = false;
            if ($request->recipe_status === 'Archived') {
                $data['recipe_status'] = 'Complete';
            }
        }
        $item->update($data);
        return response()->json(['message' => 'Menu Item updated successfully']);
    }

    /**
     * DELETE (Archive): We don't actually delete menu items, we archive them!
     */
    public function destroy(string $id)
    {
        $item = MenuItem::findOrFail($id);

        $item->update([
            'archived' => true,
            'pos_status' => 'Unavailable',
            'recipe_status' => 'Archived'
        ]);
        return response()->json(['message' => 'Menu Item archived successfully']);
    }
}
