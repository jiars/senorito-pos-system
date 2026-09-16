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
                'order_items.menu_item:id,item_name,category_id,pricing_type',
                'order_items.menu_item.menu_categories:id,category_name',
                'order_items.variant:id,variant_name,selling_price,estimated_cost',
            ])
            ->where('status', '!=', 'Cancelled');

        if ($request->filled('from_date')) {
            $startDate = Carbon::createFromFormat(
                'Y-m-d',
                $request->query('from_date'),
                'Asia/Manila'
            )->startOfDay()->utc();

            $query->where('order_datetime', '>=', $startDate);
        }

        if ($request->filled('to_date')) {
            $endDate = Carbon::createFromFormat(
                'Y-m-d',
                $request->query('to_date'),
                'Asia/Manila'
            )->endOfDay()->utc();

            $query->where('order_datetime', '<=', $endDate);
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
