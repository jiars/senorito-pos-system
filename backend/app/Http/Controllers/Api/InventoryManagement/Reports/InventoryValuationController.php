<?php

namespace App\Http\Controllers\Api\InventoryManagement\Reports;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;

class InventoryValuationController extends Controller
{
    public function index()
    {
        // Return only the raw fields required by the valuation report.
        $items = InventoryItem::query()
            ->select([
                'id',
                'item_name',
                'category_id',
                'base_unit',
                'minimum_level',
                'cost_per_unit',
                'current_stock',
            ])
            ->with([
                'inventory_categories:id,category_name',
                'inventory_batches:id,inventory_item_id,quantity,unit_cost',
            ])
            ->where('archived', false)
            ->orderBy('item_name')
            ->get();

        return response()->json([
            'items' => $items,
        ]);
    }
}
