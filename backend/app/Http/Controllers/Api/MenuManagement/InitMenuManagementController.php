<?php

namespace App\Http\Controllers\Api\MenuManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use App\Models\MenuManagement\MenuCategory;
use App\Models\MenuManagement\MenuItem;
use App\Models\MenuManagement\Addon;

class InitMenuManagementController extends Controller
{
    /**
     * Unified fetch endpoint for the Menu Management pages.
     * Fetches all categories, menu items, and addons in a single payload.
     */
    public function index()
    {
        $categories = MenuCategory::with('menu_items')
            ->orderBy('category_name', 'asc')
            ->get();

        $menuItems = MenuItem::with(['menu_categories', 'menu_prices', 'menu_recipes'])
            ->where('archived', false)
            ->orderBy('item_name', 'asc')
            ->get();

        $archivedMenuItems = MenuItem::with([
            'menu_categories',
            'menu_prices',
            'menu_recipes',
        ])
            ->where('archived', true)
            ->orderBy('item_name', 'asc')
            ->get();

        $addons = Addon::with(['addon_categories.menu_categories', 'addon_recipes'])
            ->where('archived', false)
            ->orderBy('addon_name', 'asc')
            ->get();

        // Fetch archived Add-ons using the same relationships.
        $archivedAddons = Addon::with([
            'addon_categories.menu_categories',
            'addon_recipes',
        ])
            ->where('archived', true)
            ->orderBy('addon_name', 'asc')
            ->get();

        // Ingredients required by Menu and Add-on recipe forms.
        $ingredients = InventoryItem::select([
            'id',
            'item_name',
            'base_unit',
            'minimum_level',
            'cost_per_unit',
            'current_stock',
            'track_expiry',
            'archived',
        ])
            ->with([
                'inventory_batches:id,inventory_item_id,quantity,expiration_date',
                'inventory_conversion_units:id,inventory_item_id,converted_unit,equivalent_base_amount',
            ])
            ->orderBy('item_name')
            ->get();

        return response()->json([
            'categories' => $categories,
            'items' => $menuItems,
            'addons' => $addons,
            'archivedMenuItems' => $archivedMenuItems,
            'archivedAddons' => $archivedAddons,
            'ingredients' => $ingredients,
        ]);
    }
}
