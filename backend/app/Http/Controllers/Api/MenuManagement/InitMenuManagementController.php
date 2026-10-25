<?php

namespace App\Http\Controllers\Api\MenuManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use App\Services\InventoryManagement\InventoryExpiryService;
use App\Services\InventoryManagement\InventoryStockHistoryService;
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

        $menuRelations = [
            'menu_categories',
            'menu_prices',
            'menu_recipes',
        ];

        $menuItems = MenuItem::query()
            ->where('archived', false)
            ->orderBy('item_name', 'asc')
            ->get();

        $archivedMenuItems = MenuItem::query()
            ->where('archived', true)
            ->orderBy('item_name', 'asc')
            ->get();

        $menuItems->merge($archivedMenuItems)->load($menuRelations);

        $addonRelations = [
            'addon_categories.menu_categories',
            'addon_recipes',
        ];

        $addons = Addon::query()
            ->where('archived', false)
            ->orderBy('addon_name', 'asc')
            ->get();

        $archivedAddons = Addon::query()
            ->where('archived', true)
            ->orderBy('addon_name', 'asc')
            ->get();

        $addons->merge($archivedAddons)->load($addonRelations);

        // Related ingredient data needed by recipe forms.
        $ingredientRelations = [
            'inventory_batches:id,inventory_item_id,quantity,expiration_date',
            'inventory_conversion_units:id,inventory_item_id,converted_unit,equivalent_base_amount',
        ];

        // Ingredients required by Menu and Add-on recipe forms.
        $ingredientsQuery = InventoryItem::select([
            'id',
            'item_name',
            'base_unit',
            'minimum_level',
            'cost_per_unit',
            'current_stock',
            'track_expiry',
            'archived',
        ])
            ->with($ingredientRelations)
            ->orderBy('item_name');

        // Include the same usable-stock value that POS receives.
        $ingredientsQuery = app(InventoryExpiryService::class)
            ->addUsableStock($ingredientsQuery);

        $ingredients = app(InventoryStockHistoryService::class)
            ->addLastStockChange($ingredientsQuery)
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
