<?php

namespace App\Http\Controllers\Api\InventoryManagement\Items;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Http\Request;
use App\Models\MenuManagement\AddonRecipe;
use App\Models\MenuManagement\MenuRecipe;

class InventoryItemController extends Controller
{
    public function destroy(Request $request, string $id)
    {
        $item = InventoryItem::findOrFail($id);

        // Archive and remember who performed it.
        $item->update([
            'archived' => true,
            'archived_by' => $request->user()->id,
            'archived_at' => now(),
        ]);

        return response()->json([
            'message' => 'Inventory item archived successfully.'
        ]);
    }

    public function unarchive(string $id)
    {
        $item = InventoryItem::findOrFail($id);

        $item->update([
            'archived' => false,
            'archived_by' => null,
            'archived_at' => null,
        ]);

        return response()->json([
            'message' => 'Inventory item restored successfully.'
        ]);
    }

    public function affected(string $id)
    {
        InventoryItem::findOrFail($id);

        // Find Menu Items using this ingredient.
        $menuItems = MenuRecipe::with('menu_item:id,item_name')
            ->where('inventory_item_id', $id)
            ->get()
            ->pluck('menu_item.item_name')
            ->filter()
            ->unique()
            ->values();

        // Find Add-ons using this ingredient.
        $addons = AddonRecipe::with('addon:id,addon_name')
            ->where('inventory_item_id', $id)
            ->get()
            ->pluck('addon.addon_name')
            ->filter()
            ->unique()
            ->values();

        return response()->json([
            'menuItems' => $menuItems,
            'addons' => $addons,
        ]);
    }
}
