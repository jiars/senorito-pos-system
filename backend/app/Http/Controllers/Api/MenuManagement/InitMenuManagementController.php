<?php

namespace App\Http\Controllers\Api\MenuManagement;

use App\Http\Controllers\Controller;
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
            ->orderBy('item_name', 'asc')
            ->get();

        $addons = Addon::with(['addon_categories.menu_categories', 'addon_recipes'])
            ->orderBy('addon_name', 'asc')
            ->get();

        return response()->json([
            'categories' => $categories,
            'items' => $menuItems,
            'addons' => $addons
        ]);
    }
}
