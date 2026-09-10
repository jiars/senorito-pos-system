<?php

namespace App\Http\Controllers\Api\InventoryManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryCategory;
use App\Models\InventoryManagement\InventoryItem;

class InitInventoryManagementController extends Controller
{
    /**
     * Unified fetch endpoint for the Inventory Management page.
     * Fetches all active categories and inventory items (with their batches and units) in a single payload.
     */
    public function index()
    {
        // Fetch all active categories
        $categories = InventoryCategory::where('archived', false)
            ->orderBy('category_name', 'asc')
            ->get();

        // Fetch all active inventory items, eager-loading all necessary relationships
        $inventoryItems = InventoryItem::with([
            'inventory_categories',
            'inventory_batches',
            'inventory_conversion_units'
        ])
            ->where('archived', false)
            ->orderBy('item_name', 'asc')
            ->get();

        // Return the unified payload just like we do in Menu Management
        return response()->json([
            'categories' => $categories,
            'items' => $inventoryItems
        ]);
    }
}
