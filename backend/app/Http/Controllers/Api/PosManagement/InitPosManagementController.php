<?php

namespace App\Http\Controllers\Api\PosManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
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
                'menu_prices:id,menu_item_id,variant_name,selling_price,pos_status',
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

        $today = now('Asia/Manila')->toDateString();

        // Calculate usable stock from active and non-expired batches.
        $inventoryStock = InventoryItem::query()
            ->select([
                'id',
                'item_name',
                'base_unit',
                'track_expiry',
                'archived',
            ])
            ->selectSub(
                function ($query) use ($today) {
                    $query
                        ->from('inventory_batches')
                        ->selectRaw(
                            'COALESCE(SUM(inventory_batches.quantity), 0)'
                        )
                        ->whereColumn(
                            'inventory_batches.inventory_item_id',
                            'inventory_items.id'
                        )
                        ->where('inventory_batches.quantity', '>', 0)
                        ->where(function ($query) use ($today) {
                            $query
                                ->where('inventory_items.track_expiry', false)
                                ->orWhereNull(
                                    'inventory_batches.expiration_date'
                                )
                                ->orWhereDate(
                                    'inventory_batches.expiration_date',
                                    '>=',
                                    $today
                                );
                        });
                },
                'usable_stock'
            )
            ->whereIn('id', $inventoryItemIds)
            ->where('archived', false)
            ->orderBy('item_name')
            ->get();

        return response()->json([
            'categories' => $categories,
            'items' => $menuItems,
            'addons' => $addons,
            'inventory_stock' => $inventoryStock,
        ]);
    }
}
