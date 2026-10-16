<?php

namespace App\Http\Controllers\Api\PosManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use App\Services\InventoryManagement\InventoryExpiryService;
use App\Models\MenuManagement\Addon;
use App\Models\MenuManagement\MenuCategory;
use App\Models\MenuManagement\MenuItem;


class InitPosManagementController extends Controller
{
    public function index()
    {
        // Fetch all active POS categories.
        $categories = MenuCategory::select([
            'id',
            'category_name',
        ])
            ->orderBy('category_name')
            ->get();

        // Fetch active menu items with their prices and recipes.
        $menuItems = MenuItem::select([
            'id',
            'item_name',
            'category_id',
            'pricing_type',
            'pos_status',
            'image_url',
            'archived',
        ])
            ->with([
                'menu_categories:id,category_name',
                'menu_prices:id,menu_item_id,variant_name,selling_price,pos_status,recipe_status,archived',
                'menu_recipes:id,menu_item_id,menu_item_price_id,inventory_item_id,quantity,unit',
                'menu_recipes.inventory_items:id,item_name,current_stock,base_unit,archived',
                'menu_recipes.inventory_items.inventory_conversion_units:id,inventory_item_id,converted_unit,equivalent_base_amount',
            ])
            ->where('archived', false)
            ->orderBy('item_name')
            ->get();

        // Fetch active add-ons with their categories and recipes.
        $addons = Addon::select([
            'id',
            'addon_name',
            'selling_price',
            'pos_status',
            'recipe_status',
            'archived',
        ])
            ->with([
                'addon_categories:addon_id,menu_category_id',
                'addon_recipes:id,addon_id,inventory_item_id,quantity,unit',
                'addon_recipes.inventory_items:id,item_name,current_stock,base_unit,archived',
                'addon_recipes.inventory_items.inventory_conversion_units:id,inventory_item_id,converted_unit,equivalent_base_amount',
            ])
            ->where('archived', false)
            ->orderBy('addon_name')
            ->get();

        // Collect inventory IDs used by menu items and add-ons.
        $inventoryItemIds = $menuItems
            ->flatMap(fn($item) => $item->menu_recipes->pluck('inventory_item_id'))
            ->merge($addons->flatMap(fn($addon) => $addon->addon_recipes->pluck('inventory_item_id')))
            ->filter()
            ->unique()
            ->values();

        $expiryService = app(InventoryExpiryService::class);

        // Calculate usable stock from active and non-expired batches.
        $inventoryStockQuery = InventoryItem::query()
            ->select([
                'id',
                'item_name',
                'base_unit',
                'current_stock',
                'minimum_level',
                'track_expiry',
                'archived',
            ])
            ->whereIn('id', $inventoryItemIds)
            ->where('archived', false)
            ->orderBy('item_name');

        $inventoryStock = $expiryService
            ->addUsableStock($inventoryStockQuery)
            ->get();

        return response()->json([
            'categories' => $categories,
            'items' => $menuItems,
            'addons' => $addons,
            'inventory_stock' => $inventoryStock,
        ]);
    }
}
