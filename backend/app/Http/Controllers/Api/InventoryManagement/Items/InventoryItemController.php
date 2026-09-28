<?php

namespace App\Http\Controllers\Api\InventoryManagement\Items;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryArchiveOrchestrator;
use App\Models\InventoryManagement\InventoryItem;
use App\Models\MenuManagement\AddonRecipe;
use App\Models\MenuManagement\MenuRecipe;

class InventoryItemController extends Controller
{
    public function destroy(Request $request, string $id)
    {
        $item = app(InventoryArchiveOrchestrator::class)
            ->archive($request, $id);

        return response()->json([
            'message' => 'Inventory item archived successfully.',
            'item' => $item,
        ]);
    }

    public function unarchive(string $id)
    {
        $item = app(InventoryArchiveOrchestrator::class)
            ->unarchive($id);

        return response()->json([
            'message' => 'Inventory item restored successfully.',
            'item' => $item,
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
