<?php

namespace App\Http\Controllers\Api\InventoryManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryCategory;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Support\Facades\DB;

class InitInventoryManagementController extends Controller
{
    /**
     * Unified fetch endpoint for the Inventory Management page.
     * Fetches all active categories and inventory items (with their batches and units) in a single payload.
     */
    public function index()
    {
        // Fetch all active categories
        $categories = InventoryCategory::withCount('inventory_items')
            ->orderBy('category_name', 'asc')
            ->get();

        // Both Inventory pages use these related records.
        $relations = [
            'inventory_categories',
            'inventory_batches',
            'inventory_conversion_units',
            'inventory_audit_logs',
            'archived_by_profile:id,first_name,last_name',
        ];

        $inventoryItems = InventoryItem::with($relations)
            ->where('archived', false)
            ->orderBy('item_name', 'asc')
            ->get();

        $archivedItems = InventoryItem::with($relations)
            ->where('archived', true)
            ->orderBy('item_name', 'asc')
            ->get();

        // Read the allowed inventory units from PostgreSQL.
        $units = collect(DB::select(
            'SELECT unnest(enum_range(NULL::inventory_unit_enum))::text AS unit'
        ))->pluck('unit')->values();

        // Return the unified payload just like we do in Menu Management
        return response()->json([
            'categories' => $categories,
            'items' => $inventoryItems,
            'archivedItems' => $archivedItems,
            'units' => $units,
        ]);
    }
}
