<?php

namespace App\Http\Controllers\Api\MenuManagement\Items;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItem;

class MenuItemController extends Controller
{
    // READ: Get all menu items WITH their category
    public function index()
    {
        $items = MenuItem::with(['menu_categories', 'menu_prices', 'menu_recipes'])
            ->where('archived', false)
            ->orderBy('item_name', 'asc')
            ->get();

        return response()->json($items);
    }

    // DELETE (Archive): We don't actually delete menu items, we archive them!
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

    public function unarchive(string $id)
    {
        $item = MenuItem::where('archived', true)
            ->findOrFail($id);

        $recipeStatus = $item->menu_recipes()->exists()
            ? 'Complete'
            : 'Incomplete';

        $item->update([
            'archived' => false,
            'pos_status' => 'Unavailable',
            'recipe_status' => $recipeStatus,
        ]);

        return response()->json([
            'message' => 'Menu Item restored successfully.',
        ]);
    }
}
