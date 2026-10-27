<?php

namespace App\Http\Controllers\Api\ReportManagement\Sales;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OrderSalesController extends Controller
{
    public function fetch(Request $request)
    {
        // Fetch only the data required by Sales Reports.
        $query = Order::select([
            'id',
            'order_datetime',
            'order_source',
            'subtotal',
            'total',
            'status',
        ])
            ->with([
                'order_items:id,order_id,menu_item_id,price_id,quantity,unit_price,subtotal',
                'order_items.menu_item:id,item_name,category_id,pricing_type,image_url,archived',
                'order_items.menu_item.menu_categories:id,category_name',
                // Current recipe inputs match the Edit Menu cost preview.
                'order_items.menu_item.menu_prices:id,menu_item_id',
                'order_items.menu_item.menu_recipes:id,menu_item_id,menu_item_price_id,inventory_item_id,quantity,unit',
                'order_items.menu_item.menu_recipes.inventory_items:id,base_unit,cost_per_unit',
                'order_items.menu_item.menu_recipes.inventory_items.inventory_conversion_units:id,inventory_item_id,converted_unit,equivalent_base_amount',
                'order_items.variant:id,variant_name,selling_price,estimated_cost,archived',
            ])
            ->whereNotIn('status', Order::NON_SALE_STATUSES);

        if ($request->filled('from_date')) {
            $startDate = Carbon::createFromFormat(
                'Y-m-d',
                $request->query('from_date'),
                config('app.business_timezone')
            )->startOfDay()->utc()->toISOString();

            $query->where('order_datetime', '>=', $startDate);
        }

        if ($request->filled('to_date')) {
            $endDate = Carbon::createFromFormat(
                'Y-m-d',
                $request->query('to_date'),
                config('app.business_timezone')
            )->startOfDay()->addDay()->utc()->toISOString();

            // Include the whole selected day, stopping before next midnight.
            $query->where('order_datetime', '<', $endDate);
        }

        $source = $request->query('source');

        if ($source && $source !== 'All Order Sources') {
            $query->whereRaw(
                'LOWER(order_source) = ?',
                [strtolower($source)]
            );
        }

        $category = $request->query('category');

        if ($category && $category !== 'All Categories') {
            $query->whereHas(
                'order_items.menu_item.menu_categories',
                function ($categoryQuery) use ($category) {
                    $categoryQuery->whereRaw(
                        'LOWER(category_name) = ?',
                        [strtolower($category)]
                    );
                }
            );
        }

        return $query
            ->orderBy('order_datetime', 'desc')
            ->get();
    }
}
